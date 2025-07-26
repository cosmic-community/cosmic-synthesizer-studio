'use client';

import { useState, useCallback } from 'react';

interface PianoKeyboardProps {
  onKeyPress: (frequency: number) => void;
  onKeyRelease: (frequency: number) => void;
}

// Piano key frequencies (4th octave as base)
const keyFrequencies = {
  'C4': 261.63,
  'C#4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'A4': 440.00,
  'A#4': 466.16,
  'B4': 493.88,
  'C5': 523.25,
  'C#5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5': 739.99,
  'G5': 783.99,
  'G#5': 830.61,
  'A5': 880.00,
  'A#5': 932.33,
  'B5': 987.77
};

const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'];
const blackKeys = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4', 'C#5', 'D#5', 'F#5', 'G#5', 'A#5'];

export default function PianoKeyboard({ onKeyPress, onKeyRelease }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((keyName: string) => {
    if (pressedKeys.has(keyName)) return;
    
    setPressedKeys(prev => new Set(prev).add(keyName));
    const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
    if (frequency) {
      onKeyPress(frequency);
    }
  }, [pressedKeys, onKeyPress]);

  const handleKeyUp = useCallback((keyName: string) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(keyName);
      return newSet;
    });
    
    const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
    if (frequency) {
      onKeyRelease(frequency);
    }
  }, [onKeyRelease]);

  const getBlackKeyPosition = (keyName: string): string => {
    const positions: { [key: string]: string } = {
      'C#4': '7.5%',
      'D#4': '21.5%',
      'F#4': '50%',
      'G#4': '64%',
      'A#4': '78%',
      'C#5': '107.5%',
      'D#5': '121.5%',
      'F#5': '150%',
      'G#5': '164%',
      'A#5': '178%'
    };
    return positions[keyName] || '0%';
  };

  return (
    <div className="relative bg-slate-800 p-4 rounded-xl">
      <div className="relative h-32 flex">
        {/* White Keys */}
        {whiteKeys.map((keyName, index) => (
          <button
            key={keyName}
            className={`flex-1 h-full border border-slate-600 rounded-b-lg mx-0.5 transition-all duration-75 ${
              pressedKeys.has(keyName)
                ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-lg transform scale-95'
                : 'bg-gradient-to-b from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 shadow-md'
            }`}
            onMouseDown={() => handleKeyDown(keyName)}
            onMouseUp={() => handleKeyUp(keyName)}
            onMouseLeave={() => handleKeyUp(keyName)}
            onTouchStart={() => handleKeyDown(keyName)}
            onTouchEnd={() => handleKeyUp(keyName)}
          >
            <div className="flex items-end justify-center h-full pb-2">
              <span className={`text-xs font-medium ${
                pressedKeys.has(keyName) ? 'text-white' : 'text-slate-600'
              }`}>
                {keyName.replace('4', '').replace('5', '')}
              </span>
            </div>
          </button>
        ))}

        {/* Black Keys */}
        <div className="absolute top-0 left-0 w-full h-3/5 pointer-events-none">
          {blackKeys.map((keyName) => (
            <button
              key={keyName}
              className={`absolute w-8 h-full rounded-b-lg transition-all duration-75 pointer-events-auto ${
                pressedKeys.has(keyName)
                  ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 shadow-lg transform scale-95'
                  : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-lg'
              }`}
              style={{ left: getBlackKeyPosition(keyName) }}
              onMouseDown={() => handleKeyDown(keyName)}
              onMouseUp={() => handleKeyUp(keyName)}
              onMouseLeave={() => handleKeyUp(keyName)}
              onTouchStart={() => handleKeyDown(keyName)}
              onTouchEnd={() => handleKeyUp(keyName)}
            >
              <div className="flex items-end justify-center h-full pb-2">
                <span className={`text-xs font-medium ${
                  pressedKeys.has(keyName) ? 'text-white' : 'text-gray-400'
                }`}>
                  {keyName.replace('4', '').replace('5', '').replace('#', '♯')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          Click and hold keys to play • Use mouse or touch
        </p>
      </div>
    </div>
  );
}