'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Copy, 
  Scissors, 
  Volume2,
  Clock,
  Grid,
  Layers,
  Save,
  Load,
  Plus,
  Minus
} from 'lucide-react';

export interface SequencerStep {
  active: boolean;
  velocity: number;
  note?: number;
  length?: number;
  offset?: number;
}

export interface SequencerTrack {
  id: string;
  name: string;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  steps: SequencerStep[];
  instrument: string;
  channel: number;
}

export interface SequencerPattern {
  id: string;
  name: string;
  length: number;
  tracks: SequencerTrack[];
  bpm: number;
  swing: number;
  quantize: number;
}

export interface SequencerState {
  patterns: SequencerPattern[];
  currentPattern: string;
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  currentBar: number;
  playMode: 'pattern' | 'song' | 'loop';
  quantization: 'off' | '1/16' | '1/8' | '1/4';
  selectedTrack: string | null;
  selectedSteps: { trackId: string; stepIndex: number }[];
  clipboard: { trackId: string; steps: number[] } | null;
}

const createEmptyTrack = (id: string, name: string, color: string, instrument: string = 'synth'): SequencerTrack => ({
  id,
  name,
  color,
  muted: false,
  solo: false,
  volume: 80,
  steps: Array(64).fill(null).map(() => ({ 
    active: false, 
    velocity: 80, 
    note: 60,
    length: 1,
    offset: 0
  })),
  instrument,
  channel: 1
});

const defaultPattern: SequencerPattern = {
  id: 'pattern-1',
  name: 'Pattern 1',
  length: 16,
  bpm: 128,
  swing: 0,
  quantize: 16,
  tracks: [
    createEmptyTrack('kick', 'Kick', '#ff6b6b', 'drum'),
    createEmptyTrack('snare', 'Snare', '#4ecdc4', 'drum'),
    createEmptyTrack('hihat', 'Hi-Hat', '#45b7d1', 'drum'),
    createEmptyTrack('bass', 'Bass', '#96ceb4', 'synth'),
    createEmptyTrack('lead', 'Lead', '#ffeaa7', 'synth'),
    createEmptyTrack('pad', 'Pad', '#dda0dd', 'synth'),
    createEmptyTrack('perc', 'Perc', '#ff9ff3', 'drum'),
    createEmptyTrack('fx', 'FX', '#54a0ff', 'synth')
  ]
};

interface SequencerGridProps {
  onStateChange?: (state: SequencerState) => void;
  onStepTrigger?: (trackId: string, step: SequencerStep) => void;
  className?: string;
}

