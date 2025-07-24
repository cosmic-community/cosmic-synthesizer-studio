'use client';

import { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';

interface ModernSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'info' | 'warning';
  disabled?: boolean;
  showValue?: boolean;
}

export default function ModernSlider({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  label,
  unit = '',
  orientation = 'horizontal',
  size = 'md',
  color = 'accent',
  disabled = false,
  showValue = true
}: ModernSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: orientation === 'horizontal' ? 'h-1' : 'w-1',
    md: orientation === 'horizontal' ? 'h-2' : 'w-2',
    lg: orientation === 'horizontal' ? 'h-3' : 'w-3'
  };

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    accent: 'bg-synth-accent shadow-synth-accent/30',
    info: 'bg-synth-info shadow-synth-info/30',
    warning: 'bg-synth-warning shadow-synth-warning/30'
  };

  const normalizedValue = (value - min) / (max - min);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    const updateValue = (clientX: number, clientY: number) => {
      let newNormalizedValue;
      
      if (orientation === 'horizontal') {
        newNormalizedValue = (clientX - rect.left) / rect.width;
      } else {
        newNormalizedValue = 1 - (clientY - rect.top) / rect.height;
      }
      
      newNormalizedValue = Math.max(0, Math.min(1, newNormalizedValue));
      const newValue = min + newNormalizedValue * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      onChange(steppedValue);
    };

    updateValue(e.clientX, e.clientY);
    
    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, min, max, step, onChange, orientation]);

  const formatValue = (val: number): string => {
    if (unit === 'Hz' && val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    if (unit === '%') {
      return Math.round(val * 100).toString();
    }
    if (typeof val === 'number') {
      return val.toFixed(val < 1 ? 2 : val < 10 ? 1 : 0);
    }
    return val.toString();
  };

  const sliderStyle = orientation === 'horizontal' 
    ? { width: '100%', minWidth: '120px' }
    : { height: '120px', width: 'auto' };

  const trackStyle = orientation === 'horizontal'
    ? { width: '100%' }
    : { height: '100%', width: sizeClasses[size].split(' ')[1] };

  const thumbPosition = orientation === 'horizontal'
    ? { left: `${normalizedValue * 100}%`, transform: 'translateX(-50%)' }
    : { bottom: `${normalizedValue * 100}%`, transform: 'translateY(50%)', left: '50%', marginLeft: '-0.625rem' };

  const fillStyle = orientation === 'horizontal'
    ? { width: `${normalizedValue * 100}%` }
    : { height: `${normalizedValue * 100}%` };

  return (
    <div className={clsx(
      'flex gap-3',
      orientation === 'horizontal' ? 'flex-col' : 'flex-row items-center'
    )}>
      {/* Label */}
      <div className={clsx(
        'text-sm font-medium text-gray-300',
        orientation === 'vertical' && 'writing-mode-vertical-rl text-orientation-mixed'
      )}>
        {label}
      </div>

      {/* Slider container */}
      <div 
        className={clsx(
          'relative flex items-center cursor-pointer',
          orientation === 'vertical' && 'flex-col justify-center'
        )}
        style={sliderStyle}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Track */}
        <div
          ref={sliderRef}
          className={clsx(
            'relative bg-synth-control rounded-full transition-all duration-200',
            sizeClasses[size],
            (isHovering || isDragging) && 'bg-synth-control/80',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={trackStyle}
          onMouseDown={handleMouseDown}
        >
          {/* Fill */}
          <div
            className={clsx(
              'absolute rounded-full transition-all duration-150',
              sizeClasses[size],
              colorClasses[color],
              orientation === 'horizontal' ? 'left-0 top-0' : 'bottom-0 left-0'
            )}
            style={fillStyle}
          />

          {/* Thumb */}
          <div
            className={clsx(
              'absolute rounded-full border-2 border-white transition-all duration-150',
              'bg-gradient-to-br from-gray-200 to-gray-400',
              'shadow-lg cursor-grab',
              thumbSizeClasses[size],
              isDragging ? 'cursor-grabbing scale-110 shadow-xl' : 'hover:scale-105',
              disabled && 'cursor-not-allowed'
            )}
            style={thumbPosition}
          >
            {/* Inner highlight */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-transparent opacity-60" />
          </div>

          {/* Glow effect */}
          {(isDragging || isHovering) && (
            <div 
              className={clsx(
                'absolute inset-0 rounded-full blur-sm opacity-30',
                colorClasses[color]
              )}
            />
          )}
        </div>
      </div>

      {/* Value display */}
      {showValue && (
        <div className={clsx(
          'text-xs font-mono text-center min-w-0',
          color === 'accent' ? 'text-synth-accent' : 
          color === 'info' ? 'text-synth-info' : 'text-synth-warning'
        )}>
          {formatValue(value)}{unit}
        </div>
      )}
    </div>
  );
}