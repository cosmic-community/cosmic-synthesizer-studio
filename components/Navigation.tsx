'use client';

import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Music, 
  Sliders, 
  Mic, 
  Settings, 
  FileAudio,
  Layers,
  Grid3x3,
  Play,
  Square,
  Volume2,
  ChevronDown,
  Search,
  User,
  Moon,
  Sun,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isPlaying?: boolean;
  isRecording?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  onRecord?: () => void;
  masterVolume?: number;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  badge?: string | number;
  children?: NavItem[];
}

export default function Navigation({
  activeSection,
  onSectionChange,
  isPlaying = false,
  isRecording = false,
  onPlay,
  onStop,
  onRecord,
  masterVolume = 0.7,
  onVolumeChange,
  className
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['studio']);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation items configuration
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="w-5 h-5" />,
      shortcut: 'Ctrl+1'
    },
    {
      id: 'studio',
      label: 'Studio',
      icon: <Music className="w-5 h-5" />,
      shortcut: 'Ctrl+2',
      children: [
        {
          id: 'synth',
          label: 'Synthesizer',
          icon: <Sliders className="w-4 h-4" />,
          shortcut: 'S'
        },
        {
          id: 'drums',
          label: 'Drum Machine',
          icon: <Grid3x3 className="w-4 h-4" />,
          shortcut: 'D'
        },
        {
          id: 'effects',
          label: 'Effects Rack',
          icon: <Layers className="w-4 h-4" />,
          shortcut: 'E'
        },
        {
          id: 'mixer',
          label: 'Mixer Console',
          icon: <Sliders className="w-4 h-4" />,
          shortcut: 'M'
        }
      ]
    },
    {
      id: 'recording',
      label: 'Recording',
      icon: <Mic className="w-5 h-5" />,
      shortcut: 'Ctrl+3',
      badge: isRecording ? 'REC' : undefined
    },
    {
      id: 'library',
      label: 'Library',
      icon: <FileAudio className="w-5 h-5" />,
      shortcut: 'Ctrl+4'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      shortcut: 'Ctrl+,'
    }
  ];

  // Filter items based on search
  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.children?.some(child => 
      child.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Handle menu expansion
  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    onSectionChange(itemId);
    setIsMobileMenuOpen(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            handleItemSelect('overview');
            break;
          case '2':
            e.preventDefault();
            handleItemSelect('studio');
            break;
          case '3':
            e.preventDefault();
            handleItemSelect('recording');
            break;
          case '4':
            e.preventDefault();
            handleItemSelect('library');
            break;
          case ',':
            e.preventDefault();
            handleItemSelect('settings');
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 's':
            if (!e.ctrlKey && !e.metaKey && e.target === document.body) {
              e.preventDefault();
              handleItemSelect('synth');
            }
            break;
          case 'd':
            if (!e.ctrlKey && !e.metaKey && e.target === document.body) {
              e.preventDefault();
              handleItemSelect('drums');
            }
            break;
          case 'e':
            if (!e.ctrlKey && !e.metaKey && e.target === document.body) {
              e.preventDefault();
              handleItemSelect('effects');
            }
            break;
          case 'm':
            if (!e.ctrlKey && !e.metaKey && e.target === document.body) {
              e.preventDefault();
              handleItemSelect('mixer');
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = activeSection === item.id;
    const isExpanded = expandedMenus.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="nav-item-container">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              handleItemSelect(item.id);
            }
          }}
          className={clsx(
            'nav-item group',
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
            'text-left transition-all duration-200',
            'hover:bg-white/5 hover:backdrop-blur-sm',
            'focus:outline-none focus:ring-2 focus:ring-synth-accent/50',
            isActive && 'nav-item-active bg-synth-accent/20 text-synth-accent border-r-2 border-synth-accent',
            !isActive && 'text-gray-300 hover:text-white',
            level > 0 && 'ml-4 text-sm'
          )}
          style={{ paddingLeft: `${(level * 16) + 16}px` }}
        >
          <span className={clsx(
            'nav-icon transition-colors duration-200',
            isActive ? 'text-synth-accent' : 'text-gray-400 group-hover:text-synth-accent'
          )}>
            {item.icon}
          </span>

          {!isCompact && (
            <>
              <span className="nav-label flex-1 font-medium">
                {item.label}
              </span>

              {item.badge && (
                <span className={clsx(
                  'nav-badge px-2 py-0.5 text-xs font-bold rounded-full',
                  item.badge === 'REC' 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-synth-accent/20 text-synth-accent'
                )}>
                  {item.badge}
                </span>
              )}

              {item.shortcut && (
                <span className="nav-shortcut text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.shortcut}
                </span>
              )}

              {hasChildren && (
                <ChevronDown className={clsx(
                  'w-4 h-4 text-gray-400 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )} />
              )}
            </>
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isExpanded && !isCompact && (
          <div className="nav-submenu mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <nav className={clsx(
        'nav-sidebar fixed left-0 top-0 bottom-0 z-40',
        'glass-heavy border-r border-white/10',
        'flex flex-col transition-all duration-300',
        isCompact ? 'w-16' : 'w-64',
        'hidden lg:flex',
        className
      )}>
        {/* Header */}
        <div className="nav-header p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="nav-logo w-8 h-8 bg-gradient-to-br from-synth-accent to-synth-info rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-black" />
            </div>
            
            {!isCompact && (
              <div className="nav-title">
                <h1 className="text-lg font-bold text-white">Cosmic Studio</h1>
                <p className="text-xs text-gray-400">Music Production</p>
              </div>
            )}

            <button
              onClick={() => setIsCompact(!isCompact)}
              className="nav-collapse ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Search */}
          {!isCompact && (
            <div className="nav-search mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sections..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-synth-accent/50"
              />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="nav-content flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNavItems.map(item => renderNavItem(item))}
        </div>

        {/* Footer Controls */}
        <div className="nav-footer p-4 border-t border-white/10 space-y-3">
          {/* Transport Controls */}
          <div className="nav-transport flex items-center justify-center gap-2">
            <button
              onClick={onPlay}
              className={clsx(
                'transport-btn w-8 h-8 rounded-full flex items-center justify-center transition-all',
                isPlaying 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
              )}
              title="Play/Pause"
            >
              <Play className="w-4 h-4" />
            </button>
            
            <button
              onClick={onStop}
              className="transport-btn w-8 h-8 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white flex items-center justify-center transition-all"
              title="Stop"
            >
              <Square className="w-4 h-4" />
            </button>
            
            <button
              onClick={onRecord}
              className={clsx(
                'transport-btn w-8 h-8 rounded-full flex items-center justify-center transition-all',
                isRecording 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
              )}
              title="Record"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Master Volume */}
          {!isCompact && (
            <div className="nav-volume">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 flex-1">Master</span>
                <span className="text-xs text-white font-mono">
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
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* User Menu */}
          <div className="nav-user flex items-center gap-2">
            <button className="user-avatar w-8 h-8 bg-gradient-to-br from-synth-accent to-synth-info rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </button>
            
            {!isCompact && (
              <div className="user-info flex-1">
                <p className="text-sm font-medium text-white">Producer</p>
                <p className="text-xs text-gray-400">Studio Session</p>
              </div>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="mobile-menu-trigger fixed top-4 left-4 z-50 lg:hidden p-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="mobile-menu absolute left-0 top-0 bottom-0 w-80 max-w-[80vw] glass-heavy border-r border-white/10 overflow-y-auto">
            {/* Mobile Header */}
            <div className="mobile-header p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sections..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-synth-accent/50"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="mobile-nav p-2 space-y-1">
              {filteredNavItems.map(item => renderNavItem(item))}
            </div>

            {/* Mobile Footer */}
            <div className="mobile-footer p-4 border-t border-white/10 space-y-3">
              {/* Transport Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onPlay}
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    isPlaying 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  )}
                >
                  <Play className="w-5 h-5" />
                </button>
                
                <button
                  onClick={onStop}
                  className="w-10 h-10 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white flex items-center justify-center transition-all"
                >
                  <Square className="w-5 h-5" />
                </button>
                
                <button
                  onClick={onRecord}
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    isRecording 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  )}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              {/* Master Volume */}
              <div className="volume-control">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400 flex-1">Master Volume</span>
                  <span className="text-sm text-white font-mono">
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
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}