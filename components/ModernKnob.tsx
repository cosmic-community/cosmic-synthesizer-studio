'use client';

import { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';

interface ModernKnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'info' | 'warning';
  disabled?: boolean;
}

export default function ModernKnob({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  label,
  unit = '',
  size = 'md',
  color = 'accent',
  disabled = false
}: ModernKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const colorClasses = {
    accent: 'border-synth-accent shadow-synth-accent/30',
    info: 'border-synth-info shadow-synth-info/30',
    warning: 'border-synth-warning shadow-synth-warning/30'
  };

  const normalizedValue = (value - min) / (max - min);
  const rotation = normalizedValue * 270 - 135; // -135° to +135°

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY; // Inverted for natural feel
    const sensitivity = 0.005;
    const deltaValue = deltaY * (max - min) * sensitivity;
    const newValue = Math.max(min, Math.min(max, startValue + deltaValue));
    
    // Snap to step
    const steppedValue = Math.round(newValue / step) * step;
    onChange(steppedValue);
  }, [isDragging, startY, startValue, min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newValue = Math.max(min, Math.min(max, value + delta * (max - min)));
    const steppedValue = Math.round(newValue / step) * step;
    onChange(steppedValue);
  }, [disabled, value, min, max, step, onChange]);

  const formatValue = (val: number): string => {
    if (unit === 'Hz' && val >= 1000) {
      return `${(val / 1000).toFixed(1)}kHz`;
    }
    if (typeof val === 'number') {
      return val.toFixed(val < 1 ? 2 : val < 10 ? 1 : 0);
    }
    return String(val);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={knobRef}
        className={clsx(
          'relative rounded-full border-2 cursor-pointer transition-all duration-200',
          'bg-gradient-to-br from-synth-control to-synth-panel',
          'hover:shadow-lg active:scale-95',
          sizeClasses[size],
          isDragging ? colorClasses[color] : 'border-gray-600 hover:border-gray-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {/* Outer ring indicator */}
        <div 
          className="absolute inset-1 rounded-full border border-gray-700"
          style={{
            background: `conic-gradient(from 0deg, 
              transparent 0deg, 
              transparent ${(normalizedValue * 270) + 45}deg, 
              ${color === 'accent' ? '#00ff88' : color === 'info' ? '#4dabf7' : '#ff6b6b'} ${(normalizedValue * 270) + 45}deg,
              ${color === 'accent' ? '#00ff88' : color === 'info' ? '#4dabf7' : '#ff6b6b'} ${(normalizedValue * 270) + 50}deg,
              transparent ${(normalizedValue * 270) + 50}deg,
              transparent 315deg
            )`
          }}
        />
        
        {/* Center knob */}
        <div 
          className={clsx(
            'absolute inset-2 rounded-full transition-transform duration-100',
            'bg-gradient-to-br from-gray-300 to-gray-600',
            'shadow-inner',
            isDragging && 'scale-95'
          )}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Indicator dot */}
          <div 
            className={clsx(
              'absolute w-1.5 h-1.5 rounded-full top-1 left-1/2 transform -translate-x-1/2',
              color === 'accent' ? 'bg-synth-accent' : 
              color === 'info' ? 'bg-synth-info' : 'bg-synth-warning'
            )}
          />
        </div>

        {/* Glow effect when active */}
        {isDragging && (
          <div 
            className={clsx(
              'absolute inset-0 rounded-full blur-sm -z-10',
              color === 'accent' ? 'bg-synth-accent/20' : 
              color === 'info' ? 'bg-synth-info/20' : 'bg-synth-warning/20'
            )}
          />
        )}
      </div>

      {/* Label and value */}
      <div className="text-center min-w-0">
        <div className="text-xs text-gray-400 font-medium truncate">
          {label}
        </div>
        <div className={clsx(
          'text-sm font-mono font-bold mt-1',
          color === 'accent' ? 'text-synth-accent' : 
          color === 'info' ? 'text-synth-info' : 'text-synth-warning'
        )}>
          {formatValue(value)}{unit}
        </div>
      </div>
    </div>
  );
}