'use client';

import { useEffect, useRef } from 'react';
import { AudioEngine } from '@/lib/audioEngine';
import { normalizeAudioData } from '@/lib/utils';

interface AudioVisualizerProps {
  audioEngine: AudioEngine | null;
}

export default function AudioVisualizer({ audioEngine }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!audioEngine || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const analyserData = audioEngine.getAnalyserData();
      const normalizedData = normalizeAudioData(analyserData);
      
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw frequency bars
      const barWidth = canvas.width / normalizedData.length;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#00ff88');
      gradient.addColorStop(0.5, '#4dabf7');
      gradient.addColorStop(1, '#ff6b6b');
      
      ctx.fillStyle = gradient;
      
      for (let i = 0; i < normalizedData.length; i++) {
        const barHeight = normalizedData[i] * canvas.height;
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      }
      
      // Draw waveform overlay
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const sliceWidth = canvas.width / normalizedData.length;
      let x = 0;
      
      for (let i = 0; i < normalizedData.length; i++) {
        const v = normalizedData[i];
        const y = (v * canvas.height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.stroke();
      
      // Add glow effect
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioEngine]);

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <h3 className="text-xl font-bold text-synth-accent mb-4">
        Audio Visualizer
      </h3>
      
      <div className="relative bg-synth-bg rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-32 sm:h-48"
          style={{ display: 'block' }}
        />
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 text-xs text-gray-400">
            Frequency Analysis
          </div>
          <div className="absolute top-2 right-2 text-xs text-gray-400">
            Real-time
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-synth-accent font-semibold">Bass</div>
          <div className="text-gray-400">20Hz - 250Hz</div>
        </div>
        <div className="text-center">
          <div className="text-synth-info font-semibold">Mid</div>
          <div className="text-gray-400">250Hz - 4kHz</div>
        </div>
        <div className="text-center">
          <div className="text-synth-warning font-semibold">Treble</div>
          <div className="text-gray-400">4kHz - 20kHz</div>
        </div>
      </div>
    </div>
  );
}