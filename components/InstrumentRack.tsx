'use client';

import { useState } from 'react';
import { Music, Volume2, Settings, Power } from 'lucide-react';

interface Instrument {
  id: string;
  name: string;
  type: 'synth' | 'sampler' | 'drum' | 'bass';
  enabled: boolean;
  volume: number;
  preset: string;
}

export default function InstrumentRack() {
  const [instruments, setInstruments] = useState<Instrument[]>([
    {
      id: '1',
      name: 'Lead Synth',
      type: 'synth',
      enabled: true,
      volume: 0.8,
      preset: 'Warm Analog'
    },
    {
      id: '2',
      name: 'Bass',
      type: 'bass',
      enabled: true,
      volume: 0.9,
      preset: 'Punchy Bass'
    },
    {
      id: '3',
      name: 'Drum Kit',
      type: 'drum',
      enabled: false,
      volume: 0.7,
      preset: 'Rock Kit'
    }
  ]);

  const toggleInstrument = (id: string) => {
    setInstruments(instruments.map(inst => 
      inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
    ));
  };

  const updateVolume = (id: string, volume: number) => {
    setInstruments(instruments.map(inst => 
      inst.id === id ? { ...inst, volume } : inst
    ));
  };

  const getInstrumentIcon = (type: Instrument['type']) => {
    switch (type) {
      case 'synth': return '🎹';
      case 'bass': return '🎸';
      case 'drum': return '🥁';
      case 'sampler': return '🎵';
      default: return '🎼';
    }
  };

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-synth-accent" />
        <h3 className="text-lg font-semibold text-white">Instruments</h3>
      </div>

      <div className="space-y-3">
        {instruments.map((instrument) => (
          <div
            key={instrument.id}
            className={`bg-synth-panel rounded-lg p-3 border transition-colors ${
              instrument.enabled ? 'border-synth-accent/50' : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getInstrumentIcon(instrument.type)}</span>
                <div>
                  <div className="text-white font-medium text-sm">{instrument.name}</div>
                  <div className="text-xs text-gray-400">{instrument.preset}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-white">
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleInstrument(instrument.id)}
                  className={`${instrument.enabled ? 'text-synth-accent' : 'text-gray-500'}`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={instrument.volume}
                onChange={(e) => updateVolume(instrument.id, parseFloat(e.target.value))}
                disabled={!instrument.enabled}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs text-gray-400 w-8">
                {Math.round(instrument.volume * 100)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}