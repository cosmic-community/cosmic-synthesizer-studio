'use client';

import { useState } from 'react';
import { Clock, Power, RotateCcw, Repeat } from 'lucide-react';

export default function DelayEcho() {
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({
    time: 250,        // ms
    feedback: 0.4,    // 0-1
    wetLevel: 0.3,    // 0-1
    dryLevel: 0.7,    // 0-1
    highCut: 8000,    // Hz
    sync: false       // BPM sync
  });

  const [bpm] = useState(128);

  const updateSetting = (key: keyof typeof settings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      time: 250,
      feedback: 0.4,
      wetLevel: 0.3,
      dryLevel: 0.7,
      highCut: 8000,
      sync: false
    });
  };

  const syncToQuarterNote = () => {
    const quarterNoteMs = (60 / bpm) * 1000;
    updateSetting('time', quarterNoteMs);
    updateSetting('sync', true);
  };

  const syncToEighthNote = () => {
    const eighthNoteMs = (60 / bpm) * 500;
    updateSetting('time', eighthNoteMs);
    updateSetting('sync', true);
  };

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Delay/Echo</h3>
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
        {/* Delay Time */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Delay Time</label>
            <div className="flex gap-1">
              <button
                onClick={syncToQuarterNote}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                1/4
              </button>
              <button
                onClick={syncToEighthNote}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                1/8
              </button>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="2000"
            step="1"
            value={settings.time}
            onChange={(e) => updateSetting('time', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.time.toFixed(0)} ms
            {settings.sync && (
              <span className="text-synth-accent ml-1">(Synced)</span>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Feedback</label>
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

        {/* High Cut Filter */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">High Cut</label>
          <input
            type="range"
            min="200"
            max="20000"
            step="10"
            value={settings.highCut}
            onChange={(e) => updateSetting('highCut', parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-white text-center mt-1">
            {settings.highCut < 1000 
              ? `${settings.highCut} Hz`
              : `${(settings.highCut / 1000).toFixed(1)} kHz`
            }
          </div>
        </div>

        {/* BPM Sync Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">BPM Sync</label>
          <input
            type="checkbox"
            checked={settings.sync}
            onChange={(e) => updateSetting('sync', e.target.checked)}
            disabled={!enabled}
            className="rounded disabled:opacity-50"
          />
        </div>
      </div>

      {/* Visual Delay Representation */}
      <div className="mt-4 h-12 bg-gray-800 rounded relative overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          {enabled && Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="bg-synth-accent/40 rounded-full animate-pulse"
              style={{
                width: '8px',
                height: '8px',
                marginLeft: `${i * 20}px`,
                animationDelay: `${(settings.time * i) / 100}ms`,
                opacity: Math.pow(settings.feedback, i)
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-1 left-2 text-xs text-gray-500">
          {enabled ? `${Math.round(60000 / settings.time)} repeats/min` : 'Bypassed'}
        </div>
      </div>
    </div>
  );
}