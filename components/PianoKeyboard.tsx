'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface PianoKeyboardProps {
  onKeyPress: (frequency: number, velocity?: number) => void;
  onKeyRelease: (frequency: number) => void;
  disabled?: boolean;
  showLabels?: boolean;
  keySize?: 'small' | 'medium' | 'large';
  maxPolyphony?: number;
}

// Extended piano key frequencies (4 octaves for better range)
const keyFrequencies = {
  // Octave 2
  'C2': 65.41,
  'C#2': 69.30,
  'D2': 73.42,
  'D#2': 77.78,
  'E2': 82.41,
  'F2': 87.31,
  'F#2': 92.50,
  'G2': 98.00,
  'G#2': 103.83,
  'A2': 110.00,
  'A#2': 116.54,
  'B2': 123.47,
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

// Enhanced keyboard mapping with multiple layers for better polyphony
const keyboardMapping: Record<string, string> = {
  // Main row - White keys (C4-F5)
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
  '=': 'G6',
  
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
  '/': 'E4',
  
  // ZXCV row for even lower octave
  'z': 'C2',
  'x': 'D2',
  'c': 'E2'
};

// Reverse mapping for display
const pianoToKeyboard: Record<string, string[]> = {};
Object.entries(keyboardMapping).forEach(([key, note]) => {
  if (!pianoToKeyboard[note]) {
    pianoToKeyboard[note] = [];
  }
  pianoToKeyboard[note].push(key.toUpperCase());
});

const whiteKeys = [
  'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 
  'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5',
  'C6', 'D6', 'E6', 'F6'
];

const blackKeys = [
  'C#2', 'D#2', 'F#2', 'G#2', 'A#2',
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
  keySize = 'medium',
  maxPolyphony = 32
}: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [keyboardPressedKeys, setKeyboardPressedKeys] = useState<Set<string>>(new Set());
  const [octaveShift, setOctaveShift] = useState(0);
  const [sustainMode, setSustainMode] = useState(false);
  const [velocity, setVelocity] = useState(0.8);
  const [keyPressStartTime, setKeyPressStartTime] = useState<Map<string, number>>(new Map());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [voiceAllocation, setVoiceAllocation] = useState<Map<string, number>>(new Map());
  
  const sustainedKeys = useRef<Set<string>>(new Set());
  const mouseDownRef = useRef(false);
  const lastPlayedNote = useRef<string | null>(null);
  const activeVoices = useRef<Set<string>>(new Set());
  const keyRepeatTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Enhanced velocity calculation with mouse dynamics
  const calculateVelocity = useCallback((keyName: string, pressTime?: number, mouseVelocity?: number): number => {
    let calculatedVelocity = velocity;
    
    if (pressTime) {
      const timeSincePress = Date.now() - pressTime;
      // Faster key presses = higher velocity
      const velocityModifier = Math.max(0.3, Math.min(1.0, 1.0 - (timeSincePress / 500)));
      calculatedVelocity *= velocityModifier;
    }
    
    if (mouseVelocity !== undefined) {
      // Use mouse velocity for additional expression
      calculatedVelocity = Math.max(0.1, Math.min(1.0, mouseVelocity));
    }
    
    return calculatedVelocity;
  }, [velocity]);

  // Voice management - prioritize newer notes when reaching polyphony limit
  const allocateVoice = useCallback((keyName: string): boolean => {
    if (activeVoices.current.size < maxPolyphony) {
      activeVoices.current.add(keyName);
      setVoiceAllocation(prev => new Map(prev).set(keyName, Date.now()));
      return true;
    }
    
    // Find oldest voice to steal
    let oldestKey = '';
    let oldestTime = Date.now();
    
    voiceAllocation.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      // Release oldest voice
      const frequency = keyFrequencies[oldestKey as keyof typeof keyFrequencies];
      if (frequency) {
        const shiftedFrequency = frequency * Math.pow(2, octaveShift);
        onKeyRelease(shiftedFrequency);
      }
      
      activeVoices.current.delete(oldestKey);
      activeVoices.current.add(keyName);
      setVoiceAllocation(prev => {
        const newMap = new Map(prev);
        newMap.delete(oldestKey);
        newMap.set(keyName, Date.now());
        return newMap;
      });
      
      return true;
    }
    
    return false;
  }, [maxPolyphony, voiceAllocation, octaveShift, onKeyRelease]);

  const handleKeyDown = useCallback((keyName: string, forceVelocity?: number, fromKeyboard = false) => {
    if (disabled) return;
    
    // Prevent key repeat for keyboard events
    if (fromKeyboard && keyboardPressedKeys.has(keyName)) return;
    
    // Check if we can allocate a voice
    if (!allocateVoice(keyName)) {
      console.warn('Maximum polyphony reached, stealing oldest voice');
    }
    
    const pressTime = Date.now();
    setKeyPressStartTime(prev => new Map(prev).set(keyName, pressTime));
    setPressedKeys(prev => new Set(prev).add(keyName));
    
    if (fromKeyboard) {
      setKeyboardPressedKeys(prev => new Set(prev).add(keyName));
    }
    
    const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
    if (frequency) {
      // Apply octave shift
      const shiftedFrequency = frequency * Math.pow(2, octaveShift);
      const noteVelocity = forceVelocity ?? calculateVelocity(keyName, pressTime);
      onKeyPress(shiftedFrequency, noteVelocity);
      lastPlayedNote.current = keyName;
    }
  }, [disabled, keyboardPressedKeys, allocateVoice, octaveShift, calculateVelocity, onKeyPress]);

  const handleKeyUp = useCallback((keyName: string, fromKeyboard = false) => {
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
    
    if (fromKeyboard) {
      setKeyboardPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyName);
        return newSet;
      });
    }
    
    setKeyPressStartTime(prev => {
      const newMap = new Map(prev);
      newMap.delete(keyName);
      return newMap;
    });
    
    // Release voice
    activeVoices.current.delete(keyName);
    setVoiceAllocation(prev => {
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
  }, [disabled, sustainMode, octaveShift, onKeyRelease]);

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
          activeVoices.current.delete(keyName);
        });
        sustainedKeys.current.clear();
        setVoiceAllocation(new Map());
        setPressedKeys(new Set());
      }
      
      return newSustainMode;
    });
  }, [octaveShift, onKeyRelease]);

  // Release all keys - enhanced for polyphonic support
  const releaseAllKeys = useCallback(() => {
    // Release all currently pressed keys
    pressedKeys.forEach(keyName => {
      const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
      if (frequency) {
        const shiftedFrequency = frequency * Math.pow(2, octaveShift);
        onKeyRelease(shiftedFrequency);
      }
    });
    
    // Release all sustained keys
    sustainedKeys.current.forEach(keyName => {
      const frequency = keyFrequencies[keyName as keyof typeof keyFrequencies];
      if (frequency) {
        const shiftedFrequency = frequency * Math.pow(2, octaveShift);
        onKeyRelease(shiftedFrequency);
      }
    });
    
    // Clear all state
    setPressedKeys(new Set());
    setKeyboardPressedKeys(new Set());
    sustainedKeys.current.clear();
    activeVoices.current.clear();
    setVoiceAllocation(new Map());
    setSustainMode(false);
    
    // Clear any pending key repeat timeouts
    keyRepeatTimeouts.current.forEach(timeout => clearTimeout(timeout));
    keyRepeatTimeouts.current.clear();
  }, [pressedKeys, octaveShift, onKeyRelease]);

  // Enhanced keyboard event handling for better polyphony
  const handleKeyboardDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;
    
    const computerKey = event.key.toLowerCase();
    const pianoKey = keyboardMapping[computerKey];
    
    if (pianoKey) {
      event.preventDefault();
      event.stopPropagation();
      
      // Prevent key repeat
      if (event.repeat) return;
      
      handleKeyDown(pianoKey, undefined, true);
    }
  }, [disabled, handleKeyDown]);

  const handleKeyboardUp = useCallback((event: KeyboardEvent) => {
    if (disabled) return;
    
    const computerKey = event.key.toLowerCase();
    const pianoKey = keyboardMapping[computerKey];
    
    if (pianoKey) {
      event.preventDefault();
      event.stopPropagation();
      handleKeyUp(pianoKey, true);
    }
  }, [disabled, handleKeyUp]);

  // Control shortcuts
  const controlShortcuts = [
    {
      keys: ['shift', 'z'],
      callback: () => {
        setOctaveShift(prev => Math.max(prev - 1, -3));
      },
      description: 'Octave down',
      preventDefault: true
    },
    {
      keys: ['shift', 'x'],
      callback: () => {
        setOctaveShift(prev => Math.min(prev + 1, 3));
      },
      description: 'Octave up',
      preventDefault: true
    },
    {
      keys: ['shift', 'c'],
      callback: toggleSustain,
      description: 'Toggle sustain',
      preventDefault: true
    },
    {
      keys: ['shift', 'space'],
      callback: releaseAllKeys,
      description: 'Release all keys',
      preventDefault: true
    }
  ];

  // Use keyboard shortcuts hook for controls only
  useKeyboardShortcuts(controlShortcuts, {
    enabled: !disabled,
    target: typeof window !== 'undefined' ? window : null
  });

  // Enhanced keyboard event listeners with proper polyphonic handling
  useEffect(() => {
    if (disabled) return;

    window.addEventListener('keydown', handleKeyboardDown, true);
    window.addEventListener('keyup', handleKeyboardUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyboardDown, true);
      window.removeEventListener('keyup', handleKeyboardUp, true);
    };
  }, [handleKeyboardDown, handleKeyboardUp, disabled]);

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

  // Enhanced touch support for mobile polyphony
  const handleTouchStart = useCallback((event: React.TouchEvent, keyName: string) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      // Check if force property exists on the touch object and use it, otherwise default to 0.5
      const force = (touch as any).force !== undefined ? (touch as any).force : 0.5;
      const touchVelocity = Math.max(0.1, Math.min(1.0, force * velocity));
      handleKeyDown(keyName, touchVelocity);
    }
  }, [handleKeyDown, velocity]);

  const handleTouchEnd = useCallback((event: React.TouchEvent, keyName: string) => {
    event.preventDefault();
    handleKeyUp(keyName);
  }, [handleKeyUp]);

  // Get black key position with improved spacing for wider keyboard
  const getBlackKeyPosition = (keyName: string): string => {
    const positions: { [key: string]: string } = {
      // Octave 2
      'C#2': '2.1%',
      'D#2': '5.9%',
      'F#2': '13.5%',
      'G#2': '17.3%',
      'A#2': '21.1%',
      // Octave 3
      'C#3': '28.7%',
      'D#3': '32.5%',
      'F#3': '40.1%',
      'G#3': '43.9%',
      'A#3': '47.7%',
      // Octave 4
      'C#4': '55.3%',
      'D#4': '59.1%',
      'F#4': '66.7%',
      'G#4': '70.5%',
      'A#4': '74.3%',
      // Octave 5
      'C#5': '81.9%',
      'D#5': '85.7%',
      'F#5': '93.3%',
      'G#5': '97.1%',
      'A#5': '100.9%',
      // Octave 6
      'C#6': '108.5%',
      'D#6': '112.3%'
    };
    return positions[keyName] || '0%';
  };

  // Key size configurations
  const sizeConfigs = {
    small: { height: 'h-20', keyWidth: 'flex-1', fontSize: 'text-xs' },
    medium: { height: 'h-28', keyWidth: 'flex-1', fontSize: 'text-sm' },
    large: { height: 'h-36', keyWidth: 'flex-1', fontSize: 'text-base' }
  };

  const config = sizeConfigs[keySize];

  return (
    <div className={`relative bg-slate-800 p-4 rounded-xl ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Enhanced Control Panel */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Octave Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Octave:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOctaveShift(prev => Math.max(prev - 1, -3))}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white flex items-center justify-center transition-colors"
                disabled={octaveShift <= -3}
              >
                -
              </button>
              <span className="w-8 text-center text-sm text-white font-mono">
                {octaveShift >= 0 ? '+' : ''}{octaveShift}
              </span>
              <button
                onClick={() => setOctaveShift(prev => Math.min(prev + 1, 3))}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white flex items-center justify-center transition-colors"
                disabled={octaveShift >= 3}
              >
                +
              </button>
            </div>
          </div>

          {/* Polyphony Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Voices:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-cyan-400 font-mono">
                {activeVoices.current.size}/{maxPolyphony}
              </span>
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-150"
                  style={{ width: `${(activeVoices.current.size / maxPolyphony) * 100}%` }}
                />
              </div>
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
          {pressedKeys.size} active
          {sustainedKeys.current.size > 0 && ` • ${sustainedKeys.current.size} sustained`}
        </div>
      </div>

      {/* Enhanced Piano Keyboard */}
      <div 
        className={`relative ${config.height} flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800`}
        onMouseMove={handleMouseMove}
      >
        {/* White Keys */}
        {whiteKeys.map((keyName, index) => {
          const isPressed = pressedKeys.has(keyName) || sustainedKeys.current.has(keyName);
          const isSustained = sustainedKeys.current.has(keyName) && !pressedKeys.has(keyName);
          const computerKeys = pianoToKeyboard[keyName] || [];
          
          return (
            <button
              key={keyName}
              className={`${config.keyWidth} min-w-[2.5rem] h-full border border-slate-600 rounded-b-lg mx-0.5 transition-all duration-75 relative select-none ${
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
                    {computerKeys.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {computerKeys.slice(0, 2).map((key, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs px-1 py-0.5 rounded ${
                              isPressed 
                                ? 'bg-white/20 text-white' 
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {key}
                          </span>
                        ))}
                      </div>
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
            const computerKeys = pianoToKeyboard[keyName] || [];
            
            return (
              <button
                key={keyName}
                className={`absolute w-7 h-full rounded-b-lg transition-all duration-75 pointer-events-auto select-none ${
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
                      {computerKeys.length > 0 && (
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          isPressed 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-600 text-gray-300'
                        }`}>
                          {computerKeys[0]}
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

      {/* Enhanced Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          Enhanced polyphonic support • Up to {maxPolyphony} simultaneous notes • Multiple keyboard layers
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Shift+Z/X: Octave • Shift+C: Sustain • Shift+Space: Release all • Voice stealing when limit reached
        </p>
      </div>

      {/* Enhanced Active Keys Display */}
      {pressedKeys.size > 0 && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg">
            <span className="text-xs text-cyan-400">Playing ({activeVoices.current.size}):</span>
            <span className="text-xs text-white font-mono">
              {Array.from(pressedKeys).slice(0, 6).join(', ')}
              {pressedKeys.size > 6 && `... +${pressedKeys.size - 6}`}
            </span>
          </div>
        </div>
      )}

      {/* Voice allocation indicator */}
      {activeVoices.current.size > maxPolyphony * 0.8 && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-yellow-600/20 border border-yellow-600/50 rounded text-xs text-yellow-400">
            ⚠️ High polyphony usage - voice stealing may occur
          </div>
        </div>
      )}
    </div>
  );
}