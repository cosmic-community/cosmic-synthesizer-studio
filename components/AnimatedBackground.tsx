'use client';

import { useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'waves' | 'grid' | 'neural' | 'frequency';
  intensity?: number;
  speed?: number;
  color?: string;
  opacity?: number;
  interactive?: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

interface WavePoint {
  x: number;
  y: number;
  baseY: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

export default function AnimatedBackground({
  variant = 'particles',
  intensity = 0.5,
  speed = 1,
  color = '#00ff88',
  opacity = 0.3,
  interactive = true,
  className
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<WavePoint[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Convert hex color to RGB
  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1] || '00', 16),
      g: parseInt(result[2] || '00', 16),
      b: parseInt(result[3] || '00', 16)
    } : { r: 0, g: 255, b: 136 };
  }, []);

  const { r, g, b } = hexToRgb(color);

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor(50 * intensity);
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2 * speed,
        vy: (Math.random() - 0.5) * 2 * speed,
        size: Math.random() * 3 + 1,
        life: Math.random() * 100,
        maxLife: 100,
        color: `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.8 + 0.2})`
      });
    }
  }, [intensity, speed, r, g, b]);

  // Initialize waves
  const initWaves = useCallback((width: number, height: number) => {
    const waveCount = Math.floor(20 * intensity);
    wavesRef.current = [];

    for (let i = 0; i < waveCount; i++) {
      const x = (i / waveCount) * width;
      wavesRef.current.push({
        x,
        y: height / 2,
        baseY: height / 2 + (Math.random() - 0.5) * height * 0.3,
        amplitude: Math.random() * 50 + 20,
        frequency: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
  }, [intensity]);

  // Draw particles
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    particlesRef.current.forEach((particle, index) => {
      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;

      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Respawn particle if dead
      if (particle.life <= 0) {
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.life = particle.maxLife;
      }

      // Interactive effect
      if (interactive) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += (dx / distance) * force * 0.1;
          particle.vy += (dy / distance) * force * 0.1;
        }
      }

      // Apply friction
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Draw particle
      const alpha = (particle.life / particle.maxLife) * opacity;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
      ctx.fill();
      ctx.restore();

      // Draw connections
      particlesRef.current.slice(index + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const connectionAlpha = (1 - distance / 100) * opacity * 0.5;
          ctx.save();
          ctx.globalAlpha = connectionAlpha;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${connectionAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
          ctx.restore();
        }
      });
    });
  }, [interactive, opacity, r, g, b]);

  // Draw waves
  const drawWaves = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = timeRef.current * 0.01 * speed;

    // Update wave points
    wavesRef.current.forEach(point => {
      point.y = point.baseY + Math.sin(time + point.phase) * point.amplitude;
    });

    // Draw wave
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main wave
    ctx.beginPath();
    wavesRef.current.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prevPoint = wavesRef.current[index - 1];
        if (prevPoint) {
          const cpx = (prevPoint.x + point.x) / 2;
          const cpy = (prevPoint.y + point.y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
        }
      }
    });
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.shadowBlur = 20;
    ctx.stroke();

    // Secondary waves
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = opacity / (i + 1);
      ctx.lineWidth = 2 / i;
      ctx.beginPath();
      
      wavesRef.current.forEach((point, index) => {
        const offset = Math.sin(time * (1 + i * 0.2) + point.phase) * point.amplitude * 0.5;
        const y = point.baseY + offset + (i * 30);
        
        if (index === 0) {
          ctx.moveTo(point.x, y);
        } else {
          const prevPoint = wavesRef.current[index - 1];
          if (prevPoint) {
            const prevOffset = Math.sin(time * (1 + i * 0.2) + prevPoint.phase) * prevPoint.amplitude * 0.5;
            const prevY = prevPoint.baseY + prevOffset + (i * 30);
            const cpx = (prevPoint.x + point.x) / 2;
            const cpy = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevPoint.x, prevY, cpx, cpy);
          }
        }
      });
      ctx.stroke();
    }
    
    ctx.restore();
  }, [opacity, speed, r, g, b]);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = timeRef.current * 0.005 * speed;
    const gridSize = Math.floor(50 / intensity);

    ctx.save();
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      const offset = Math.sin(time + x * 0.01) * 10;
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      const offset = Math.cos(time + y * 0.01) * 10;
      ctx.beginPath();
      ctx.moveTo(0, y + offset);
      ctx.lineTo(width, y + offset);
      ctx.stroke();
    }

    // Add intersection points
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 1.5})`;
    for (let x = 0; x <= width; x += gridSize) {
      for (let y = 0; y <= height; y += gridSize) {
        const xOffset = Math.sin(time + x * 0.01) * 10;
        const yOffset = Math.cos(time + y * 0.01) * 10;
        const pulse = Math.sin(time * 2 + (x + y) * 0.01) * 0.5 + 0.5;
        
        ctx.save();
        ctx.globalAlpha = opacity * pulse;
        ctx.beginPath();
        ctx.arc(x + xOffset, y + yOffset, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }, [intensity, opacity, speed, r, g, b]);

  // Draw neural network
  const drawNeural = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = timeRef.current * 0.01 * speed;
    const nodeCount = Math.floor(20 * intensity);
    const nodes: { x: number; y: number; pulse: number }[] = [];

    // Generate nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: (i % 5) * (width / 4) + width / 8,
        y: Math.floor(i / 5) * (height / 4) + height / 8,
        pulse: Math.sin(time + i * 0.5) * 0.5 + 0.5
      });
    }

    ctx.save();

    // Draw connections
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach(otherNode => {
        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const alpha = (1 - distance / 200) * opacity * 0.5;
          const pulse = (node.pulse + otherNode.pulse) / 2;
          
          ctx.globalAlpha = alpha * pulse;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 1)`;
          ctx.lineWidth = 1 + pulse;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(otherNode.x, otherNode.y);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.globalAlpha = opacity;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${node.pulse})`;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.shadowBlur = 10 + node.pulse * 10;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 3 + node.pulse * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, [intensity, opacity, speed, r, g, b]);

  // Draw frequency bars
  const drawFrequency = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = timeRef.current * 0.02 * speed;
    const barCount = Math.floor(60 * intensity);
    const barWidth = width / barCount;

    ctx.save();

    for (let i = 0; i < barCount; i++) {
      const frequency = i / barCount;
      const barHeight = Math.sin(time + frequency * 10) * height * 0.3 + height * 0.1;
      const hue = frequency * 60; // Shift from green to blue
      
      const barOpacity = opacity * (0.5 + Math.sin(time * 2 + i * 0.1) * 0.5);
      
      ctx.fillStyle = `hsla(${hue + 120}, 70%, 60%, ${barOpacity})`;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);

      // Add glow effect
      ctx.shadowColor = `hsla(${hue + 120}, 70%, 60%, 0.8)`;
      ctx.shadowBlur = 5;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, 2);
    }

    ctx.restore();
  }, [intensity, opacity, speed]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Update time
    timeRef.current += 1;

    // Draw based on variant
    switch (variant) {
      case 'particles':
        drawParticles(ctx, width, height);
        break;
      case 'waves':
        drawWaves(ctx, width, height);
        break;
      case 'grid':
        drawGrid(ctx, width, height);
        break;
      case 'neural':
        drawNeural(ctx, width, height);
        break;
      case 'frequency':
        drawFrequency(ctx, width, height);
        break;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [variant, drawParticles, drawWaves, drawGrid, drawNeural, drawFrequency]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [interactive]);

  // Setup and cleanup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Reinitialize based on variant
      if (variant === 'particles') {
        initParticles(canvas.width, canvas.height);
      } else if (variant === 'waves') {
        initWaves(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, initParticles, initWaves, interactive, handleMouseMove, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={clsx(
        'absolute inset-0 pointer-events-none',
        className
      )}
      style={{ 
        mixBlendMode: 'screen',
        filter: `blur(${intensity * 0.5}px)`
      }}
    />
  );
}

// Preset configurations
export const backgroundPresets = {
  studio: {
    variant: 'neural' as const,
    color: '#00ff88',
    intensity: 0.3,
    speed: 0.5,
    interactive: true
  },
  ambient: {
    variant: 'particles' as const,
    color: '#4dabf7',
    intensity: 0.2,
    speed: 0.3,
    interactive: false
  },
  energetic: {
    variant: 'frequency' as const,
    color: '#ff6b6b',
    intensity: 0.8,
    speed: 1.5,
    interactive: true
  },
  minimal: {
    variant: 'grid' as const,
    color: '#ffffff',
    intensity: 0.1,
    speed: 0.2,
    interactive: false
  },
  flow: {
    variant: 'waves' as const,
    color: '#00ff88',
    intensity: 0.6,
    speed: 1,
    interactive: true
  }
};