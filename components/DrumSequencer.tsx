'use client';

import { useState, useEffect, useRef } from 'react';
import { DrumSequencerState, DrumSoundConfig } from '@/types';
import { Volume2, Play, Square, RotateCcw, Shuffle, Settings, Download } from 'lucide-react';
import DrumSoundSelector from './DrumSoundSelector';
import { drumKits, getDefaultDrumKit } from '@/lib/drumSounds';

interface DrumSequencerProps {
  drumState: DrumSequencerState;
  onStateChange: (state: DrumSequencerState) => void;
  onPlaySound?: (sound: DrumSoundConfig) => void;
}

export default function DrumSequencer({ drumState, onStateChange, onPlaySound }: DrumSequencerProps) {
  const [selectedKit, setSelectedKit] = useState('electronic');
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const [swing, setSwing] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with default kit sounds if no sounds are set
  useEffect(() => {
    if (!drumState.sounds || drumState.sounds.length === 0) {
      const defaultKit = getDefaultDrumKit();
      updateState({ 
        sounds: defaultKit.sounds.slice(0, 8),
        pattern: Array(8).fill(null).map(() => Array(16).fill(false))
      });
    }
  }, []);

  // Sequencer timing
  useEffect(() => {
    if (drumState.isPlaying) {
      const stepDuration = (60 / drumState.bpm / 4) * 1000; // 16th notes
      
      intervalRef.current = setInterval(() => {
        updateState({ 
          currentStep: (drumState.currentStep + 1) % 16 
        });
        
        // Trigger sounds for current step
        if (drumState.pattern && drumState.sounds) {
          drumState.sounds.forEach((sound, soundIndex) => {
            if (drumState.pattern![soundIndex]?.[drumState.currentStep] && onPlaySound) {
              // Apply swing timing
              const swingDelay = (drumState.currentStep % 2 === 1) ? swing * stepDuration * 0.1 : 0;
              setTimeout(() => onPlaySound(sound), swingDelay);
            }
          });
        }
      }, stepDuration);
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
  }, [drumState.isPlaying, drumState.bpm, drumState.currentStep, drumState.pattern, drumState.sounds, swing, onPlaySound]);

  const updateState = (updates: Partial<DrumSequencerState>) => {
    onStateChange({ ...drumState, ...updates });
  };

  const toggleStep = (soundIndex: number, stepIndex: number) => {
    if (!drumState.pattern || !drumState.pattern[soundIndex]) return;
    
    const newPattern = [...drumState.pattern];
    if (newPattern[soundIndex] && newPattern[soundIndex][stepIndex] !== undefined) {
      newPattern[soundIndex][stepIndex] = !newPattern[soundIndex][stepIndex];
      updateState({ pattern: newPattern });
    }
  };

  const clearPattern = () => {
    const newPattern = Array(8).fill(null).map(() => Array(16).fill(false));
    updateState({ pattern: newPattern });
  };

  const randomizePattern = () => {
    const newPattern = Array(8).fill(null).map((_, soundIndex) => {
      // Different probabilities for different sound types
      const sound = drumState.sounds?.[soundIndex];
      let probability = 0.15; // default
      
      if (sound) {
        switch (sound.type) {
          case 'kick':
            probability = 0.25;
            break;
          case 'snare':
          case 'clap':
            probability = 0.2;
            break;
          case 'hihat':
            probability = 0.4;
            break;
          case 'openhat':
            probability = 0.1;
            break;
          case 'perc':
            probability = 0.15;
            break;
          default:
            probability = 0.12;
        }
      }
      
      return Array(16).fill(null).map(() => Math.random() < probability);
    });
    updateState({ pattern: newPattern });
  };

  const duplicatePattern = (soundIndex: number) => {
    if (!drumState.pattern || !drumState.pattern[soundIndex]) return;
    
    const pattern = drumState.pattern[soundIndex];
    const newPattern = [...drumState.pattern];
    
    // Find next empty slot
    const emptySlot = newPattern.findIndex((p, i) => i !== soundIndex && p.every(step => !step));
    if (emptySlot >= 0) {
      newPattern[emptySlot] = [...pattern];
      updateState({ pattern: newPattern });
    }
  };

  const shiftPattern = (soundIndex: number, direction: 'left' | 'right') => {
    if (!drumState.pattern || !drumState.pattern[soundIndex]) return;
    
    const pattern = [...drumState.pattern[soundIndex]];
    const newPattern = [...drumState.pattern];
    
    if (direction === 'left') {
      pattern.push(pattern.shift()!);
    } else {
      pattern.unshift(pattern.pop()!);
    }
    
    newPattern[soundIndex] = pattern;
    updateState({ pattern: newPattern });
  };

  const exportPattern = () => {
    const patternData = {
      kit: selectedKit,
      sounds: drumState.sounds,
      pattern: drumState.pattern,
      bpm: drumState.bpm,
      swing,
      volume
    };
    
    const blob = new Blob([JSON.stringify(patternData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drum-pattern-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKitChange = (kitId: string) => {
    setSelectedKit(kitId);
    const kit = drumKits.find(k => k.id === kitId);
    if (kit) {
      updateState({ 
        sounds: kit.sounds.slice(0, 8),
        bpm: kit.bpm || drumState.bpm
      });
    }
  };

  const handleSoundsChange = (sounds: DrumSoundConfig[]) => {
    updateState({ sounds: sounds.slice(0, 8) });
  };

  const getStepIntensity = (soundIndex: number, stepIndex: number): number => {
    if (!drumState.pattern?.[soundIndex]?.[stepIndex]) return 0;
    
    // Add some variation based on step position
    let intensity = 0.8;
    
    // Accents on downbeats
    if (stepIndex % 4 === 0) intensity += 0.2;
    // Slight accent on off-beats
    if (stepIndex % 2 === 1) intensity += 0.1;
    
    return Math.min(intensity, 1.0);
  };

  return (
    <div className="bg-synth-panel p-6 rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-synth-accent flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Advanced Drum Sequencer
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">BPM:</label>
            <input
              type="number"
              min="60"
              max="200"
              value={drumState.bpm}
              onChange={(e) => updateState({ bpm: Number(e.target.value) })}
              className="w-16 px-2 py-1 bg-synth-control border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Swing:</label>
            <input
              type="range"
              min="0"
              max="50"
              value={swing}
              onChange={(e) => setSwing(Number(e.target.value))}
              className="w-16"
            />
          </div>
          
          <button onClick={clearPattern} className="synth-button text-sm flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
          
          <button onClick={randomizePattern} className="synth-button text-sm flex items-center gap-1">
            <Shuffle className="w-3 h-3" />
            Random
          </button>
          
          <button 
            onClick={() => setShowSoundSelector(!showSoundSelector)} 
            className={`synth-button text-sm flex items-center gap-1 ${showSoundSelector ? 'active' : ''}`}
          >
            <Settings className="w-3 h-3" />
            Sounds
          </button>
          
          <button onClick={exportPattern} className="synth-button text-sm flex items-center gap-1">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Step indicator - enhanced with swing visualization */}
      <div className="mb-6">
        <div className="flex gap-1 mb-2">
          {Array(16).fill(null).map((_, index) => (
            <div
              key={index}
              className={`h-3 flex-1 rounded transition-all duration-150 ${
                drumState.currentStep === index 
                  ? 'bg-synth-accent shadow-lg' 
                  : index % 4 === 0 
                    ? 'bg-synth-info' 
                    : index % 2 === 1 && swing > 0
                      ? 'bg-yellow-500 opacity-50'
                      : 'bg-synth-control'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1 text-xs text-gray-400">
          {Array(16).fill(null).map((_, index) => (
            <div key={index} className="flex-1 text-center">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Drum patterns - enhanced with better visualization */}
      <div className="space-y-2">
        {drumState.sounds?.map((sound, soundIndex) => (
          <div key={soundIndex} className="flex items-center gap-3 group">
            {/* Sound info */}
            <div className="w-24 text-sm font-medium text-gray-300 truncate flex-shrink-0">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sound.color || '#888888' }}
                />
                <span className="truncate">{sound.name}</span>
              </div>
            </div>
            
            {/* Pattern grid */}
            <div className="flex gap-1 flex-1">
              {Array(16).fill(null).map((_, stepIndex) => {
                const isActive = drumState.pattern?.[soundIndex]?.[stepIndex];
                const intensity = getStepIntensity(soundIndex, stepIndex);
                
                return (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(soundIndex, stepIndex)}
                    className={`drum-pad flex-1 h-8 rounded transition-all duration-150 border ${
                      isActive
                        ? 'border-synth-accent shadow-lg' 
                        : 'border-gray-600 hover:border-gray-500'
                    } ${
                      drumState.currentStep === stepIndex 
                        ? 'ring-2 ring-synth-info ring-opacity-50' 
                        : ''
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? sound.color || '#00d4ff'
                        : 'transparent',
                      opacity: isActive ? intensity : 0.3
                    }}
                  />
                );
              })}
            </div>

            {/* Sound controls */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onPlaySound?.(sound)}
                className="w-6 h-6 bg-synth-accent rounded flex items-center justify-center hover:bg-synth-info transition-colors"
              >
                <Play className="w-3 h-3 text-black" />
              </button>
              
              <button
                onClick={() => shiftPattern(soundIndex, 'left')}
                className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500 transition-colors text-xs"
              >
                ←
              </button>
              
              <button
                onClick={() => shiftPattern(soundIndex, 'right')}
                className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500 transition-colors text-xs"
              >
                →
              </button>
            </div>

            {/* Volume control */}
            <div className="w-16 flex-shrink-0">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sound.volume || 0.8}
                onChange={(e) => {
                  const newSounds = [...(drumState.sounds || [])];
                  if (newSounds[soundIndex]) {
                    newSounds[soundIndex] = {
                      ...newSounds[soundIndex],
                      volume: Number(e.target.value)
                    };
                    updateState({ sounds: newSounds });
                  }
                }}
                className="w-full h-2 bg-synth-control rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${sound.color || '#00d4ff'} 0%, ${sound.color || '#00d4ff'} ${((sound.volume || 0.8) * 100)}%, #374151 ${((sound.volume || 0.8) * 100)}%, #374151 100%)`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Transport controls */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-600">
        <div className="text-sm text-gray-400 space-y-1">
          <p>Click pads to create patterns • Use sound selector for different kits</p>
          <p>Swing: {swing}% • Master Volume: {Math.round(volume * 100)}%</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Master:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20"
            />
          </div>
          
          <button
            onClick={() => updateState({ isPlaying: !drumState.isPlaying })}
            className={`synth-button flex items-center gap-2 ${drumState.isPlaying ? 'active' : ''}`}
          >
            {drumState.isPlaying ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sound Selector */}
      {showSoundSelector && (
        <div className="border-t border-gray-600 pt-6">
          <DrumSoundSelector
            selectedKit={selectedKit}
            selectedSounds={drumState.sounds || []}
            onKitChange={handleKitChange}
            onSoundsChange={handleSoundsChange}
            onPlaySound={onPlaySound}
          />
        </div>
      )}
    </div>
  );
}