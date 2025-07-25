'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Headphones, Settings, Sliders, Zap, Filter } from 'lucide-react';
import { clsx } from 'clsx';

interface ChannelState {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  gain: number;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  sends: {
    reverb: number;
    delay: number;
  };
  level: number;
  type: 'audio' | 'midi' | 'bus';
  color: string;
}

interface MixerState {
  channels: ChannelState[];
  masterVolume: number;
  masterPan: number;
  soloActive: boolean;
  selectedChannel: string | null;
}

const defaultChannels: ChannelState[] = [
  {
    id: '1',
    name: 'Piano',
    volume: 0.75,
    pan: 0,
    muted: false,
    solo: false,
    gain: 0,
    eq: { high: 0, mid: 0, low: 0 },
    sends: { reverb: 0.2, delay: 0.1 },
    level: 0.3,
    type: 'audio',
    color: '#4dabf7'
  },
  {
    id: '2',
    name: 'Drums',
    volume: 0.8,
    pan: 0,
    muted: false,
    solo: false,
    gain: 2,
    eq: { high: 1, mid: 0, low: 2 },
    sends: { reverb: 0.1, delay: 0.05 },
    level: 0.6,
    type: 'audio',
    color: '#ff6b6b'
  },
  {
    id: '3',
    name: 'Bass',
    volume: 0.7,
    pan: 0,
    muted: false,
    solo: false,
    gain: 1,
    eq: { high: -1, mid: 0, low: 3 },
    sends: { reverb: 0.05, delay: 0 },
    level: 0.4,
    type: 'audio',
    color: '#00ff88'
  },
  {
    id: '4',
    name: 'Lead',
    volume: 0.6,
    pan: 0.3,
    muted: false,
    solo: false,
    gain: 0,
    eq: { high: 2, mid: 1, low: -1 },
    sends: { reverb: 0.4, delay: 0.3 },
    level: 0.2,
    type: 'midi',
    color: '#ffaa00'
  },
  {
    id: '5',
    name: 'Reverb',
    volume: 0.3,
    pan: 0,
    muted: false,
    solo: false,
    gain: -6,
    eq: { high: 0, mid: 0, low: 0 },
    sends: { reverb: 0, delay: 0 },
    level: 0.15,
    type: 'bus',
    color: '#8b5cf6'
  },
  {
    id: '6',
    name: 'Delay',
    volume: 0.25,
    pan: 0,
    muted: false,
    solo: false,
    gain: -9,
    eq: { high: -2, mid: 0, low: -3 },
    sends: { reverb: 0, delay: 0 },
    level: 0.1,
    type: 'bus',
    color: '#06d6a0'
  }
];

