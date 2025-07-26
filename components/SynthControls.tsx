'use client';

import { SynthState } from '@/types';
import ModernKnob from './ModernKnob';
import ModernSlider from './ModernSlider';

interface SynthControlsProps {
  synthState: SynthState;
  onStateChange: (state: SynthState) => void;
}

export default function SynthControls({ synthState, onStateChange }: SynthControlsProps) {
  const handleOscillatorChange = (type: string) => {
    onStateChange({
      ...synthState,
      oscillatorType: type as any
    });
  };

  const handleFilterChange = (property: string, value: number) => {
    onStateChange({
      ...synthState,
      [property]: value
    });
  };

  const handleEnvelopeChange = (property: string, value: number) => {
    onStateChange({
      ...synthState,
      [property]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Oscillator Section */}
        <div className="glass-panel p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">Oscillator</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 mb-2">Waveform</label>
              <select
                value={synthState.oscillatorType}
                onChange={(e) => handleOscillatorChange(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="glass-panel p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">Filter</h4>
          <div className="space-y-4">
            <ModernKnob
              label="Cutoff"
              value={synthState.filterCutoff}
              min={20}
              max={20000}
              onChange={(value) => handleFilterChange('filterCutoff', value)}
              unit="Hz"
            />
            <ModernKnob
              label="Resonance"
              value={synthState.filterResonance}
              min={0.1}
              max={30}
              onChange={(value) => handleFilterChange('filterResonance', value)}
            />
          </div>
        </div>

        {/* Envelope Section */}
        <div className="glass-panel p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">Envelope</h4>
          <div className="space-y-3">
            <ModernSlider
              label="Attack"
              value={synthState.attack}
              min={0.001}
              max={2}
              step={0.001}
              onChange={(value) => handleEnvelopeChange('attack', value)}
              unit="s"
            />
            <ModernSlider
              label="Decay"
              value={synthState.decay}
              min={0.001}
              max={2}
              step={0.001}
              onChange={(value) => handleEnvelopeChange('decay', value)}
              unit="s"
            />
            <ModernSlider
              label="Sustain"
              value={synthState.sustain}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleEnvelopeChange('sustain', value)}
            />
            <ModernSlider
              label="Release"
              value={synthState.release}
              min={0.001}
              max={3}
              step={0.001}
              onChange={(value) => handleEnvelopeChange('release', value)}
              unit="s"
            />
          </div>
        </div>

        {/* Volume Section */}
        <div className="glass-panel p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">Output</h4>
          <div className="space-y-4">
            <ModernKnob
              label="Volume"
              value={synthState.volume}
              min={0}
              max={1}
              onChange={(value) => handleEnvelopeChange('volume', value)}
              unit="%"
              displayValue={Math.round(synthState.volume * 100)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}