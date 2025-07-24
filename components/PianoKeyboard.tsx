'use client';

import { useState, useEffect } from 'react';
import { noteToFrequency } from '@/lib/utils';

interface PianoKeyboardProps {
  onKeyPress: (frequency: number) => void;
  onKeyRelease: (frequency: number) => void;
}

interface Key {
  note: string;
  octave: number;
  isBlack: boolean;
  frequency: number;
}

export default function PianoKeyboard({ onKeyPress, onKeyRelease }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Generate piano keys (C4 to C6)
  const generateKeys = (): Key[] => {
    const keys: Key[] = [];
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    for (let octave = 4; octave <= 5; octave++) {
      for (const note of notes) {
        const frequency = noteToFrequency(note, octave);
        keys.push({
          note,
          octave,
          isBlack: note.includes('#'),
          frequency
        });
      }
    }
    
    // Add C6
    const c6Frequency = noteToFrequency('C', 6);
    keys.push({
      note: 'C',
      octave: 6,
      isBlack: false,
      frequency: c6Frequency
    });
    
    return keys;
  };

  const keys = generateKeys();

  const handleKeyDown = (key: Key) => {
    const keyId = `${key.note}${key.octave}`;
    if (!pressedKeys.has(keyId)) {
      setPressedKeys(prev => new Set(prev).add(keyId));
      onKeyPress(key.frequency);
    }
  };

  const handleKeyUp = (key: Key) => {
    const keyId = `${key.note}${key.octave}`;
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(keyId);
      return newSet;
    });
    onKeyRelease(key.frequency);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const keyMap: { [key: string]: Key | undefined } = {
      'a': keys.find(k => k.note === 'C' && k.octave === 4),
      'w': keys.find(k => k.note === 'C#' && k.octave === 4),
      's': keys.find(k => k.note === 'D' && k.octave === 4),
      'e': keys.find(k => k.note === 'D#' && k.octave === 4),
      'd': keys.find(k => k.note === 'E' && k.octave === 4),
      'f': keys.find(k => k.note === 'F' && k.octave === 4),
      't': keys.find(k => k.note === 'F#' && k.octave === 4),
      'g': keys.find(k => k.note === 'G' && k.octave === 4),
      'y': keys.find(k => k.note === 'G#' && k.octave === 4),
      'h': keys.find(k => k.note === 'A' && k.octave === 4),
      'u': keys.find(k => k.note === 'A#' && k.octave === 4),
      'j': keys.find(k => k.note === 'B' && k.octave === 4),
      'k': keys.find(k => k.note === 'C' && k.octave === 5),
    };

    const handleKeyboardDown = (e: KeyboardEvent) => {
      const key = keyMap[e.key.toLowerCase()];
      if (key && !e.repeat) {
        handleKeyDown(key);
      }
    };

    const handleKeyboardUp = (e: KeyboardEvent) => {
      const key = keyMap[e.key.toLowerCase()];
      if (key) {
        handleKeyUp(key);
      }
    };

    window.addEventListener('keydown', handleKeyboardDown);
    window.addEventListener('keyup', handleKeyboardUp);

    return () => {
      window.removeEventListener('keydown', handleKeyboardDown);
      window.removeEventListener('keyup', handleKeyboardUp);
    };
  }, [keys]);

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <h3 className="text-xl font-bold text-synth-accent mb-6">
        Piano Keyboard
      </h3>
      
      <div className="relative bg-gray-800 p-4 rounded-lg">
        <div className="flex relative">
          {/* White keys */}
          {keys.filter(key => !key.isBlack).map((key) => {
            const keyId = `${key.note}${key.octave}`;
            const isPressed = pressedKeys.has(keyId);
            
            return (
              <button
                key={keyId}
                className={`piano-key white h-32 flex-1 mx-0.5 rounded-b-lg border-2 transition-all duration-75 ${
                  isPressed 
                    ? 'bg-synth-accent border-synth-accent transform scale-95' 
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
                onMouseDown={() => handleKeyDown(key)}
                onMouseUp={() => handleKeyUp(key)}
                onMouseLeave={() => handleKeyUp(key)}
                onTouchStart={() => handleKeyDown(key)}
                onTouchEnd={() => handleKeyUp(key)}
              >
                <span className={`text-xs mt-auto mb-2 ${isPressed ? 'text-black' : 'text-gray-600'}`}>
                  {key.note}{key.octave}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Black keys */}
        <div className="absolute top-4 left-4 flex">
          {keys.filter(key => key.isBlack).map((key, index) => {
            const keyId = `${key.note}${key.octave}`;
            const isPressed = pressedKeys.has(keyId);
            
            // Calculate position for black keys
            const whiteKeyWidth = 100 / keys.filter(k => !k.isBlack).length;
            const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7, 7.7, 8.7, 10.7, 11.7, 12.7, 14.7, 15.7, 17.7, 18.7, 20.7, 21.7, 22.7];
            const leftPosition = blackKeyPositions[index] ?? 0;
            
            return (
              <button
                key={keyId}
                className={`piano-key black absolute h-20 w-8 rounded-b-lg transition-all duration-75 ${
                  isPressed 
                    ? 'bg-synth-accent border-synth-accent transform scale-95' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                style={{ left: `${leftPosition * whiteKeyWidth}%` }}
                onMouseDown={() => handleKeyDown(key)}
                onMouseUp={() => handleKeyUp(key)}
                onMouseLeave={() => handleKeyUp(key)}
                onTouchStart={() => handleKeyDown(key)}
                onTouchEnd={() => handleKeyUp(key)}
              >
                <span className={`text-xs mt-auto mb-1 ${isPressed ? 'text-black' : 'text-white'}`}>
                  {key.note}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Play with your mouse/touch or use keyboard shortcuts: A-K keys</p>
        <p>White keys: A S D F G H J K | Black keys: W E T Y U</p>
      </div>
    </div>
  );
}