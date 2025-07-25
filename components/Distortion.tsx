'use client';

import { useState } from 'react';
import { Zap, Power, RotateCcw } from 'lucide-react';

export default function Distortion() {
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({
    drive: 0.5,       // 0-1
    tone: 0.5,        // 0-1
    level: 0.8,       // 0-1
    type: 'soft' as 'soft' | 'hard' | 'tube' | 'fuzz' | 'bitcrush'
  });

  const updateSetting = (key: keyof typeof settings, value: number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      drive: 0.5,
      tone: 0.5,
      level: 0.8,
      type: 'soft'
    });
  };

  const distortionTypes = [
    { value: 'soft', label: 'Soft Clip' },
    { value: 'hard', label: 'Hard Clip' },
    { value: 'tube', label: 'Tube' },
    { value: 'fuzz', label: 'Fuzz' },
    { value: 'bitcrush', label: 'Bit Crush' }
  ];

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Distortion</h3>
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

      <div className="space-y-4">
        {/* Distortion Type */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Type</label>
          <select
            value={settings.type}
            onChange={(e) => updateSetting('type', e.target.value)}
            disabled={!enabled}
            className="w-full px-3 py-1 bg-synth-panel border border-gray-600 rounded text-white text-sm disabled:opacity-50"
          >
            {distortionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Drive */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Drive</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.drive}
            onChange={(e) => updateSetting('drive', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.drive * 100).toFixed(0)}%
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tone</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.tone}
            onChange={(e) => updateSetting('tone', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.tone < 0.5 ? 'Dark' : settings.tone > 0.5 ? 'Bright' : 'Neutral'}
          </div>
        </div>

        {/* Output Level */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Output Level</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.level}
            onChange={(e) => updateSetting('level', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.level * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Distortion Curve Visualization */}
      <div className="mt-4 h-16 bg-gray-800 rounded relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
          {/* Grid */}
          <defs>
            <pattern id="distGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="60" fill="url(#distGrid)" />
          
          {/* Input signal (sine wave) */}
          <path
            d={Array.from({ length: 100 }, (_, i) => {
              const x = i;
              const y = 30 + Math.sin((i / 100) * Math.PI * 2 * 2) * 15;
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            stroke="#666"
            strokeWidth="1"
            fill="none"
          />
          
          {/* Distorted signal */}
          <path
            d={Array.from({ length: 100 }, (_, i) => {
              const x = i;
              let input = Math.sin((i / 100) * Math.PI * 2 * 2);
              
              // Apply distortion based on type and drive
              let output = input;
              const driveAmount = settings.drive * 5;
              
              switch (settings.type) {
                case 'soft':
                  output = Math.tanh(input * driveAmount);
                  break;
                case 'hard':
                  output = Math.max(-1, Math.min(1, input * driveAmount));
                  break;
                case 'tube':
                  output = input * driveAmount / (1 + Math.abs(input * driveAmount));
                  break;
                case 'fuzz':
                  output = Math.sign(input) * Math.pow(Math.abs(input * driveAmount), 0.7);
                  break;
                case 'bitcrush':
                  const bits = Math.max(1, 8 - settings.drive * 6);
                  const step = Math.pow(2, bits - 1);
                  output = Math.round(input * driveAmount * step) / step;
                  break;
              }
              
              const y = 30 - output * 15 * settings.level;
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            stroke={enabled ? '#f56565' : '#4a5568'}
            strokeWidth="2"
            fill="none"
            opacity={enabled ? 1 : 0.3}
          />
        </svg>
        
        <div className="absolute bottom-1 left-2 text-xs text-gray-500">
          {enabled ? `${distortionTypes.find(t => t.value === settings.type)?.label}` : 'Bypassed'}
        </div>
      </div>
    </div>
  );
}