'use client';

import { DrumSequencerState } from '@/types';
import { Play, Square } from 'lucide-react';

interface DrumSequencerProps {
  drumState: DrumSequencerState;
  onStateChange: (state: DrumSequencerState) => void;
}

export default function DrumSequencer({ drumState, onStateChange }: DrumSequencerProps) {
  const toggleStep = (soundIndex: number, stepIndex: number) => {
    const newPattern = [...(drumState.pattern || [])];
    if (!newPattern[soundIndex]) {
      newPattern[soundIndex] = Array(16).fill(false);
    }
    newPattern[soundIndex][stepIndex] = !newPattern[soundIndex][stepIndex];
    
    onStateChange({
      ...drumState,
      pattern: newPattern
    });
  };

  const selectSound = (soundIndex: number) => {
    onStateChange({
      ...drumState,
      selectedSound: soundIndex
    });
  };

  const updateBPM = (bpm: number) => {
    onStateChange({
      ...drumState,
      bpm: Math.max(60, Math.min(200, bpm))
    });
  };

  const clearPattern = () => {
    onStateChange({
      ...drumState,
      pattern: Array(8).fill(null).map(() => Array(16).fill(false)),
      currentStep: 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Transport Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">BPM:</span>
            <input
              type="number"
              min="60"
              max="200"
              value={drumState.bpm}
              onChange={(e) => updateBPM(parseInt(e.target.value))}
              className="w-16 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-white text-sm text-center"
            />
          </div>
          
          <button
            onClick={clearPattern}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
            drumState.isPlaying ? 'bg-green-900/50 text-green-400' : 'bg-slate-700/50 text-slate-400'
          }`}>
            {drumState.isPlaying ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            {drumState.isPlaying ? 'Playing' : 'Stopped'}
          </div>
        </div>
      </div>

      {/* Step Sequencer Grid */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="space-y-3">
          {/* Step Numbers */}
          <div className="flex items-center gap-1">
            <div className="w-20 text-xs text-slate-400">Track</div>
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 text-center text-xs py-1 rounded ${
                  drumState.currentStep === i
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Drum Tracks */}
          {(drumState.sounds || []).map((sound, soundIndex) => (
            <div key={soundIndex} className="flex items-center gap-1">
              {/* Sound Name */}
              <button
                onClick={() => selectSound(soundIndex)}
                className={`w-20 text-left text-xs px-2 py-2 rounded transition-colors ${
                  drumState.selectedSound === soundIndex
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {sound.name}
              </button>

              {/* Step Buttons */}
              {Array.from({ length: 16 }, (_, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => toggleStep(soundIndex, stepIndex)}
                  className={`flex-1 h-8 rounded transition-all ${
                    drumState.pattern?.[soundIndex]?.[stepIndex]
                      ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600'
                  } ${
                    drumState.isPlaying && drumState.currentStep === stepIndex
                      ? 'ring-2 ring-yellow-400'
                      : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sound Parameters */}
      {drumState.sounds && drumState.sounds[drumState.selectedSound] && (
        <div className="glass-panel p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">
            {drumState.sounds[drumState.selectedSound].name} Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-2">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={drumState.sounds[drumState.selectedSound].volume}
                onChange={(e) => {
                  const newSounds = [...drumState.sounds];
                  newSounds[drumState.selectedSound] = {
                    ...newSounds[drumState.selectedSound],
                    volume: parseFloat(e.target.value)
                  };
                  onStateChange({ ...drumState, sounds: newSounds });
                }}
                className="w-full slider-modern"
              />
              <div className="text-xs text-slate-400 mt-1">
                {Math.round(drumState.sounds[drumState.selectedSound].volume * 100)}%
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-2">Decay</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.01"
                value={drumState.sounds[drumState.selectedSound].decay}
                onChange={(e) => {
                  const newSounds = [...drumState.sounds];
                  newSounds[drumState.selectedSound] = {
                    ...newSounds[drumState.selectedSound],
                    decay: parseFloat(e.target.value)
                  };
                  onStateChange({ ...drumState, sounds: newSounds });
                }}
                className="w-full slider-modern"
              />
              <div className="text-xs text-slate-400 mt-1">
                {drumState.sounds[drumState.selectedSound].decay.toFixed(2)}s
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-2">Frequency</label>
              <input
                type="range"
                min="20"
                max="10000"
                step="1"
                value={drumState.sounds[drumState.selectedSound].frequency}
                onChange={(e) => {
                  const newSounds = [...drumState.sounds];
                  newSounds[drumState.selectedSound] = {
                    ...newSounds[drumState.selectedSound],
                    frequency: parseFloat(e.target.value)
                  };
                  onStateChange({ ...drumState, sounds: newSounds });
                }}
                className="w-full slider-modern"
              />
              <div className="text-xs text-slate-400 mt-1">
                {Math.round(drumState.sounds[drumState.selectedSound].frequency)}Hz
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}