'use client';

import { DrumSequencerState } from '@/types';
import { Play, Square, RotateCcw, Volume2, Settings, Copy, Shuffle } from 'lucide-react';
import { useState } from 'react';

interface DrumSequencerProps {
  drumState: DrumSequencerState;
  onStateChange: (state: DrumSequencerState) => void;
}

export default function DrumSequencer({ drumState, onStateChange }: DrumSequencerProps) {
  const [showSettings, setShowSettings] = useState(false);

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

  const randomizePattern = () => {
    const newPattern = Array(8).fill(null).map((_, soundIndex) => 
      Array(16).fill(null).map(() => Math.random() > 0.7)
    );
    
    onStateChange({
      ...drumState,
      pattern: newPattern
    });
  };

  const copyPattern = (fromSound: number, toSound: number) => {
    if (!drumState.pattern?.[fromSound]) return;
    
    const newPattern = [...drumState.pattern];
    newPattern[toSound] = [...newPattern[fromSound]];
    
    onStateChange({
      ...drumState,
      pattern: newPattern
    });
  };

  const getStepIntensity = (soundIndex: number, stepIndex: number) => {
    if (!drumState.pattern?.[soundIndex]?.[stepIndex]) return 0;
    return drumState.sounds?.[soundIndex]?.volume || 0.8;
  };

  return (
    <div className="space-y-6">
      {/* Transport Controls */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300 font-medium">BPM:</span>
              <input
                type="number"
                min="60"
                max="200"
                value={drumState.bpm}
                onChange={(e) => updateBPM(parseInt(e.target.value))}
                className="w-20 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm text-center font-mono focus:border-synth-accent focus:outline-none transition-colors"
              />
              <div className="w-12 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-synth-accent transition-all duration-200"
                  style={{ width: `${((drumState.bpm - 60) / 140) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={clearPattern}
                className="synth-button-small flex items-center gap-1 hover:bg-red-600"
                title="Clear Pattern"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
              
              <button
                onClick={randomizePattern}
                className="synth-button-small flex items-center gap-1"
                title="Randomize Pattern"
              >
                <Shuffle className="w-3 h-3" />
                Random
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`synth-button-small flex items-center gap-1 ${showSettings ? 'bg-synth-accent text-black' : ''}`}
                title="Settings"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
              drumState.isPlaying 
                ? 'bg-green-900/50 text-green-400' 
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              {drumState.isPlaying ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
              <span className="font-mono">
                {drumState.isPlaying ? `${(drumState.currentStep % 4) + 1}/4` : 'STOP'}
              </span>
            </div>
            
            <div className="text-xs text-slate-500 font-mono">
              Step: {drumState.currentStep + 1}/16
            </div>
          </div>
        </div>
      </div>

      {/* Step Sequencer Grid */}
      <div className="glass-panel p-6 rounded-xl">
        <div className="space-y-3">
          {/* Step Numbers Header */}
          <div className="flex items-center gap-1">
            <div className="w-24 text-xs text-slate-400 font-medium">Track</div>
            <div className="w-8 text-xs text-slate-400">Vol</div>
            <div className="w-8 text-xs text-slate-400">Copy</div>
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 text-center text-xs py-2 rounded-lg font-mono transition-all ${
                  drumState.currentStep === i
                    ? 'bg-synth-accent text-black shadow-lg'
                    : i % 4 === 0
                    ? 'bg-slate-600/50 text-slate-300 font-semibold'
                    : 'bg-slate-700/30 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Drum Tracks */}
          {(drumState.sounds || []).map((sound, soundIndex) => (
            <div key={soundIndex} className="flex items-center gap-1">
              {/* Sound Name Button */}
              <button
                onClick={() => selectSound(soundIndex)}
                className={`w-24 text-left text-xs px-3 py-2 rounded-lg transition-all font-medium ${
                  drumState.selectedSound === soundIndex
                    ? 'bg-synth-accent text-black shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                }`}
              >
                <div className="truncate">{sound.name}</div>
                <div className="text-xs opacity-60 truncate">
                  {sound.type}
                </div>
              </button>

              {/* Volume Control */}
              <div className="w-8 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sound.volume}
                  onChange={(e) => {
                    const newSounds = [...drumState.sounds];
                    newSounds[soundIndex] = {
                      ...newSounds[soundIndex],
                      volume: parseFloat(e.target.value)
                    };
                    onStateChange({ ...drumState, sounds: newSounds });
                  }}
                  className="w-full h-1 slider-modern"
                  style={{ writingMode: 'bt-lr', appearance: 'slider-vertical' }}
                />
              </div>

              {/* Copy Button */}
              <button
                onClick={() => {
                  // Simple copy to next track
                  const nextTrack = (soundIndex + 1) % drumState.sounds.length;
                  copyPattern(soundIndex, nextTrack);
                }}
                className="w-8 h-8 flex items-center justify-center rounded bg-slate-700/30 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors"
                title="Copy to next track"
              >
                <Copy className="w-3 h-3" />
              </button>

              {/* Step Buttons */}
              {Array.from({ length: 16 }, (_, stepIndex) => {
                const isActive = drumState.pattern?.[soundIndex]?.[stepIndex];
                const intensity = getStepIntensity(soundIndex, stepIndex);
                const isCurrentStep = drumState.isPlaying && drumState.currentStep === stepIndex;
                
                return (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(soundIndex, stepIndex)}
                    className={`flex-1 h-10 rounded-lg transition-all duration-150 relative ${
                      isActive
                        ? 'bg-gradient-to-br from-synth-accent to-cyan-500 shadow-lg'
                        : 'bg-slate-700/30 hover:bg-slate-600/40 border border-slate-600/50'
                    } ${
                      isCurrentStep
                        ? 'ring-2 ring-yellow-400 ring-opacity-75'
                        : ''
                    }`}
                    style={{
                      opacity: isActive ? Math.max(0.6, intensity) : 1
                    }}
                  >
                    {/* Step intensity indicator */}
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-white/20 rounded-b-lg transition-all"
                        style={{ height: `${intensity * 100}%` }}
                      />
                    )}
                    
                    {/* Beat indicator dots */}
                    {stepIndex % 4 === 0 && !isActive && (
                      <div className="absolute top-1 left-1 w-1 h-1 bg-slate-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Sound Parameters Panel */}
      {drumState.sounds && drumState.sounds[drumState.selectedSound] && (
        <div className="glass-panel p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-synth-accent mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {drumState.sounds[drumState.selectedSound].name} Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Volume</label>
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
              <div className="text-xs text-slate-400 mt-1 font-mono text-center">
                {Math.round(drumState.sounds[drumState.selectedSound].volume * 100)}%
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Decay</label>
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
              <div className="text-xs text-slate-400 mt-1 font-mono text-center">
                {drumState.sounds[drumState.selectedSound].decay.toFixed(2)}s
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Frequency</label>
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
              <div className="text-xs text-slate-400 mt-1 font-mono text-center">
                {Math.round(drumState.sounds[drumState.selectedSound].frequency)}Hz
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Type</label>
              <select
                value={drumState.sounds[drumState.selectedSound].type}
                onChange={(e) => {
                  const newSounds = [...drumState.sounds];
                  newSounds[drumState.selectedSound] = {
                    ...newSounds[drumState.selectedSound],
                    type: e.target.value as any
                  };
                  onStateChange({ ...drumState, sounds: newSounds });
                }}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-synth-accent focus:outline-none"
              >
                <option value="kick">Kick</option>
                <option value="snare">Snare</option>
                <option value="hihat">Hi-Hat</option>
                <option value="openhat">Open Hat</option>
                <option value="clap">Clap</option>
                <option value="crash">Crash</option>
                <option value="ride">Ride</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pattern Overview */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            <span>Pattern Length: 16 steps</span>
            <span>Time Signature: 4/4</span>
            <span>Active Tracks: {drumState.pattern?.filter(track => track?.some(step => step)).length || 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-synth-accent rounded-full animate-pulse"></div>
            <span className="text-synth-accent text-sm font-medium">
              {drumState.isPlaying ? 'PLAYING' : 'STOPPED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}