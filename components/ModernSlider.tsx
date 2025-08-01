'use client';

interface ModernSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  displayValue?: string;
  color?: string;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export default function ModernSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  unit = '',
  displayValue,
  color = '#00ff88',
  disabled = false,
  orientation = 'horizontal'
}: ModernSliderProps) {
  const normalizedValue = (value - min) / (max - min);
  const percentage = normalizedValue * 100;

  const formatValue = () => {
    if (displayValue) return displayValue;
    
    if (unit === 'Hz' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k${unit}`;
    }
    
    if (step < 1) {
      return `${value.toFixed(2)}${unit}`;
    }
    
    return `${Math.round(value)}${unit}`;
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    const middleValue = (min + max) / 2;
    onChange(middleValue);
  };

  return (
    <div className={`space-y-2 ${orientation === 'vertical' ? 'flex flex-col items-center h-32' : ''}`}>
      {/* Label and Value */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-300 font-medium">
          {label}
        </label>
        <span className="text-sm font-mono text-white bg-slate-700/50 px-2 py-1 rounded">
          {formatValue()}
        </span>
      </div>

      {/* Slider Container */}
      <div className={`relative ${orientation === 'vertical' ? 'h-full w-4' : 'h-4 w-full'}`}>
        {/* Track */}
        <div
          className={`absolute rounded-full bg-slate-700 ${
            orientation === 'vertical' ? 'w-2 h-full left-1' : 'h-2 w-full top-1'
          }`}
          style={{
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
          }}
        />

        {/* Progress */}
        <div
          className={`absolute rounded-full transition-all duration-150 ${
            orientation === 'vertical' ? 'w-2 left-1 bottom-0' : 'h-2 top-1 left-0'
          }`}
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
            [orientation === 'vertical' ? 'height' : 'width']: `${percentage}%`
          }}
        />

        {/* Slider Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onDoubleClick={handleDoubleClick}
          disabled={disabled}
          className={`absolute w-full h-full opacity-0 cursor-pointer ${
            disabled ? 'cursor-not-allowed' : ''
          } ${orientation === 'vertical' ? 'slider-vertical' : ''}`}
          style={{
            WebkitAppearance: 'none',
            background: 'transparent'
          }}
        />

        {/* Thumb */}
        <div
          className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-150 pointer-events-none ${
            disabled ? 'opacity-50' : 'hover:scale-110'
          }`}
          style={{
            backgroundColor: color,
            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 4px ${color}80`,
            [orientation === 'vertical' ? 'bottom' : 'left']: `calc(${percentage}% - 8px)`,
            [orientation === 'vertical' ? 'left' : 'top']: '0px'
          }}
        />

        {/* Step Markers */}
        {step >= 0.1 && (max - min) / step <= 10 && (
          <div className={`absolute ${orientation === 'vertical' ? 'w-full h-full' : 'w-full h-full'}`}>
            {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
              const stepValue = min + (i * step);
              const stepPercentage = ((stepValue - min) / (max - min)) * 100;
              
              return (
                <div
                  key={i}
                  className={`absolute w-1 h-1 bg-slate-500 rounded-full ${
                    orientation === 'vertical' ? 'left-1.5' : 'top-1.5'
                  }`}
                  style={{
                    [orientation === 'vertical' ? 'bottom' : 'left']: `${stepPercentage}%`
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Min/Max Labels */}
      <div className={`flex justify-between text-xs text-slate-400 ${
        orientation === 'vertical' ? 'flex-col-reverse h-full' : ''
      }`}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}