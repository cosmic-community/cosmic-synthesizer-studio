'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Copy, 
  Scissors, 
  Clipboard, 
  Trash2, 
  Edit, 
  Settings, 
  Download, 
  Upload,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  Play,
  Square,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Save,
  Share2
} from 'lucide-react';
import { clsx } from 'clsx';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number } | null;
  onClose: () => void;
  className?: string;
}

interface ContextMenuTriggerProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
  className?: string;
}

// Main context menu component
export function ContextMenu({ items, position, onClose, className }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuState, setSubmenuState] = useState<{
    item: ContextMenuItem | null;
    position: { x: number; y: number } | null;
  }>({ item: null, position: null });

  // Close menu on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, onClose]);

  // Position menu within viewport
  const getMenuStyle = useCallback(() => {
    if (!position || !menuRef.current) return {};

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10;
    }

    return {
      left: Math.max(10, x),
      top: Math.max(10, y),
    };
  }, [position]);

  const handleItemClick = (item: ContextMenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (item.disabled) return;
    
    if (item.submenu) {
      // Show submenu
      const rect = event.currentTarget.getBoundingClientRect();
      setSubmenuState({
        item,
        position: {
          x: rect.right,
          y: rect.top
        }
      });
    } else {
      // Execute action and close menu
      item.onClick();
      onClose();
    }
  };

  const handleSubmenuClose = () => {
    setSubmenuState({ item: null, position: null });
  };

  if (!position) return null;

  const menuContent = (
    <>
      <div
        ref={menuRef}
        className={clsx(
          'fixed z-50 glass-modal min-w-48 max-w-64',
          'py-2 rounded-lg shadow-xl',
          'animate-modal-show',
          className
        )}
        style={getMenuStyle()}
      >
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`}>
            {item.separator && (
              <div className="my-1 h-px bg-white/10" />
            )}
            
            <button
              onClick={(e) => handleItemClick(item, e)}
              disabled={item.disabled}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5',
                'text-left text-sm font-medium',
                'transition-colors duration-150',
                item.disabled
                  ? 'text-gray-500 cursor-not-allowed'
                  : item.destructive
                  ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                  : 'text-white hover:bg-synth-accent/10 hover:text-synth-accent',
                item.submenu && 'justify-between'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="w-4 h-4 flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.shortcut && (
                  <span className="text-xs text-gray-400 font-mono">
                    {item.shortcut}
                  </span>
                )}
                {item.submenu && (
                  <span className="text-gray-400">›</span>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Submenu */}
      {submenuState.item && submenuState.position && (
        <ContextMenu
          items={submenuState.item.submenu || []}
          position={submenuState.position}
          onClose={handleSubmenuClose}
        />
      )}
    </>
  );

  return createPortal(menuContent, document.body);
}

// Context menu trigger wrapper
export function ContextMenuTrigger({ 
  children, 
  items, 
  disabled = false, 
  className 
}: ContextMenuTriggerProps) {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setMenuPosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCloseMenu = () => {
    setMenuPosition(null);
  };

  return (
    <>
      <div 
        onContextMenu={handleContextMenu}
        className={clsx('relative', className)}
      >
        {children}
      </div>
      
      <ContextMenu
        items={items}
        position={menuPosition}
        onClose={handleCloseMenu}
      />
    </>
  );
}

// Predefined context menu configurations
export const contextMenuPresets = {
  // Synthesizer control context menu
  synthControl: (onEdit: () => void, onReset: () => void, onCopy: () => void): ContextMenuItem[] => [
    {
      id: 'edit',
      label: 'Edit Parameters',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      shortcut: 'E'
    },
    {
      id: 'copy',
      label: 'Copy Settings',
      icon: <Copy className="w-4 h-4" />,
      onClick: onCopy,
      shortcut: 'Ctrl+C'
    },
    {
      id: 'reset',
      label: 'Reset to Default',
      icon: <RotateCcw className="w-4 h-4" />,
      onClick: onReset,
      shortcut: 'Ctrl+R'
    },
    {
      id: 'randomize',
      label: 'Randomize',
      icon: <Shuffle className="w-4 h-4" />,
      onClick: () => {},
      shortcut: 'Shift+R'
    }
  ],

  // Audio track context menu
  audioTrack: (
    onPlay: () => void,
    onStop: () => void,
    onMute: () => void,
    onSolo: () => void,
    isMuted: boolean,
    isSoloed: boolean
  ): ContextMenuItem[] => [
    {
      id: 'play',
      label: 'Play Track',
      icon: <Play className="w-4 h-4" />,
      onClick: onPlay,
      shortcut: 'Space'
    },
    {
      id: 'stop',
      label: 'Stop Track',
      icon: <Square className="w-4 h-4" />,
      onClick: onStop,
      shortcut: 'Shift+Space'
    },
    { id: 'separator-1', label: '', separator: true, onClick: () => {} },
    {
      id: 'mute',
      label: isMuted ? 'Unmute' : 'Mute',
      icon: isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />,
      onClick: onMute,
      shortcut: 'M'
    },
    {
      id: 'solo',
      label: isSoloed ? 'Unsolo' : 'Solo',
      icon: isSoloed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />,
      onClick: onSolo,
      shortcut: 'S'
    },
    { id: 'separator-2', label: '', separator: true, onClick: () => {} },
    {
      id: 'effects',
      label: 'Effects',
      icon: <Zap className="w-4 h-4" />,
      submenu: [
        {
          id: 'reverb',
          label: 'Add Reverb',
          onClick: () => {}
        },
        {
          id: 'delay',
          label: 'Add Delay',
          onClick: () => {}
        },
        {
          id: 'distortion',
          label: 'Add Distortion',
          onClick: () => {}
        }
      ],
      onClick: () => {}
    }
  ],

  // File/project context menu
  project: (
    onSave: () => void,
    onSaveAs: () => void,
    onExport: () => void,
    onShare: () => void
  ): ContextMenuItem[] => [
    {
      id: 'save',
      label: 'Save Project',
      icon: <Save className="w-4 h-4" />,
      onClick: onSave,
      shortcut: 'Ctrl+S'
    },
    {
      id: 'save-as',
      label: 'Save As...',
      icon: <Save className="w-4 h-4" />,
      onClick: onSaveAs,
      shortcut: 'Ctrl+Shift+S'
    },
    { id: 'separator-1', label: '', separator: true, onClick: () => {} },
    {
      id: 'export',
      label: 'Export Audio',
      icon: <Download className="w-4 h-4" />,
      submenu: [
        {
          id: 'export-wav',
          label: 'Export as WAV',
          onClick: () => {}
        },
        {
          id: 'export-mp3',
          label: 'Export as MP3',
          onClick: () => {}
        },
        {
          id: 'export-stems',
          label: 'Export Stems',
          onClick: () => {}
        }
      ],
      onClick: onExport,
      shortcut: 'Ctrl+E'
    },
    {
      id: 'share',
      label: 'Share Project',
      icon: <Share2 className="w-4 h-4" />,
      onClick: onShare,
      shortcut: 'Ctrl+Shift+P'
    }
  ],

  // General editing context menu
  editing: (
    onCut: () => void,
    onCopy: () => void,
    onPaste: () => void,
    onDelete: () => void,
    canPaste: boolean
  ): ContextMenuItem[] => [
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors className="w-4 h-4" />,
      onClick: onCut,
      shortcut: 'Ctrl+X'
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: onCopy,
      shortcut: 'Ctrl+C'
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard className="w-4 h-4" />,
      onClick: onPaste,
      disabled: !canPaste,
      shortcut: 'Ctrl+V'
    },
    { id: 'separator-1', label: '', separator: true, onClick: () => {} },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      destructive: true,
      shortcut: 'Delete'
    }
  ]
};

// Hook for using context menus
export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  const showContextMenu = useCallback((
    event: React.MouseEvent,
    menuItems: ContextMenuItem[]
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    setItems(menuItems);
    setPosition({
      x: event.clientX,
      y: event.clientY
    });
    setIsOpen(true);
  }, []);

  const hideContextMenu = useCallback(() => {
    setIsOpen(false);
    setPosition(null);
    setItems([]);
  }, []);

  return {
    isOpen,
    position,
    items,
    showContextMenu,
    hideContextMenu
  };
}