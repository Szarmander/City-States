import { useEffect, useRef, useState } from 'react';

type Track = 'lobby' | 'playing' | 'danger' | 'none';

interface AudioPlayerProps {
  currentTrack: Track;
  musicPlaying: boolean;
}

const TRACK_URLS = {
  lobby: '/maksymmalko-roblox-minecraft-fortnite-video-game-music-358426.mp3',
  playing: '/the_mountain-retro-game-593063.mp3',
  danger: '/slimeyfox-hyperarcade-bonus-points-593951.mp3',
};

export function AudioPlayer({ currentTrack, musicPlaying }: AudioPlayerProps) {
  const audioRefs = {
    lobby: useRef<HTMLAudioElement>(null),
    playing: useRef<HTMLAudioElement>(null),
    danger: useRef<HTMLAudioElement>(null)
  };

  const activeTrackRef = useRef<Track>('none');

  useEffect(() => {
    if (!musicPlaying) {
      // Pause all and set volume to 0
      Object.values(audioRefs).forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.volume = 0;
        }
      });
      return;
    }

    const prevTrack = activeTrackRef.current;
    if (prevTrack === currentTrack) return;

    const FADE_DURATION = 1000; // 1 second crossfade
    const INTERVAL = 50;
    const STEPS = FADE_DURATION / INTERVAL;
    const VOL_STEP = 1 / STEPS;

    // Fade out previous track
    if (prevTrack !== 'none' && audioRefs[prevTrack]?.current) {
      const prevAudio = audioRefs[prevTrack].current!;
      let vol = prevAudio.volume;
      const fadeOut = setInterval(() => {
        vol -= Math.max(0, VOL_STEP);
        if (vol <= 0) {
          vol = 0;
          clearInterval(fadeOut);
          prevAudio.pause();
        }
        prevAudio.volume = vol;
      }, INTERVAL);
    }

    // Fade in new track
    if (currentTrack !== 'none' && audioRefs[currentTrack]?.current) {
      const newAudio = audioRefs[currentTrack].current!;
      
      const isFirstTrack = (prevTrack === 'none');
      newAudio.volume = isFirstTrack ? 1 : 0;
      
      const playPromise = newAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Autoplay prevented, waiting for interaction");
          const playOnInteract = () => {
            newAudio.play();
            document.removeEventListener('click', playOnInteract);
            document.removeEventListener('keydown', playOnInteract);
          };
          document.addEventListener('click', playOnInteract);
          document.addEventListener('keydown', playOnInteract);
        });
      }
      
      if (!isFirstTrack) {
        let vol = 0;
        const fadeIn = setInterval(() => {
          vol += VOL_STEP;
          if (vol >= 1) {
            vol = 1;
            clearInterval(fadeIn);
          }
          newAudio.volume = vol;
        }, INTERVAL);
      }
    }

    activeTrackRef.current = currentTrack;

  }, [currentTrack, musicPlaying]);

  return (
    <>
      <audio ref={audioRefs.lobby} src={TRACK_URLS.lobby} loop />
      <audio ref={audioRefs.playing} src={TRACK_URLS.playing} loop />
      <audio ref={audioRefs.danger} src={TRACK_URLS.danger} />
    </>
  );
}
