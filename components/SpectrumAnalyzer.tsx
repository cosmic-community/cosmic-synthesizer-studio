'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface SpectrumAnalyzerProps {
  audioData: Uint8Array;
  color?: 'accent' | 'info' | 'warning';
  height?: number;
  barCount?: number;
  showFrequencyLabels?: boolean;
  logarithmic?: boolean;
  className?: string;
}

export default function SpectrumAnalyzer({
  audioData,
  color = 'accent',
  height = 200,
  barCount = 64,
  showFrequencyLabels = true,
  logarithmic = true,
  className
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const colorMap = {
    accent: {
      primary: '#00ff88',
      secondary: '#4dabf7',
      tertiary: '#ff6b6b'
    },
    info: {
      primary: '#4dabf7',
      secondary: '#00ff88',
      tertiary: '#ff6b6b'
    },
    warning: {
      primary: '#ff6b6b',
      secondary: '#ffaa00',
      tertiary: '#4dabf7'
    }
  };

  const frequencyLabels = ['20', '100', '500', '1k', '5k', '10k', '20k'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height: canvasHeight } = canvas;
      
      // Clear canvas with subtle gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      bgGradient.addColorStop(0, '#0f0f0f');
      bgGradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, canvasHeight);

      // Draw frequency grid lines
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines (dB levels)
      for (let i = 0; i <= 8; i++) {
        const y = (i * canvasHeight) / 8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (audioData.length > 0) {
        const colors = colorMap[color];
        const barWidth = width / barCount;
        const dataStep = Math.floor(audioData.length / barCount);

        // Create gradient for bars
        const barGradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
        barGradient.addColorStop(0, colors.primary);
        barGradient.addColorStop(0.6, colors.secondary);
        barGradient.addColorStop(1, colors.tertiary);

        for (let i = 0; i < barCount; i++) {
          let value = 0;
          
          if (logarithmic) {
            // Logarithmic frequency distribution for more realistic spectrum
            const startIdx = Math.floor(Math.pow(i / barCount, 2) * audioData.length);
            const endIdx = Math.floor(Math.pow((i + 1) / barCount, 2) * audioData.length);
            
            for (let j = startIdx; j < endIdx && j < audioData.length; j++) {
              value = Math.max(value, audioData[j] ?? 0);
            }
          } else {
            // Linear distribution
            const idx = i * dataStep;
            value = audioData[idx] ?? 0;
          }

          const barHeight = (value / 255) * canvasHeight * 0.9;
          const x = i * barWidth;
          const y = canvasHeight - barHeight;

          // Draw main bar
          ctx.fillStyle = barGradient;
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

          // Add peak highlight
          if (barHeight > canvasHeight * 0.7) {
            ctx.fillStyle = colors.tertiary;
            ctx.fillRect(x + 1, y, barWidth - 2, 3);
          }

          // Add glow effect for high values
          if (barHeight > canvasHeight * 0.5) {
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.shadowColor = colors.primary;
            ctx.shadowBlur = 8;
            ctx.fillStyle = colors.primary;
            ctx.fillRect(x + 1, y, barWidth - 2, Math.min(barHeight, 10));
            ctx.restore();
          }
        }

        // Draw peak dots that follow the spectrum
        ctx.fillStyle = colors.tertiary;
        for (let i = 0; i < barCount; i++) {
          let value = 0;
          
          if (logarithmic) {
            const startIdx = Math.floor(Math.pow(i / barCount, 2) * audioData.length);
            const endIdx = Math.floor(Math.pow((i + 1) / barCount, 2) * audioData.length);
            
            for (let j = startIdx; j < endIdx && j < audioData.length; j++) {
              value = Math.max(value, audioData[j] ?? 0);
            }
          } else {
            const idx = i * dataStep;
            value = audioData[idx] ?? 0;
          }

          const barHeight = (value / 255) * canvasHeight * 0.9;
          const x = i * barWidth + barWidth / 2;
          const y = canvasHeight - barHeight - 5;

          if (barHeight > 10) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, color, height, barCount, logarithmic]);

  return (
    <div className={clsx('relative bg-synth-bg rounded-lg overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px` }}
      />
      
      {/* Overlay labels */}
      <div className="absolute top-2 left-2 text-xs text-gray-400 font-mono">
        SPECTRUM ANALYZER
      </div>
      
      <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono">
        {logarithmic ? 'LOG' : 'LINEAR'}
      </div>

      {/* Frequency labels */}
      {showFrequencyLabels && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2">
          {frequencyLabels.map((label, index) => (
            <span key={index} className="text-xs text-gray-500 font-mono">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* dB scale */}
      <div className="absolute left-1 top-0 bottom-4 flex flex-col justify-between text-xs text-gray-500 font-mono">
        {['0', '-12', '-24', '-36', '-48', '-60', '-72', '-∞'].map((db) => (
          <span key={db}>{db}</span>
        ))}
      </div>
    </div>
  );
}