'use client';

import { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Trash2, Volume2, Circle } from 'lucide-react';

interface Loop {
  id: string;
  name: string;
  duration: number;
  isRecording: boolean;
  isPlaying: boolean;
  volume: number;
  buffer?: AudioBuffer;
  color: string;
}

export default function LoopStation() {
  const [loops, setLoops] = useState<Loop[]>([
    {
      id: '1',
      name: 'Loop 1',
      duration: 0,
      isRecording: false,
      isPlaying: false,
      volume: 0.8,
      color: '#ff6b6b'
    },
    {
      id: '2',
      name: 'Loop 2',
      duration: 0,
      isRecording: false,
      isPlaying: false,
      volume: 0.8,
      color: '#4ecdc4'
    },
    {
      id: '3',
      name: 'Loop 3',
      duration: 0,
      isRecording: false,
      isPlaying: false,
      volume: 0.8,
      color: '#45b7d1'
    },
    {
      id: '4',
      name: 'Loop 4',
      duration: 0,
      isRecording: false,
      isPlaying: false,
      volume: 0.8,
      color: '#f9ca24'
    }
  ]);

  const [masterTempo, setMasterTempo] = useState(120);
  const [isQuantized, setIsQuantized] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.8);

  const startRecording = (loopId: string) => {
    setLoops(loops.map(loop => 
      loop.id === loopId 
        ? { ...loop, isRecording: true, duration: 0 }
        : loop
    ));
    
    // In a real implementation, this would start audio recording
    console.log(`Started recording loop ${loopId}`);
  };

  const stopRecording = (loopId: string) => {
    setLoops(loops.map(loop => 
      loop.id === loopId 
        ? { ...loop, isRecording: false, duration: 4.0 } // Mock duration
        : loop
    ));
    
    console.log(`Stopped recording loop ${loopId}`);
  };

  const togglePlayback = (loopId: string) => {
    setLoops(loops.map(loop => 
      loop.id === loopId 
        ? { ...loop, isPlaying: !loop.isPlaying }
        : loop
    ));
  };

  const clearLoop = (loopId: string) => {
    setLoops(loops.map(loop => 
      loop.id === loopId 
        ? { ...loop, isPlaying: false, isRecording: false, duration: 0, buffer: undefined }
        : loop
    ));
  };

  const updateLoopVolume = (loopId: string, volume: number) => {
    setLoops(loops.map(loop => 
      loop.id === loopId 
        ? { ...loop, volume }
        : loop
    ));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Loop Station
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Tempo:</span>
              <input
                type="number"
                value={masterTempo}
                onChange={(e) => setMasterTempo(parseInt(e.target.value))}
                className="w-16 px-2 py-1 bg-synth-control border border-gray-600 rounded text-white text-sm"
                min="60"
                max="200"
              />
              <span className="text-sm text-gray-400">BPM</span>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isQuantized}
                onChange={(e) => setIsQuantized(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-400">Quantize</span>
            </label>
          </div>
        </div>

        {/* Master Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-400 w-8">
              {Math.round(masterVolume * 100)}
            </span>
          </div>
          
          <button className="synth-button text-sm">Clear All</button>
          <button className="synth-button text-sm">Save Session</button>
        </div>
      </div>

      {/* Loop Slots */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {loops.map((loop) => (
            <div
              key={loop.id}
              className={`rounded-lg border-2 transition-colors ${
                loop.isRecording 
                  ? 'border-red-500 bg-red-500/10' 
                  : loop.isPlaying 
                  ? 'border-green-500 bg-green-500/10'
                  : loop.duration > 0
                  ? 'border-gray-600 bg-synth-control'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="p-4 h-full flex flex-col">
                {/* Loop Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: loop.color }}
                    />
                    <span className="text-white font-medium">{loop.name}</span>
                  </div>
                  
                  {loop.duration > 0 && (
                    <button
                      onClick={() => clearLoop(loop.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Waveform/Status Display */}
                <div className="flex-1 rounded bg-gray-800 mb-4 flex items-center justify-center">
                  {loop.isRecording ? (
                    <div className="flex items-center gap-2 text-red-400">
                      <Circle className="w-4 h-4 animate-pulse fill-current" />
                      <span className="text-sm">Recording...</span>
                    </div>
                  ) : loop.duration > 0 ? (
                    <div className="w-full h-16 px-4 flex items-center">
                      {/* Simple waveform representation */}
                      <div className="flex items-center h-full w-full">
                        {Array.from({ length: 40 }, (_, i) => (
                          <div
                            key={i}
                            className={`flex-1 mx-px transition-colors ${
                              loop.isPlaying ? 'bg-synth-accent' : 'bg-synth-accent/40'
                            }`}
                            style={{
                              height: `${Math.random() * 60 + 20}%`,
                              opacity: loop.isPlaying ? 0.8 : 0.4
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Empty Loop</div>
                  )}
                </div>

                {/* Controls */}
                <div className="space-y-3">
                  {/* Transport Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => 
                        loop.isRecording 
                          ? stopRecording(loop.id)
                          : startRecording(loop.id)
                      }
                      disabled={loop.isPlaying}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        loop.isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-synth-control hover:bg-synth-accent text-white border-2 border-gray-600 hover:border-synth-accent'
                      }`}
                    >
                      {loop.isRecording ? (
                        <Square className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {loop.duration > 0 && (
                      <button
                        onClick={() => togglePlayback(loop.id)}
                        disabled={loop.isRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          loop.isPlaying
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-synth-control hover:bg-synth-accent text-white border-2 border-gray-600 hover:border-synth-accent'
                        }`}
                      >
                        {loop.isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={loop.volume}
                      onChange={(e) => updateLoopVolume(loop.id, parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 w-8">
                      {Math.round(loop.volume * 100)}
                    </span>
                  </div>

                  {/* Duration Display */}
                  {loop.duration > 0 && (
                    <div className="text-center text-xs text-gray-400">
                      {formatTime(loop.duration)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}