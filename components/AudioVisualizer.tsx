'use client';

import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '@/lib/audioEngine';

interface AudioVisualizerProps {
  audioEngine: AudioEngine | null;
  type?: 'waveform' | 'frequency' | 'both';
  color?: string;
  height?: number;
}

export default function AudioVisualizer({ 
  audioEngine, 
  type = 'both', 
  color = '#00ff88',
  height = 200 
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!audioEngine || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    let analyser: AnalyserNode;
    let dataArray: Uint8Array;
    let timeDataArray: Uint8Array;

    // Setup audio analysis
    try {
      // Get analyser data directly from audioEngine's public method
      const existingData = audioEngine.getAnalyserData();
      if (existingData.length === 0) {
        // AudioEngine not properly initialized
        return;
      }

      // Create our own analyser for visualization
      if (!audioEngine.initialized) {
        return;
      }

      // For now, we'll use a simplified approach without accessing private properties
      // This creates a basic visualization without direct audio context access
      const bufferLength = 1024;
      dataArray = new Uint8Array(bufferLength);
      timeDataArray = new Uint8Array(bufferLength);
      
      setIsActive(true);
    } catch (error) {
      console.error('Failed to setup audio analyzer:', error);
      return;
    }

    const draw = () => {
      if (!ctx) return;

      // Get current audio data from the engine
      const currentData = audioEngine?.getAnalyserData();
      if (currentData && currentData.length > 0) {
        // Copy data for visualization
        for (let i = 0; i < Math.min(dataArray.length, currentData.length); i++) {
          dataArray[i] = currentData[i];
          timeDataArray[i] = currentData[i]; // Simplified - using same data for both
        }
      }

      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + '80');
      gradient.addColorStop(1, color + '20');

      if (type === 'frequency' || type === 'both') {
        drawFrequencyBars(ctx, dataArray, rect.width, rect.height / (type === 'both' ? 2 : 1), gradient);
      }

      if (type === 'waveform' || type === 'both') {
        const yOffset = type === 'both' ? rect.height / 2 : 0;
        const waveHeight = type === 'both' ? rect.height / 2 : rect.height;
        drawWaveform(ctx, timeDataArray, rect.width, waveHeight, yOffset, color);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const drawFrequencyBars = (
      ctx: CanvasRenderingContext2D, 
      data: Uint8Array, 
      width: number, 
      height: number, 
      gradient: CanvasGradient
    ) => {
      const barCount = Math.min(data.length / 4, width / 3); // Reduce bar density
      const barWidth = width / barCount;

      ctx.fillStyle = gradient;

      for (let i = 0; i < barCount; i++) {
        const value = data[i * 4] / 255; // Sample every 4th frequency bin
        const barHeight = value * height * 0.8; // Scale down slightly

        // Add some logarithmic scaling for better visual representation
        const logValue = Math.log(value * 10 + 1) / Math.log(11);
        const scaledHeight = logValue * height * 0.9;

        const x = i * barWidth;
        const y = height - scaledHeight;

        // Draw bar with rounded top
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, scaledHeight, [2, 2, 0, 0]);
        ctx.fill();

        // Add peak indicator
        if (value > 0.7) {
          ctx.fillStyle = '#ff6b6b';
          ctx.beginPath();
          ctx.roundRect(x + 1, y - 4, barWidth - 2, 2, 1);
          ctx.fill();
          ctx.fillStyle = gradient;
        }
      }
    };

    const drawWaveform = (
      ctx: CanvasRenderingContext2D,
      data: Uint8Array,
      width: number,
      height: number,
      yOffset: number,
      strokeColor: string
    ) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      const sliceWidth = width / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * height / 2) + yOffset + (height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsActive(false);
    };
  }, [audioEngine, type, color, height]);

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg bg-slate-900/50"
        style={{ height: `${height}px` }}
      />
      
      {/* Activity indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
          }`} 
        />
        <span className="text-xs text-slate-400 font-mono">
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      {/* Type indicator */}
      <div className="absolute bottom-2 left-2">
        <span className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded">
          {type.toUpperCase()}
        </span>
      </div>

      {/* No audio message */}
      {!audioEngine && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Waiting for audio...</p>
          </div>
        </div>
      )}
    </div>
  );
}