'use client';

import { useState, useCallback, useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

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

// Computer keyboard to piano key mapping
const keyboardMapping: Record<string, string> = {
  // White keys - bottom row
  'a': 'C4',
  's': 'D4', 
  'd': 'E4',
  'f': 'F4',
  'g': 'G4',
  'h': 'A4',
  'j': 'B4',
  'k': 'C5',
  'l': 'D5',
  ';': 'E5',
  "'": 'F5',
  
  // Black keys - top row
  'w': 'C#4',
  'e': 'D#4',
  't': 'F#4',
  'y': 'G#4',
  'u': 'A#4',
  'o': 'C#5',
  'p': 'D#5',
  ']': 'F#5',
};

// Reverse mapping for display
const pianoToKeyboard: Record<string, string> = {};
Object.entries(keyboardMapping).forEach(([key, note]) => {
  pianoToKeyboard[note] = key.toUpperCase();
});

const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'];
const blackKeys = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4', 'C#5', 'D#5', 'F#5', 'G#5', 'A#5'];

export default function PianoKeyboard({ onKeyPress, onKeyRelease }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [octaveShift, setOctaveShift] = useState(0);

  const handleKeyDown = useCallback((keyName: string) => {
    if (pressedKeys.has(keyName)) return;
    
    setPressedKeys(prev => new Set(prev).add(keyName));
    const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
    if (frequency) {
      // Apply octave shift
      const shiftedFrequency = frequency * Math.pow(2, octaveShift);
      onKeyPress(shiftedFrequency);
    }
  }, [pressedKeys, onKeyPress, octaveShift]);

  const handleKeyUp = useCallback((keyName: string) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(keyName);
      return newSet;
    });
    
    const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
    if (frequency) {
      // Apply octave shift
      const shiftedFrequency = frequency * Math.pow(2, octaveShift);
      onKeyRelease(shiftedFrequency);
    }
  }, [onKeyRelease, octaveShift]);

  // Create keyboard shortcuts for piano keys
  const pianoShortcuts = Object.entries(keyboardMapping).map(([computerKey, pianoKey]) => ({
    keys: [computerKey],
    callback: (event: KeyboardEvent) => {
      if (event.type === 'keydown') {
        handleKeyDown(pianoKey);
      }
    },
    description: `Play ${pianoKey}`,
    preventDefault: true,
    stopPropagation: true
  }));

  // Add octave shift shortcuts
  const octaveShortcuts = [
    {
      keys: ['z'],
      callback: () => {
        setOctaveShift(prev => Math.max(prev - 1, -2));
      },
      description: 'Octave down',
      preventDefault: true
    },
    {
      keys: ['x'],
      callback: () => {
        setOctaveShift(prev => Math.min(prev + 1, 2));
      },
      description: 'Octave up',
      preventDefault: true
    }
  ];

  const allShortcuts = [...pianoShortcuts, ...octaveShortcuts];

  // Use keyboard shortcuts hook
  useKeyboardShortcuts(allShortcuts, {
    enabled: true,
    target: typeof window !== 'undefined' ? window : null
  });

  // Handle key release events separately
  useEffect(() => {
    const handleKeyUpEvent = (event: KeyboardEvent) => {
      const computerKey = event.key.toLowerCase();
      const pianoKey = keyboardMapping[computerKey];
      if (pianoKey) {
        handleKeyUp(pianoKey);
      }
    };

    window.addEventListener('keyup', handleKeyUpEvent);
    return () => window.removeEventListener('keyup', handleKeyUpEvent);
  }, [handleKeyUp]);

  // Clear all pressed keys when component loses focus or window is not active
  useEffect(() => {
    const handleBlur = () => {
      pressedKeys.forEach(keyName => {
        const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
        if (frequency) {
          const shiftedFrequency = frequency * Math.pow(2, octaveShift);
          onKeyRelease(shiftedFrequency);
        }
      });
      setPressedKeys(new Set());
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pressedKeys, onKeyRelease, octaveShift]);

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
      {/* Octave shift indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Octave:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOctaveShift(prev => Math.max(prev - 1, -2))}
              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white flex items-center justify-center transition-colors"
              disabled={octaveShift <= -2}
            >
              -
            </button>
            <span className="w-8 text-center text-sm text-white font-mono">
              {octaveShift >= 0 ? '+' : ''}{octaveShift}
            </span>
            <button
              onClick={() => setOctaveShift(prev => Math.min(prev + 1, 2))}
              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white flex items-center justify-center transition-colors"
              disabled={octaveShift >= 2}
            >
              +
            </button>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Z/X: Octave • A-J: White keys • W/E/T/Y/U: Black keys
        </div>
      </div>

      <div className="relative h-32 flex">
        {/* White Keys */}
        {whiteKeys.map((keyName, index) => {
          const isPressed = pressedKeys.has(keyName);
          const computerKey = pianoToKeyboard[keyName];
          
          return (
            <button
              key={keyName}
              className={`flex-1 h-full border border-slate-600 rounded-b-lg mx-0.5 transition-all duration-75 relative ${
                isPressed
                  ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-lg transform scale-95'
                  : 'bg-gradient-to-b from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 shadow-md'
              }`}
              onMouseDown={() => handleKeyDown(keyName)}
              onMouseUp={() => handleKeyUp(keyName)}
              onMouseLeave={() => handleKeyUp(keyName)}
              onTouchStart={() => handleKeyDown(keyName)}
              onTouchEnd={() => handleKeyUp(keyName)}
            >
              <div className="flex flex-col items-center justify-end h-full pb-2 gap-1">
                <span className={`text-xs font-medium ${
                  isPressed ? 'text-white' : 'text-slate-600'
                }`}>
                  {keyName.replace('4', '').replace('5', '')}
                </span>
                {computerKey && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    isPressed 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {computerKey}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Black Keys */}
        <div className="absolute top-0 left-0 w-full h-3/5 pointer-events-none">
          {blackKeys.map((keyName) => {
            const isPressed = pressedKeys.has(keyName);
            const computerKey = pianoToKeyboard[keyName];
            
            return (
              <button
                key={keyName}
                className={`absolute w-8 h-full rounded-b-lg transition-all duration-75 pointer-events-auto ${
                  isPressed
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
                <div className="flex flex-col items-center justify-end h-full pb-2 gap-1">
                  <span className={`text-xs font-medium ${
                    isPressed ? 'text-white' : 'text-gray-400'
                  }`}>
                    {keyName.replace('4', '').replace('5', '').replace('#', '♯')}
                  </span>
                  {computerKey && (
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      isPressed 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-600 text-gray-300'
                    }`}>
                      {computerKey}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          Click keys to play • Use computer keyboard: A-J for white keys, W/E/T/Y/U for black keys • Z/X to change octave
        </p>
      </div>
    </div>
  );
}