'use client';

import { DrumSequencerState } from '@/types';
import { Volume2 } from 'lucide-react';

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
          
          <button onClick={clearPattern} className="synth-button text-sm">
            Clear
          </button>
          
          <button onClick={randomizePattern} className="synth-button text-sm">
            Random
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-4">
        <div className="grid grid-cols-16 gap-1 mb-2">
          {Array(16).fill(null).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded ${
                drumState.currentStep === index 
                  ? 'bg-synth-accent' 
                  : index % 4 === 0 
                    ? 'bg-synth-info' 
                    : 'bg-synth-control'
              }`}
            />
          ))}
        </div>
        <div className="grid grid-cols-16 gap-1 text-xs text-gray-400">
          {Array(16).fill(null).map((_, index) => (
            <div key={index} className="text-center">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Drum patterns */}
      <div className="space-y-2">
        {drumState.sounds?.map((sound, soundIndex) => (
          <div key={soundIndex} className="flex items-center gap-2">
            <div className="w-20 text-sm font-medium text-gray-300 truncate">
              {sound?.name || `Sound ${soundIndex + 1}`}
            </div>
            
            <div className="grid grid-cols-16 gap-1 flex-1">
              {Array(16).fill(null).map((_, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => toggleStep(soundIndex, stepIndex)}
                  className={`drum-pad w-6 h-6 ${
                    drumState.pattern?.[soundIndex]?.[stepIndex] ? 'active' : ''
                  } ${
                    drumState.currentStep === stepIndex ? 'ring-2 ring-synth-info' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>Click the pads to create drum patterns. Each row represents a different drum sound.</p>
      </div>
    </div>
  );
}