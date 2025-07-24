'use client';

import { DrumSequencerState } from '@/types';
import { Volume2, Play, Square, RotateCcw, Shuffle } from 'lucide-react';

interface DrumSequencerProps {
  drumState: DrumSequencerState;
  onStateChange: (state: DrumSequencerState) => void;
}

export default function DrumSequencer({ drumState, onStateChange }: DrumSequencerProps) {
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
    const newPattern = Array(8).fill(null).map(() => 
      Array(16).fill(null).map(() => Math.random() > 0.7)
    );
    updateState({ pattern: newPattern });
  };

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-synth-accent flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Drum Sequencer
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
          
          <button onClick={clearPattern} className="synth-button text-sm flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
          
          <button onClick={randomizePattern} className="synth-button text-sm flex items-center gap-1">
            <Shuffle className="w-3 h-3" />
            Random
          </button>
        </div>
      </div>

      {/* Step indicator - horizontal layout */}
      <div className="mb-6">
        <div className="flex gap-1 mb-2">
          {Array(16).fill(null).map((_, index) => (
            <div
              key={index}
              className={`h-3 flex-1 rounded ${
                drumState.currentStep === index 
                  ? 'bg-synth-accent' 
                  : index % 4 === 0 
                    ? 'bg-synth-info' 
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

      {/* Drum patterns - horizontal layout */}
      <div className="space-y-3">
        {drumState.sounds?.map((sound, soundIndex) => (
          <div key={soundIndex} className="flex items-center gap-3">
            {/* Sound name */}
            <div className="w-20 text-sm font-medium text-gray-300 truncate flex-shrink-0">
              {sound?.name || `Sound ${soundIndex + 1}`}
            </div>
            
            {/* Pattern grid - horizontal */}
            <div className="flex gap-1 flex-1">
              {Array(16).fill(null).map((_, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => toggleStep(soundIndex, stepIndex)}
                  className={`drum-pad flex-1 h-8 rounded transition-all duration-150 ${
                    drumState.pattern?.[soundIndex]?.[stepIndex] 
                      ? 'bg-synth-accent border-synth-accent shadow-lg' 
                      : 'bg-synth-control border-gray-600 hover:bg-gray-600'
                  } ${
                    drumState.currentStep === stepIndex 
                      ? 'ring-2 ring-synth-info ring-opacity-50' 
                      : ''
                  } border`}
                />
              ))}
            </div>

            {/* Sound volume control */}
            <div className="w-12 flex-shrink-0">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sound?.volume || 0.8}
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
                  background: `linear-gradient(to right, #00d4ff 0%, #00d4ff ${((sound?.volume || 0.8) * 100)}%, #374151 ${((sound?.volume || 0.8) * 100)}%, #374151 100%)`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pattern controls */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          <p>Click pads to create patterns. Each row = different drum sound.</p>
        </div>
        
        <div className="flex gap-2">
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
    </div>
  );
}