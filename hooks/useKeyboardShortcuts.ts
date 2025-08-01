import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  keys: string[];
  callback: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  disabled?: boolean;
  global?: boolean;
  allowRepeat?: boolean;
}

export interface ShortcutManager {
  register: (shortcut: KeyboardShortcut) => () => void;
  unregister: (keys: string[]) => void;
  enable: () => void;
  disable: () => void;
  isEnabled: boolean;
  getPressedKeys: () => string[];
  clearPressedKeys: () => void;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[] = [],
  options: {
    enabled?: boolean;
    target?: HTMLElement | Window | null;
    capture?: boolean;
    enablePolyphony?: boolean;
  } = {}
): ShortcutManager {
  const {
    enabled = true,
    target = typeof window !== 'undefined' ? window : null,
    capture = false,
    enablePolyphony = false
  } = options;

  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const keyDownTimestampsRef = useRef<Map<string, number>>(new Map());
  const enabledRef = useRef(enabled);
  const targetRef = useRef(target);
  const polyphonyEnabledRef = useRef(enablePolyphony);

  // Normalize key names for consistent handling
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

  // Create shortcut key string from array of keys
  const createShortcutKey = useCallback((keys: string[]): string => {
    return keys
      .map(key => normalizeKey(key))
      .sort()
      .join('+');
  }, [normalizeKey]);

  // Enhanced keydown handler with polyphonic support
  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (!enabledRef.current) return;

    const key = normalizeKey(keyboardEvent.key);
    const timestamp = Date.now();

    // Handle key repeat for polyphonic mode
    if (polyphonyEnabledRef.current) {
      // In polyphonic mode, we want to prevent key repeat for most keys
      // but allow it for specific shortcuts that benefit from repeat
      const isKeyAlreadyPressed = pressedKeysRef.current.has(key);
      
      if (keyboardEvent.repeat) {
        // Find shortcuts that explicitly allow repeat
        const allowRepeatShortcuts = Array.from(shortcutsRef.current.values())
          .filter(shortcut => shortcut.allowRepeat && shortcut.keys.includes(key));
        
        if (allowRepeatShortcuts.length === 0) {
          return; // Block key repeat for polyphonic keys
        }
      }
    }

    // Add key to pressed keys set
    pressedKeysRef.current.add(key);
    keyDownTimestampsRef.current.set(key, timestamp);

    // Add modifier keys based on event state
    if (keyboardEvent.ctrlKey) pressedKeysRef.current.add('ctrl');
    if (keyboardEvent.shiftKey) pressedKeysRef.current.add('shift');  
    if (keyboardEvent.altKey) pressedKeysRef.current.add('alt');
    if (keyboardEvent.metaKey) pressedKeysRef.current.add('cmd');

    // Create current key combination
    const currentKeys = Array.from(pressedKeysRef.current).sort();
    
    // Find all matching shortcuts (support for multiple shortcuts per key combination)
    const matchingShortcuts: KeyboardShortcut[] = [];
    
    for (const [shortcutKey, shortcut] of shortcutsRef.current.entries()) {
      if (shortcut.disabled) continue;
      
      const shortcutKeys = shortcut.keys.map(k => normalizeKey(k)).sort();
      
      // Check for exact match
      if (shortcutKeys.length === currentKeys.length && 
          shortcutKeys.every(k => currentKeys.includes(k))) {
        matchingShortcuts.push(shortcut);
      }
      
      // Check for single key match (for simple key presses)
      else if (shortcutKeys.length === 1 && shortcutKeys[0] === key) {
        matchingShortcuts.push(shortcut);
      }
    }

    // Execute all matching shortcuts
    for (const shortcut of matchingShortcuts) {
      // Handle key repeat policy
      if (keyboardEvent.repeat && !shortcut.allowRepeat) {
        continue;
      }

      // Prevent default behavior if specified
      if (shortcut.preventDefault !== false) {
        keyboardEvent.preventDefault();
      }

      // Stop propagation if specified
      if (shortcut.stopPropagation) {
        keyboardEvent.stopPropagation();
      }

      // Execute callback with error handling
      try {
        shortcut.callback(keyboardEvent);
      } catch (error) {
        console.error('Error executing keyboard shortcut:', shortcut.keys, error);
      }
    }
  }, [normalizeKey]);

  // Enhanced keyup handler with polyphonic support
  const handleKeyUp = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (!enabledRef.current) return;

    const key = normalizeKey(keyboardEvent.key);
    
    // Remove key from pressed keys
    pressedKeysRef.current.delete(key);
    keyDownTimestampsRef.current.delete(key);

    // Remove modifier keys when released (check actual state)
    if (!keyboardEvent.ctrlKey) pressedKeysRef.current.delete('ctrl');
    if (!keyboardEvent.shiftKey) pressedKeysRef.current.delete('shift');
    if (!keyboardEvent.altKey) pressedKeysRef.current.delete('alt');
    if (!keyboardEvent.metaKey) pressedKeysRef.current.delete('cmd');
  }, [normalizeKey]);

  // Register a shortcut with enhanced options
  const register = useCallback((shortcut: KeyboardShortcut) => {
    const key = createShortcutKey(shortcut.keys);
    shortcutsRef.current.set(key, {
      ...shortcut,
      allowRepeat: shortcut.allowRepeat || false
    });

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
    keyDownTimestampsRef.current.clear();
  }, []);

  // Get currently pressed keys (useful for debugging)
  const getPressedKeys = useCallback(() => {
    return Array.from(pressedKeysRef.current);
  }, []);

  // Clear all pressed keys (useful for cleanup)
  const clearPressedKeys = useCallback(() => {
    pressedKeysRef.current.clear();
    keyDownTimestampsRef.current.clear();
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

  // Update polyphony mode
  useEffect(() => {
    polyphonyEnabledRef.current = enablePolyphony;
  }, [enablePolyphony]);

  // Add/remove event listeners with enhanced options
  useEffect(() => {
    const currentTarget = targetRef.current;
    if (!currentTarget) return;

    // Use passive listeners for better performance where possible
    const keydownOptions = { capture, passive: false };
    const keyupOptions = { capture, passive: false };

    currentTarget.addEventListener('keydown', handleKeyDown, keydownOptions);
    currentTarget.addEventListener('keyup', handleKeyUp, keyupOptions);

    return () => {
      currentTarget.removeEventListener('keydown', handleKeyDown, keydownOptions);
      currentTarget.removeEventListener('keyup', handleKeyUp, keyupOptions);
    };
  }, [handleKeyDown, handleKeyUp, capture]);

  // Enhanced cleanup on blur/visibility change
  useEffect(() => {
    const handleBlur = () => {
      clearPressedKeys();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearPressedKeys();
      }
    };

    const handleFocus = () => {
      // Clear keys when gaining focus to prevent stuck keys
      clearPressedKeys();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [clearPressedKeys]);

  return {
    register,
    unregister,
    enable,
    disable,
    isEnabled: enabledRef.current,
    getPressedKeys,
    clearPressedKeys
  };
}

// Enhanced hook for global shortcuts with polyphonic support
export function useGlobalShortcuts(shortcuts: KeyboardShortcut[], enablePolyphony = false) {
  return useKeyboardShortcuts(shortcuts, {
    target: typeof window !== 'undefined' ? window : null,
    capture: true,
    enablePolyphony
  });
}

// Hook for element-specific shortcuts
export function useElementShortcuts(
  elementRef: React.RefObject<HTMLElement>,
  shortcuts: KeyboardShortcut[],
  enablePolyphony = false
) {
  return useKeyboardShortcuts(shortcuts, {
    target: elementRef.current,
    capture: false,
    enablePolyphony
  });
}

// Hook for modal/dialog shortcuts with enhanced focus management
export function useModalShortcuts(
  isOpen: boolean,
  shortcuts: KeyboardShortcut[],
  enablePolyphony = false
) {
  const modalShortcuts = shortcuts.map(shortcut => ({
    ...shortcut,
    disabled: !isOpen
  }));

  return useKeyboardShortcuts(modalShortcuts, {
    target: typeof window !== 'undefined' ? window : null,
    capture: true,
    enablePolyphony
  });
}

// Enhanced hook specifically for piano keyboard with polyphonic support
export function usePianoKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: {
    enabled?: boolean;
    allowKeyRepeat?: boolean;
  } = {}
) {
  const { enabled = true, allowKeyRepeat = false } = options;

  // Enhance shortcuts with piano-specific settings
  const pianoShortcuts = shortcuts.map(shortcut => ({
    ...shortcut,
    allowRepeat: allowKeyRepeat,
    preventDefault: shortcut.preventDefault !== false,
    stopPropagation: shortcut.stopPropagation !== false
  }));

  return useKeyboardShortcuts(pianoShortcuts, {
    enabled,
    target: typeof window !== 'undefined' ? window : null,
    capture: true,
    enablePolyphony: true // Always enable polyphony for piano
  });
}

// Predefined shortcut groups with enhanced configurations
export const shortcutGroups = {
  // Common application shortcuts
  app: {
    save: { keys: ['ctrl', 's'], description: 'Save', preventDefault: true },
    open: { keys: ['ctrl', 'o'], description: 'Open', preventDefault: true },
    new: { keys: ['ctrl', 'n'], description: 'New', preventDefault: true },
    undo: { keys: ['ctrl', 'z'], description: 'Undo', preventDefault: true },
    redo: { keys: ['ctrl', 'y'], description: 'Redo', preventDefault: true },
    redoAlt: { keys: ['ctrl', 'shift', 'z'], description: 'Redo (Alt)', preventDefault: true },
    copy: { keys: ['ctrl', 'c'], description: 'Copy', preventDefault: true },
    cut: { keys: ['ctrl', 'x'], description: 'Cut', preventDefault: true },
    paste: { keys: ['ctrl', 'v'], description: 'Paste', preventDefault: true },
    selectAll: { keys: ['ctrl', 'a'], description: 'Select All', preventDefault: true },
    find: { keys: ['ctrl', 'f'], description: 'Find', preventDefault: true },
    print: { keys: ['ctrl', 'p'], description: 'Print', preventDefault: true }
  },

  // Media/transport shortcuts with repeat support
  media: {
    play: { keys: ['space'], description: 'Play/Pause', allowRepeat: false },
    stop: { keys: ['shift', 'space'], description: 'Stop', allowRepeat: false },
    record: { keys: ['r'], description: 'Record', allowRepeat: false },
    rewind: { keys: ['left'], description: 'Rewind', allowRepeat: true },
    fastForward: { keys: ['right'], description: 'Fast Forward', allowRepeat: true },
    skipBack: { keys: ['shift', 'left'], description: 'Skip Back', allowRepeat: false },
    skipForward: { keys: ['shift', 'right'], description: 'Skip Forward', allowRepeat: false },
    volumeUp: { keys: ['up'], description: 'Volume Up', allowRepeat: true },
    volumeDown: { keys: ['down'], description: 'Volume Down', allowRepeat: true },
    mute: { keys: ['m'], description: 'Mute', allowRepeat: false }
  },

  // Navigation shortcuts
  navigation: {
    escape: { keys: ['esc'], description: 'Cancel/Close', allowRepeat: false },
    enter: { keys: ['enter'], description: 'Confirm/Submit', allowRepeat: false },
    tab: { keys: ['tab'], description: 'Next Element', allowRepeat: true },
    shiftTab: { keys: ['shift', 'tab'], description: 'Previous Element', allowRepeat: true },
    home: { keys: ['home'], description: 'Go to Start', allowRepeat: false },
    end: { keys: ['end'], description: 'Go to End', allowRepeat: false },
    pageUp: { keys: ['pageup'], description: 'Page Up', allowRepeat: true },
    pageDown: { keys: ['pagedown'], description: 'Page Down', allowRepeat: true }
  },

  // View shortcuts
  view: {
    fullscreen: { keys: ['f11'], description: 'Toggle Fullscreen', preventDefault: false },
    zoomIn: { keys: ['ctrl', '+'], description: 'Zoom In', allowRepeat: true },
    zoomOut: { keys: ['ctrl', '-'], description: 'Zoom Out', allowRepeat: true },
    zoomReset: { keys: ['ctrl', '0'], description: 'Reset Zoom', allowRepeat: false },
    refresh: { keys: ['f5'], description: 'Refresh', preventDefault: false },
    devTools: { keys: ['f12'], description: 'Developer Tools', preventDefault: false }
  },

  // Enhanced piano keyboard shortcuts with polyphonic support
  piano: {
    // White keys - main layer
    playC: { keys: ['a'], description: 'Play C', allowRepeat: false },
    playD: { keys: ['s'], description: 'Play D', allowRepeat: false },
    playE: { keys: ['d'], description: 'Play E', allowRepeat: false },
    playF: { keys: ['f'], description: 'Play F', allowRepeat: false },
    playG: { keys: ['g'], description: 'Play G', allowRepeat: false },
    playA: { keys: ['h'], description: 'Play A', allowRepeat: false },
    playB: { keys: ['j'], description: 'Play B', allowRepeat: false },
    playC5: { keys: ['k'], description: 'Play C (octave 5)', allowRepeat: false },
    playD5: { keys: ['l'], description: 'Play D (octave 5)', allowRepeat: false },
    playE5: { keys: [';'], description: 'Play E (octave 5)', allowRepeat: false },
    playF5: { keys: ["'"], description: 'Play F (octave 5)', allowRepeat: false },
    
    // Black keys
    playCSharp: { keys: ['w'], description: 'Play C#', allowRepeat: false },
    playDSharp: { keys: ['e'], description: 'Play D#', allowRepeat: false },
    playFSharp: { keys: ['t'], description: 'Play F#', allowRepeat: false },
    playGSharp: { keys: ['y'], description: 'Play G#', allowRepeat: false },
    playASharp: { keys: ['u'], description: 'Play A#', allowRepeat: false },
    playCSharp5: { keys: ['o'], description: 'Play C# (octave 5)', allowRepeat: false },
    playDSharp5: { keys: ['p'], description: 'Play D# (octave 5)', allowRepeat: false },
    playFSharp5: { keys: [']'], description: 'Play F# (octave 5)', allowRepeat: false },
    
    // Number row for higher octave
    playC6: { keys: ['1'], description: 'Play C (octave 6)', allowRepeat: false },
    playD6: { keys: ['2'], description: 'Play D (octave 6)', allowRepeat: false },
    playE6: { keys: ['3'], description: 'Play E (octave 6)', allowRepeat: false },
    playF6: { keys: ['4'], description: 'Play F (octave 6)', allowRepeat: false },
    playG6: { keys: ['5'], description: 'Play G (octave 6)', allowRepeat: false },
    playA6: { keys: ['6'], description: 'Play A (octave 6)', allowRepeat: false },
    playB6: { keys: ['7'], description: 'Play B (octave 6)', allowRepeat: false },
    
    // Lower octave
    playC2: { keys: ['z'], description: 'Play C (octave 2)', allowRepeat: false },
    playD2: { keys: ['x'], description: 'Play D (octave 2)', allowRepeat: false },
    playE2: { keys: ['c'], description: 'Play E (octave 2)', allowRepeat: false },
    
    // Control shortcuts
    octaveDown: { keys: ['shift', 'z'], description: 'Octave Down', allowRepeat: true },
    octaveUp: { keys: ['shift', 'x'], description: 'Octave Up', allowRepeat: true },
    sustain: { keys: ['shift', 'c'], description: 'Toggle Sustain', allowRepeat: false },
    allNotesOff: { keys: ['shift', 'space'], description: 'All Notes Off', allowRepeat: false }
  }
};

// Utility functions with enhanced support
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
    allowRepeat: false,
    ...options
  };
}

