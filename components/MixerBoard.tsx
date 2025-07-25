'use client';

import { useState, useEffect } from 'react';
import { Volume2, Mic, Headphones, Settings, RotateCcw, Save, Load } from 'lucide-react';
import ChannelStrip from './ChannelStrip';

export interface MixerChannel {
  id: number;
  name: string;
  type: 'synth' | 'drum' | 'audio' | 'aux';
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  sends: {
    reverb: number;
    delay: number;
    chorus: number;
  };
  insert: string | null;
  input: string;
  output: string;
  recording: boolean;
  monitoring: boolean;
}

export interface MixerState {
  channels: MixerChannel[];
  masterVolume: number;
  masterPan: number;
  cueVolume: number;
  talkbackLevel: number;
  metering: {
    [channelId: number]: {
      peak: number;
      rms: number;
      clip: boolean;
    };
  };
  masterMetering: {
    left: number;
    right: number;
    peak: number;
    clip: boolean;
  };
}

const defaultChannel = (id: number, name: string, type: MixerChannel['type']): MixerChannel => ({
  id,
  name,
  type,
  volume: 0.75,
  pan: 0,
  muted: false,
  solo: false,
  eq: { high: 0, mid: 0, low: 0 },
  sends: { reverb: 0, delay: 0, chorus: 0 },
  insert: null,
  input: type === 'synth' ? 'Synth 1' : type === 'drum' ? 'Drum Machine' : 'Line In',
  output: 'Master',
  recording: false,
  monitoring: false
});

const defaultMixerState: MixerState = {
  channels: [
    defaultChannel(1, 'Synth Lead', 'synth'),
    defaultChannel(2, 'Synth Pad', 'synth'),
    defaultChannel(3, 'Kick', 'drum'),
    defaultChannel(4, 'Snare', 'drum'),
    defaultChannel(5, 'Hi-Hat', 'drum'),
    defaultChannel(6, 'Audio 1', 'audio'),
    defaultChannel(7, 'Audio 2', 'audio'),
    defaultChannel(8, 'Reverb', 'aux')
  ],
  masterVolume: 0.8,
  masterPan: 0,
  cueVolume: 0.7,
  talkbackLevel: 0.5,
  metering: {},
  masterMetering: { left: 0, right: 0, peak: 0, clip: false }
};

interface MixerBoardProps {
  onStateChange?: (state: MixerState) => void;
  className?: string;
}

