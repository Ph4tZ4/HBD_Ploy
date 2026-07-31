import { createContext, useContext } from 'react';

export const ThemeContext = createContext('night');
export const useTheme = () => useContext(ThemeContext);

export const SCENE_GRADIENT = {
  night: 'radial-gradient(120% 100% at 50% 0%, #1a1a3a 0%, #0b0b1e 70%)',
  day: 'radial-gradient(130% 100% at 50% 0%, #8fb8ee 0%, #c6ddf7 52%, #ffe9f2 100%)',
};

export function sceneBackground(theme) {
  return SCENE_GRADIENT[theme] || SCENE_GRADIENT.night;
}
