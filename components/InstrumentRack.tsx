'use client';

import { useState, useEffect } from 'react';
import { Music, Volume2, Settings, Power, Plus, Minus } from 'lucide-react';

interface Instrument {
  id: string;
  name: string;
  type: 'synth' | 'sampler' | 'drum' | 'bass' | 'piano';
  enabled: boolean;
  volume: number;
  preset: string;
  muted: boolean;
  solo: boolean;
  pan: number;
}

interface InstrumentRackProps {
  onInstrumentChange?: (instruments: Instrument[]) => void;
}

export default function InstrumentRack({ onInstrumentChange }: InstrumentRackProps) {
  const [instruments, setInstruments] = useState<Instrument[]>([
    {
      id: '1',
      name: 'Lead Synth',
      type: 'synth',
      enabled: true,
      volume: 0.8,
      preset: 'Warm Analog',
      muted: false,
      solo: false,
      pan: 0
    },
    {
      id: '2',
      name: 'Bass',
      type: 'bass',
      enabled: true,
      volume: 0.9,
      preset: 'Punchy Bass',
      muted: false,
      solo: false,
      pan: 0
    },
    {
      id: '3',
      name: 'Drum Kit',
      type: 'drum',
      enabled: true,
      volume: 0.7,
      preset: 'Rock Kit',
      muted: false,
      solo: false,
      pan: 0
    }
  ]);

  const [selectedInstrument, setSelectedInstrument] = useState<string>('1');

  // Update parent when instruments change
  useEffect(() => {
    if (onInstrumentChange) {
      onInstrumentChange(instruments);
    }
  }, [instruments, onInstrumentChange]);

  const toggleInstrument = (id: string) => {
    setInstruments(instruments.map(inst => 
      inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
    ));
  };

  const updateVolume = (id: string, volume: number) => {
    setInstruments(instruments.map(inst => 
      inst.id === id ? { ...inst, volume: Math.max(0, Math.min(1, volume)) } : inst
    ));
  };

  const updatePan = (id: string, pan: number) => {
    setInstruments(instruments.map(inst => 
      inst.id === id ? { ...inst, pan: Math.max(-1, Math.min(1, pan)) } : inst
    ));
  };

  const toggleMute = (id: string) => {
    setInstruments(instruments.map(inst => 
      inst.id === id ? { ...inst, muted: !inst.muted } : inst
    ));
  };

  const toggleSolo = (id: string) => {
    setInstruments(instruments.map(inst => 
      inst.id === id ? { ...inst, solo: !inst.solo } : inst
    ));
  };

  const addInstrument = () => {
    const newId = (instruments.length + 1).toString();
    const newInstrument: Instrument = {
      id: newId,
      name: `Instrument ${newId}`,
      type: 'synth',
      enabled: true,
      volume: 0.8,
      preset: 'Default',
      muted: false,
      solo: false,
      pan: 0
    };
    setInstruments([...instruments, newInstrument]);
  };

  const removeInstrument = (id: string) => {
    if (instruments.length > 1) {
      setInstruments(instruments.filter(inst => inst.id !== id));
      if (selectedInstrument === id) {
        setSelectedInstrument(instruments[0]?.id || '1');
      }
    }
  };

  const getInstrumentIcon = (type: Instrument['type']) => {
    switch (type) {
      case 'synth': return '🎹';
      case 'bass': return '🎸';
      case 'drum': return '🥁';
      case 'sampler': return '🎵';
      case 'piano': return '🎼';
      default: return '🎼';
    }
  };

  const getInstrumentColor = (type: Instrument['type']) => {
    switch (type) {
      case 'synth': return '#4ecdc4';
      case 'bass': return '#ff6b6b';
      case 'drum': return '#f9ca24';
      case 'sampler': return '#a29bfe';
      case 'piano': return '#6c5ce7';
      default: return '#74b9ff';
    }
  };

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Instruments</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={addInstrument}
            className="synth-button-small"
            title="Add Instrument"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeInstrument(selectedInstrument)}
            className="synth-button-small"
            title="Remove Instrument"
            disabled={instruments.length <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {instruments.map((instrument) => (
          <div
            key={instrument.id}
            className={`bg-synth-panel rounded-lg p-3 border transition-all cursor-pointer ${
              instrument.enabled ? 'border-synth-accent/50' : 'border-gray-700'
            } ${
              selectedInstrument === instrument.id ? 'ring-2 ring-synth-accent/30' : ''
            }`}
            onClick={() => setSelectedInstrument(instrument.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-lg"
                  style={{ backgroundColor: getInstrumentColor(instrument.type) + '20' }}
                >
                  <span>{getInstrumentIcon(instrument.type)}</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={instrument.name}
                    onChange={(e) => {
                      setInstruments(instruments.map(inst =>
                        inst.id === instrument.id ? { ...inst, name: e.target.value } : inst
                      ));
                    }}
                    className="bg-transparent text-white font-medium text-sm border-none outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="text-xs text-gray-400">{instrument.preset}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute(instrument.id);
                  }}
                  className={`px-2 py-1 text-xs rounded ${
                    instrument.muted ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSolo(instrument.id);
                  }}
                  className={`px-2 py-1 text-xs rounded ${
                    instrument.solo ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  S
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleInstrument(instrument.id);
                  }}
                  className={`${instrument.enabled ? 'text-synth-accent' : 'text-gray-500'}`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-3 h-3 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={instrument.volume}
                onChange={(e) => {
                  e.stopPropagation();
                  updateVolume(instrument.id, parseFloat(e.target.value));
                }}
                disabled={!instrument.enabled}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs text-gray-400 w-8">
                {Math.round(instrument.volume * 100)}
              </span>
            </div>

            {/* Pan Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-8">Pan</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={instrument.pan}
                onChange={(e) => {
                  e.stopPropagation();
                  updatePan(instrument.id, parseFloat(e.target.value));
                }}
                disabled={!instrument.enabled}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs text-gray-400 w-8">
                {instrument.pan > 0 ? 'R' : instrument.pan < 0 ? 'L' : 'C'}
                {Math.abs(Math.round(instrument.pan * 100))}
              </span>
            </div>

            {/* Instrument Type Selector */}
            {selectedInstrument === instrument.id && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">Type:</span>
                  <select
                    value={instrument.type}
                    onChange={(e) => {
                      setInstruments(instruments.map(inst =>
                        inst.id === instrument.id 
                          ? { ...inst, type: e.target.value as Instrument['type'] }
                          : inst
                      ));
                    }}
                    className="bg-synth-panel border border-gray-600 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="synth">Synthesizer</option>
                    <option value="piano">Piano</option>
                    <option value="bass">Bass</option>
                    <option value="drum">Drums</option>
                    <option value="sampler">Sampler</option>
                  </select>
                </div>
                <button className="text-gray-400 hover:text-white flex items-center gap-1 text-xs">
                  <Settings className="w-3 h-3" />
                  Configure
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}