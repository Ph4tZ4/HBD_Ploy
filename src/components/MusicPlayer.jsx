import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './MusicPlayer.css';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const isReadyRef = useRef(false);
  const hasStartedRef = useRef(false);

  const startFadeIn = useCallback(() => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    let vol = 0;
    fadeIntervalRef.current = setInterval(() => {
      vol += 5;
      if (playerRef.current && playerRef.current.setVolume) {
        playerRef.current.setVolume(vol);
      }
      if (vol >= 100) {
        clearInterval(fadeIntervalRef.current);
      }
    }, 150);
  }, []);

  const stopPlaybackWithFadeOut = useCallback(() => {
    if (!playerRef.current || !playerRef.current.pauseVideo) return;
    setIsPlaying(false);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    let vol = 100;
    if (playerRef.current.getVolume) {
      try {
        vol = playerRef.current.getVolume() || 100;
      } catch (e) {
        vol = 100;
      }
    }

    fadeIntervalRef.current = setInterval(() => {
      vol -= 15;
      if (vol <= 0) {
        vol = 0;
        if (playerRef.current && playerRef.current.pauseVideo) {
          playerRef.current.pauseVideo();
        }
        clearInterval(fadeIntervalRef.current);
      } else if (playerRef.current && playerRef.current.setVolume) {
        playerRef.current.setVolume(vol);
      }
    }, 80);
  }, []);

  const playMusic = useCallback(() => {
    if (!playerRef.current || !playerRef.current.playVideo) return;
    
    if (!hasStartedRef.current) {
      playerRef.current.seekTo(75, true);
    }
    
    playerRef.current.setVolume(0);
    playerRef.current.playVideo();
    
    hasStartedRef.current = true;
    setIsPlaying(true);
    startFadeIn();
  }, [startFadeIn]);

  useEffect(() => {
    const initPlayer = () => {
      if (!playerRef.current && window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('bgm-yt-player', {
          height: '250',
          width: '250',
          videoId: 'An0fEBn6E2c',
          playerVars: {
            start: 75, 
            autoplay: 1, 
            controls: 0,
            disablekb: 1,
            loop: 1,
            playsinline: 1, // CRITICAL FOR iOS Safari
            playlist: 'An0fEBn6E2c',
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              isReadyRef.current = true;
              e.target.setVolume(0);
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.PLAYING && !hasStartedRef.current) {
                hasStartedRef.current = true;
                setIsPlaying(true);
                startFadeIn();
              }
            }
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [startFadeIn]);

  // Global interaction listener for Autoplay workaround
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (isReadyRef.current && !hasStartedRef.current && playerRef.current && playerRef.current.playVideo) {
        playMusic();
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [playMusic]);

  const toggleMusic = () => {
    if (isPlaying) {
      stopPlaybackWithFadeOut();
    } else {
      playMusic();
    }
  };

  return (
    <div className="music-player-container">
      {/* 
        CRITICAL FOR iOS: 
        Opacity cannot be exactly 0 and size cannot be 1x1, otherwise iOS Safari pauses the media to save battery!
        We use opacity: 0.01 and 250x250, hidden via z-index.
      */}
      <div
        id="bgm-yt-player"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '250px', 
          height: '250px', 
          opacity: 0.01, 
          pointerEvents: 'none', 
          zIndex: -9999 
        }}
      />

      <motion.button
        className="music-btn"
        whileHover={{ scale: 1.08, boxShadow: '0 10px 30px rgba(255, 107, 151, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMusic}
        title={isPlaying ? 'ปิดเพลง' : 'เปิดเพลง'}
      >
        <span className="music-icon">{isPlaying ? '🎵' : '🔇'}</span>
        <span>{isPlaying ? 'Birthday BGM' : 'เปิดเพลง 🎵'}</span>

        {isPlaying && (
          <div className="equalizer">
            {[1, 2, 3].map((bar) => (
              <motion.div
                key={bar}
                className="eq-bar"
                animate={{ height: ['4px', '14px', '6px', '12px', '4px'] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: bar * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </motion.button>
    </div>
  );
}