export default function MixerConsole() {
  const [mixerState, setMixerState] = useState<MixerState>({
    channels: defaultChannels,
    masterVolume: 0.8,
    masterPan: 0,
    soloActive: false,
    selectedChannel: null
  });

  const levelUpdateRef = useRef<NodeJS.Timeout>();

  // Simulate level meters with random data
  useEffect(() => {
    const updateLevels = () => {
      setMixerState(prev => ({
        ...prev,
        channels: prev.channels.map(channel => ({
          ...channel,
          level: Math.random() * (channel.muted || (prev.soloActive && !channel.solo) ? 0 : channel.volume)
        }))
      }));
    };

    levelUpdateRef.current = setInterval(updateLevels, 50);
    return () => {
      if (levelUpdateRef.current) {
        clearInterval(levelUpdateRef.current);
      }
    };
  }, []);

  const updateChannel = (channelId: string, updates: Partial<ChannelState>) => {
    setMixerState(prev => ({
      ...prev,
      channels: prev.channels.map(channel =>
        channel.id === channelId ? { ...channel, ...updates } : channel
      )
    }));
  };

  const handleSolo = (channelId: string) => {
    setMixerState(prev => {
      const channel = prev.channels.find(c => c.id === channelId);
      if (!channel) return prev;

      const newSoloState = !channel.solo;
      const updatedChannels = prev.channels.map(c =>
        c.id === channelId ? { ...c, solo: newSoloState } : c
      );

      const soloActive = updatedChannels.some(c => c.solo);

      return {
        ...prev,
        channels: updatedChannels,
        soloActive
      };
    });
  };

  const handleMute = (channelId: string) => {
    updateChannel(channelId, { 
      muted: !mixerState.channels.find(c => c.id === channelId)?.muted 
    });
  };

  const renderChannelStrip = (channel: ChannelState) => {
    const isAudible = !channel.muted && (!mixerState.soloActive || channel.solo);
    
    return (
      <div
        key={channel.id}
        className={clsx(
          'bg-synth-control rounded-lg p-3 space-y-3 transition-all duration-200',
          'border border-gray-700 hover:border-gray-600',
          mixerState.selectedChannel === channel.id && 'ring-2 ring-synth-accent ring-opacity-50',
          !isAudible && 'opacity-60'
        )}
        style={{ borderTopColor: channel.color }}
        onClick={() => setMixerState(prev => ({ 
          ...prev, 
          selectedChannel: prev.selectedChannel === channel.id ? null : channel.id 
        }))}
      >
        {/* Channel Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {channel.type === 'audio' && <Volume2 className="w-3 h-3" />}
            {channel.type === 'midi' && <Zap className="w-3 h-3" />}
            {channel.type === 'bus' && <Filter className="w-3 h-3" />}
            <span className="text-xs font-bold text-white">{channel.name}</span>
          </div>
          <div className="text-xs text-gray-400">{channel.type.toUpperCase()}</div>
        </div>

        {/* EQ Section */}
        <div className="space-y-1">
          <div className="text-xs text-gray-400 text-center">EQ</div>
          {(['high', 'mid', 'low'] as const).map((band) => (
            <div key={band} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-8 uppercase">{band}</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={channel.eq[band]}
                onChange={(e) => updateChannel(channel.id, {
                  eq: { ...channel.eq, [band]: Number(e.target.value) }
                })}
                className="flex-1 h-1 bg-synth-bg rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #374151 0%, #374151 ${((channel.eq[band] + 12) / 24) * 100}%, ${channel.color} ${((channel.eq[band] + 12) / 24) * 100}%, ${channel.color} 100%)`
                }}
              />
              <span className="text-xs text-white w-8 text-right">
                {channel.eq[band] > 0 ? '+' : ''}{channel.eq[band]}
              </span>
            </div>
          ))}
        </div>

        {/* Send Section */}
        <div className="space-y-1">
          <div className="text-xs text-gray-400 text-center">SENDS</div>
          {(['reverb', 'delay'] as const).map((send) => (
            <div key={send} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-8 uppercase">{send.slice(0,3)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={channel.sends[send]}
                onChange={(e) => updateChannel(channel.id, {
                  sends: { ...channel.sends, [send]: Number(e.target.value) }
                })}
                className="flex-1 h-1 bg-synth-bg rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #374151 0%, #374151 ${channel.sends[send] * 100}%, ${channel.color} ${channel.sends[send] * 100}%, ${channel.color} 100%)`
                }}
              />
              <span className="text-xs text-white w-8 text-right">
                {Math.round(channel.sends[send] * 100)}
              </span>
            </div>
          ))}
        </div>

        {/* Pan Control */}
        <div className="space-y-1">
          <div className="text-xs text-gray-400 text-center">PAN</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">L</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={channel.pan}
              onChange={(e) => updateChannel(channel.id, { pan: Number(e.target.value) })}
              className="flex-1 h-2 bg-synth-bg rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-400">R</span>
          </div>
          <div className="text-xs text-center text-white">
            {channel.pan === 0 ? 'C' : channel.pan > 0 ? `R${Math.round(channel.pan * 100)}` : `L${Math.round(Math.abs(channel.pan) * 100)}`}
          </div>
        </div>

        {/* Level Meter and Fader */}
        <div className="space-y-2">
          <div className="text-xs text-gray-400 text-center">LEVEL</div>
          
          {/* Level Meter */}
          <div className="h-32 bg-synth-bg rounded flex items-end justify-center p-1">
            <div className="w-6 bg-gray-800 rounded relative">
              <div
                className="absolute bottom-0 left-0 right-0 rounded transition-all duration-75"
                style={{
                  height: `${channel.level * 100}%`,
                  background: channel.level > 0.8 ? '#ff6b6b' : channel.level > 0.6 ? '#ffaa00' : '#00ff88'
                }}
              />
              {/* Peak indicator */}
              {channel.level > 0.9 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-t animate-pulse" />
              )}
            </div>
          </div>

          {/* Volume Fader */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={channel.volume}
              onChange={(e) => updateChannel(channel.id, { volume: Number(e.target.value) })}
              className="w-full h-2 bg-synth-bg rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #374151 0%, #374151 ${channel.volume * 100}%, ${channel.color} ${channel.volume * 100}%, ${channel.color} 100%)`
              }}
            />
            <div className="text-xs text-center text-white mt-1">
              {Math.round(channel.volume * 100)}
            </div>
          </div>
        </div>

        {/* Mute/Solo Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMute(channel.id);
            }}
            className={clsx(
              'flex-1 px-2 py-1 text-xs font-bold rounded transition-all duration-200',
              channel.muted
                ? 'bg-synth-warning text-black shadow-lg shadow-synth-warning/30'
                : 'bg-synth-control text-white hover:bg-gray-600'
            )}
          >
            MUTE
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSolo(channel.id);
            }}
            className={clsx(
              'flex-1 px-2 py-1 text-xs font-bold rounded transition-all duration-200',
              channel.solo
                ? 'bg-synth-accent text-black shadow-lg shadow-synth-accent/30'
                : 'bg-synth-control text-white hover:bg-gray-600'
            )}
          >
            SOLO
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-synth-panel p-6 rounded-lg h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-synth-accent flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Mixer Console
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Master:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mixerState.masterVolume}
              onChange={(e) => setMixerState(prev => ({ 
                ...prev, 
                masterVolume: Number(e.target.value) 
              }))}
              className="w-20"
            />
            <span className="text-synth-accent font-bold text-sm min-w-[3rem]">
              {Math.round(mixerState.masterVolume * 100)}%
            </span>
          </div>
          
          <button className="synth-button text-sm flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Settings
          </button>
        </div>
      </div>

      {/* Channel Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mixerState.channels.map(renderChannelStrip)}
      </div>

      {/* Master Section */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="bg-synth-control rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 text-center">Master Bus</h4>
          
          <div className="flex items-center justify-center gap-8">
            {/* Master Level Meter */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400">MASTER</span>
              <div className="h-40 w-8 bg-synth-bg rounded flex items-end justify-center p-1">
                <div className="w-6 bg-gray-800 rounded relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded transition-all duration-75"
                    style={{
                      height: `${mixerState.masterVolume * 80}%`,
                      background: 'linear-gradient(to top, #00ff88 0%, #ffaa00 60%, #ff6b6b 90%)'
                    }}
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={mixerState.masterVolume}
                onChange={(e) => setMixerState(prev => ({ 
                  ...prev, 
                  masterVolume: Number(e.target.value) 
                }))}
                className="w-20 h-2 bg-synth-bg rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-white">{Math.round(mixerState.masterVolume * 100)}</span>
            </div>

            {/* Master Pan */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400">PAN</span>
              <div className="h-20 flex items-center">
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={mixerState.masterPan}
                  onChange={(e) => setMixerState(prev => ({ 
                    ...prev, 
                    masterPan: Number(e.target.value) 
                  }))}
                  className="w-20 h-2 bg-synth-bg rounded-lg appearance-none cursor-pointer transform rotate-90"
                />
              </div>
              <span className="text-xs text-white">
                {mixerState.masterPan === 0 ? 'C' : mixerState.masterPan > 0 ? `R${Math.round(mixerState.masterPan * 100)}` : `L${Math.round(Math.abs(mixerState.masterPan) * 100)}`}
              </span>
            </div>
          </div>

          {/* Master Controls */}
          <div className="mt-4 flex justify-center gap-4">
            <button className="synth-button flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Monitor
            </button>
            <button className="synth-button flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Talkback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}