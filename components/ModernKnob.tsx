'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ModernKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  displayValue?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'blue' | 'green' | 'purple';
}

export default function ModernKnob({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  unit = '',
  displayValue,
  size = 'md',
  color = 'cyan'
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
    cyan: 'from-cyan-400 to-cyan-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600'
  };

  // Normalize value to 0-1 range
  const normalizedValue = (value - min) / (max - min);
  // Convert to rotation angle (-135° to +135°, 270° total range)
  const rotation = (normalizedValue * 270) - 135;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    e.preventDefault();
  }, [value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY; // Inverted for natural feel
    const sensitivity = (max - min) / 100; // Adjust sensitivity
    const newValue = Math.max(min, Math.min(max, startValue + (deltaY * sensitivity)));
    
    // Apply step if provided
    const steppedValue = step > 0 ? Math.round(newValue / step) * step : newValue;
    
    onChange(steppedValue);
  }, [isDragging, startY, startValue, min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse events
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const displayVal = displayValue !== undefined ? displayValue : Math.round(value * 100) / 100;

  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      
      <div className="relative">
        {/* Knob Track */}
        <div 
          className={`${sizeClasses[size]} rounded-full bg-slate-700 border-2 border-slate-600 relative cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-slate-500`}
          style={{
            background: `conic-gradient(from 225deg, transparent ${normalizedValue * 270}deg, rgba(156, 163, 175, 0.3) ${normalizedValue * 270}deg)`
          }}
        >
          {/* Knob Handle */}
          <div
            ref={knobRef}
            className={`absolute inset-1 rounded-full bg-gradient-to-br ${colorClasses[color]} shadow-lg transition-all duration-150 ${isDragging ? 'scale-95' : 'hover:scale-105'}`}
            style={{
              transform: `rotate(${rotation}deg)`
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Knob Indicator */}
            <div className="absolute top-1 left-1/2 w-0.5 h-3 bg-white rounded-full transform -translate-x-1/2 shadow-sm" />
            
            {/* Center Highlight */}
            <div className="absolute inset-2 rounded-full bg-white/20 backdrop-blur-sm" />
          </div>
        </div>

        {/* Value Display */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm">
            {displayVal}{unit}
          </div>
        </div>
      </div>
    </div>
  );
}