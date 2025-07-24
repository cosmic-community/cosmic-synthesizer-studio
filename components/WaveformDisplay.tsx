'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface WaveformDisplayProps {
  audioData: number[];
  color?: 'accent' | 'info' | 'warning';
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
  className?: string;
}

export default function WaveformDisplay({
  audioData,
  color = 'accent',
  height = 120,
  showGrid = true,
  animate = true,
  className
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const colorMap = {
    accent: '#00ff88',
    info: '#4dabf7',
    warning: '#ff6b6b'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height: canvasHeight } = canvas;
      
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, canvasHeight);

      // Draw grid
      if (showGrid) {
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
          const y = (i * canvasHeight) / 4;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i <= 8; i++) {
          const x = (i * width) / 8;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        
        ctx.setLineDash([]);
      }

      if (audioData.length > 0) {
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, colorMap[color] + '80');
        gradient.addColorStop(0.5, colorMap[color]);
        gradient.addColorStop(1, colorMap[color] + '80');

        // Draw waveform
        ctx.strokeStyle = colorMap[color];
        ctx.fillStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Main waveform path
        ctx.beginPath();
        const sliceWidth = width / audioData.length;
        let x = 0;

        for (let i = 0; i < audioData.length; i++) {
          const v = (audioData[i] ?? 0) * 0.8; // Scale down slightly
          const y = (canvasHeight / 2) + (v * canvasHeight / 2);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();

        // Create filled area
        ctx.lineTo(width, canvasHeight / 2);
        ctx.lineTo(0, canvasHeight / 2);
        ctx.closePath();
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Add glow effect
        ctx.shadowColor = colorMap[color];
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw center line
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight / 2);
        ctx.lineTo(width, canvasHeight / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (animate) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = height;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (animate) {
      draw();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, color, height, showGrid, animate]);

  return (
    <div className={clsx('relative bg-synth-bg rounded-lg overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px` }}
      />
      
      {/* Overlay info */}
      <div className="absolute top-2 left-2 text-xs text-gray-400 font-mono">
        WAVEFORM
      </div>
      
      <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono">
        {audioData.length} SAMPLES
      </div>

      {/* Peak indicator */}
      {audioData.length > 0 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs">
          <span className="text-gray-400">PEAK:</span>
          <span className={clsx(
            'font-mono font-bold',
            color === 'accent' ? 'text-synth-accent' : 
            color === 'info' ? 'text-synth-info' : 'text-synth-warning'
          )}>
            {Math.max(...audioData.map(Math.abs)).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}