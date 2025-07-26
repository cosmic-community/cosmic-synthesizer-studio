'use client';

interface ModernSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'blue' | 'green' | 'purple';
}

export default function ModernSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  unit = '',
  orientation = 'horizontal',
  size = 'md',
  color = 'cyan'
}: ModernSliderProps) {
  const normalizedValue = (value - min) / (max - min);
  
  const sizeClasses = {
    sm: orientation === 'horizontal' ? 'h-1' : 'w-1 h-20',
    md: orientation === 'horizontal' ? 'h-2' : 'w-2 h-24',
    lg: orientation === 'horizontal' ? 'h-3' : 'w-3 h-32'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const colorClasses = {
    cyan: 'from-cyan-400 to-cyan-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600'
  };

  const displayValue = Math.round(value * 100) / 100;

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col items-center' : 'items-center space-x-3'} space-y-2`}>
      <label className="text-xs font-medium text-slate-300 min-w-0">
        {label}
      </label>
      
      <div className={`relative ${orientation === 'horizontal' ? 'flex-1' : ''}`}>
        {/* Track */}
        <div className={`${sizeClasses[size]} bg-slate-700 rounded-full relative overflow-hidden`}>
          {/* Progress */}
          <div 
            className={`absolute top-0 left-0 ${sizeClasses[size]} bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-150`}
            style={{
              [orientation === 'horizontal' ? 'width' : 'height']: `${normalizedValue * 100}%`
            }}
          />
        </div>

        {/* Thumb */}
        <div
          className={`absolute ${thumbSizeClasses[size]} bg-gradient-to-br ${colorClasses[color]} rounded-full shadow-lg transform transition-all duration-150 hover:scale-110 cursor-pointer`}
          style={{
            [orientation === 'horizontal' ? 'left' : 'bottom']: `${normalizedValue * 100}%`,
            [orientation === 'horizontal' ? 'top' : 'left']: '50%',
            transform: `translate${orientation === 'horizontal' ? 'X' : 'Y'}(-50%) translate${orientation === 'horizontal' ? 'Y' : 'X'}(-50%)`
          }}
        />

        {/* Hidden Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${orientation === 'vertical' ? 'rotate-90' : ''}`}
        />
      </div>

      <div className="text-xs font-mono text-slate-300 min-w-max">
        {displayValue}{unit}
      </div>
    </div>
  );
}