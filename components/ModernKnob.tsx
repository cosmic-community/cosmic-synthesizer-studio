'use client';

import { useState, useRef, useCallback } from 'react';

interface ModernKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  displayValue?: number | string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  disabled?: boolean;
}

export default function ModernKnob({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  displayValue,
  size = 'medium',
  color = '#00ff88',
  disabled = false
}: ModernKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  // Calculate rotation angle (-135° to +135°, 270° total range)
  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + (normalizedValue * 270);

  // Size configurations
  const sizeConfig = {
    small: {
      knobSize: 'w-12 h-12',
      fontSize: 'text-xs',
      indicatorWidth: 'w-0.5',
      indicatorHeight: 'h-4'
    },
    medium: {
      knobSize: 'w-16 h-16',
      fontSize: 'text-sm',
      indicatorWidth: 'w-0.5',
      indicatorHeight: 'h-5'
    },
    large: {
      knobSize: 'w-20 h-20',
      fontSize: 'text-base',
      indicatorWidth: 'w-1',
      indicatorHeight: 'h-6'
    }
  };

  const config = sizeConfig[size];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY; // Inverted for natural feel
    const sensitivity = (max - min) / 200; // Adjust sensitivity
    const newValue = Math.max(min, Math.min(max, startValue + (deltaY * sensitivity)));
    
    // Apply step rounding
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(steppedValue);
  }, [isDragging, startY, startValue, min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleDoubleClick = useCallback(() => {
    if (disabled) return;
    
    // Reset to middle value on double-click
    const middleValue = (min + max) / 2;
    const steppedValue = Math.round(middleValue / step) * step;
    onChange(steppedValue);
  }, [disabled, min, max, step, onChange]);

  const formatDisplayValue = () => {
    if (displayValue !== undefined) {
      return displayValue;
    }
    
    if (unit === 'Hz' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    
    if (step < 1) {
      return value.toFixed(2);
    }
    
    return Math.round(value);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Label */}
      <label className={`text-slate-300 font-medium ${config.fontSize}`}>
        {label}
      </label>

      {/* Knob Container */}
      <div className="relative">
        {/* Outer Ring */}
        <div 
          className={`${config.knobSize} rounded-full border-2 border-slate-600 relative`}
          style={{
            background: `conic-gradient(from 45deg, ${color}20 0deg, ${color}40 ${normalizedValue * 270}deg, transparent ${normalizedValue * 270}deg, transparent 270deg, ${color}20 270deg)`
          }}
        >
          {/* Inner Knob */}
          <div
            ref={knobRef}
            className={`${config.knobSize} rounded-full cursor-pointer select-none transition-all duration-150 ${
              isDragging ? 'scale-105' : 'hover:scale-102'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              background: `radial-gradient(circle at 30% 30%, #4a4a4a, #2a2a2a)`,
              boxShadow: isDragging 
                ? `0 0 20px ${color}40, inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)`
                : `0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)`,
              transform: `rotate(${rotation}deg)`
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
          >
            {/* Indicator Line */}
            <div
              className={`${config.indicatorWidth} ${config.indicatorHeight} bg-white rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 shadow-lg`}
              style={{
                background: isDragging ? color : '#ffffff',
                boxShadow: `0 0 4px ${isDragging ? color : 'rgba(0,0,0,0.5)'}`
              }}
            />
          </div>
        </div>

        {/* Center Dot */}
        <div 
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Value Display */}
      <div className={`${config.fontSize} font-mono text-center`}>
        <div className="text-white font-semibold">
          {formatDisplayValue()}{unit}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {min}{unit} - {max}{unit}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${normalizedValue * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}