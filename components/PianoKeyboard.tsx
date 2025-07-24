'use client';

import { useState, useEffect } from 'react';
import { noteToFrequency } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [currentOctave, setCurrentOctave] = useState(4);

  // Generate piano keys based on current octave (2 octaves range)
  const generateKeys = (): Key[] => {
    const keys: Key[] = [];
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Generate keys for current octave and next octave
    for (let octave = currentOctave; octave <= currentOctave + 1; octave++) {
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
    
    // Add one more C for the next octave
    const cNextFrequency = noteToFrequency('C', currentOctave + 2);
    keys.push({
      note: 'C',
      octave: currentOctave + 2,
      isBlack: false,
      frequency: cNextFrequency
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

  const changeOctave = (direction: 'up' | 'down') => {
    setCurrentOctave(prev => {
      if (direction === 'up' && prev < 7) {
        return prev + 1;
      } else if (direction === 'down' && prev > 1) {
        return prev - 1;
      }
      return prev;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const keyMap: { [key: string]: Key | undefined } = {
      'a': keys.find(k => k.note === 'C' && k.octave === currentOctave),
      'w': keys.find(k => k.note === 'C#' && k.octave === currentOctave),
      's': keys.find(k => k.note === 'D' && k.octave === currentOctave),
      'e': keys.find(k => k.note === 'D#' && k.octave === currentOctave),
      'd': keys.find(k => k.note === 'E' && k.octave === currentOctave),
      'f': keys.find(k => k.note === 'F' && k.octave === currentOctave),
      't': keys.find(k => k.note === 'F#' && k.octave === currentOctave),
      'g': keys.find(k => k.note === 'G' && k.octave === currentOctave),
      'y': keys.find(k => k.note === 'G#' && k.octave === currentOctave),
      'h': keys.find(k => k.note === 'A' && k.octave === currentOctave),
      'u': keys.find(k => k.note === 'A#' && k.octave === currentOctave),
      'j': keys.find(k => k.note === 'B' && k.octave === currentOctave),
      'k': keys.find(k => k.note === 'C' && k.octave === currentOctave + 1),
      'o': keys.find(k => k.note === 'C#' && k.octave === currentOctave + 1),
      'l': keys.find(k => k.note === 'D' && k.octave === currentOctave + 1),
      'p': keys.find(k => k.note === 'D#' && k.octave === currentOctave + 1),
      ';': keys.find(k => k.note === 'E' && k.octave === currentOctave + 1),
    };

    const handleKeyboardDown = (e: KeyboardEvent) => {
      // Handle octave change
      if (e.key === 'z' && !e.repeat) {
        changeOctave('down');
        return;
      }
      if (e.key === 'x' && !e.repeat) {
        changeOctave('up');
        return;
      }

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
  }, [keys, currentOctave]);

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-synth-accent">
          Piano Keyboard
        </h3>
        
        {/* Octave Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">Octave:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeOctave('down')}
              disabled={currentOctave <= 1}
              className="synth-button text-sm px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-synth-accent font-bold text-lg min-w-[2rem] text-center">
              {currentOctave}
            </span>
            <button
              onClick={() => changeOctave('up')}
              disabled={currentOctave >= 7}
              className="synth-button text-sm px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
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
            
            // Calculate position for black keys (improved positioning)
            const whiteKeyWidth = 100 / keys.filter(k => !k.isBlack).length;
            const blackKeyPositions = [
              0.7, 1.7, // C#, D# (first group)
              3.7, 4.7, 5.7, // F#, G#, A# (second group)
              7.7, 8.7, // C#, D# (next octave first group)
              10.7, 11.7, 12.7, // F#, G#, A# (next octave second group)
              14.7, 15.7, // C#, D# (next octave first group)
              17.7, 18.7, 19.7, // F#, G#, A# (next octave second group)
            ];
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
      
      <div className="mt-4 text-sm text-gray-400 space-y-1">
        <p>Play with your mouse/touch or use keyboard shortcuts:</p>
        <p>White keys: A S D F G H J K L ; | Black keys: W E T Y U O P</p>
        <p>Octave controls: Z (down) X (up) | Current range: C{currentOctave} - C{currentOctave + 2}</p>
      </div>
    </div>
  );
}