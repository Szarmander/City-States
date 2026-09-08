import './Roulette.css';
import { useState, useEffect, useRef } from 'react'

const LETTERS = "ABCDEFGHIJKLMNOPRSTUWZ".split("");

// Simple Web Audio API beep sound
function playTick(audioCtx: AudioContext | null) {
  if (!audioCtx) return;
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // high pitch
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05); // drop down quickly
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Ignore audio errors if context isn't fully active
  }
}

function playDing(audioCtx: AudioContext | null) {
  if (!audioCtx) return;
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); 
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1); 
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    // Ignore audio errors
  }
}

export function Roulette({ targetLetter }: { targetLetter: string }) {
  const [current, setCurrent] = useState('A');
  const [done, setDone] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on mount (requires user interaction before this point, which is true because they clicked start/join)
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    let ticks = 0;
    const maxTicks = 30; // approx 3 seconds at 100ms
    
    const interval = setInterval(() => {
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        setCurrent(targetLetter);
        setDone(true);
        playDing(audioCtxRef.current);
      } else {
        setCurrent(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
        playTick(audioCtxRef.current);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close();
      }
    };
  }, [targetLetter]);

  return (
    <div className="card panel-card text-center" style={{ maxWidth: '400px' }}>
      <h2 className="subtitle">{done ? "Letter Selected!" : "Selecting Letter..."}</h2>
      <div className={`roulette-letter ${done ? 'roulette-done' : ''}`}>
        {current}
      </div>
    </div>
  )
}
