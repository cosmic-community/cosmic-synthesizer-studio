'use client';

import { useState } from 'react';
import { Filter, Power, RotateCcw, TrendingUp } from 'lucide-react';

export default function FilterSweep() {
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({
    cutoff: 1000,     // Hz
    resonance: 0.3,   // 0-1
    type: 'lowpass' as 'lowpass' | 'highpass' | 'bandpass' | 'notch',
    lfoRate: 0.5,     // Hz
    lfoDepth: 0.3,    // 0-1
    lfoSync: false    // BPM sync
  });

  const updateSetting = (key: keyof typeof settings, value: number | string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      cutoff: 1000,
      resonance: 0.3,
      type: 'lowpass',
      lfoRate: 0.5,
      lfoDepth: 0.3,
      lfoSync: false
    });
  };

  const filterTypes = [
    { value: 'lowpass', label: 'Low Pass' },
    { value: 'highpass', label: 'High Pass' },
    { value: 'bandpass', label: 'Band Pass' },
    { value: 'notch', label: 'Notch' }
  ];

  return (
    <div className="bg-synth-control rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Filter Sweep</h3>
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
        {/* Filter Type */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Filter Type</label>
          <select
            value={settings.type}
            onChange={(e) => updateSetting('type', e.target.value)}
            disabled={!enabled}
            className="w-full px-3 py-1 bg-synth-panel border border-gray-600 rounded text-white text-sm disabled:opacity-50"
          >
            {filterTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cutoff Frequency */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Cutoff Frequency</label>
          <input
            type="range"
            min="20"
            max="20000"
            step="1"
            value={settings.cutoff}
            onChange={(e) => updateSetting('cutoff', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.cutoff < 1000 
              ? `${settings.cutoff} Hz`
              : `${(settings.cutoff / 1000).toFixed(1)} kHz`
            }
          </div>
        </div>

        {/* Resonance */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Resonance</label>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.01"
            value={settings.resonance}
            onChange={(e) => updateSetting('resonance', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.resonance * 100).toFixed(0)}%
          </div>
        </div>

        {/* LFO Controls */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            LFO Modulation
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rate</label>
              <input
                type="range"
                min="0.01"
                max="20"
                step="0.01"
                value={settings.lfoRate}
                onChange={(e) => updateSetting('lfoRate', parseFloat(e.target.value))}
                disabled={!enabled}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="text-xs text-white text-center mt-1">
                {settings.lfoRate.toFixed(2)} Hz
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Depth</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.lfoDepth}
                onChange={(e) => updateSetting('lfoDepth', parseFloat(e.target.value))}
                disabled={!enabled}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="text-xs text-white text-center mt-1">
                {(settings.lfoDepth * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <label className="text-xs text-gray-400">BPM Sync</label>
            <input
              type="checkbox"
              checked={settings.lfoSync}
              onChange={(e) => updateSetting('lfoSync', e.target.checked)}
              disabled={!enabled}
              className="rounded disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Filter Response Visualization */}
      <div className="mt-4 h-16 bg-gray-800 rounded relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
          {/* Frequency response curve */}
          <path
            d={Array.from({ length: 200 }, (_, i) => {
              const freq = (i / 200) * 20000; // 0-20kHz
              const cutoffPos = (settings.cutoff / 20000) * 200;
              let response = 30; // Center line
              
              switch (settings.type) {
                case 'lowpass':
                  if (i > cutoffPos) {
                    const rolloff = Math.max(0, 1 - ((i - cutoffPos) / (200 - cutoffPos)) * 2);
                    response = 30 + rolloff * 25;
                  } else {
                    response = 55;
                  }
                  break;
                case 'highpass':
                  if (i < cutoffPos) {
                    const rolloff = Math.max(0, (i / cutoffPos));
                    response = 5 + rolloff * 50;
                  } else {
                    response = 55;
                  }
                  break;
                case 'bandpass':
                  const distance = Math.abs(i - cutoffPos);
                  const bandwidth = 40; // Fixed bandwidth for visualization
                  if (distance < bandwidth) {
                    response = 55 - (distance / bandwidth) * 50;
                  } else {
                    response = 5;
                  }
                  break;
                case 'notch':
                  const notchDistance = Math.abs(i - cutoffPos);
                  const notchWidth = 20;
                  if (notchDistance < notchWidth) {
                    response = 55 - ((notchWidth - notchDistance) / notchWidth) * 50;
                  } else {
                    response = 55;
                  }
                  break;
              }
              
              // Add resonance peak
              if (Math.abs(i - cutoffPos) < 5) {
                response -= settings.resonance * 15;
              }
              
              return i === 0 ? `M ${i} ${response}` : `L ${i} ${response}`;
            }).join(' ')}
            stroke={enabled ? '#63b3ed' : '#4a5568'}
            strokeWidth="2"
            fill="none"
            opacity={enabled ? 1 : 0.3}
          />
          
          {/* Cutoff frequency indicator */}
          <line
            x1={(settings.cutoff / 20000) * 200}
            y1="0"
            x2={(settings.cutoff / 20000) * 200}
            y2="60"
            stroke={enabled ? '#f56565' : '#4a5568'}
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity={enabled ? 0.8 : 0.3}
          />
        </svg>
        
        <div className="absolute bottom-1 left-2 text-xs text-gray-500">
          {enabled ? `${filterTypes.find(t => t.value === settings.type)?.label}` : 'Bypassed'}
        </div>
        <div className="absolute bottom-1 right-2 text-xs text-gray-500">
          Q: {(settings.resonance * 10).toFixed(1)}
        </div>
      </div>
    </div>
  );
}