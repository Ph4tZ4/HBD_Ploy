/* ================================================================
   LiquidGlassMaterial — true screen-space refraction glass.

   How it works (NOT a CSS backdrop-filter):
   1. <GlassBackdrop> renders the whole scene (minus the glass
      meshes, which live on layer 1) into an off-screen FBO once
      per frame.
   2. The custom GLSL shader samples that FBO with a refraction
      offset driven by simplex noise + an SDF rounded-rectangle
      edge field, giving physical distortion, chromatic
      aberration, fresnel rim light and a moving specular streak.
   3. <GlassPanel> is a plane whose shape is cut by an iOS-style
      continuous-corner rounded-box SDF inside the fragment shader.
   ================================================================ */
import * as THREE from 'three';
import { createContext, useContext, useMemo, useRef, forwardRef } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial, useFBO } from '@react-three/drei';

export const GLASS_LAYER = 1;

/* ----- Shader ----------------------------------------------------- */
const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uBackdrop;
  uniform vec2  uResolution;
  uniform float uTime;
  uniform vec2  uSize;      // panel size in world units
  uniform float uRadius;    // corner radius in world units
  uniform float uStrength;  // refraction strength
  uniform float uChroma;    // chromatic aberration spread
  uniform vec3  uTint;
  uniform float uTintAmt;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  /* --- simplex noise (Ashima) --- */
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  /* --- iOS continuous-corner rounded box SDF --- */
  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    /* panel-local coordinates & shape mask */
    vec2 p = (vUv - 0.5) * uSize;
    float d = sdRoundedBox(p, uSize * 0.5, uRadius);
    if (d > 0.0) discard;

    float px = fwidth(d) * 1.5;
    float shapeAA = smoothstep(0.0, -px, d);
    float edge = 1.0 - smoothstep(0.0, uRadius * 1.6, -d); // 1 at rim → 0 inside

    /* liquid surface: slow-flowing noise field bends the "normal" */
    float n1 = snoise(vUv * 3.0 + vec2(uTime * 0.15, uTime * 0.09));
    float n2 = snoise(vUv * 6.5 - vec2(uTime * 0.11, uTime * 0.17));
    vec2 flow = vec2(n1, n2);

    /* refraction: stronger near the rounded rim (thick glass edge) */
    vec2 screenUv = gl_FragCoord.xy / uResolution;
    vec2 rimDir = normalize(p + 1e-4);
    vec2 offset = flow * uStrength * (0.35 + 0.65 * edge)
                + rimDir * edge * edge * uStrength * 2.4;

    /* chromatic aberration: refract each channel slightly apart */
    float ca = uChroma * (0.4 + edge);
    vec3 refr;
    refr.r = texture2D(uBackdrop, screenUv + offset * (1.0 + ca)).r;
    refr.g = texture2D(uBackdrop, screenUv + offset).g;
    refr.b = texture2D(uBackdrop, screenUv + offset * (1.0 - ca)).b;

    /* fresnel rim light */
    float fresnel = pow(1.0 - abs(dot(normalize(vWorldNormal), normalize(vViewDir))), 3.0);
    float rim = smoothstep(0.55, 1.0, edge);

    /* moving specular streak (diagonal sheen) */
    float streak = smoothstep(0.12, 0.0,
      abs(vUv.x + vUv.y * 0.6 - mod(uTime * 0.07, 2.2) + 0.2));

    vec3 col = mix(refr, uTint, uTintAmt);
    col += vec3(1.0) * (fresnel * 0.25 + rim * 0.18 + streak * 0.06);
    /* inner top highlight — glossy iOS sheen */
    col += vec3(1.0) * smoothstep(0.55, 1.0, vUv.y) * 0.05;

    gl_FragColor = vec4(col, uOpacity * shapeAA);
    #include <colorspace_fragment>
  }
`;

const LiquidGlassMaterialImpl = shaderMaterial(
  {
    uBackdrop: null,
    uResolution: new THREE.Vector2(1, 1),
    uTime: 0,
    uSize: new THREE.Vector2(1, 1),
    uRadius: 0.12,
    uStrength: 0.02,
    uChroma: 0.35,
    uTint: new THREE.Color('#ffffff'),
    uTintAmt: 0.06,
    uOpacity: 1,
  },
  vertex,
  fragment,
);
extend({ LiquidGlassMaterialImpl });

/* ----- Backdrop capture ------------------------------------------- */
const BackdropContext = createContext(null);

export function GlassBackdrop({ children, resolutionScale = 0.6 }) {
  const { size, camera } = useThree();
  const fbo = useFBO(
    Math.round(size.width * resolutionScale),
    Math.round(size.height * resolutionScale),
    { samples: 0, depthBuffer: true },
  );
  const value = useMemo(() => ({ fbo }), [fbo]);

  useFrame((state) => {
    const { gl, scene } = state;
    camera.layers.enableAll();
    camera.layers.disable(GLASS_LAYER);
    gl.setRenderTarget(fbo);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    camera.layers.enable(GLASS_LAYER);
  });

  return <BackdropContext.Provider value={value}>{children}</BackdropContext.Provider>;
}

/* ----- Material component ----------------------------------------- */
export const LiquidGlassMaterial = forwardRef(function LiquidGlassMaterial(
  { width = 1, height = 1, radius = 0.12, strength = 0.02, chroma = 0.35,
    tint = '#ffffff', tintAmt = 0.06, opacity = 1, ...props },
  ref,
) {
  const backdrop = useContext(BackdropContext);
  const mat = useRef();
  const { size, viewport } = useThree();

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    m.uTime = state.clock.elapsedTime;
    m.uBackdrop = backdrop?.fbo.texture ?? null;
    m.uResolution.set(size.width * viewport.dpr, size.height * viewport.dpr);
  });

  return (
    <liquidGlassMaterialImpl
      ref={(node) => { mat.current = node; if (ref) ref.current = node; }}
      uSize={[width, height]}
      uRadius={radius}
      uStrength={strength}
      uChroma={chroma}
      uTint={tint}
      uTintAmt={tintAmt}
      uOpacity={opacity}
      transparent
      depthWrite={false}
      {...props}
    />
  );
});

/* ----- Ready-made panel mesh --------------------------------------- */
export function GlassPanel({ width = 3, height = 2, radius = 0.22, children, ...props }) {
  const meshRef = useRef();
  return (
    <group {...props}>
      <mesh
        ref={(m) => { meshRef.current = m; if (m) m.layers.set(GLASS_LAYER); }}
        renderOrder={10}
      >
        <planeGeometry args={[width, height]} />
        <LiquidGlassMaterial width={width} height={height} radius={radius} />
      </mesh>
      {children}
    </group>
  );
}
