'use client';

import { useState, useEffect } from 'react';
import { Volume2, Mic, Headphones, Settings, RotateCcw, Save } from 'lucide-react';
import ChannelStrip from './ChannelStrip';

export interface MixerChannel {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  soloed: boolean;
  pan: number;
  type?: 'synth' | 'drum' | 'audio' | 'aux';
  eq?: {
    high: number;
    mid: number;
    low: number;
  };
  sends?: {
    reverb: number;
    delay: number;
    chorus: number;
  };
  insert?: string | null;
  input?: string;
  output?: string;
  recording?: boolean;
  monitoring?: boolean;
}

export interface MixerBoardProps {
  channels: MixerChannel[];
  onChannelChange: (channelId: string, property: string, value: any) => void;
  onStateChange?: (state: any) => void;
  className?: string;
}

export default function MixerBoard({ 
  channels, 
  onChannelChange, 
  onStateChange, 
  className 
}: MixerBoardProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showRoutingMatrix, setShowRoutingMatrix] = useState(false);
  const [viewMode, setViewMode] = useState<'channels' | 'sends' | 'eq'>('channels');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [masterPan, setMasterPan] = useState(0);
  const [cueVolume, setCueVolume] = useState(0.7);
  const [metering, setMetering] = useState<{[channelId: string]: { peak: number; rms: number; clip: boolean }}>({});
  const [masterMetering, setMasterMetering] = useState({ left: 0, right: 0, peak: 0, clip: false });

  // Simulate metering data
  useEffect(() => {
    const interval = setInterval(() => {
      setMetering(
        Object.fromEntries(
          channels.map(ch => [
            ch.id,
            {
              peak: Math.random() * (ch.muted ? 0 : ch.volume),
              rms: Math.random() * (ch.muted ? 0 : ch.volume * 0.7),
              clip: Math.random() > 0.95 && !ch.muted
            }
          ])
        )
      );
      setMasterMetering({
        left: Math.random() * masterVolume,
        right: Math.random() * masterVolume,
        peak: Math.random() * masterVolume,
        clip: Math.random() > 0.98
      });
    }, 50);

    return () => clearInterval(interval);
  }, [channels, masterVolume]);

  const handleChannelChange = (channelId: string, property: string, value: any) => {
    onChannelChange(channelId, property, value);
  };

  const soloChannel = (channelId: string) => {
    const channel = channels.find(ch => ch.id === channelId);
    if (channel) {
      onChannelChange(channelId, 'soloed', !channel.soloed);
      // Unsolo other channels
      channels.forEach(ch => {
        if (ch.id !== channelId && ch.soloed) {
          onChannelChange(ch.id, 'soloed', false);
        }
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
            
            <button className="synth-button">
              <RotateCcw className="w-4 h-4" />
              Reset
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
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-20 synth-slider"
            />
            <span className="text-sm text-synth-accent w-12">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Cue:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={cueVolume}
              onChange={(e) => setCueVolume(Number(e.target.value))}
              className="w-16 synth-slider"
            />
          </div>

          {/* Master Metering */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">L</div>
            <div className="w-16 h-3 bg-synth-control rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  masterMetering.clip ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 via-yellow-500 to-red-500'
                }`}
                style={{ width: `${masterMetering.left * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400">R</div>
            <div className="w-16 h-3 bg-synth-control rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  masterMetering.clip ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 via-yellow-500 to-red-500'
                }`}
                style={{ width: `${masterMetering.right * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Channel Strips */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-synth-control p-3 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white truncate">{channel.name}</h4>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleChannelChange(channel.id, 'muted', !channel.muted)}
                    className={`w-6 h-6 text-xs rounded ${
                      channel.muted ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => soloChannel(channel.id)}
                    className={`w-6 h-6 text-xs rounded ${
                      channel.soloed ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Volume Control */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Volume</span>
                  <span className="text-xs text-synth-accent">{Math.round(channel.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={channel.volume}
                  onChange={(e) => handleChannelChange(channel.id, 'volume', Number(e.target.value))}
                  className="w-full synth-slider"
                />
              </div>

              {/* Pan Control */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Pan</span>
                  <span className="text-xs text-synth-accent">
                    {channel.pan > 0 ? `R${Math.round(channel.pan * 100)}` : 
                     channel.pan < 0 ? `L${Math.round(Math.abs(channel.pan) * 100)}` : 'C'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={channel.pan}
                  onChange={(e) => handleChannelChange(channel.id, 'pan', Number(e.target.value))}
                  className="w-full synth-slider"
                />
              </div>

              {/* Level Meter */}
              <div className="h-2 bg-synth-bg rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    metering[channel.id]?.clip ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 via-yellow-500 to-red-500'
                  }`}
                  style={{ width: `${(metering[channel.id]?.peak || 0) * 100}%` }}
                />
              </div>
            </div>
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
              <div className="text-center text-gray-400">
                <p>Routing matrix configuration will be available in a future update.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}