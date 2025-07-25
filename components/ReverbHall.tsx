'use client';

import { useState } from 'react';
import { Home, Power, RotateCcw } from 'lucide-react';

export default function ReverbHall() {
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({
    roomSize: 0.5,     // 0-1
    damping: 0.5,      // 0-1
    wetLevel: 0.3,     // 0-1
    dryLevel: 0.7,     // 0-1
    width: 1.0,        // 0-1
    freezeMode: false
  });

  const updateSetting = (key: keyof typeof settings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      roomSize: 0.5,
      damping: 0.5,
      wetLevel: 0.3,
      dryLevel: 0.7,
      width: 1.0,
      freezeMode: false
    });
  };

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Reverb Hall</h3>
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
        {/* Room Size */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Room Size</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.roomSize}
            onChange={(e) => updateSetting('roomSize', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.roomSize * 100).toFixed(0)}%
          </div>
        </div>

        {/* Damping */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Damping</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.damping}
            onChange={(e) => updateSetting('damping', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.damping * 100).toFixed(0)}%
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

        {/* Width */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Stereo Width</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.width}
            onChange={(e) => updateSetting('width', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {(settings.width * 100).toFixed(0)}%
          </div>
        </div>

        {/* Freeze Mode */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Freeze Mode</label>
          <input
            type="checkbox"
            checked={settings.freezeMode}
            onChange={(e) => updateSetting('freezeMode', e.target.checked)}
            disabled={!enabled}
            className="rounded disabled:opacity-50"
          />
        </div>
      </div>

      {/* Visual Representation */}
      <div className="mt-4 h-16 bg-gray-800 rounded relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-synth-accent/20 rounded-full transition-all"
            style={{
              width: `${20 + settings.roomSize * 60}%`,
              height: `${20 + settings.roomSize * 60}%`,
              opacity: enabled ? settings.wetLevel : 0.1
            }}
          />
          <div
            className="absolute bg-synth-accent/10 rounded-full transition-all"
            style={{
              width: `${40 + settings.roomSize * 40}%`,
              height: `${40 + settings.roomSize * 40}%`,
              opacity: enabled ? settings.wetLevel * 0.5 : 0.05
            }}
          />
        </div>
        <div className="absolute bottom-1 left-2 text-xs text-gray-500">
          {enabled ? 'Active' : 'Bypassed'}
        </div>
      </div>
    </div>
  );
}