export default function MixerBoard({ onStateChange, className }: MixerBoardProps) {
  const [mixerState, setMixerState] = useState<MixerState>(defaultMixerState);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [showRoutingMatrix, setShowRoutingMatrix] = useState(false);
  const [viewMode, setViewMode] = useState<'channels' | 'sends' | 'eq'>('channels');

  // Simulate metering data
  useEffect(() => {
    const interval = setInterval(() => {
      setMixerState(prev => ({
        ...prev,
        metering: Object.fromEntries(
          prev.channels.map(ch => [
            ch.id,
            {
              peak: Math.random() * (ch.muted ? 0 : ch.volume),
              rms: Math.random() * (ch.muted ? 0 : ch.volume * 0.7),
              clip: Math.random() > 0.95 && !ch.muted
            }
          ])
        ),
        masterMetering: {
          left: Math.random() * prev.masterVolume,
          right: Math.random() * prev.masterVolume,
          peak: Math.random() * prev.masterVolume,
          clip: Math.random() > 0.98
        }
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const updateMixerState = (updates: Partial<MixerState>) => {
    const newState = { ...mixerState, ...updates };
    setMixerState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  const updateChannel = (channelId: number, updates: Partial<MixerChannel>) => {
    const newChannels = mixerState.channels.map(ch =>
      ch.id === channelId ? { ...ch, ...updates } : ch
    );
    updateMixerState({ channels: newChannels });
  };

  const resetMixer = () => {
    setMixerState(defaultMixerState);
    if (onStateChange) {
      onStateChange(defaultMixerState);
    }
  };

  const soloChannel = (channelId: number) => {
    const newChannels = mixerState.channels.map(ch => ({
      ...ch,
      solo: ch.id === channelId ? !ch.solo : false
    }));
    updateMixerState({ channels: newChannels });
  };

  const addChannel = () => {
    const newId = Math.max(...mixerState.channels.map(ch => ch.id)) + 1;
    const newChannel = defaultChannel(newId, `Channel ${newId}`, 'audio');
    updateMixerState({ 
      channels: [...mixerState.channels, newChannel] 
    });
  };

  const removeChannel = (channelId: number) => {
    if (mixerState.channels.length > 1) {
      updateMixerState({
        channels: mixerState.channels.filter(ch => ch.id !== channelId)
      });
    }
  };

  return (
    <div className={`bg-synth-panel rounded-lg overflow-hidden ${className || ''}`}>
      {/* Mixer Header */}
      <div className="bg-synth-control/50 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-synth-accent flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Mixer Console
            </h3>
            
            <div className="flex items-center gap-2">
              {['channels', 'sends', 'eq'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`synth-button text-sm ${viewMode === mode ? 'active' : ''}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRoutingMatrix(!showRoutingMatrix)}
              className={`synth-button ${showRoutingMatrix ? 'active' : ''}`}
            >
              <Settings className="w-4 h-4" />
              Routing
            </button>
            
            <button onClick={resetMixer} className="synth-button">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            
            <button onClick={addChannel} className="synth-button">
              + Channel
            </button>
          </div>
        </div>

        {/* Master Section */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Master:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mixerState.masterVolume}
              onChange={(e) => updateMixerState({ masterVolume: Number(e.target.value) })}
              className="w-20 synth-slider"
            />
            <span className="text-sm text-synth-accent w-12">
              {Math.round(mixerState.masterVolume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Cue:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mixerState.cueVolume}
              onChange={(e) => updateMixerState({ cueVolume: Number(e.target.value) })}
              className="w-16 synth-slider"
            />
          </div>

          {/* Master Metering */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">L</div>
            <div className="w-16 h-3 bg-synth-control rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  mixerState.masterMetering.clip ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 via-yellow-500 to-red-500'
                }`}
                style={{ width: `${mixerState.masterMetering.left * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400">R</div>
            <div className="w-16 h-3 bg-synth-control rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  mixerState.masterMetering.clip ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 via-yellow-500 to-red-500'
                }`}
                style={{ width: `${mixerState.masterMetering.right * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Channel Strips */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {mixerState.channels.map((channel) => (
            <ChannelStrip
              key={channel.id}
              channel={channel}
              metering={mixerState.metering[channel.id]}
              viewMode={viewMode}
              isSelected={selectedChannel === channel.id}
              onUpdate={(updates) => updateChannel(channel.id, updates)}
              onSelect={() => setSelectedChannel(channel.id)}
              onSolo={() => soloChannel(channel.id)}
              onRemove={() => removeChannel(channel.id)}
            />
          ))}
        </div>
      </div>

      {/* Routing Matrix Modal */}
      {showRoutingMatrix && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-synth-panel border border-white/20 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Audio Routing Matrix</h3>
                <button
                  onClick={() => setShowRoutingMatrix(false)}
                  className="synth-button"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-8 gap-2 text-sm">
                <div className="font-semibold text-gray-300">Input</div>
                {mixerState.channels.slice(0, 7).map(ch => (
                  <div key={ch.id} className="font-semibold text-gray-300 text-center">
                    Ch {ch.id}
                  </div>
                ))}
                
                {mixerState.channels.map(sourceChannel => (
                  <>
                    <div key={`source-${sourceChannel.id}`} className="font-medium text-gray-400">
                      {sourceChannel.name}
                    </div>
                    {mixerState.channels.slice(0, 7).map(targetChannel => (
                      <div key={`route-${sourceChannel.id}-${targetChannel.id}`} className="text-center">
                        <input
                          type="checkbox"
                          checked={sourceChannel.output === `Channel ${targetChannel.id}`}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateChannel(sourceChannel.id, { output: `Channel ${targetChannel.id}` });
                            }
                          }}
                          className="rounded"
                        />
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}