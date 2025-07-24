'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
  className?: string;
}

export default function ModernButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  active = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  glow = false,
  className
}: ModernButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = clsx(
    'relative inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-synth-bg',
    'select-none cursor-pointer',
    'border border-transparent',
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'cursor-wait'
  );

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: clsx(
      'bg-gradient-to-r from-synth-control to-synth-panel',
      'border-gray-600 text-white',
      'hover:border-gray-500 hover:shadow-lg',
      'active:scale-95 active:shadow-inner',
      active && 'bg-gradient-to-r from-synth-accent to-synth-info text-black border-synth-accent shadow-lg',
      'focus:ring-gray-500'
    ),
    secondary: clsx(
      'bg-synth-panel border-gray-700 text-gray-300',
      'hover:bg-synth-control hover:border-gray-600 hover:text-white',
      'active:scale-95',
      active && 'bg-synth-control border-gray-500 text-white',
      'focus:ring-gray-600'
    ),
    accent: clsx(
      'bg-gradient-to-r from-synth-accent to-synth-info',
      'text-black font-semibold border-synth-accent',
      'hover:shadow-lg hover:shadow-synth-accent/30',
      'active:scale-95',
      'focus:ring-synth-accent'
    ),
    danger: clsx(
      'bg-gradient-to-r from-synth-warning to-red-600',
      'text-white font-semibold border-synth-warning',
      'hover:shadow-lg hover:shadow-synth-warning/30',
      'active:scale-95',
      'focus:ring-synth-warning'
    ),
    ghost: clsx(
      'bg-transparent text-gray-400',
      'hover:bg-synth-control/50 hover:text-white',
      'active:scale-95',
      active && 'bg-synth-control/30 text-synth-accent',
      'focus:ring-gray-600'
    )
  };

  const glowClasses = glow && !disabled && clsx(
    'shadow-lg',
    variant === 'accent' && 'shadow-synth-accent/40',
    variant === 'danger' && 'shadow-synth-warning/40',
    variant === 'primary' && active && 'shadow-synth-accent/40'
  );

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        glowClasses,
        isPressed && !disabled && 'scale-95',
        className
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
    >
      {/* Background glow effect */}
      {(active || glow) && !disabled && (
        <div className={clsx(
          'absolute inset-0 rounded-lg opacity-20 blur-sm -z-10',
          variant === 'accent' && 'bg-synth-accent',
          variant === 'danger' && 'bg-synth-warning',
          variant === 'primary' && active && 'bg-synth-accent'
        )} />
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}

      {/* Icon */}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4" />
      )}

      {/* Content */}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>

      {/* Icon */}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4" />
      )}

      {/* Active indicator */}
      {active && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-synth-accent rounded-full animate-pulse" />
      )}
    </button>
  );
}