'use client';

import { SynthState } from '@/types';
import { Waves, Clock, Zap, Shuffle } from 'lucide-react';

interface EffectsRackProps {
  synthState: SynthState;
  onStateChange: (state: SynthState) => void;
}

export default function EffectsRack({ synthState, onStateChange }: EffectsRackProps) {
  const updateEffect = (effectName: keyof SynthState['effects'], updates: any) => {
    onStateChange({
      ...synthState,
      effects: {
        ...synthState.effects,
        [effectName]: {
          ...synthState.effects[effectName],
          ...updates
        }
      }
    });
  };

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <h3 className="text-xl font-bold text-synth-accent mb-6 flex items-center gap-2">
        <Waves className="w-5 h-5" />
        Effects Rack
      </h3>

      <div className="space-y-6">
        {/* Reverb */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Reverb
            </h4>
            <button
              onClick={() => updateEffect('reverb', { active: !synthState.effects.reverb.active })}
              className={`synth-button ${synthState.effects.reverb.active ? 'active' : ''}`}
            >
              {synthState.effects.reverb.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.reverb.active && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount: {Math.round(synthState.effects.reverb.amount * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={synthState.effects.reverb.amount}
                onChange={(e) => updateEffect('reverb', { amount: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
          )}
        </div>

        {/* Delay */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Delay
            </h4>
            <button
              onClick={() => updateEffect('delay', { active: !synthState.effects.delay.active })}
              className={`synth-button ${synthState.effects.delay.active ? 'active' : ''}`}
            >
              {synthState.effects.delay.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.delay.active && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time: {synthState.effects.delay.time.toFixed(2)}s
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={synthState.effects.delay.time}
                  onChange={(e) => updateEffect('delay', { time: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback: {Math.round(synthState.effects.delay.feedback * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.01"
                  value={synthState.effects.delay.feedback}
                  onChange={(e) => updateEffect('delay', { feedback: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Distortion */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Distortion
            </h4>
            <button
              onClick={() => updateEffect('distortion', { active: !synthState.effects.distortion.active })}
              className={`synth-button ${synthState.effects.distortion.active ? 'active' : ''}`}
            >
              {synthState.effects.distortion.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.distortion.active && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount: {synthState.effects.distortion.amount}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={synthState.effects.distortion.amount}
                onChange={(e) => updateEffect('distortion', { amount: Number(e.target.value) })}
                className="synth-slider"
              />
            </div>
          )}
        </div>

        {/* Chorus */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Chorus
            </h4>
            <button
              onClick={() => updateEffect('chorus', { active: !synthState.effects.chorus.active })}
              className={`synth-button ${synthState.effects.chorus.active ? 'active' : ''}`}
            >
              {synthState.effects.chorus.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.chorus.active && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rate: {synthState.effects.chorus.rate.toFixed(1)}Hz
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={synthState.effects.chorus.rate}
                  onChange={(e) => updateEffect('chorus', { rate: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Depth: {Math.round(synthState.effects.chorus.depth * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={synthState.effects.chorus.depth}
                  onChange={(e) => updateEffect('chorus', { depth: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}