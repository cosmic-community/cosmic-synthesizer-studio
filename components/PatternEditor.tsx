'use client';

import { useState, useEffect, useRef } from 'react';
import { Grid3x3, Play, Pause, Copy, Trash2, RotateCcw, Shuffle, Volume2 } from 'lucide-react';
import { DrumSoundConfig } from '@/types';

interface Pattern {
  id: string;
  name: string;
  steps: boolean[][];
  length: number;
  sounds: DrumSoundConfig[];
}

interface PatternEditorProps {
  onPatternChange?: (pattern: Pattern) => void;
  audioEngine?: any;
}

export default function PatternEditor({ onPatternChange, audioEngine }: PatternEditorProps) {
  const [currentPattern, setCurrentPattern] = useState<Pattern>({
    id: '1',
    name: 'Rock Beat',
    length: 16,
    sounds: [
      { name: 'Kick', type: 'kick', frequency: 60, decay: 0.5, volume: 0.8, oscillatorType: 'sine' },
      { name: 'Snare', type: 'snare', frequency: 200, decay: 0.2, volume: 0.7, oscillatorType: 'square' },
      { name: 'Hi-Hat', type: 'hihat', frequency: 8000, decay: 0.1, volume: 0.6, oscillatorType: 'square' },
      { name: 'Open Hat', type: 'openhat', frequency: 9000, decay: 0.3, volume: 0.5, oscillatorType: 'square' },
    ],
    steps: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-Hat
      [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true] // Open Hat
    ]
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSound, setSelectedSound] = useState(0);
  const [bpm, setBpm] = useState(128);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      if (audioEngine && !audioInitialized) {
        try {
          await audioEngine.init();
          await audioEngine.resume();
          setAudioInitialized(true);
          console.log('Audio engine initialized successfully');
        } catch (error) {
          console.error('Failed to initialize audio engine:', error);
        }
      }
    };
    
    initAudio();
  }, [audioEngine, audioInitialized]);

  // Update parent component when pattern changes
  useEffect(() => {
    if (onPatternChange) {
      onPatternChange(currentPattern);
    }
  }, [currentPattern, onPatternChange]);

  // Handle playback
  useEffect(() => {
    if (isPlaying && audioInitialized) {
      const stepTime = (60 / bpm / 4) * 1000; // 16th notes
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % currentPattern.length;
          
          // Play sounds for current step
          if (audioEngine) {
            currentPattern.steps.forEach((track, soundIndex) => {
              if (track[prev] && currentPattern.sounds[soundIndex]) {
                try {
                  audioEngine.playDrumSound(currentPattern.sounds[soundIndex]);
                } catch (error) {
                  console.error('Error playing drum sound:', error);
                }
              }
            });
          }
          
          return nextStep;
        });
      }, stepTime);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, currentPattern, audioEngine, audioInitialized]);

  const toggleStep = (soundIndex: number, stepIndex: number) => {
    setCurrentPattern(prev => ({
      ...prev,
      steps: prev.steps.map((sound, i) =>
        i === soundIndex
          ? sound.map((step, j) => (j === stepIndex ? !step : step))
          : sound
      )
    }));
  };

  const clearPattern = () => {
    setCurrentPattern(prev => ({
      ...prev,
      steps: prev.steps.map(sound => sound.map(() => false))
    }));
  };

  const randomizePattern = () => {
    setCurrentPattern(prev => ({
      ...prev,
      steps: prev.steps.map(sound =>
        sound.map(() => Math.random() < 0.3) // 30% chance for each step
      )
    }));
  };

  const copyPattern = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPattern));
  };

  const togglePlayback = async () => {
    if (!audioInitialized && audioEngine) {
      try {
        await audioEngine.init();
        await audioEngine.resume();
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio for playback:', error);
        return;
      }
    }
    setIsPlaying(!isPlaying);
  };

  const testSound = async (soundIndex: number) => {
    if (!audioInitialized && audioEngine) {
      try {
        await audioEngine.init();
        await audioEngine.resume();
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio for test:', error);
        return;
      }
    }
    
    if (audioEngine && currentPattern.sounds[soundIndex]) {
      try {
        audioEngine.playDrumSound(currentPattern.sounds[soundIndex]);
      } catch (error) {
        console.error('Error testing sound:', error);
      }
    }
  };

  const updateSoundVolume = (soundIndex: number, volume: number) => {
    setCurrentPattern(prev => ({
      ...prev,
      sounds: prev.sounds.map((sound, i) =>
        i === soundIndex ? { ...sound, volume } : sound
      )
    }));
  };

  const getSoundColor = (index: number) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-synth-control rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="w-5 h-5 text-synth-accent" />
        <h3 className="text-lg font-semibold text-white">Pattern Editor</h3>
        {!audioInitialized && (
          <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
            Audio not ready - click play to initialize
          </span>
        )}
      </div>

      {/* Pattern Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <input
            type="text"
            value={currentPattern.name}
            onChange={(e) => setCurrentPattern(prev => ({ ...prev, name: e.target.value }))}
            className="bg-transparent text-white font-medium border-none outline-none"
          />
          <div className="text-sm text-gray-400">{currentPattern.length} steps • {bpm} BPM</div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={togglePlayback}
            className="synth-button-small"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={copyPattern} className="synth-button-small">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={randomizePattern} className="synth-button-small">
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={clearPattern} className="synth-button-small">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BPM Control */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">BPM:</span>
        <input
          type="range"
          min="60"
          max="200"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-white w-8">{bpm}</span>
      </div>

      {/* Step Sequencer Grid */}
      <div className="space-y-2">
        {/* Step Numbers */}
        <div className="flex gap-1 ml-24">
          {Array.from({ length: currentPattern.length }, (_, i) => (
            <div
              key={i}
              className={`w-6 h-4 flex items-center justify-center text-xs rounded ${
                i === currentStep && isPlaying
                  ? 'bg-synth-accent text-white'
                  : i % 4 === 0
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Sound Rows */}
        {currentPattern.sounds.map((sound, soundIndex) => (
          <div key={soundIndex} className="flex items-center gap-1">
            {/* Sound Label and Controls */}
            <div className="w-20 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => testSound(soundIndex)}
                  className={`h-6 text-xs rounded flex items-center justify-center font-medium transition-colors px-2 ${
                    selectedSound === soundIndex
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: selectedSound === soundIndex ? getSoundColor(soundIndex) : 'transparent',
                    border: `1px solid ${getSoundColor(soundIndex)}`
                  }}
                >
                  {sound.name}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className="w-2 h-2 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sound.volume}
                  onChange={(e) => updateSoundVolume(soundIndex, parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Step Buttons */}
            {currentPattern.steps[soundIndex]?.map((isActive, stepIndex) => (
              <button
                key={stepIndex}
                onClick={() => toggleStep(soundIndex, stepIndex)}
                className={`w-6 h-6 rounded transition-all ${
                  isActive
                    ? 'shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${
                  stepIndex === currentStep && isPlaying
                    ? 'ring-2 ring-white'
                    : ''
                }`}
                style={{
                  backgroundColor: isActive ? getSoundColor(soundIndex) : undefined
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pattern Length Control */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm text-gray-400">Length:</span>
        <div className="flex gap-1">
          {[8, 16, 32].map(length => (
            <button
              key={length}
              onClick={() => {
                setCurrentPattern(prev => ({
                  ...prev,
                  length,
                  steps: prev.steps.map(sound => {
                    const newSound = [...sound];
                    if (length > sound.length) {
                      // Extend with false values
                      while (newSound.length < length) {
                        newSound.push(false);
                      }
                    } else {
                      // Truncate
                      newSound.splice(length);
                    }
                    return newSound;
                  })
                }));
              }}
              className={`px-2 py-1 text-xs rounded ${
                currentPattern.length === length
                  ? 'bg-synth-accent text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {length}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}