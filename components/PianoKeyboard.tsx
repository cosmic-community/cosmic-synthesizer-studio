'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface PianoKeyboardProps {
  onKeyPress: (frequency: number, velocity?: number) => void;
  onKeyRelease: (frequency: number) => void;
  disabled?: boolean;
  showLabels?: boolean;
  keySize?: 'small' | 'medium' | 'large';
}

// Extended piano key frequencies (3 octaves)
const keyFrequencies = {
  // Octave 3
  'C3': 130.81,
  'C#3': 138.59,
  'D3': 146.83,
  'D#3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3': 185.00,
  'G3': 196.00,
  'G#3': 207.65,
  'A3': 220.00,
  'A#3': 233.08,
  'B3': 246.94,
  // Octave 4 (middle C)
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
  // Octave 5
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
  'B5': 987.77,
  // Octave 6
  'C6': 1046.50,
  'C#6': 1108.73,
  'D6': 1174.66,
  'D#6': 1244.51,
  'E6': 1318.51,
  'F6': 1396.91
};

// Enhanced keyboard mapping with multiple rows
const keyboardMapping: Record<string, string> = {
  // Bottom row - White keys (C4-F5)
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
  
  // Top row - Black keys
  'w': 'C#4',
  'e': 'D#4',
  't': 'F#4',
  'y': 'G#4',
  'u': 'A#4',
  'o': 'C#5',
  'p': 'D#5',
  '[': 'F#5',
  ']': 'G#5',
  
  // Number row for higher octave
  '1': 'C5',
  '2': 'D5',
  '3': 'E5',
  '4': 'F5',
  '5': 'G5',
  '6': 'A5',
  '7': 'B5',
  '8': 'C6',
  '9': 'D6',
  '0': 'E6',
  '-': 'F6',
  
  // QWERTY row for lower octave
  'q': 'C3',
  'r': 'D3',
  'i': 'E3',
  'v': 'F3',
  'b': 'G3',
  'n': 'A3',
  'm': 'B3',
  ',': 'C4',
  '.': 'D4',
  '/': 'E4'
};

// Reverse mapping for display
const pianoToKeyboard: Record<string, string> = {};
Object.entries(keyboardMapping).forEach(([key, note]) => {
  if (!pianoToKeyboard[note]) {
    pianoToKeyboard[note] = key.toUpperCase();
  }
});

const whiteKeys = [
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 
  'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5',
  'C6', 'D6', 'E6', 'F6'
];

const blackKeys = [
  'C#3', 'D#3', 'F#3', 'G#3', 'A#3',
  'C#4', 'D#4', 'F#4', 'G#4', 'A#4', 
  'C#5', 'D#5', 'F#5', 'G#5', 'A#5',
  'C#6', 'D#6'
];

