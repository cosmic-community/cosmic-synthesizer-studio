'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  offset?: number;
  disabled?: boolean;
  showArrow?: boolean;
  className?: string;
  interactive?: boolean;
  maxWidth?: number;
}

interface TooltipState {
  isVisible: boolean;
  position: { x: number; y: number };
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  content,
  children,
  placement = 'auto',
  delay = 500,
  offset = 8,
  disabled = false,
  showArrow = true,
  className,
  interactive = false,
  maxWidth = 300
}: TooltipProps) {
  const [state, setState] = useState<TooltipState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    placement: 'top'
  });
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = useCallback((triggerRect: DOMRect, tooltipRect?: DOMRect) => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const tooltipWidth = tooltipRect?.width || 200;
    const tooltipHeight = tooltipRect?.height || 40;

    let finalPlacement = placement;
    let x = 0;
    let y = 0;

    // Auto placement - find the best position
    if (placement === 'auto') {
      const spaceTop = triggerRect.top;
      const spaceBottom = viewport.height - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewport.width - triggerRect.right;

      if (spaceTop >= tooltipHeight + offset) {
        finalPlacement = 'top';
      } else if (spaceBottom >= tooltipHeight + offset) {
        finalPlacement = 'bottom';
      } else if (spaceRight >= tooltipWidth + offset) {
        finalPlacement = 'right';
      } else if (spaceLeft >= tooltipWidth + offset) {
        finalPlacement = 'left';
      } else {
        // Default to bottom if no space is ideal
        finalPlacement = 'bottom';
      }
    }

    // Calculate position based on placement
    switch (finalPlacement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        y = triggerRect.top - tooltipHeight - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - tooltipWidth - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        break;
    }

    // Keep tooltip within viewport bounds
    x = Math.max(8, Math.min(x, viewport.width - tooltipWidth - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipHeight - 8));

    return {
      position: { x, y },
      placement: finalPlacement
    };
  }, [placement, offset]);

  const showTooltip = useCallback(() => {
    if (disabled || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const { position, placement: finalPlacement } = calculatePosition(triggerRect);

    setState({
      isVisible: true,
      position,
      placement: finalPlacement
    });
  }, [disabled, calculatePosition]);

  const hideTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (interactive) {
      hideTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, isVisible: false }));
      }, 100);
    } else {
      setState(prev => ({ ...prev, isVisible: false }));
    }
  }, [interactive]);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    timeoutRef.current = setTimeout(showTooltip, delay);
  }, [showTooltip, delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    hideTooltip();
  }, [hideTooltip]);

  const handleFocus = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleBlur = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  // Update tooltip position when it becomes visible
  useEffect(() => {
    if (state.isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const { position, placement: finalPlacement } = calculatePosition(triggerRect, tooltipRect);

      setState(prev => ({
        ...prev,
        position,
        placement: finalPlacement
      }));
    }
  }, [state.isVisible, calculatePosition]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-current transform rotate-45';
    
    switch (state.placement) {
      case 'top':
        return `${baseClasses} bottom-[-4px] left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-[-4px] left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseClasses} right-[-4px] top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-[-4px] top-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  const tooltipContent = state.isVisible && (
    <div
      ref={tooltipRef}
      className={clsx(
        'fixed z-50 glass-tooltip text-white text-sm font-medium',
        'px-3 py-2 rounded-lg pointer-events-none',
        'animate-tooltip-show',
        interactive && 'pointer-events-auto',
        className
      )}
      style={{
        left: state.position.x,
        top: state.position.y,
        maxWidth: `${maxWidth}px`
      }}
      onMouseEnter={interactive ? handleMouseEnter : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
    >
      {content}
      {showArrow && (
        <div className={getArrowClasses()} />
      )}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
      >
        {children}
      </div>
      {typeof window !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}

// Specialized tooltip components
export function ParameterTooltip({ 
  parameter, 
  value, 
  unit = '', 
  description,
  children,
  ...props 
}: {
  parameter: string;
  value: string | number;
  unit?: string;
  description?: string;
  children: React.ReactNode;
} & Omit<TooltipProps, 'content'>) {
  const content = (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-synth-accent">{parameter}</span>
        <span className="font-mono text-white">
          {typeof value === 'number' ? value.toFixed(2) : value}{unit}
        </span>
      </div>
      {description && (
        <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
      )}
    </div>
  );

  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  );
}

export function ShortcutTooltip({ 
  shortcut, 
  description,
  children,
  ...props 
}: {
  shortcut: string;
  description: string;
  children: React.ReactNode;
} & Omit<TooltipProps, 'content'>) {
  const content = (
    <div className="space-y-1">
      <p className="text-sm">{description}</p>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">Shortcut:</span>
        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-synth-control rounded border border-white/20">
          {shortcut}
        </kbd>
      </div>
    </div>
  );

  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  );
}

export function StatusTooltip({ 
  status, 
  details,
  children,
  ...props 
}: {
  status: 'online' | 'offline' | 'warning' | 'error';
  details?: string;
  children: React.ReactNode;
} & Omit<TooltipProps, 'content'>) {
  const statusConfig = {
    online: { color: 'text-synth-accent', label: 'Online' },
    offline: { color: 'text-gray-400', label: 'Offline' },
    warning: { color: 'text-yellow-400', label: 'Warning' },
    error: { color: 'text-synth-warning', label: 'Error' }
  };

  const config = statusConfig[status];

  const content = (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className={clsx('w-2 h-2 rounded-full', config.color.replace('text-', 'bg-'))} />
        <span className={clsx('font-semibold', config.color)}>{config.label}</span>
      </div>
      {details && (
        <p className="text-xs text-gray-300">{details}</p>
      )}
    </div>
  );

  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  );
}

// Hook for managing multiple tooltips
export function useTooltips() {
  const [activeTooltips, setActiveTooltips] = useState<Set<string>>(new Set());

  const showTooltip = useCallback((id: string) => {
    setActiveTooltips(prev => new Set(prev).add(id));
  }, []);

  const hideTooltip = useCallback((id: string) => {
    setActiveTooltips(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const hideAllTooltips = useCallback(() => {
    setActiveTooltips(new Set());
  }, []);

  const isTooltipVisible = useCallback((id: string) => {
    return activeTooltips.has(id);
  }, [activeTooltips]);

  return {
    showTooltip,
    hideTooltip,
    hideAllTooltips,
    isTooltipVisible,
    activeTooltips: Array.from(activeTooltips)
  };
}

// Tooltip manager for global tooltip settings
export class TooltipManager {
  private static instance: TooltipManager;
  private globalDelay = 500;
  private globalDisabled = false;

  static getInstance() {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  setGlobalDelay(delay: number) {
    this.globalDelay = delay;
  }

  getGlobalDelay() {
    return this.globalDelay;
  }

  setGlobalDisabled(disabled: boolean) {
    this.globalDisabled = disabled;
  }

  isGlobalDisabled() {
    return this.globalDisabled;
  }
}