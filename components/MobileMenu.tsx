'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Menu, 
  Home, 
  Music, 
  Sliders, 
  Mic, 
  Settings, 
  FileAudio,
  Search,
  Play,
  Square,
  Volume2,
  User,
  ChevronRight,
  Grid3x3,
  Layers
} from 'lucide-react';
import { clsx } from 'clsx';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isPlaying?: boolean;
  isRecording?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  onRecord?: () => void;
  masterVolume?: number;
  onVolumeChange?: (volume: number) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  children?: MenuItem[];
}

export default function MobileMenu({
  isOpen,
  onClose,
  activeSection,
  onSectionChange,
  isPlaying = false,
  isRecording = false,
  onPlay,
  onStop,  
  onRecord,
  masterVolume = 0.7,
  onVolumeChange
}: MobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['studio']);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'studio',
      label: 'Studio',
      icon: <Music className="w-5 h-5" />,
      children: [
        {
          id: 'synth',
          label: 'Synthesizer',
          icon: <Sliders className="w-4 h-4" />
        },
        {
          id: 'drums',
          label: 'Drum Machine',
          icon: <Grid3x3 className="w-4 h-4" />
        },
        {
          id: 'effects',
          label: 'Effects Rack',
          icon: <Layers className="w-4 h-4" />
        },
        {
          id: 'mixer',
          label: 'Mixer Console',
          icon: <Sliders className="w-4 h-4" />
        }
      ]
    },
    {
      id: 'recording',
      label: 'Recording',
      icon: <Mic className="w-5 h-5" />,
      badge: isRecording ? 'REC' : undefined
    },
    {
      id: 'library',
      label: 'Library',
      icon: <FileAudio className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.children?.some(child => 
      child.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Handle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    onSectionChange(itemId);
    onClose();
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isActive = activeSection === item.id;
    const isExpanded = expandedSections.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="mobile-menu-item">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id);
            } else {
              handleItemSelect(item.id);
            }
          }}
          className={clsx(
            'mobile-menu-button w-full flex items-center gap-3 px-4 py-3 text-left',
            'transition-all duration-200 rounded-lg',
            'active:scale-95',
            isActive && 'bg-synth-accent/20 text-synth-accent border-l-4 border-synth-accent',
            !isActive && 'text-gray-300 hover:text-white hover:bg-white/5',
            level > 0 && 'ml-4 py-2'
          )}
          style={{ paddingLeft: `${(level * 16) + 16}px` }}
        >
          <span className={clsx(
            'menu-icon transition-colors duration-200',
            isActive ? 'text-synth-accent' : 'text-gray-400'
          )}>
            {item.icon}
          </span>

          <span className="menu-label flex-1 font-medium">
            {item.label}
          </span>

          {item.badge && (
            <span className={clsx(
              'menu-badge px-2 py-0.5 text-xs font-bold rounded-full',
              item.badge === 'REC' 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-synth-accent/20 text-synth-accent'
            )}>
              {item.badge}
            </span>
          )}

          {hasChildren && (
            <ChevronRight className={clsx(
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )} />
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isExpanded && (
          <div className="mobile-submenu mt-1 ml-2 space-y-1 border-l border-white/10">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="mobile-menu-backdrop absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div 
        ref={menuRef}
        className={clsx(
          'mobile-menu-panel absolute left-0 top-0 bottom-0',
          'w-80 max-w-[85vw] glass-heavy border-r border-white/10',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="mobile-menu-header p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-synth-accent to-synth-info rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Cosmic Studio</h1>
                <p className="text-xs text-gray-400">Music Production</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="close-button p-2 rounded-lg hover:bg-white/10 transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="mobile-search relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-synth-accent/50 focus:border-synth-accent/50 transition-all"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="mobile-menu-content flex-1 overflow-y-auto p-2 space-y-1">
          {filteredMenuItems.map(item => renderMenuItem(item))}
        </div>

        {/* Footer Controls */}
        <div className="mobile-menu-footer p-4 border-t border-white/10 space-y-4">
          {/* Transport Controls */}
          <div className="transport-controls">
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                onClick={() => {
                  onPlay?.();
                  onClose();
                }}
                className={clsx(
                  'transport-button w-12 h-12 rounded-full flex items-center justify-center',
                  'transition-all duration-200 active:scale-95',
                  isPlaying 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                )}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <Play className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => {
                  onStop?.();
                  onClose();
                }}
                className="transport-button w-12 h-12 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                aria-label="Stop"
              >
                <Square className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => {
                  onRecord?.();
                  onClose();
                }}
                className={clsx(
                  'transport-button w-12 h-12 rounded-full flex items-center justify-center',
                  'transition-all duration-200 active:scale-95',
                  isRecording 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                )}
                aria-label={isRecording ? 'Stop Recording' : 'Record'}
              >
                <Mic className="w-6 h-6" />
              </button>
            </div>

            <div className="transport-status text-center">
              <div className="text-sm font-medium text-white">
                {isRecording ? 'Recording' : isPlaying ? 'Playing' : 'Stopped'}
              </div>
              <div className="text-xs text-gray-400">
                Ready for production
              </div>
            </div>
          </div>

          {/* Master Volume */}
          <div className="volume-control">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 flex-1">Master Volume</span>
              <span className="text-sm text-white font-mono tabular-nums">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
              className="volume-slider w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-synth-accent/50"
            />
            
            {/* Volume level indicator */}
            <div className="volume-indicator mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-synth-accent to-synth-info transition-all duration-200"
                style={{ width: `${masterVolume * 100}%` }}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="user-info flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="user-avatar w-10 h-10 bg-gradient-to-br from-synth-accent to-synth-info rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-black" />
            </div>
            <div className="user-details flex-1">
              <p className="text-sm font-medium text-white">Producer</p>
              <p className="text-xs text-gray-400">Studio Session Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}