export default function PianoKeyboard({ 
  onKeyPress, 
  onKeyRelease, 
  disabled = false,
  showLabels = true,
  keySize = 'medium'
}: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [octaveShift, setOctaveShift] = useState(0);
  const [sustainMode, setSustainMode] = useState(false);
  const [velocity, setVelocity] = useState(0.8);
  const [keyPressStartTime, setKeyPressStartTime] = useState<Map<string, number>>(new Map());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const sustainedKeys = useRef<Set<string>>(new Set());
  const mouseDownRef = useRef(false);
  const lastPlayedNote = useRef<string | null>(null);

  // Calculate velocity based on key press speed/force
  const calculateVelocity = useCallback((keyName: string, pressTime?: number): number => {
    if (pressTime) {
      const timeSincePress = Date.now() - pressTime;
      // Faster key presses = higher velocity
      const velocityModifier = Math.max(0.3, Math.min(1.0, 1.0 - (timeSincePress / 500)));
      return velocity * velocityModifier;
    }
    return velocity;
  }, [velocity]);

  const handleKeyDown = useCallback((keyName: string, forceVelocity?: number) => {
    if (disabled || pressedKeys.has(keyName)) return;
    
    const pressTime = Date.now();
    setKeyPressStartTime(prev => new Map(prev).set(keyName, pressTime));
    setPressedKeys(prev => new Set(prev).add(keyName));
    
    const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
    if (frequency) {
      // Apply octave shift
      const shiftedFrequency = frequency * Math.pow(2, octaveShift);
      const noteVelocity = forceVelocity ?? calculateVelocity(keyName, pressTime);
      onKeyPress(shiftedFrequency, noteVelocity);
      lastPlayedNote.current = keyName;
    }
  }, [pressedKeys, onKeyPress, octaveShift, disabled, calculateVelocity]);

  const handleKeyUp = useCallback((keyName: string) => {
    if (disabled) return;
    
    // If sustain mode is on, don't release the key
    if (sustainMode) {
      sustainedKeys.current.add(keyName);
      return;
    }
    
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(keyName);
      return newSet;
    });
    
    setKeyPressStartTime(prev => {
      const newMap = new Map(prev);
      newMap.delete(keyName);
      return newMap;
    });
    
    const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
    if (frequency) {
      // Apply octave shift
      const shiftedFrequency = frequency * Math.pow(2, octaveShift);
      onKeyRelease(shiftedFrequency);
    }
  }, [onKeyRelease, octaveShift, sustainMode, disabled]);

  // Handle sustain pedal toggle
  const toggleSustain = useCallback(() => {
    setSustainMode(prev => {
      const newSustainMode = !prev;
      
      // If turning off sustain, release all sustained keys
      if (!newSustainMode) {
        sustainedKeys.current.forEach(keyName => {
          const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
          if (frequency) {
            const shiftedFrequency = frequency * Math.pow(2, octaveShift);
            onKeyRelease(shiftedFrequency);
          }
        });
        sustainedKeys.current.clear();
        setPressedKeys(new Set());
      }
      
      return newSustainMode;
    });
  }, [octaveShift, onKeyRelease]);

  // Release all keys
  const releaseAllKeys = useCallback(() => {
    pressedKeys.forEach(keyName => {
      const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
      if (frequency) {
        const shiftedFrequency = frequency * Math.pow(2, octaveShift);
        onKeyRelease(shiftedFrequency);
      }
    });
    
    sustainedKeys.current.forEach(keyName => {
      const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
      if (frequency) {
        const shiftedFrequency = frequency * Math.pow(2, octaveShift);
        onKeyRelease(shiftedFrequency);
      }
    });
    
    setPressedKeys(new Set());
    sustainedKeys.current.clear();
    setSustainMode(false);
  }, [pressedKeys, octaveShift, onKeyRelease]);

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

  // Add control shortcuts
  const controlShortcuts = [
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
    },
    {
      keys: ['c'],
      callback: toggleSustain,
      description: 'Toggle sustain',
      preventDefault: true
    },
    {
      keys: ['space'],
      callback: releaseAllKeys,
      description: 'Release all keys',
      preventDefault: true
    }
  ];

  const allShortcuts = [...pianoShortcuts, ...controlShortcuts];

  // Use keyboard shortcuts hook
  useKeyboardShortcuts(allShortcuts, {
    enabled: !disabled,
    target: typeof window !== 'undefined' ? window : null
  });

  // Handle key release events separately
  useEffect(() => {
    const handleKeyUpEvent = (event: KeyboardEvent) => {
      if (disabled) return;
      
      const computerKey = event.key.toLowerCase();
      const pianoKey = keyboardMapping[computerKey];
      if (pianoKey) {
        handleKeyUp(pianoKey);
      }
    };

    window.addEventListener('keyup', handleKeyUpEvent);
    return () => window.removeEventListener('keyup', handleKeyUpEvent);
  }, [handleKeyUp, disabled]);

  // Clear all pressed keys when component loses focus or window is not active
  useEffect(() => {
    const handleBlur = () => {
      releaseAllKeys();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        releaseAllKeys();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [releaseAllKeys]);

  // Mouse tracking for velocity sensitivity
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  // Touch support for mobile devices
  const handleTouchStart = useCallback((event: React.TouchEvent, keyName: string) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      const force = touch.force || 0.5; // Use force if available, otherwise default
      const touchVelocity = Math.max(0.1, Math.min(1.0, force * velocity));
      handleKeyDown(keyName, touchVelocity);
    }
  }, [handleKeyDown, velocity]);

  const handleTouchEnd = useCallback((event: React.TouchEvent, keyName: string) => {
    event.preventDefault();
    handleKeyUp(keyName);
  }, [handleKeyUp]);

  // Get black key position with improved spacing
  const getBlackKeyPosition = (keyName: string): string => {
    const positions: { [key: string]: string } = {
      // Octave 3
      'C#3': '3.5%',
      'D#3': '10.5%',
      'F#3': '24.5%',
      'G#3': '31.5%',
      'A#3': '38.5%',
      // Octave 4
      'C#4': '52.5%',
      'D#4': '59.5%',
      'F#4': '73.5%',
      'G#4': '80.5%',
      'A#4': '87.5%',
      // Octave 5
      'C#5': '101.5%',
      'D#5': '108.5%',
      'F#5': '122.5%',
      'G#5': '129.5%',
      'A#5': '136.5%',
      // Octave 6
      'C#6': '150.5%',
      'D#6': '157.5%'
    };
    return positions[keyName] || '0%';
  };

  // Key size configurations
  const sizeConfigs = {
    small: { height: 'h-24', keyWidth: 'flex-1', fontSize: 'text-xs' },
    medium: { height: 'h-32', keyWidth: 'flex-1', fontSize: 'text-sm' },
    large: { height: 'h-40', keyWidth: 'flex-1', fontSize: 'text-base' }
  };

  const config = sizeConfigs[keySize];

  return (
    <div className={`relative bg-slate-800 p-4 rounded-xl ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Control Panel */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Octave Controls */}
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

          {/* Velocity Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Velocity:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={velocity}
              onChange={(e) => setVelocity(parseFloat(e.target.value))}
              className="w-16 slider-modern"
            />
            <span className="text-xs text-slate-300 w-8">
              {Math.round(velocity * 100)}%
            </span>
          </div>

          {/* Sustain Toggle */}
          <button
            onClick={toggleSustain}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              sustainMode
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Sustain {sustainMode ? 'ON' : 'OFF'}
          </button>

          {/* Panic Button */}
          <button
            onClick={releaseAllKeys}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
          >
            All Off
          </button>
        </div>

        <div className="text-xs text-slate-400">
          {pressedKeys.size} key{pressedKeys.size !== 1 ? 's' : ''} active
          {sustainedKeys.current.size > 0 && ` • ${sustainedKeys.current.size} sustained`}
        </div>
      </div>

      {/* Piano Keyboard */}
      <div 
        className={`relative ${config.height} flex overflow-x-auto`}
        onMouseMove={handleMouseMove}
      >
        {/* White Keys */}
        {whiteKeys.map((keyName, index) => {
          const isPressed = pressedKeys.has(keyName) || sustainedKeys.current.has(keyName);
          const isSustained = sustainedKeys.current.has(keyName) && !pressedKeys.has(keyName);
          const computerKey = pianoToKeyboard[keyName];
          
          return (
            <button
              key={keyName}
              className={`${config.keyWidth} h-full border border-slate-600 rounded-b-lg mx-0.5 transition-all duration-75 relative select-none ${
                isPressed
                  ? isSustained
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg transform scale-95'
                    : 'bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-lg transform scale-95'
                  : 'bg-gradient-to-b from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 shadow-md'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onMouseDown={() => {
                mouseDownRef.current = true;
                handleKeyDown(keyName);
              }}
              onMouseUp={() => {
                mouseDownRef.current = false;
                handleKeyUp(keyName);
              }}
              onMouseEnter={() => {
                if (mouseDownRef.current) {
                  handleKeyDown(keyName);
                }
              }}
              onMouseLeave={() => {
                if (mouseDownRef.current) {
                  handleKeyUp(keyName);
                }
              }}
              onTouchStart={(e) => handleTouchStart(e, keyName)}
              onTouchEnd={(e) => handleTouchEnd(e, keyName)}
              disabled={disabled}
            >
              <div className="flex flex-col items-center justify-end h-full pb-2 gap-1">
                {showLabels && (
                  <>
                    <span className={`${config.fontSize} font-medium ${
                      isPressed ? 'text-white' : 'text-slate-600'
                    }`}>
                      {keyName.replace(/[0-9]/g, '')}
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
                  </>
                )}
              </div>
            </button>
          );
        })}

        {/* Black Keys */}
        <div className="absolute top-0 left-0 w-full h-3/5 pointer-events-none">
          {blackKeys.map((keyName) => {
            const isPressed = pressedKeys.has(keyName) || sustainedKeys.current.has(keyName);
            const isSustained = sustainedKeys.current.has(keyName) && !pressedKeys.has(keyName);
            const computerKey = pianoToKeyboard[keyName];
            
            return (
              <button
                key={keyName}
                className={`absolute w-8 h-full rounded-b-lg transition-all duration-75 pointer-events-auto select-none ${
                  isPressed
                    ? isSustained
                      ? 'bg-gradient-to-b from-amber-500 to-amber-700 shadow-lg transform scale-95'
                      : 'bg-gradient-to-b from-cyan-500 to-cyan-700 shadow-lg transform scale-95'
                    : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-lg'
                } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ left: getBlackKeyPosition(keyName) }}
                onMouseDown={() => {
                  mouseDownRef.current = true;
                  handleKeyDown(keyName);
                }}
                onMouseUp={() => {
                  mouseDownRef.current = false;
                  handleKeyUp(keyName);
                }}
                onMouseEnter={() => {
                  if (mouseDownRef.current) {
                    handleKeyDown(keyName);
                  }
                }}
                onMouseLeave={() => {
                  if (mouseDownRef.current) {
                    handleKeyUp(keyName);
                  }
                }}
                onTouchStart={(e) => handleTouchStart(e, keyName)}
                onTouchEnd={(e) => handleTouchEnd(e, keyName)}
                disabled={disabled}
              >
                <div className="flex flex-col items-center justify-end h-full pb-2 gap-1">
                  {showLabels && (
                    <>
                      <span className={`text-xs font-medium ${
                        isPressed ? 'text-white' : 'text-gray-400'
                      }`}>
                        {keyName.replace(/[0-9]/g, '').replace('#', '♯')}
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
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          Play multiple keys simultaneously • Computer keyboard: A-J white keys, W/E/T/Y/U black keys
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Z/X: Octave • C: Sustain • Space: Release all • Mouse drag for glissando
        </p>
      </div>

      {/* Active Keys Display */}
      {pressedKeys.size > 0 && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg">
            <span className="text-xs text-cyan-400">Playing:</span>
            <span className="text-xs text-white font-mono">
              {Array.from(pressedKeys).slice(0, 8).join(', ')}
              {pressedKeys.size > 8 && '...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}