export default function SequencerGrid({ 
  onStateChange, 
  onStepTrigger,
  className 
}: SequencerGridProps) {
  const [sequencerState, setSequencerState] = useState<SequencerState>({
    patterns: [defaultPattern],
    currentPattern: 'pattern-1',
    isPlaying: false,
    isPaused: false,
    currentStep: 0,
    currentBar: 0,
    playMode: 'pattern',
    quantization: '1/16',
    selectedTrack: null,
    selectedSteps: [],
    clipboard: null
  });

  const [viewOptions, setViewOptions] = useState({
    stepsPerPage: 16,
    currentPage: 0,
    zoom: 1,
    showVelocity: false,
    showNotes: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pattern = sequencerState.patterns.find(p => p.id === sequencerState.currentPattern) || defaultPattern;

  // Transport control
  useEffect(() => {
    if (sequencerState.isPlaying && !sequencerState.isPaused) {
      const stepTime = (60000 / pattern.bpm / 4); // 16th notes in ms
      
      intervalRef.current = setInterval(() => {
        setSequencerState(prev => {
          const newStep = (prev.currentStep + 1) % pattern.length;
          const newBar = newStep === 0 ? prev.currentBar + 1 : prev.currentBar;
          
          // Trigger active steps
          pattern.tracks.forEach(track => {
            if (!track.muted && track.steps[prev.currentStep]?.active && onStepTrigger) {
              onStepTrigger(track.id, track.steps[prev.currentStep]);
            }
          });
          
          return {
            ...prev,
            currentStep: newStep,
            currentBar: newBar
          };
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
  }, [sequencerState.isPlaying, sequencerState.isPaused, pattern.bpm, pattern.length, onStepTrigger]);

  const updateSequencerState = (updates: Partial<SequencerState>) => {
    const newState = { ...sequencerState, ...updates };
    setSequencerState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  const updatePattern = (updates: Partial<SequencerPattern>) => {
    const newPatterns = sequencerState.patterns.map(p =>
      p.id === sequencerState.currentPattern ? { ...p, ...updates } : p
    );
    updateSequencerState({ patterns: newPatterns });
  };

  const updateTrack = (trackId: string, updates: Partial<SequencerTrack>) => {
    const newTracks = pattern.tracks.map(track =>
      track.id === trackId ? { ...track, ...updates } : track
    );
    updatePattern({ tracks: newTracks });
  };

  const toggleStep = (trackId: string, stepIndex: number) => {
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;

    const newSteps = [...track.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      active: !newSteps[stepIndex].active
    };
    
    updateTrack(trackId, { steps: newSteps });
  };

  const setStepVelocity = (trackId: string, stepIndex: number, velocity: number) => {
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;

    const newSteps = [...track.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      velocity: Math.max(0, Math.min(127, velocity))
    };
    
    updateTrack(trackId, { steps: newSteps });
  };

  const clearTrack = (trackId: string) => {
    const newSteps = Array(64).fill(null).map(() => ({ 
      active: false, 
      velocity: 80,
      note: 60,
      length: 1,
      offset: 0
    }));
    updateTrack(trackId, { steps: newSteps });
  };

  const duplicateTrack = (trackId: string) => {
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;

    const newTrack = {
      ...track,
      id: `${trackId}-copy-${Date.now()}`,
      name: `${track.name} Copy`,
      steps: [...track.steps]
    };

    updatePattern({ tracks: [...pattern.tracks, newTrack] });
  };

  const addTrack = () => {
    const newTrack = createEmptyTrack(
      `track-${Date.now()}`,
      `Track ${pattern.tracks.length + 1}`,
      `hsl(${Math.random() * 360}, 60%, 60%)`,
      'synth'
    );
    updatePattern({ tracks: [...pattern.tracks, newTrack] });
  };

  const removeTrack = (trackId: string) => {
    if (pattern.tracks.length > 1) {
      updatePattern({ 
        tracks: pattern.tracks.filter(t => t.id !== trackId) 
      });
    }
  };

  const copySteps = () => {
    if (sequencerState.selectedSteps.length > 0 && sequencerState.selectedTrack) {
      const stepIndices = sequencerState.selectedSteps
        .filter(s => s.trackId === sequencerState.selectedTrack)
        .map(s => s.stepIndex)
        .sort((a, b) => a - b);
      
      updateSequencerState({
        clipboard: {
          trackId: sequencerState.selectedTrack,
          steps: stepIndices
        }
      });
    }
  };

  const pasteSteps = (targetTrackId: string, startStep: number) => {
    if (!sequencerState.clipboard) return;

    const sourceTrack = pattern.tracks.find(t => t.id === sequencerState.clipboard!.trackId);
    const targetTrack = pattern.tracks.find(t => t.id === targetTrackId);
    
    if (!sourceTrack || !targetTrack) return;

    const newSteps = [...targetTrack.steps];
    sequencerState.clipboard.steps.forEach((sourceStepIndex, i) => {
      const targetStepIndex = startStep + i;
      if (targetStepIndex < newSteps.length) {
        newSteps[targetStepIndex] = { ...sourceTrack.steps[sourceStepIndex] };
      }
    });

    updateTrack(targetTrackId, { steps: newSteps });
  };

  const randomizeTrack = (trackId: string) => {
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;

    const newSteps = track.steps.map(step => ({
      ...step,
      active: Math.random() > 0.7,
      velocity: Math.floor(Math.random() * 64) + 64
    }));

    updateTrack(trackId, { steps: newSteps });
  };

  const startPage = viewOptions.currentPage * viewOptions.stepsPerPage;
  const endPage = startPage + viewOptions.stepsPerPage;
  const visibleSteps = Array.from({ length: viewOptions.stepsPerPage }, (_, i) => startPage + i);

  return (
    <div className={`bg-synth-panel rounded-lg overflow-hidden ${className || ''}`}>
      {/* Sequencer Header */}
      <div className="bg-synth-control/50 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-synth-accent flex items-center gap-2">
              <Grid className="w-5 h-5" />
              Step Sequencer
            </h3>

            {/* Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSequencerState({ 
                  isPlaying: !sequencerState.isPlaying,
                  isPaused: false
                })}
                className={`synth-button ${sequencerState.isPlaying ? 'active' : ''}`}
              >
                {sequencerState.isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => updateSequencerState({ isPaused: !sequencerState.isPaused })}
                className={`synth-button ${sequencerState.isPaused ? 'active' : ''}`}
                disabled={!sequencerState.isPlaying}
              >
                <Pause className="w-4 h-4" />
              </button>

              <button
                onClick={() => updateSequencerState({ 
                  isPlaying: false, 
                  isPaused: false, 
                  currentStep: 0,
                  currentBar: 0
                })}
                className="synth-button"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Pattern Controls */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">BPM:</label>
              <input
                type="number"
                min="60"
                max="200"
                value={pattern.bpm}
                onChange={(e) => updatePattern({ bpm: Number(e.target.value) })}
                className="w-16 px-2 py-1 bg-synth-control border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Length:</label>
              <select
                value={pattern.length}
                onChange={(e) => updatePattern({ length: Number(e.target.value) })}
                className="px-2 py-1 bg-synth-control border border-gray-600 rounded text-white text-sm"
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
                <option value={64}>64</option>
              </select>
            </div>

            <button onClick={addTrack} className="synth-button">
              <Plus className="w-4 h-4" />
              Track
            </button>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewOptions(prev => ({ 
                ...prev, 
                currentPage: Math.max(0, prev.currentPage - 1)
              }))}
              disabled={viewOptions.currentPage === 0}
              className="synth-button"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-300">
              Steps {startPage + 1}-{Math.min(endPage, pattern.length)}
            </span>

            <button
              onClick={() => setViewOptions(prev => ({ 
                ...prev, 
                currentPage: prev.currentPage + 1
              }))}
              disabled={endPage >= pattern.length}
              className="synth-button"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewOptions(prev => ({ ...prev, showVelocity: !prev.showVelocity }))}
              className={`synth-button text-sm ${viewOptions.showVelocity ? 'active' : ''}`}
            >
              Velocity
            </button>

            <button
              onClick={copySteps}
              disabled={sequencerState.selectedSteps.length === 0}
              className="synth-button"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Step Grid */}
      <div className="p-4 overflow-x-auto">
        {/* Step Numbers */}
        <div className="flex mb-2">
          <div className="w-32 flex-shrink-0"></div>
          {visibleSteps.map((stepIndex) => (
            <div
              key={stepIndex}
              className={`w-12 h-6 flex items-center justify-center text-xs border-r border-white/10 ${
                stepIndex === sequencerState.currentStep ? 'bg-synth-accent text-black font-bold' : 'text-gray-400'
              } ${stepIndex % 4 === 0 ? 'border-r-white/30' : ''}`}
            >
              {stepIndex + 1}
            </div>
          ))}
        </div>

        {/* Track Rows */}
        <div className="space-y-1">
          {pattern.tracks.map((track) => (
            <div key={track.id} className="flex items-center">
              {/* Track Header */}
              <div className="w-32 flex-shrink-0 pr-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="text-sm font-medium text-white truncate flex-1">
                    {track.name}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateTrack(track.id, { muted: !track.muted })}
                      className={`w-5 h-5 text-xs rounded ${track.muted ? 'bg-red-600 text-white' : 'bg-synth-control text-gray-400'}`}
                      title="Mute"
                    >
                      M
                    </button>
                    
                    <button
                      onClick={() => updateTrack(track.id, { solo: !track.solo })}
                      className={`w-5 h-5 text-xs rounded ${track.solo ? 'bg-yellow-600 text-white' : 'bg-synth-control text-gray-400'}`}
                      title="Solo"
                    >
                      S
                    </button>
                  </div>
                </div>

                {/* Track Controls */}
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="127"
                    value={track.volume}
                    onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) })}
                    className="flex-1 h-1 synth-slider"
                    title={`Volume: ${track.volume}`}
                  />
                  
                  <button
                    onClick={() => clearTrack(track.id)}
                    className="synth-button p-1"
                    title="Clear Track"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Step Buttons */}
              <div className="flex">
                {visibleSteps.map((stepIndex) => (
                  <div
                    key={stepIndex}
                    className={`relative w-12 h-12 border-r border-white/10 ${
                      stepIndex % 4 === 0 ? 'border-r-white/30' : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(track.id, stepIndex)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        updateSequencerState({ selectedTrack: track.id });
                      }}
                      className={`w-full h-full rounded-sm transition-all duration-100 ${
                        track.steps[stepIndex]?.active
                          ? 'shadow-lg transform scale-95'
                          : 'hover:bg-synth-control/50'
                      } ${
                        stepIndex === sequencerState.currentStep && sequencerState.isPlaying
                          ? 'ring-2 ring-synth-accent'
                          : ''
                      }`}
                      style={{
                        backgroundColor: track.steps[stepIndex]?.active 
                          ? track.color 
                          : 'transparent'
                      }}
                    >
                      {viewOptions.showVelocity && track.steps[stepIndex]?.active && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-black">
                            {track.steps[stepIndex].velocity}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Velocity Editor */}
                    {track.steps[stepIndex]?.active && viewOptions.showVelocity && (
                      <input
                        type="range"
                        min="1"
                        max="127"
                        value={track.steps[stepIndex].velocity}
                        onChange={(e) => setStepVelocity(track.id, stepIndex, Number(e.target.value))}
                        className="absolute bottom-0 left-0 right-0 h-1 opacity-75"
                        style={{ accentColor: track.color }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Track Context Menu */}
      {sequencerState.selectedTrack && (
        <div className="absolute bottom-4 right-4 bg-synth-panel border border-white/20 rounded-lg p-2 space-y-1 z-10">
          <button
            onClick={() => duplicateTrack(sequencerState.selectedTrack!)}
            className="synth-button w-full text-left text-sm"
          >
            Duplicate Track
          </button>
          <button
            onClick={() => randomizeTrack(sequencerState.selectedTrack!)}
            className="synth-button w-full text-left text-sm"
          >
            Randomize
          </button>
          <button
            onClick={() => clearTrack(sequencerState.selectedTrack!)}
            className="synth-button w-full text-left text-sm"
          >
            Clear Track
          </button>
          <button
            onClick={() => removeTrack(sequencerState.selectedTrack!)}
            className="synth-button w-full text-left text-sm hover:bg-red-600"
          >
            Remove Track
          </button>
          <button
            onClick={() => updateSequencerState({ selectedTrack: null })}
            className="synth-button w-full text-left text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}