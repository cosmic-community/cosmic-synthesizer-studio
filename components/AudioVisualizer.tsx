'use client';

import { useEffect, useRef } from 'react';
import { AudioEngine } from '@/lib/audioEngine';
import { normalizeAudioData } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface AudioVisualizerProps {
  audioEngine: AudioEngine | null;
  compact?: boolean;
}

export default function AudioVisualizer({ audioEngine, compact = false }: AudioVisualizerProps) {
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
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
      
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const displayWidth = canvas.offsetWidth;
      const displayHeight = canvas.offsetHeight;
      
      // Clear canvas
      ctx.fillStyle = compact ? 'rgba(10, 10, 10, 0.3)' : '#0a0a0a';
      ctx.fillRect(0, 0, displayWidth, displayHeight);
      
      if (compact) {
        // Compact mode - simple frequency bars
        const barCount = Math.min(normalizedData.length, 32); // Limit bars for compact view
        const barWidth = displayWidth / barCount;
        const gradient = ctx.createLinearGradient(0, displayHeight, 0, 0);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(0.5, '#00d4ff');
        gradient.addColorStop(1, '#d946ef');
        
        ctx.fillStyle = gradient;
        
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * normalizedData.length);
          const barHeight = (normalizedData[dataIndex] ?? 0) * displayHeight * 0.8;
          const x = i * barWidth;
          const y = displayHeight - barHeight;
          
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
        
        // Add subtle glow effect
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 4;
        ctx.fillRect(0, 0, 0, 0); // Trigger shadow
        ctx.shadowBlur = 0;
      } else {
        // Full mode - detailed visualization
        const barWidth = displayWidth / normalizedData.length;
        const gradient = ctx.createLinearGradient(0, displayHeight, 0, 0);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(0.5, '#4dabf7');
        gradient.addColorStop(1, '#ff6b6b');
        
        ctx.fillStyle = gradient;
        
        for (let i = 0; i < normalizedData.length; i++) {
          const barHeight = (normalizedData[i] ?? 0) * displayHeight;
          const x = i * barWidth;
          const y = displayHeight - barHeight;
          
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
        
        // Draw waveform overlay
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const sliceWidth = displayWidth / normalizedData.length;
        let x = 0;
        
        for (let i = 0; i < normalizedData.length; i++) {
          const v = normalizedData[i] ?? 0;
          const y = (v * displayHeight) / 2;
          
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
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioEngine, compact]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-synth-panel/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-synth-control/30">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-synth-accent" />
          <span className="text-xs font-medium text-gray-300">Audio</span>
        </div>
        
        <div className="relative bg-synth-bg/50 rounded-sm overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-32 h-6 block"
            style={{ display: 'block' }}
          />
        </div>
        
        <div className="text-xs text-gray-400">
          Live
        </div>
      </div>
    );
  }

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