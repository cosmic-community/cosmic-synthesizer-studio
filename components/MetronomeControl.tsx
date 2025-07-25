'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Clock } from 'lucide-react';

export default function MetronomeControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(0.5);
  const [timeSignature, setTimeSignature] = useState({ numerator: 4, denominator: 4 });
  const [currentBeat, setCurrentBeat] = useState(0);
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const createClickSound = (isAccent: boolean = false) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Higher pitch for accent, lower for regular beats
    oscillator.frequency.setValueAtTime(isAccent ? 1000 : 800, ctx.currentTime);
    oscillator.type = 'square';

    // Volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const startMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const interval = (60 / bpm) * 1000; // Convert BPM to milliseconds
    
    setCurrentBeat(0);
    createClickSound(accentFirstBeat); // First beat

    intervalRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = (prev + 1) % timeSignature.numerator;
        const isAccent = accentFirstBeat && nextBeat === 0;
        createClickSound(isAccent);
        return nextBeat;
      });
    }, interval);

    setIsPlaying(true);
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Update interval when BPM changes
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  }, [bpm]);

  const tempoTaps = useRef<number[]>([]);
  const tapTempo = () => {
    const now = Date.now();
    tempoTaps.current.push(now);
    
    // Keep only the last 4 taps
    if (tempoTaps.current.length > 4) {
      tempoTaps.current.shift();
    }
    
    if (tempoTaps.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tempoTaps.current.length; i++) {
        intervals.push(tempoTaps.current[i] - tempoTaps.current[i - 1]);
      }
      
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      
      if (newBpm >= 60 && newBpm <= 200) {
        setBpm(newBpm);
      }
    }
  };

  return (
    <div className="bg-synth-control rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-synth-accent" />
        <h3 className="text-lg font-semibold text-white">Metronome</h3>
      </div>

      {/* BPM Display and Controls */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">{bpm}</div>
          <div className="text-sm text-gray-400">BPM</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBpm(Math.max(60, bpm - 1))}
            className="synth-button-small w-8 h-8 flex items-center justify-center"
          >
            -
          </button>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => setBpm(Math.min(200, bpm + 1))}
            className="synth-button-small w-8 h-8 flex items-center justify-center"
          >
            +
          </button>
        </div>

        {/* Tap Tempo */}
        <button
          onClick={tapTempo}
          className="w-full py-2 bg-synth-accent hover:bg-synth-accent/80 text-white rounded-lg transition-colors"
        >
          Tap Tempo
        </button>

        {/* Time Signature */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Time Signature:</span>
          <div className="flex items-center gap-2">
            <select
              value={timeSignature.numerator}
              onChange={(e) => setTimeSignature(prev => ({ ...prev, numerator: parseInt(e.target.value) }))}
              className="bg-synth-panel border border-gray-600 rounded px-2 py-1 text-white text-sm"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
            <span className="text-white">/</span>
            <select
              value={timeSignature.denominator}
              onChange={(e) => setTimeSignature(prev => ({ ...prev, denominator: parseInt(e.target.value) }))}
              className="bg-synth-panel border border-gray-600 rounded px-2 py-1 text-white text-sm"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
            </select>
          </div>
        </div>

        {/* Beat Indicator */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: timeSignature.numerator }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                i === currentBeat && isPlaying
                  ? 'bg-synth-accent border-synth-accent text-white'
                  : i === 0 && accentFirstBeat
                  ? 'border-synth-accent text-synth-accent'
                  : 'border-gray-600 text-gray-400'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <button
            onClick={toggleMetronome}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Stop' : 'Start'}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-400 w-8">
              {Math.round(volume * 100)}
            </span>
          </div>

          {/* Accent First Beat */}
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={accentFirstBeat}
              onChange={(e) => setAccentFirstBeat(e.target.checked)}
              className="rounded"
            />
            Accent first beat
          </label>
        </div>
      </div>
    </div>
  );
}