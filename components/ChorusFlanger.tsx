'use client';

import { useState } from 'react';
import { Waves, Power, RotateCcw } from 'lucide-react';

export default function ChorusFlanger() {
  const [mode, setMode] = useState<'chorus' | 'flanger'>('chorus');
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({
    rate: 0.5,        // Hz
    depth: 0.5,       // 0-1
    feedback: 0.3,    // 0-1 
    wetLevel: 0.4,    // 0-1
    dryLevel: 0.6,    // 0-1
    phase: 0          // 0-360 degrees
  });

  const updateSetting = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      rate: mode === 'chorus' ? 0.5 : 0.3,
      depth: mode === 'chorus' ? 0.5 : 0.7,
      feedback: mode === 'chorus' ? 0.3 : 0.6,
      wetLevel: 0.4,
      dryLevel: 0.6,
      phase: 0
    });
  };

  const switchMode = (newMode: 'chorus' | 'flanger') => {
    setMode(newMode);
    // Adjust settings for the new mode
    if (newMode === 'chorus') {
      setSettings(prev => ({
        ...prev,
        rate: 0.5,
        depth: 0.5,
        feedback: 0.3
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        rate: 0.3,
        depth: 0.7,
        feedback: 0.6
      }));
    }
  };

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Chorus/Flanger</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetSettings}
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`${enabled ? 'text-synth-accent' : 'text-gray-500'}`}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => switchMode('chorus')}
          className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
            mode === 'chorus'
              ? 'bg-synth-accent text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Chorus
        </button>
        <button
          onClick={() => switchMode('flanger')}
          className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
            mode === 'flanger'
              ? 'bg-synth-accent text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Flanger
        </button>
      </div>

      <div className="space-y-4">
        {/* Rate */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rate</label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={settings.rate}
            onChange={(e) => updateSetting('rate', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.rate.toFixed(1)} Hz
          </div>
        </div>

        {/* Depth */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Depth</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.depth}
            onChange={(e) => updateSetting('depth', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.depth * 100).toFixed(0)}%
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {mode === 'chorus' ? 'Feedback' : 'Resonance'}
          </label>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.01"
            value={settings.feedback}
            onChange={(e) => updateSetting('feedback', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.feedback * 100).toFixed(0)}%
          </div>
        </div>

        {/* Wet/Dry Mix */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Wet</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.wetLevel}
              onChange={(e) => updateSetting('wetLevel', parseFloat(e.target.value))}
              disabled={!enabled}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="text-xs text-white text-center mt-1">
              {(settings.wetLevel * 100).toFixed(0)}%
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Dry</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.dryLevel}
              onChange={(e) => updateSetting('dryLevel', parseFloat(e.target.value))}
              disabled={!enabled}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="text-xs text-white text-center mt-1">
              {(settings.dryLevel * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Phase (for stereo effects) */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Stereo Phase</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={settings.phase}
            onChange={(e) => updateSetting('phase', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.phase.toFixed(0)}°
          </div>
        </div>
      </div>

      {/* LFO Visualization */}
      <div className="mt-4 h-12 bg-gray-800 rounded relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
          {/* LFO Waveform */}
          <path
            d={Array.from({ length: 200 }, (_, i) => {
              const x = i;
              const y = 25 + Math.sin((i / 200) * Math.PI * 2 * 4) * settings.depth * 15;
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            stroke={enabled ? '#63b3ed' : '#4a5568'}
            strokeWidth="2"
            fill="none"
            opacity={enabled ? 1 : 0.3}
          />
        </svg>
        <div className="absolute bottom-1 left-2 text-xs text-gray-500">
          {enabled ? `${mode.charAt(0).toUpperCase() + mode.slice(1)} Active` : 'Bypassed'}
        </div>
        <div className="absolute bottom-1 right-2 text-xs text-gray-500">
          {settings.rate.toFixed(1)} Hz
        </div>
      </div>
    </div>
  );
}