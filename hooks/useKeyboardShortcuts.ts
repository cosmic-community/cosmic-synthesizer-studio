import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  keys: string[];
  callback: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  disabled?: boolean;
  global?: boolean;
}

export interface ShortcutManager {
  register: (shortcut: KeyboardShortcut) => () => void;
  unregister: (keys: string[]) => void;
  enable: () => void;
  disable: () => void;
  isEnabled: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[] = [],
  options: {
    enabled?: boolean;
    target?: HTMLElement | Window;
    capture?: boolean;
  } = {}
): ShortcutManager {
  const {
    enabled = true,
    target = typeof window !== 'undefined' ? window : null,
    capture = false
  } = options;

  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const enabledRef = useRef(enabled);
  const targetRef = useRef(target);

  // Normalize key names
  const normalizeKey = useCallback((key: string): string => {
    const keyMap: Record<string, string> = {
      'Control': 'ctrl',
      'Shift': 'shift',
      'Alt': 'alt',
      'Meta': 'cmd',
      'Escape': 'esc',
      'Enter': 'enter',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'Tab': 'tab',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      ' ': 'space'
    };

    return keyMap[key] || key.toLowerCase();
  }, []);

  // Create shortcut key string
  const createShortcutKey = useCallback((keys: string[]): string => {
    return keys
      .map(key => normalizeKey(key))
      .sort()
      .join('+');
  }, [normalizeKey]);

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabledRef.current) return;

    const key = normalizeKey(event.key);
    pressedKeysRef.current.add(key);

    // Add modifier keys
    if (event.ctrlKey) pressedKeysRef.current.add('ctrl');
    if (event.shiftKey) pressedKeysRef.current.add('shift');
    if (event.altKey) pressedKeysRef.current.add('alt');
    if (event.metaKey) pressedKeysRef.current.add('cmd');

    // Create current key combination
    const currentKeys = Array.from(pressedKeysRef.current).sort();
    const shortcutKey = currentKeys.join('+');

    // Find matching shortcut
    const shortcut = shortcutsRef.current.get(shortcutKey);

    if (shortcut && !shortcut.disabled) {
      // Prevent default behavior if specified
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }

      // Stop propagation if specified
      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }

      // Execute callback
      try {
        shortcut.callback(event);
      } catch (error) {
        console.error('Error executing keyboard shortcut:', shortcut.keys, error);
      }
    }
  }, []);

  // Handle keyup events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabledRef.current) return;

    const key = normalizeKey(event.key);
    pressedKeysRef.current.delete(key);

    // Remove modifier keys when released
    if (!event.ctrlKey) pressedKeysRef.current.delete('ctrl');
    if (!event.shiftKey) pressedKeysRef.current.delete('shift');
    if (!event.altKey) pressedKeysRef.current.delete('alt');
    if (!event.metaKey) pressedKeysRef.current.delete('cmd');
  }, [normalizeKey]);

  // Register a shortcut
  const register = useCallback((shortcut: KeyboardShortcut) => {
    const key = createShortcutKey(shortcut.keys);
    shortcutsRef.current.set(key, shortcut);

    // Return unregister function
    return () => {
      shortcutsRef.current.delete(key);
    };
  }, [createShortcutKey]);

  // Unregister a shortcut
  const unregister = useCallback((keys: string[]) => {
    const key = createShortcutKey(keys);
    shortcutsRef.current.delete(key);
  }, [createShortcutKey]);

  // Enable/disable shortcuts
  const enable = useCallback(() => {
    enabledRef.current = true;
  }, []);

  const disable = useCallback(() => {
    enabledRef.current = false;
    pressedKeysRef.current.clear();
  }, []);

  // Register shortcuts from props
  useEffect(() => {
    const unregisterFunctions: (() => void)[] = [];

    shortcuts.forEach(shortcut => {
      const unregisterFn = register(shortcut);
      unregisterFunctions.push(unregisterFn);
    });

    return () => {
      unregisterFunctions.forEach(fn => fn());
    };
  }, [shortcuts, register]);

  // Update enabled state
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Update target
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // Add/remove event listeners
  useEffect(() => {
    const currentTarget = targetRef.current;
    if (!currentTarget) return;

    currentTarget.addEventListener('keydown', handleKeyDown, capture);
    currentTarget.addEventListener('keyup', handleKeyUp, capture);

    return () => {
      currentTarget.removeEventListener('keydown', handleKeyDown, capture);
      currentTarget.removeEventListener('keyup', handleKeyUp, capture);
    };
  }, [handleKeyDown, handleKeyUp, capture]);

  // Clear pressed keys when component unmounts or window loses focus
  useEffect(() => {
    const handleBlur = () => {
      pressedKeysRef.current.clear();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pressedKeysRef.current.clear();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    register,
    unregister,
    enable,
    disable,
    isEnabled: enabledRef.current
  };
}

// Hook for global shortcuts (works anywhere in the app)
export function useGlobalShortcuts(shortcuts: KeyboardShortcut[]) {
  return useKeyboardShortcuts(shortcuts, {
    target: typeof window !== 'undefined' ? window : null,
    capture: true
  });
}

// Hook for element-specific shortcuts
export function useElementShortcuts(
  elementRef: React.RefObject<HTMLElement>,
  shortcuts: KeyboardShortcut[]
) {
  return useKeyboardShortcuts(shortcuts, {
    target: elementRef.current,
    capture: false
  });
}

// Hook for modal/dialog shortcuts
export function useModalShortcuts(
  isOpen: boolean,
  shortcuts: KeyboardShortcut[]
) {
  const modalShortcuts = shortcuts.map(shortcut => ({
    ...shortcut,
    disabled: !isOpen
  }));

  return useKeyboardShortcuts(modalShortcuts, {
    target: typeof window !== 'undefined' ? window : null,
    capture: true
  });
}

// Predefined shortcut groups
export const shortcutGroups = {
  // Common application shortcuts
  app: {
    save: { keys: ['ctrl', 's'], description: 'Save' },
    open: { keys: ['ctrl', 'o'], description: 'Open' },
    new: { keys: ['ctrl', 'n'], description: 'New' },
    undo: { keys: ['ctrl', 'z'], description: 'Undo' },
    redo: { keys: ['ctrl', 'y'], description: 'Redo' },
    redoAlt: { keys: ['ctrl', 'shift', 'z'], description: 'Redo (Alt)' },
    copy: { keys: ['ctrl', 'c'], description: 'Copy' },
    cut: { keys: ['ctrl', 'x'], description: 'Cut' },
    paste: { keys: ['ctrl', 'v'], description: 'Paste' },
    selectAll: { keys: ['ctrl', 'a'], description: 'Select All' },
    find: { keys: ['ctrl', 'f'], description: 'Find' },
    print: { keys: ['ctrl', 'p'], description: 'Print' }
  },

  // Media/transport shortcuts
  media: {
    play: { keys: ['space'], description: 'Play/Pause' },
    stop: { keys: ['shift', 'space'], description: 'Stop' },
    record: { keys: ['r'], description: 'Record' },
    rewind: { keys: ['left'], description: 'Rewind' },
    fastForward: { keys: ['right'], description: 'Fast Forward' },
    skipBack: { keys: ['shift', 'left'], description: 'Skip Back' },
    skipForward: { keys: ['shift', 'right'], description: 'Skip Forward' },
    volumeUp: { keys: ['up'], description: 'Volume Up' },
    volumeDown: { keys: ['down'], description: 'Volume Down' },
    mute: { keys: ['m'], description: 'Mute' }
  },

  // Navigation shortcuts
  navigation: {
    escape: { keys: ['esc'], description: 'Cancel/Close' },
    enter: { keys: ['enter'], description: 'Confirm/Submit' },
    tab: { keys: ['tab'], description: 'Next Element' },
    shiftTab: { keys: ['shift', 'tab'], description: 'Previous Element' },
    home: { keys: ['home'], description: 'Go to Start' },
    end: { keys: ['end'], description: 'Go to End' },
    pageUp: { keys: ['pageup'], description: 'Page Up' },
    pageDown: { keys: ['pagedown'], description: 'Page Down' }
  },

  // View shortcuts
  view: {
    fullscreen: { keys: ['f11'], description: 'Toggle Fullscreen', preventDefault: false },
    zoomIn: { keys: ['ctrl', '+'], description: 'Zoom In' },
    zoomOut: { keys: ['ctrl', '-'], description: 'Zoom Out' },
    zoomReset: { keys: ['ctrl', '0'], description: 'Reset Zoom' },
    refresh: { keys: ['f5'], description: 'Refresh', preventDefault: false },
    devTools: { keys: ['f12'], description: 'Developer Tools', preventDefault: false }
  }
};

// Utility functions
export function formatShortcut(keys: string[]): string {
  const symbolMap: Record<string, string> = {
    'ctrl': '⌘',
    'shift': '⇧',
    'alt': '⌥',
    'cmd': '⌘',
    'enter': '↵',
    'space': '␣',
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
    'esc': 'Esc',
    'delete': 'Del',
    'backspace': '⌫'
  };

  return keys
    .map(key => symbolMap[key.toLowerCase()] || key.toUpperCase())
    .join(' + ');
}

export function createShortcut(
  keys: string[],
  callback: (event: KeyboardEvent) => void,
  options: Partial<Omit<KeyboardShortcut, 'keys' | 'callback'>> = {}
): KeyboardShortcut {
  return {
    keys,
    callback,
    preventDefault: true,
    stopPropagation: false,
    disabled: false,
    global: false,
    ...options
  };
}

// Hook for shortcut help/documentation
export function useShortcutHelp(shortcuts: KeyboardShortcut[]) {
  const getShortcutsByCategory = useCallback(() => {
    const categories = new Map<string, KeyboardShortcut[]>();

    shortcuts.forEach(shortcut => {
      if (!shortcut.description) return;

      // Determine category based on keys or description
      let category = 'General';
      
      if (shortcut.keys.includes('ctrl') || shortcut.keys.includes('cmd')) {
        category = 'Application';
      } else if (shortcut.keys.some(key => ['up', 'down', 'left', 'right', 'space'].includes(key))) {
        category = 'Navigation';
      } else if (shortcut.keys.some(key => ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'].includes(key))) {
        category = 'Function Keys';
      }

      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(shortcut);
    });

    return Array.from(categories.entries()).map(([name, shortcuts]) => ({
      name,
      shortcuts: shortcuts.sort((a, b) => (a.description || '').localeCompare(b.description || ''))
    }));
  }, [shortcuts]);

  const searchShortcuts = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return shortcuts.filter(shortcut => 
      shortcut.description?.toLowerCase().includes(lowercaseQuery) ||
      shortcut.keys.some(key => key.toLowerCase().includes(lowercaseQuery))
    );
  }, [shortcuts]);

  return {
    getShortcutsByCategory,
    searchShortcuts,
    formatShortcut
  };
}