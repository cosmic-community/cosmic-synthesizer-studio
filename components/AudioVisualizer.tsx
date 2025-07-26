'use client';

import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '@/lib/audioEngine';

interface AudioVisualizerProps {
  audioEngine: AudioEngine | null;
}

export default function AudioVisualizer({ audioEngine }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!audioEngine || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!ctx || !audioEngine.initialized) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      try {
        const dataArray = audioEngine.getAnalyserData();
        
        // Check if there's audio activity
        const hasActivity = dataArray.some(value => value > 10);
        setIsActive(hasActivity);

        // Clear canvas
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // slate-900 with opacity
        ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

        if (dataArray.length === 0) {
          // Draw idle state
          drawIdleState(ctx, canvas);
        } else {
          // Draw frequency bars
          drawFrequencyBars(ctx, canvas, dataArray);
        }
      } catch (error) {
        console.error('Visualizer error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioEngine]);

  const drawIdleState = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const centerY = height / 2;
    const time = Date.now() * 0.001;

    // Draw animated sine wave
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'; // cyan-400 with opacity
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const y = centerY + Math.sin((x * 0.02) + time) * 20;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; // slate-400 with opacity
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Audio Visualizer', width / 2, centerY - 40);
    ctx.fillText('Play notes to see frequency analysis', width / 2, centerY + 60);
  };

  const drawFrequencyBars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const barCount = Math.min(64, dataArray.length / 4); // Reduce number of bars for better performance
    const barWidth = width / barCount;

    for (let i = 0; i < barCount; i++) {
      // Average multiple frequency bins for each bar
      const startIndex = Math.floor((i * dataArray.length) / barCount);
      const endIndex = Math.floor(((i + 1) * dataArray.length) / barCount);
      let sum = 0;
      for (let j = startIndex; j < endIndex; j++) {
        sum += dataArray[j];
      }
      const barHeight = (sum / (endIndex - startIndex)) / 255 * height * 0.8;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)'); // cyan-400
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)'); // blue-500
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0.4)'); // violet-600

      ctx.fillStyle = gradient;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);

      // Add glow effect for active bars
      if (barHeight > height * 0.1) {
        ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, Math.min(barHeight, 4));
        ctx.shadowBlur = 0;
      }
    }

    // Draw frequency labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Low', 10, height - 10);
    ctx.textAlign = 'right';
    ctx.fillText('High', width - 10, height - 10);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-lg bg-slate-900/50 border border-slate-700"
        style={{ width: '100%', height: '192px' }}
      />
      
      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
          isActive 
            ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
            : 'bg-slate-600'
        }`} />
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-3 left-3 text-xs text-slate-400">
        {audioEngine?.initialized ? (
          isActive ? 'Analyzing audio...' : 'Ready - play some notes!'
        ) : (
          'Initializing...'
        )}
      </div>
    </div>
  );
}