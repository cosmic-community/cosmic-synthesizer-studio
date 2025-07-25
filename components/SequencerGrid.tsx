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

export interface SequencerPattern {
  id: string;
  name: string;
  steps: boolean[];
  note: number;
  active: boolean;
}

export interface SequencerGridProps {
  patterns: SequencerPattern[];
  currentStep: number;
  isPlaying: boolean;
  bpm: number;
  onPatternChange: (patternId: string, stepIndex: number, active: boolean) => void;
  onPlayToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onStateChange?: (state: any) => void;
  className?: string;
}

export default function SequencerGrid({ 
  patterns,
  currentStep,
  isPlaying,
  bpm,
  onPatternChange,
  onPlayToggle,
  onBpmChange,
  onStateChange,
  className 
}: SequencerGridProps) {
  const [viewOptions, setViewOptions] = useState({
    stepsPerPage: 16,
    currentPage: 0,
    zoom: 1,
    showVelocity: false,
    showNotes: false
  });

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ patternId: string; steps: number[] } | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleStep = (patternId: string, stepIndex: number) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern) {
      onPatternChange(patternId, stepIndex, !pattern.steps[stepIndex]);
    }
  };

  const clearPattern = (patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern) {
      pattern.steps.forEach((_, index) => {
        if (pattern.steps[index]) {
          onPatternChange(patternId, index, false);
        }
      });
    }
  };

  const randomizePattern = (patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern) {
      pattern.steps.forEach((_, index) => {
        const shouldBeActive = Math.random() > 0.7;
        if (pattern.steps[index] !== shouldBeActive) {
          onPatternChange(patternId, index, shouldBeActive);
        }
      });
    }
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
                onClick={onPlayToggle}
                className={`synth-button ${isPlaying ? 'active' : ''}`}
              >
                {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button className="synth-button">
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
                value={bpm}
                onChange={(e) => onBpmChange(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-synth-control border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <button className="synth-button">
              <Plus className="w-4 h-4" />
              Pattern
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
              Steps {startPage + 1}-{Math.min(endPage, 16)}
            </span>

            <button
              onClick={() => setViewOptions(prev => ({ 
                ...prev, 
                currentPage: prev.currentPage + 1
              }))}
              disabled={endPage >= 16}
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

            <button className="synth-button">
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
                stepIndex === currentStep ? 'bg-synth-accent text-black font-bold' : 'text-gray-400'
              } ${stepIndex % 4 === 0 ? 'border-r-white/30' : ''}`}
            >
              {stepIndex + 1}
            </div>
          ))}
        </div>

        {/* Pattern Rows */}
        <div className="space-y-1">
          {patterns.map((pattern) => (
            <div key={pattern.id} className="flex items-center">
              {/* Pattern Header */}
              <div className="w-32 flex-shrink-0 pr-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-synth-accent" />
                  <span className="text-sm font-medium text-white truncate flex-1">
                    {pattern.name}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => clearPattern(pattern.id)}
                      className="synth-button p-1"
                      title="Clear Pattern"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
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
                      onClick={() => toggleStep(pattern.id, stepIndex)}
                      className={`w-full h-full rounded-sm transition-all duration-100 ${
                        pattern.steps[stepIndex]
                          ? 'bg-synth-accent shadow-lg transform scale-95'
                          : 'hover:bg-synth-control/50'
                      } ${
                        stepIndex === currentStep && isPlaying
                          ? 'ring-2 ring-synth-accent'
                          : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}