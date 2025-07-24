'use client';

import { SynthState } from '@/types';
import { Waves, Clock, Zap, Shuffle, Circle, Sliders, Volume, Music } from 'lucide-react';

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="space-y-3">
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Size: {Math.round((synthState.effects.reverb.roomSize || 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={synthState.effects.reverb.roomSize || 0.5}
                  onChange={(e) => updateEffect('reverb', { roomSize: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
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
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Drive: {synthState.effects.distortion.amount}
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type: {synthState.effects.distortion.type || 'soft'}
                </label>
                <select
                  value={synthState.effects.distortion.type || 'soft'}
                  onChange={(e) => updateEffect('distortion', { type: e.target.value })}
                  className="w-full px-3 py-1 bg-synth-panel border border-gray-600 rounded text-white text-sm"
                >
                  <option value="soft">Soft Clip</option>
                  <option value="hard">Hard Clip</option>
                  <option value="tube">Tube</option>
                  <option value="fuzz">Fuzz</option>
                  <option value="bitcrush">Bitcrush</option>
                </select>
              </div>
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

        {/* Phaser */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Circle className="w-4 h-4" />
              Phaser
            </h4>
            <button
              onClick={() => updateEffect('phaser', { active: !synthState.effects.phaser?.active })}
              className={`synth-button ${synthState.effects.phaser?.active ? 'active' : ''}`}
            >
              {synthState.effects.phaser?.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.phaser?.active && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rate: {(synthState.effects.phaser.rate || 0.5).toFixed(1)}Hz
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={synthState.effects.phaser.rate || 0.5}
                  onChange={(e) => updateEffect('phaser', { rate: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Depth: {Math.round((synthState.effects.phaser.depth || 0.7) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={synthState.effects.phaser.depth || 0.7}
                  onChange={(e) => updateEffect('phaser', { depth: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Flanger */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Music className="w-4 h-4" />
              Flanger
            </h4>
            <button
              onClick={() => updateEffect('flanger', { active: !synthState.effects.flanger?.active })}
              className={`synth-button ${synthState.effects.flanger?.active ? 'active' : ''}`}
            >
              {synthState.effects.flanger?.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.flanger?.active && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rate: {(synthState.effects.flanger.rate || 0.3).toFixed(1)}Hz
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={synthState.effects.flanger.rate || 0.3}
                  onChange={(e) => updateEffect('flanger', { rate: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback: {Math.round((synthState.effects.flanger.feedback || 0.6) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.01"
                  value={synthState.effects.flanger.feedback || 0.6}
                  onChange={(e) => updateEffect('flanger', { feedback: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Compressor */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Volume className="w-4 h-4" />
              Compressor
            </h4>
            <button
              onClick={() => updateEffect('compressor', { active: !synthState.effects.compressor?.active })}
              className={`synth-button ${synthState.effects.compressor?.active ? 'active' : ''}`}
            >
              {synthState.effects.compressor?.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.compressor?.active && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Threshold: {(synthState.effects.compressor.threshold || -20)}dB
                </label>
                <input
                  type="range"
                  min="-40"
                  max="0"
                  step="1"
                  value={synthState.effects.compressor.threshold || -20}
                  onChange={(e) => updateEffect('compressor', { threshold: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ratio: {(synthState.effects.compressor.ratio || 4)}:1
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={synthState.effects.compressor.ratio || 4}
                  onChange={(e) => updateEffect('compressor', { ratio: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* EQ */}
        <div className="bg-synth-control p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              EQ
            </h4>
            <button
              onClick={() => updateEffect('eq', { active: !synthState.effects.eq?.active })}
              className={`synth-button ${synthState.effects.eq?.active ? 'active' : ''}`}
            >
              {synthState.effects.eq?.active ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {synthState.effects.eq?.active && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Low: {(synthState.effects.eq.low || 0) > 0 ? '+' : ''}{(synthState.effects.eq.low || 0)}dB
                </label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={synthState.effects.eq.low || 0}
                  onChange={(e) => updateEffect('eq', { low: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mid: {(synthState.effects.eq.mid || 0) > 0 ? '+' : ''}{(synthState.effects.eq.mid || 0)}dB
                </label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={synthState.effects.eq.mid || 0}
                  onChange={(e) => updateEffect('eq', { mid: Number(e.target.value) })}
                  className="synth-slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  High: {(synthState.effects.eq.high || 0) > 0 ? '+' : ''}{(synthState.effects.eq.high || 0)}dB
                </label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={synthState.effects.eq.high || 0}
                  onChange={(e) => updateEffect('eq', { high: Number(e.target.value) })}
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