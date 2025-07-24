'use client';

import { SynthState, OscillatorType } from '@/types';
import { Volume2, Zap } from 'lucide-react';

interface SynthControlsProps {
  synthState: SynthState;
  onStateChange: (state: SynthState) => void;
}

export default function SynthControls({ synthState, onStateChange }: SynthControlsProps) {
  const updateState = (updates: Partial<SynthState>) => {
    onStateChange({ ...synthState, ...updates });
  };

  const oscillatorTypes: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <h3 className="text-xl font-bold text-synth-accent mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Synthesizer Controls
      </h3>

      <div className="space-y-6">
        {/* Oscillator Section */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Oscillator</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {oscillatorTypes.map((type) => (
              <button
                key={type}
                onClick={() => updateState({ oscillatorType: type })}
                className={`synth-button ${synthState.oscillatorType === type ? 'active' : ''}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Filter</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cutoff: {synthState.filterCutoff}Hz
              </label>
              <input
                type="range"
                min="20"
                max="20000"
                step="10"
                value={synthState.filterCutoff}
                onChange={(e) => updateState({ filterCutoff: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resonance: {synthState.filterResonance.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={synthState.filterResonance}
                onChange={(e) => updateState({ filterResonance: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
          </div>
        </div>

        {/* ADSR Envelope */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">ADSR Envelope</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attack: {synthState.attack.toFixed(2)}s
              </label>
              <input
                type="range"
                min="0.01"
                max="2"
                step="0.01"
                value={synthState.attack}
                onChange={(e) => updateState({ attack: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Decay: {synthState.decay.toFixed(2)}s
              </label>
              <input
                type="range"
                min="0.01"
                max="2"
                step="0.01"
                value={synthState.decay}
                onChange={(e) => updateState({ decay: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sustain: {synthState.sustain.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={synthState.sustain}
                onChange={(e) => updateState({ sustain: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release: {synthState.release.toFixed(2)}s
              </label>
              <input
                type="range"
                min="0.01"
                max="3"
                step="0.01"
                value={synthState.release}
                onChange={(e) => updateState({ release: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
          </div>
        </div>

        {/* Master Volume */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Master Volume
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Volume: {Math.round(synthState.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={synthState.volume}
              onChange={(e) => updateState({ volume: Number(e.target.value) })}
              className="synth-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}