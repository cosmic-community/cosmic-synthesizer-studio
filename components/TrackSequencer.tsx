'use client';

import { useState } from 'react';
import { Play, Pause, Square, Volume2, Mic, Music } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'instrument';
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  color: string;
  armed: boolean;
}

export default function TrackSequencer() {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: '1',
      name: 'Bass',
      type: 'instrument',
      muted: false,
      solo: false,
      volume: 0.8,
      pan: 0,
      color: '#ff6b6b',
      armed: false
    },
    {
      id: '2',
      name: 'Drums',
      type: 'midi',
      muted: false,
      solo: false,
      volume: 0.7,
      pan: 0,
      color: '#4ecdc4',
      armed: false
    },
    {
      id: '3',
      name: 'Lead',
      type: 'instrument',
      muted: false,
      solo: false,
      volume: 0.6,
      pan: 0.2,
      color: '#45b7d1',
      armed: true
    },
    {
      id: '4',
      name: 'Vocals',
      type: 'audio',
      muted: false,
      solo: false,
      volume: 0.9,
      pan: 0,
      color: '#f9ca24',
      armed: false
    }
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);

  const toggleTrackMute = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const toggleTrackSolo = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const toggleTrackArm = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, armed: !track.armed } : track
    ));
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const bars = 8;
  const beatsPerBar = 4;
  const totalBeats = bars * beatsPerBar;

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Track Sequencer</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="synth-button flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button className="synth-button">
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex bg-synth-control border-b border-gray-700">
        <div className="w-48 p-2 border-r border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Timeline</div>
        </div>
        <div className="flex-1 p-2">
          <div className="flex">
            {Array.from({ length: totalBeats }, (_, i) => (
              <div
                key={i}
                className="flex-1 text-xs text-gray-400 text-center border-r border-gray-600 last:border-r-0"
              >
                {i % beatsPerBar === 0 ? Math.floor(i / beatsPerBar) + 1 : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="flex-1 overflow-y-auto">
        {tracks.map((track) => (
          <div key={track.id} className="flex border-b border-gray-700 hover:bg-gray-800/30">
            {/* Track Controls */}
            <div className="w-48 p-3 border-r border-gray-700 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-white text-sm font-medium">{track.name}</span>
                {track.type === 'instrument' && <Music className="w-3 h-3 text-gray-400" />}
                {track.type === 'audio' && <Volume2 className="w-3 h-3 text-gray-400" />}
                {track.type === 'midi' && <div className="w-3 h-3 bg-synth-accent rounded-sm" />}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTrackMute(track.id)}
                  className={`px-2 py-1 text-xs rounded ${
                    track.muted 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => toggleTrackSolo(track.id)}
                  className={`px-2 py-1 text-xs rounded ${
                    track.solo 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  S
                </button>
                <button
                  onClick={() => toggleTrackArm(track.id)}
                  className={`px-2 py-1 text-xs rounded ${
                    track.armed 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Vol</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-8">
                  {Math.round(track.volume * 100)}
                </span>
              </div>
            </div>

            {/* Track Timeline */}
            <div className="flex-1 relative">
              <div className="flex h-16">
                {Array.from({ length: totalBeats }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 border-r border-gray-600 last:border-r-0 hover:bg-synth-accent/10 cursor-pointer ${
                      i % beatsPerBar === 0 ? 'border-r-gray-500' : ''
                    }`}
                  />
                ))}
              </div>
              
              {/* Sample audio blocks for demonstration */}
              {track.id === '1' && (
                <div
                  className="absolute top-2 left-4 h-12 bg-gradient-to-r from-synth-accent/60 to-synth-accent/40 rounded flex items-center px-2"
                  style={{ width: '25%' }}
                >
                  <div className="text-xs text-white">Bass Line</div>
                </div>
              )}
              
              {track.id === '2' && (
                <>
                  <div
                    className="absolute top-2 left-0 h-12 bg-gradient-to-r from-blue-500/60 to-blue-500/40 rounded flex items-center px-2"
                    style={{ width: '12.5%' }}
                  >
                    <div className="text-xs text-white">Kick</div>
                  </div>
                  <div
                    className="absolute top-2 h-12 bg-gradient-to-r from-green-500/60 to-green-500/40 rounded flex items-center px-2"
                    style={{ left: '25%', width: '12.5%' }}
                  >
                    <div className="text-xs text-white">Snare</div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Playhead */}
      <div
        className="absolute top-20 bottom-0 w-0.5 bg-synth-accent pointer-events-none z-10"
        style={{ left: `${200 + (playheadPosition / totalBeats) * (window.innerWidth - 200)}px` }}
      />
    </div>
  );
}