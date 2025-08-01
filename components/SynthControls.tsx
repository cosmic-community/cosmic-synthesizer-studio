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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Oscillator Section */}
        <div className="glass-panel p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-synth-accent mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-synth-accent rounded-full"></span>
            Oscillator
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-3 font-medium">Waveform</label>
              <div className="grid grid-cols-2 gap-2">
                {['sine', 'square', 'sawtooth', 'triangle'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleOscillatorChange(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      synthState.oscillatorType === type
                        ? 'bg-synth-accent text-black shadow-lg'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Waveform Preview */}
            <div className="h-16 bg-slate-800/50 rounded-lg flex items-center justify-center">
              <div className="text-xs text-slate-400 font-mono">
                {synthState.oscillatorType.toUpperCase()} WAVE
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="glass-panel p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-synth-accent mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Filter
          </h4>
          <div className="space-y-6">
            <ModernKnob
              label="Cutoff"
              value={synthState.filterCutoff}
              min={20}
              max={20000}
              onChange={(value) => handleFilterChange('filterCutoff', value)}
              unit="Hz"
              size="large"
              color="#4dabf7"
            />
            <ModernKnob
              label="Resonance"
              value={synthState.filterResonance}
              min={0.1}
              max={30}
              onChange={(value) => handleFilterChange('filterResonance', value)}
              size="large"
              color="#4dabf7"
            />
          </div>
        </div>

        {/* Envelope Section */}
        <div className="glass-panel p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-synth-accent mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
            Envelope
          </h4>
          <div className="space-y-4">
            <ModernSlider
              label="Attack"
              value={synthState.attack}
              min={0.001}
              max={2}
              step={0.001}
              onChange={(value) => handleEnvelopeChange('attack', value)}
              unit="s"
              color="#ff8c42"
              displayValue={(synthState.attack * 1000).toFixed(0) + 'ms'}
            />
            <ModernSlider
              label="Decay"
              value={synthState.decay}
              min={0.001}
              max={2}
              step={0.001}
              onChange={(value) => handleEnvelopeChange('decay', value)}
              unit="s"
              color="#ff8c42"
              displayValue={(synthState.decay * 1000).toFixed(0) + 'ms'}
            />
            <ModernSlider
              label="Sustain"
              value={synthState.sustain}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleEnvelopeChange('sustain', value)}
              color="#ff8c42"
              displayValue={Math.round(synthState.sustain * 100) + '%'}
            />
            <ModernSlider
              label="Release"
              value={synthState.release}
              min={0.001}
              max={3}
              step={0.001}
              onChange={(value) => handleEnvelopeChange('release', value)}
              unit="s"
              color="#ff8c42"
              displayValue={(synthState.release * 1000).toFixed(0) + 'ms'}
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="glass-panel p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-synth-accent mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Output
          </h4>
          <div className="space-y-6">
            <ModernKnob
              label="Volume"
              value={synthState.volume}
              min={0}
              max={1}
              onChange={(value) => handleEnvelopeChange('volume', value)}
              unit="%"
              displayValue={Math.round(synthState.volume * 100)}
              size="large"
              color="#00ff88"
            />
            
            {/* Output Level Meter */}
            <div className="space-y-2">
              <label className="block text-sm text-slate-300 font-medium">Level</label>
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-150"
                  style={{ width: `${synthState.volume * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 text-center font-mono">
                {(synthState.volume * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADSR Envelope Visualization */}
      <div className="glass-panel p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-synth-accent mb-4">ADSR Envelope Preview</h4>
        <div className="h-32 bg-slate-800/50 rounded-lg relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="envelopeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff8c42" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#ff8c42" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <path
              d={`M 0,100 
                  L ${synthState.attack * 40},20 
                  L ${(synthState.attack + synthState.decay) * 40},${100 - (synthState.sustain * 60)} 
                  L 300,${100 - (synthState.sustain * 60)} 
                  L ${300 + synthState.release * 30},100 
                  Z`}
              fill="url(#envelopeGradient)"
              stroke="#ff8c42"
              strokeWidth="2"
            />
          </svg>
          
          {/* ADSR Stage Labels */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-xs text-slate-400 font-mono">
            <span>A</span>
            <span>D</span>
            <span>S</span>
            <span>R</span>
          </div>
        </div>
      </div>
    </div>
  );
}