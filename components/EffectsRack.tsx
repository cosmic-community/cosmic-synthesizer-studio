'use client';

import { useState, useEffect } from 'react';
import { SynthState } from '@/types';
import { Waves, Clock, Zap, Shuffle, Circle, Sliders, Volume, Music, RotateCcw } from 'lucide-react';

interface EffectsRackProps {
  synthState: SynthState;
  onStateChange: (state: SynthState) => void;
}

export default function EffectsRack({ synthState, onStateChange }: EffectsRackProps) {
  const [activeEffectPanel, setActiveEffectPanel] = useState<string>('reverb');
  const [presets, setPresets] = useState<Record<string, any>>({
    reverb: {
      hall: { amount: 0.5, roomSize: 0.8 },
      room: { amount: 0.3, roomSize: 0.4 },
      plate: { amount: 0.4, roomSize: 0.6 }
    },
    delay: {
      short: { time: 0.125, feedback: 0.3 },
      long: { time: 0.5, feedback: 0.4 },
      echo: { time: 0.375, feedback: 0.6 }
    },
    distortion: {
      soft: { amount: 30, type: 'soft' },
      hard: { amount: 60, type: 'hard' },
      tube: { amount: 40, type: 'tube' }
    }
  });

  const updateEffect = (effectName: keyof SynthState['effects'], updates: any) => {
    const currentEffect = synthState.effects[effectName] || {};
    
    onStateChange({
      ...synthState,
      effects: {
        ...synthState.effects,
        [effectName]: {
          ...currentEffect,
          ...updates
        }
      }
    });
  };

  const getEffectActive = (effectName: keyof SynthState['effects']): boolean => {
    const effect = synthState.effects[effectName];
    return effect?.active === true;
  };

  const applyPreset = (effectName: string, presetName: string) => {
    const preset = presets[effectName]?.[presetName];
    if (preset) {
      updateEffect(effectName as keyof SynthState['effects'], { ...preset, active: true });
    }
  };

  const resetEffect = (effectName: keyof SynthState['effects']) => {
    const defaultValues = {
      reverb: { active: false, amount: 0.25, roomSize: 0.5 },
      delay: { active: false, time: 0.25, feedback: 0.3 },
      distortion: { active: false, amount: 30, type: 'soft' },
      chorus: { active: false, rate: 1, depth: 0.5 },
      phaser: { active: false, rate: 0.5, depth: 0.7 },
      flanger: { active: false, rate: 0.3, feedback: 0.6 },
      compressor: { active: false, threshold: -20, ratio: 4 },
      eq: { active: false, low: 0, mid: 0, high: 0 }
    };
    
    updateEffect(effectName, defaultValues[effectName]);
  };

  const effects = [
    {
      id: 'reverb',
      name: 'Reverb',
      icon: <Waves className="w-4 h-4" />,
      color: '#4ecdc4'
    },
    {
      id: 'delay',
      name: 'Delay',
      icon: <Clock className="w-4 h-4" />,
      color: '#45b7d1'
    },
    {
      id: 'distortion',
      name: 'Distortion',
      icon: <Zap className="w-4 h-4" />,
      color: '#ff6b6b'
    },
    {
      id: 'chorus',
      name: 'Chorus',
      icon: <Shuffle className="w-4 h-4" />,
      color: '#f9ca24'
    },
    {
      id: 'phaser',
      name: 'Phaser',
      icon: <Circle className="w-4 h-4" />,
      color: '#a29bfe'
    },
    {
      id: 'flanger',
      name: 'Flanger',
      icon: <Music className="w-4 h-4" />,
      color: '#fd79a8'
    },
    {
      id: 'compressor',
      name: 'Compressor',
      icon: <Volume className="w-4 h-4" />,
      color: '#00b894'
    },
    {
      id: 'eq',
      name: 'EQ',
      icon: <Sliders className="w-4 h-4" />,
      color: '#fdcb6e'
    }
  ];

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <h3 className="text-xl font-bold text-synth-accent mb-6 flex items-center gap-2">
        <Waves className="w-5 h-5" />
        Effects Rack
      </h3>

      {/* Effects Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {effects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => setActiveEffectPanel(effect.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeEffectPanel === effect.id
                ? 'text-white shadow-lg'
                : 'text-gray-400 hover:text-white bg-synth-control'
            } ${
              getEffectActive(effect.id as keyof SynthState['effects'])
                ? 'ring-2 ring-opacity-50'
                : ''
            }`}
            style={{
              backgroundColor: activeEffectPanel === effect.id ? effect.color : undefined,
              ringColor: getEffectActive(effect.id as keyof SynthState['effects']) ? effect.color : undefined
            }}
          >
            {effect.icon}
            {effect.name}
            {getEffectActive(effect.id as keyof SynthState['effects']) && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Active Effect Panel */}
      <div className="bg-synth-control p-4 rounded-lg">
        {/* Reverb */}
        {activeEffectPanel === 'reverb' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Waves className="w-4 h-4" />
                Reverb
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => resetEffect('reverb')}
                  className="synth-button-small"
                  title="Reset"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateEffect('reverb', { active: !getEffectActive('reverb') })}
                  className={`synth-button ${getEffectActive('reverb') ? 'active' : ''}`}
                >
                  {getEffectActive('reverb') ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-2 mb-4">
              {Object.keys(presets.reverb).map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => applyPreset('reverb', presetName)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded capitalize"
                >
                  {presetName}
                </button>
              ))}
            </div>
            
            {getEffectActive('reverb') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount: {Math.round((synthState.effects.reverb?.amount || 0.25) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={synthState.effects.reverb?.amount || 0.25}
                    onChange={(e) => updateEffect('reverb', { amount: Number(e.target.value) })}
                    className="synth-slider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Size: {Math.round((synthState.effects.reverb?.roomSize || 0.5) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={synthState.effects.reverb?.roomSize || 0.5}
                    onChange={(e) => updateEffect('reverb', { roomSize: Number(e.target.value) })}
                    className="synth-slider"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delay */}
        {activeEffectPanel === 'delay' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Delay
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => resetEffect('delay')}
                  className="synth-button-small"
                  title="Reset"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateEffect('delay', { active: !getEffectActive('delay') })}
                  className={`synth-button ${getEffectActive('delay') ? 'active' : ''}`}
                >
                  {getEffectActive('delay') ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {Object.keys(presets.delay).map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => applyPreset('delay', presetName)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded capitalize"
                >
                  {presetName}
                </button>
              ))}
            </div>
            
            {getEffectActive('delay') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time: {(synthState.effects.delay?.time || 0.25).toFixed(2)}s
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="1"
                    step="0.01"
                    value={synthState.effects.delay?.time || 0.25}
                    onChange={(e) => updateEffect('delay', { time: Number(e.target.value) })}
                    className="synth-slider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Feedback: {Math.round((synthState.effects.delay?.feedback || 0.3) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.9"
                    step="0.01"
                    value={synthState.effects.delay?.feedback || 0.3}
                    onChange={(e) => updateEffect('delay', { feedback: Number(e.target.value) })}
                    className="synth-slider"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Distortion */}
        {activeEffectPanel === 'distortion' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Distortion
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => resetEffect('distortion')}
                  className="synth-button-small"
                  title="Reset"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateEffect('distortion', { active: !getEffectActive('distortion') })}
                  className={`synth-button ${getEffectActive('distortion') ? 'active' : ''}`}
                >
                  {getEffectActive('distortion') ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {Object.keys(presets.distortion).map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => applyPreset('distortion', presetName)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded capitalize"
                >
                  {presetName}
                </button>
              ))}
            </div>
            
            {getEffectActive('distortion') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Drive: {synthState.effects.distortion?.amount || 30}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={synthState.effects.distortion?.amount || 30}
                    onChange={(e) => updateEffect('distortion', { amount: Number(e.target.value) })}
                    className="synth-slider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type: {synthState.effects.distortion?.type || 'soft'}
                  </label>
                  <select
                    value={synthState.effects.distortion?.type || 'soft'}
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
        )}

        {/* EQ */}
        {activeEffectPanel === 'eq' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                EQ
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => resetEffect('eq')}
                  className="synth-button-small"
                  title="Reset"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateEffect('eq', { active: !getEffectActive('eq') })}
                  className={`synth-button ${getEffectActive('eq') ? 'active' : ''}`}
                >
                  {getEffectActive('eq') ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            
            {getEffectActive('eq') && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Low
                  </label>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={synthState.effects.eq?.low || 0}
                    onChange={(e) => updateEffect('eq', { low: Number(e.target.value) })}
                    className="synth-slider vertical"
                    style={{ writingMode: 'bt-lr', height: '120px' }}
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    {(synthState.effects.eq?.low || 0) > 0 ? '+' : ''}{(synthState.effects.eq?.low || 0)}dB
                  </div>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mid
                  </label>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={synthState.effects.eq?.mid || 0}
                    onChange={(e) => updateEffect('eq', { mid: Number(e.target.value) })}
                    className="synth-slider vertical"
                    style={{ writingMode: 'bt-lr', height: '120px' }}
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    {(synthState.effects.eq?.mid || 0) > 0 ? '+' : ''}{(synthState.effects.eq?.mid || 0)}dB
                  </div>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    High
                  </label>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={synthState.effects.eq?.high || 0}
                    onChange={(e) => updateEffect('eq', { high: Number(e.target.value) })}
                    className="synth-slider vertical"
                    style={{ writingMode: 'bt-lr', height: '120px' }}
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    {(synthState.effects.eq?.high || 0) > 0 ? '+' : ''}{(synthState.effects.eq?.high || 0)}dB
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}