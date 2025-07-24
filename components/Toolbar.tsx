'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  SkipBack, 
  SkipForward,
  Mic, 
  Volume2, 
  Settings, 
  Save, 
  FolderOpen,
  Download,
  Upload,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  Zap,
  Layers,
  Grid,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  Repeat,
  Clock,
  Users,
  Share2
} from 'lucide-react';
import { clsx } from 'clsx';

interface ToolbarProps {
  isPlaying: boolean;
  isRecording: boolean;
  isPaused: boolean;
  canUndo: boolean;
  canRedo: boolean;
  bpm: number;
  masterVolume: number;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onRecord: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: () => void;
  onSettings: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'accent' | 'warning' | 'ghost';
}

export default function Toolbar({
  isPlaying,
  isRecording,
  isPaused,
  canUndo,
  canRedo,
  bpm,
  masterVolume,
  onPlay,
  onStop,
  onPause,
  onRecord,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onExport,
  onImport,
  onSettings,
  onBpmChange,
  onVolumeChange,
  className
}: ToolbarProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [localBpm, setLocalBpm] = useState(bpm);
  const volumeTimeoutRef = useRef<NodeJS.Timeout>();
  const bpmInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalBpm(bpm);
  }, [bpm]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    onVolumeChange(volume);
    
    // Auto-hide volume slider after interaction
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2000);
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value);
    if (!isNaN(newBpm) && newBpm >= 60 && newBpm <= 200) {
      setLocalBpm(newBpm);
    }
  };

  const handleBpmBlur = () => {
    onBpmChange(localBpm);
  };

  const handleBpmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onBpmChange(localBpm);
      bpmInputRef.current?.blur();
    }
  };

  // Transport controls
  const transportButtons: ToolbarButton[] = [
    {
      id: 'skip-back',
      icon: <SkipBack className="w-4 h-4" />,
      label: 'Skip Back',
      shortcut: 'Shift+←',
      onClick: () => {}, // TODO: Implement skip back
      disabled: true
    },
    {
      id: 'play-pause',
      icon: isPlaying ? (isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />) : <Play className="w-4 h-4" />,
      label: isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play',
      shortcut: 'Space',
      onClick: isPlaying ? onPause : onPlay,
      variant: 'accent' as const,
      active: isPlaying && !isPaused
    },
    {
      id: 'stop',
      icon: <Square className="w-4 h-4" />,
      label: 'Stop',
      shortcut: 'Shift+Space',
      onClick: onStop,
      disabled: !isPlaying && !isPaused
    },
    {
      id: 'skip-forward',
      icon: <SkipForward className="w-4 h-4" />,
      label: 'Skip Forward',
      shortcut: 'Shift+→',
      onClick: () => {}, // TODO: Implement skip forward
      disabled: true
    },
    {
      id: 'record',
      icon: <Mic className="w-4 h-4" />,
      label: isRecording ? 'Stop Recording' : 'Record',
      shortcut: 'R',
      onClick: onRecord,
      variant: isRecording ? 'warning' as const : 'default' as const,
      active: isRecording
    }
  ];

  // Edit controls
  const editButtons: ToolbarButton[] = [
    {
      id: 'undo',
      icon: <Undo className="w-4 h-4" />,
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      onClick: onUndo,
      disabled: !canUndo
    },
    {
      id: 'redo',
      icon: <Redo className="w-4 h-4" />,
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      onClick: onRedo,
      disabled: !canRedo
    },
    {
      id: 'copy',
      icon: <Copy className="w-4 h-4" />,
      label: 'Copy',
      shortcut: 'Ctrl+C',
      onClick: () => {}, // TODO: Implement copy
      disabled: true
    },
    {
      id: 'cut',
      icon: <Scissors className="w-4 h-4" />,
      label: 'Cut',
      shortcut: 'Ctrl+X',
      onClick: () => {}, // TODO: Implement cut
      disabled: true
    },
    {
      id: 'paste',
      icon: <Clipboard className="w-4 h-4" />,
      label: 'Paste',
      shortcut: 'Ctrl+V',
      onClick: () => {}, // TODO: Implement paste
      disabled: true
    }
  ];

  // File controls
  const fileButtons: ToolbarButton[] = [
    {
      id: 'save',
      icon: <Save className="w-4 h-4" />,
      label: 'Save Project',
      shortcut: 'Ctrl+S',
      onClick: onSave
    },
    {
      id: 'load',
      icon: <FolderOpen className="w-4 h-4" />,
      label: 'Open Project',
      shortcut: 'Ctrl+O',
      onClick: onLoad
    },
    {
      id: 'export',
      icon: <Download className="w-4 h-4" />,
      label: 'Export Audio',
      shortcut: 'Ctrl+E',
      onClick: onExport
    },
    {
      id: 'import',
      icon: <Upload className="w-4 h-4" />,
      label: 'Import Audio',
      shortcut: 'Ctrl+I',
      onClick: onImport
    }
  ];

  // Utility controls
  const utilityButtons: ToolbarButton[] = [
    {
      id: 'shuffle',
      icon: <Shuffle className="w-4 h-4" />,
      label: 'Randomize',
      shortcut: 'Shift+R',
      onClick: () => {}, // TODO: Implement randomize
      disabled: true
    },
    {
      id: 'reset',
      icon: <RotateCcw className="w-4 h-4" />,
      label: 'Reset All',
      shortcut: 'Ctrl+R',
      onClick: () => {}, // TODO: Implement reset
      disabled: true
    },
    {
      id: 'share',
      icon: <Share2 className="w-4 h-4" />,
      label: 'Share',
      shortcut: 'Ctrl+Shift+S',
      onClick: () => {}, // TODO: Implement share
      disabled: true
    },
    {
      id: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
      shortcut: 'Ctrl+,',
      onClick: onSettings
    }
  ];

  const renderButton = (button: ToolbarButton) => {
    const baseClasses = clsx(
      'relative flex items-center justify-center',
      'px-3 py-2 rounded-lg',
      'font-medium text-sm',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-synth-bg',
      'group hover:scale-105',
      button.disabled && 'opacity-50 cursor-not-allowed'
    );

    const variantClasses = {
      default: clsx(
        'glass-button text-white',
        !button.disabled && 'hover:glass-button-hover',
        button.active && 'glass-button-accent'
      ),
      accent: clsx(
        'glass-button-accent text-white font-semibold',
        !button.disabled && 'hover:shadow-lg hover:shadow-synth-accent/30'
      ),
      warning: clsx(
        'glass-warning text-white font-semibold',
        !button.disabled && 'hover:shadow-lg hover:shadow-synth-warning/30'
      ),
      ghost: clsx(
        'bg-transparent text-gray-400',
        !button.disabled && 'hover:bg-synth-control/50 hover:text-white'
      )
    };

    return (
      <button
        key={button.id}
        onClick={button.onClick}
        disabled={button.disabled}
        className={clsx(baseClasses, variantClasses[button.variant || 'default'])}
        title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
      >
        {button.icon}
        {!isCompact && (
          <span className="ml-2 hidden sm:inline">{button.label}</span>
        )}
        
        {/* Keyboard shortcut indicator */}
        {button.shortcut && !isCompact && (
          <span className="ml-2 text-xs opacity-60 hidden lg:inline">
            {button.shortcut}
          </span>
        )}

        {/* Active indicator */}
        {button.active && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-synth-accent rounded-full animate-pulse" />
        )}
      </button>
    );
  };

  return (
    <div className={clsx(
      'glass-toolbar sticky top-0 z-50',
      'px-4 py-3',
      'border-b border-white/10',
      'animate-slide-in-top',
      className
    )}>
      <div className="flex items-center justify-between gap-4 max-w-full overflow-x-auto">
        {/* Left section - Transport controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {transportButtons.map(renderButton)}
          
          {/* Separator */}
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          {/* BPM Control */}
          <div className="flex items-center gap-2 glass-control px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-synth-accent" />
            <input
              ref={bpmInputRef}
              type="number"
              min="60"
              max="200"
              value={localBpm}
              onChange={handleBpmChange}
              onBlur={handleBpmBlur}
              onKeyDown={handleBpmKeyDown}
              className="w-12 bg-transparent text-white text-sm font-mono text-center border-none outline-none"
            />
            <span className="text-xs text-gray-400">BPM</span>
          </div>
        </div>

        {/* Center section - Edit controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {editButtons.map(renderButton)}
          
          {/* Separator */}
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          {/* File controls */}
          {fileButtons.map(renderButton)}
        </div>

        {/* Right section - Utility controls and volume */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {utilityButtons.map(renderButton)}
          
          {/* Separator */}
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          {/* Volume Control */}
          <div className="relative flex items-center">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="glass-button flex items-center gap-2 px-3 py-2 rounded-lg"
              title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
            >
              <Volume2 className="w-4 h-4" />
              {!isCompact && (
                <span className="text-xs font-mono w-8 text-center">
                  {Math.round(masterVolume * 100)}%
                </span>
              )}
            </button>
            
            {/* Volume Slider Popup */}
            {showVolumeSlider && (
              <div className="absolute top-full right-0 mt-2 glass-tooltip p-3 rounded-lg animate-tooltip-show">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    onChange={handleVolumeChange}
                    className="w-24 glass-slider-track"
                  />
                  <span className="text-xs text-gray-400">100%</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Compact toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="glass-button p-2 rounded-lg lg:hidden"
            title="Toggle Compact View"
          >
            {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-1 right-1 flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-recording-pulse" />
          <span className="text-red-400 font-medium">REC</span>
        </div>
      )}
    </div>
  );
}