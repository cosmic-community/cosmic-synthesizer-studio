'use client';

import { useState } from 'react';
import { Maximize2, Power, RotateCcw } from 'lucide-react';

export default function CompressorLimiter() {
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({
    threshold: -20,    // dB
    ratio: 4,          // :1
    attack: 5,         // ms
    release: 100,      // ms
    knee: 2,           // dB
    makeup: 0          // dB
  });

  const [meteringData] = useState({
    inputLevel: -12,
    outputLevel: -15,
    gainReduction: 3
  });

  const updateSetting = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      threshold: -20,
      ratio: 4,
      attack: 5,
      release: 100,
      knee: 2,
      makeup: 0
    });
  };

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Compressor</h3>
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

      <div className="grid grid-cols-2 gap-4">
        {/* Threshold */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Threshold</label>
          <input
            type="range"
            min="-40"
            max="0"
            step="0.1"
            value={settings.threshold}
            onChange={(e) => updateSetting('threshold', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.threshold.toFixed(1)} dB
          </div>
        </div>

        {/* Ratio */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Ratio</label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={settings.ratio}
            onChange={(e) => updateSetting('ratio', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.ratio.toFixed(1)}:1
          </div>
        </div>

        {/* Attack */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Attack</label>
          <input
            type="range"
            min="0.1"
            max="100"
            step="0.1"
            value={settings.attack}
            onChange={(e) => updateSetting('attack', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.attack.toFixed(1)} ms
          </div>
        </div>

        {/* Release */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Release</label>
          <input
            type="range"
            min="10"
            max="1000"
            step="1"
            value={settings.release}
            onChange={(e) => updateSetting('release', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.release.toFixed(0)} ms
          </div>
        </div>

        {/* Knee */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Knee</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={settings.knee}
            onChange={(e) => updateSetting('knee', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.knee.toFixed(1)} dB
          </div>
        </div>

        {/* Makeup Gain */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Makeup</label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={settings.makeup}
            onChange={(e) => updateSetting('makeup', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.makeup.toFixed(1)} dB
          </div>
        </div>
      </div>

      {/* Gain Reduction Meter */}
      <div className="mt-4">
        <label className="block text-xs text-gray-400 mb-2">Gain Reduction</label>
        <div className="h-4 bg-gray-800 rounded relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all"
            style={{ width: `${Math.min((meteringData.gainReduction / 20) * 100, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
            -{meteringData.gainReduction.toFixed(1)} dB
          </div>
        </div>
      </div>

      {/* Input/Output Levels */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Input</label>
          <div className="h-2 bg-gray-800 rounded relative overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all"
              style={{ width: `${Math.max(0, (meteringData.inputLevel + 60) / 60 * 100)}%` }}
            />
          </div>
          <div className="text-xs text-center text-gray-400 mt-1">
            {meteringData.inputLevel.toFixed(1)} dB
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Output</label>
          <div className="h-2 bg-gray-800 rounded relative overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all"
              style={{ width: `${Math.max(0, (meteringData.outputLevel + 60) / 60 * 100)}%` }}
            />
          </div>
          <div className="text-xs text-center text-gray-400 mt-1">
            {meteringData.outputLevel.toFixed(1)} dB
          </div>
        </div>
      </div>
    </div>
  );
}