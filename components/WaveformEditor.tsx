'use client';

import { useState, useRef, useEffect } from 'react';
import { Activity, Play, Pause, Scissors, RotateCcw, Undo2, Redo2, Volume2 } from 'lucide-react';

export default function WaveformEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // seconds
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [volume, setVolume] = useState(0.8);

  // Mock waveform data
  const generateWaveformData = (length: number) => {
    return Array.from({ length }, () => Math.random() * 2 - 1);
  };

  const [waveformData] = useState(() => generateWaveformData(44100 * 4)); // 4 seconds at 44.1kHz

  useEffect(() => {
    drawWaveform();
  }, [zoom, selection, currentTime]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Vertical grid lines (time markers)
    const timeStep = Math.max(1, Math.floor(duration / 10));
    for (let i = 0; i <= duration; i += timeStep) {
      const x = (i / duration) * width * zoom;
      if (x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Selection background
    if (selection) {
      const startX = (selection.start / duration) * width * zoom;
      const endX = (selection.end / duration) * width * zoom;
      ctx.fillStyle = 'rgba(99, 179, 237, 0.2)';
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Waveform
    ctx.strokeStyle = '#63b3ed';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const samplesPerPixel = Math.floor(waveformData.length / (width * zoom));
    
    for (let x = 0; x < width * zoom && x < width; x++) {
      const sampleIndex = Math.floor((x / (width * zoom)) * waveformData.length);
      const sample = waveformData[sampleIndex] || 0;
      const y = (height / 2) + (sample * (height / 2) * 0.8);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // Playhead
    const playheadX = (currentTime / duration) * width * zoom;
    if (playheadX <= width) {
      ctx.strokeStyle = '#f56565';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickTime = (x / canvas.width / zoom) * duration;
    
    if (event.shiftKey && selection) {
      // Extend selection
      setSelection({
        start: Math.min(selection.start, clickTime),
        end: Math.max(selection.end, clickTime)
      });
    } else if (event.altKey) {
      // Start new selection
      setSelection({ start: clickTime, end: clickTime });
    } else {
      // Set playhead position
      setCurrentTime(Math.min(clickTime, duration));
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control audio playback
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  const cutSelection = () => {
    if (selection) {
      console.log(`Cutting from ${formatTime(selection.start)} to ${formatTime(selection.end)}`);
      setSelection(null);
    }
  };

  const clearSelection = () => {
    setSelection(null);
  };

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Waveform Editor
          </h3>
          <div className="flex items-center gap-2">
            <button className="synth-button-small" title="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="synth-button-small" title="Redo">
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={cutSelection}
              disabled={!selection}
              className="synth-button-small"
              title="Cut Selection"
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button
              onClick={clearSelection}
              disabled={!selection}
              className="synth-button-small"
              title="Clear Selection"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayback}
              className="synth-button flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <div className="text-white font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {selection && (
              <div className="text-synth-accent text-sm">
                Selection: {formatTime(selection.end - selection.start)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Zoom:</span>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400 w-8">{zoom.toFixed(1)}x</span>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400 w-8">
                {Math.round(volume * 100)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Waveform Display */}
      <div className="flex-1 p-4">
        <div className="h-full bg-synth-control rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
          />
        </div>
      </div>

      {/* Footer - Instructions */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 space-y-1">
          <div>• Click to set playhead position</div>
          <div>• Alt + Click to start selection</div>
          <div>• Shift + Click to extend selection</div>
          <div>• Use zoom slider to see more detail</div>
        </div>
      </div>
    </div>
  );
}