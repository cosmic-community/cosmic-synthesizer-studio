'use client';

import { useState } from 'react';
import { 
  Volume2, 
  Mic, 
  Headphones, 
  Settings, 
  X, 
  Circle,
  Square,
  RotateCcw
} from 'lucide-react';
import { MixerChannel } from './MixerBoard';

interface ChannelMetering {
  peak: number;
  rms: number;
  clip: boolean;
}

interface ChannelStripProps {
  channel: MixerChannel;
  metering?: ChannelMetering;
  viewMode: 'channels' | 'sends' | 'eq';
  isSelected: boolean;
  onUpdate: (updates: Partial<MixerChannel>) => void;
  onSelect: () => void;
  onSolo: () => void;
  onRemove: () => void;
}

export default function ChannelStrip({
  channel,
  metering,
  viewMode,
  isSelected,
  onUpdate,
  onSelect,
  onSolo,
  onRemove
}: ChannelStripProps) {
  const [showEQ, setShowEQ] = useState(false);
  const [showInserts, setShowInserts] = useState(false);

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'synth': return 'border-synth-accent';
      case 'drum': return 'border-orange-500';
      case 'audio': return 'border-blue-500';
      case 'aux': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  const resetChannel = () => {
    onUpdate({
      volume: 0.75,
      pan: 0,
      eq: { high: 0, mid: 0, low: 0 },
      sends: { reverb: 0, delay: 0, chorus: 0 }
    });
  };

  return (
    <div 
      className={`bg-synth-control rounded-lg p-4 border-2 transition-all duration-200 cursor-pointer ${
        isSelected ? `${getChannelColor(channel.type)} shadow-lg` : 'border-transparent hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      {/* Channel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            channel.type === 'synth' ? 'bg-synth-accent' :
            channel.type === 'drum' ? 'bg-orange-500' :
            channel.type === 'audio' ? 'bg-blue-500' : 'bg-purple-500'
          }`} />
          <span className="text-sm font-semibold text-white truncate">
            {channel.name}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInserts(!showInserts);
            }}
            className="synth-button p-1"
            title="Inserts"
          >
            <Settings className="w-3 h-3" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="synth-button p-1 hover:bg-red-600"
            title="Remove Channel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Input/Output */}
      <div className="mb-4 space-y-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Input</label>
          <select
            value={channel.input}
            onChange={(e) => onUpdate({ input: e.target.value })}
            className="w-full text-xs p-1 bg-synth-panel border border-gray-600 rounded text-white"
          >
            <option>Line In 1</option>
            <option>Line In 2</option>
            <option>Synth 1</option>
            <option>Synth 2</option>
            <option>Drum Machine</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Output</label>
          <select
            value={channel.output}
            onChange={(e) => onUpdate({ output: e.target.value })}
            className="w-full text-xs p-1 bg-synth-panel border border-gray-600 rounded text-white"
          >
            <option>Master</option>
            <option>Cue</option>
            <option>Aux 1</option>
            <option>Aux 2</option>
          </select>
        </div>
      </div>

      {/* EQ Section */}
      {(viewMode === 'eq' || showEQ) && (
        <div className="mb-4 p-2 bg-synth-panel rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-300">EQ</span>
            <button
              onClick={resetChannel}
              className="synth-button p-1"
              title="Reset EQ"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-400">
                High: {channel.eq.high > 0 ? '+' : ''}{channel.eq.high}dB
              </label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={channel.eq.high}
                onChange={(e) => onUpdate({ 
                  eq: { ...channel.eq, high: Number(e.target.value) }
                })}
                className="w-full h-1 synth-slider"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400">
                Mid: {channel.eq.mid > 0 ? '+' : ''}{channel.eq.mid}dB
              </label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={channel.eq.mid}
                onChange={(e) => onUpdate({ 
                  eq: { ...channel.eq, mid: Number(e.target.value) }
                })}
                className="w-full h-1 synth-slider"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400">
                Low: {channel.eq.low > 0 ? '+' : ''}{channel.eq.low}dB
              </label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={channel.eq.low}
                onChange={(e) => onUpdate({ 
                  eq: { ...channel.eq, low: Number(e.target.value) }
                })}
                className="w-full h-1 synth-slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sends Section */}
      {(viewMode === 'sends') && (
        <div className="mb-4 p-2 bg-synth-panel rounded">
          <span className="block text-xs font-semibold text-gray-300 mb-2">Sends</span>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-400">
                Reverb: {Math.round(channel.sends.reverb * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={channel.sends.reverb}
                onChange={(e) => onUpdate({ 
                  sends: { ...channel.sends, reverb: Number(e.target.value) }
                })}
                className="w-full h-1 synth-slider"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400">
                Delay: {Math.round(channel.sends.delay * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={channel.sends.delay}
                onChange={(e) => onUpdate({ 
                  sends: { ...channel.sends, delay: Number(e.target.value) }
                })}
                className="w-full h-1 synth-slider"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400">
                Chorus: {Math.round(channel.sends.chorus * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={channel.sends.chorus}
                onChange={(e) => onUpdate({ 
                  sends: { ...channel.sends, chorus: Number(e.target.value) }
                })}
                className="w-full h-1 synth-slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pan Control */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Pan: {channel.pan === 0 ? 'C' : channel.pan > 0 ? `R${Math.abs(channel.pan * 100).toFixed(0)}` : `L${Math.abs(channel.pan * 100).toFixed(0)}`}
        </label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={channel.pan}
          onChange={(e) => onUpdate({ pan: Number(e.target.value) })}
          className="w-full synth-slider"
        />
      </div>

      {/* Main Fader */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Volume: {Math.round(channel.volume * 100)}%
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={channel.volume}
            onChange={(e) => onUpdate({ volume: Number(e.target.value) })}
            className="w-full synth-slider transform rotate-0"
            style={{ height: '100px', writingMode: 'bt-lr' }}
          />
        </div>
      </div>

      {/* Level Meter */}
      {metering && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-16 bg-synth-panel rounded overflow-hidden relative">
              {/* RMS Level */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
                style={{ height: `${metering.rms * 100}%` }}
              />
              {/* Peak Hold */}
              {metering.peak > 0 && (
                <div
                  className={`absolute left-0 right-0 h-0.5 ${metering.clip ? 'bg-red-500' : 'bg-white'} transition-all duration-100`}
                  style={{ bottom: `${metering.peak * 100}%` }}
                />
              )}
            </div>
            <div className="text-xs text-gray-400 w-8">
              {metering.clip ? 'CLIP' : Math.round(metering.peak * 100)}
            </div>
          </div>
        </div>
      )}

      {/* Transport Controls */}
      <div className="flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ muted: !channel.muted });
          }}
          className={`flex-1 synth-button text-xs ${channel.muted ? 'active bg-red-600' : ''}`}
        >
          MUTE
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSolo();
          }}
          className={`flex-1 synth-button text-xs ${channel.solo ? 'active bg-yellow-600' : ''}`}
        >
          SOLO
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ recording: !channel.recording });
          }}
          className={`flex-1 synth-button text-xs ${channel.recording ? 'active bg-red-500' : ''}`}
          title="Record Enable"
        >
          <Circle className={`w-3 h-3 ${channel.recording ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Insert Effects Modal */}
      {showInserts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-synth-panel border border-white/20 rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Channel {channel.id} Inserts</h3>
                <button
                  onClick={() => setShowInserts(false)}
                  className="synth-button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Insert Effect</label>
                <select
                  value={channel.insert || ''}
                  onChange={(e) => onUpdate({ insert: e.target.value || null })}
                  className="w-full p-2 bg-synth-control border border-gray-600 rounded text-white"
                >
                  <option value="">None</option>
                  <option value="compressor">Compressor</option>
                  <option value="eq">Parametric EQ</option>
                  <option value="gate">Noise Gate</option>
                  <option value="limiter">Limiter</option>
                  <option value="distortion">Distortion</option>
                  <option value="chorus">Chorus</option>
                </select>
              </div>
              
              {channel.insert && (
                <div className="p-3 bg-synth-control rounded">
                  <h4 className="text-sm font-semibold text-white mb-2 capitalize">
                    {channel.insert} Settings
                  </h4>
                  <p className="text-xs text-gray-400">
                    Effect parameters would be controlled here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}