// Enhanced hook for shortcut help/documentation
export function useShortcutHelp(shortcuts: KeyboardShortcut[]) {
  const getShortcutsByCategory = useCallback(() => {
    const categories = new Map<string, KeyboardShortcut[]>();

    shortcuts.forEach(shortcut => {
      if (!shortcut.description) return;

      // Enhanced categorization
      let category = 'General';
      
      if (shortcut.keys.includes('ctrl') || shortcut.keys.includes('cmd')) {
        category = 'Application';
      } else if (shortcut.keys.some(key => ['up', 'down', 'left', 'right', 'space'].includes(key))) {
        category = 'Navigation';
      } else if (shortcut.keys.some(key => ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'].includes(key))) {
        category = 'Function Keys';
      } else if (shortcut.keys.some(key => ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'w', 'e', 't', 'y', 'u', 'o', 'p', 'z', 'x', 'c', '1', '2', '3', '4', '5', '6', '7'].includes(key))) {
        category = 'Piano';
      } else if (shortcut.keys.includes('shift')) {
        category = 'Controls';
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

  const getPolyphonicShortcuts = useCallback(() => {
    return shortcuts.filter(shortcut => !shortcut.allowRepeat);
  }, [shortcuts]);

  return {
    getShortcutsByCategory,
    searchShortcuts,
    getPolyphonicShortcuts,
    formatShortcut
  };
}

// Debug utilities for polyphonic keyboard development
export function useShortcutDebugger(enabled = false) {
  const debugRef = useRef<{
    keyPresses: { key: string; timestamp: number; }[];
    shortcuts: { keys: string[]; timestamp: number; }[];
  }>({ keyPresses: [], shortcuts: [] });

  const logKeyPress = useCallback((key: string) => {
    if (!enabled) return;
    
    debugRef.current.keyPresses.push({
      key,
      timestamp: Date.now()
    });
    
    // Keep only recent key presses (last 10 seconds)
    const cutoff = Date.now() - 10000;
    debugRef.current.keyPresses = debugRef.current.keyPresses.filter(
      press => press.timestamp > cutoff
    );
  }, [enabled]);

  const logShortcut = useCallback((keys: string[]) => {
    if (!enabled) return;
    
    debugRef.current.shortcuts.push({
      keys: [...keys],
      timestamp: Date.now()
    });
    
    // Keep only recent shortcuts (last 30 seconds)
    const cutoff = Date.now() - 30000;
    debugRef.current.shortcuts = debugRef.current.shortcuts.filter(
      shortcut => shortcut.timestamp > cutoff
    );
  }, [enabled]);

  const getDebugInfo = useCallback(() => {
    return {
      recentKeyPresses: debugRef.current.keyPresses,
      recentShortcuts: debugRef.current.shortcuts,
      polyphonicSupport: true
    };
  }, []);

  const clearDebugInfo = useCallback(() => {
    debugRef.current.keyPresses = [];
    debugRef.current.shortcuts = [];
  }, []);

  return {
    logKeyPress,
    logShortcut,
    getDebugInfo,
    clearDebugInfo
  };
}