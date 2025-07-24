export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action: () => void;
  global?: boolean;
  preventDefault?: boolean;
  disabled?: boolean;
}

export interface ShortcutCategory {
  id: string;
  name: string;
  shortcuts: KeyboardShortcut[];
}

class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private pressedKeys: Set<string> = new Set();
  private isListening = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  // Start listening for keyboard events
  public startListening(): void {
    if (this.isListening) return;
    
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    this.isListening = true;
  }

  // Stop listening for keyboard events
  public stopListening(): void {
    if (!this.isListening) return;
    
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.isListening = false;
    this.pressedKeys.clear();
  }

  // Register a keyboard shortcut
  public register(shortcut: KeyboardShortcut): void {
    const key = this.createShortcutKey(shortcut.keys);
    this.shortcuts.set(key, shortcut);
  }

  // Unregister a keyboard shortcut
  public unregister(keys: string[]): void {
    const key = this.createShortcutKey(keys);
    this.shortcuts.delete(key);
  }

  // Register multiple shortcuts
  public registerMultiple(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach(shortcut => this.register(shortcut));
  }

  // Get all registered shortcuts
  public getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  // Get shortcuts by category
  public getShortcutsByCategory(): ShortcutCategory[] {
    const categories = new Map<string, KeyboardShortcut[]>();
    
    this.shortcuts.forEach(shortcut => {
      if (!categories.has(shortcut.category)) {
        categories.set(shortcut.category, []);
      }
      categories.get(shortcut.category)!.push(shortcut);
    });

    return Array.from(categories.entries()).map(([name, shortcuts]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      shortcuts
    }));
  }

  // Check if a shortcut exists
  public hasShortcut(keys: string[]): boolean {
    const key = this.createShortcutKey(keys);
    return this.shortcuts.has(key);
  }

  // Execute a shortcut manually
  public executeShortcut(keys: string[]): boolean {
    const key = this.createShortcutKey(keys);
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut && !shortcut.disabled) {
      shortcut.action();
      return true;
    }
    
    return false;
  }

  // Enable/disable a shortcut
  public setShortcutEnabled(keys: string[], enabled: boolean): void {
    const key = this.createShortcutKey(keys);
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      shortcut.disabled = !enabled;
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = this.normalizeKey(event.key);
    this.pressedKeys.add(key);

    // Add modifier keys
    if (event.ctrlKey) this.pressedKeys.add('ctrl');
    if (event.shiftKey) this.pressedKeys.add('shift');
    if (event.altKey) this.pressedKeys.add('alt');
    if (event.metaKey) this.pressedKeys.add('meta');

    // Check for matching shortcuts
    const currentKeys = Array.from(this.pressedKeys).sort();
    const shortcutKey = currentKeys.join('+');
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut && !shortcut.disabled) {
      // Check if we should prevent default behavior
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Execute the shortcut action
      try {
        shortcut.action();
      } catch (error) {
        console.error('Error executing shortcut:', shortcut.id, error);
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = this.normalizeKey(event.key);
    this.pressedKeys.delete(key);

    // Remove modifier keys when released
    if (!event.ctrlKey) this.pressedKeys.delete('ctrl');
    if (!event.shiftKey) this.pressedKeys.delete('shift');
    if (!event.altKey) this.pressedKeys.delete('alt');
    if (!event.metaKey) this.pressedKeys.delete('meta');
  }

  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      'Control': 'ctrl',
      'Shift': 'shift',
      'Alt': 'alt',
      'Meta': 'meta',
      'Escape': 'escape',
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
  }

  private createShortcutKey(keys: string[]): string {
    return keys.map(key => this.normalizeKey(key)).sort().join('+');
  }
}

// Global instance
export const shortcutManager = new KeyboardShortcutManager();

// Predefined shortcuts for synthesizer studio
export const studioShortcuts: KeyboardShortcut[] = [
  // Transport controls
  {
    id: 'play-pause',
    keys: ['space'],
    description: 'Play/Pause playback',
    category: 'Transport',
    action: () => console.log('Play/Pause'), // Will be overridden
  },
  {
    id: 'stop',
    keys: ['shift', 'space'],
    description: 'Stop playback',
    category: 'Transport',
    action: () => console.log('Stop'),
  },
  {
    id: 'record',
    keys: ['r'],
    description: 'Start/Stop recording',
    category: 'Transport',
    action: () => console.log('Record'),
  },
  {
    id: 'skip-forward',
    keys: ['shift', 'right'],
    description: 'Skip forward',
    category: 'Transport',
    action: () => console.log('Skip forward'),
  },
  {
    id: 'skip-backward',
    keys: ['shift', 'left'],
    description: 'Skip backward',
    category: 'Transport',
    action: () => console.log('Skip backward'),
  },

  // File operations
  {
    id: 'save',
    keys: ['ctrl', 's'],
    description: 'Save project',
    category: 'File',
    action: () => console.log('Save'),
  },
  {
    id: 'save-as',
    keys: ['ctrl', 'shift', 's'],
    description: 'Save project as...',
    category: 'File',
    action: () => console.log('Save As'),
  },
  {
    id: 'open',
    keys: ['ctrl', 'o'],
    description: 'Open project',
    category: 'File',
    action: () => console.log('Open'),
  },
  {
    id: 'new',
    keys: ['ctrl', 'n'],
    description: 'New project',
    category: 'File',
    action: () => console.log('New'),
  },
  {
    id: 'export',
    keys: ['ctrl', 'e'],
    description: 'Export audio',
    category: 'File',
    action: () => console.log('Export'),
  },
  {
    id: 'import',
    keys: ['ctrl', 'i'],
    description: 'Import audio',
    category: 'File',
    action: () => console.log('Import'),
  },

  // Edit operations
  {
    id: 'undo',
    keys: ['ctrl', 'z'],
    description: 'Undo last action',
    category: 'Edit',
    action: () => console.log('Undo'),
  },
  {
    id: 'redo',
    keys: ['ctrl', 'y'],
    description: 'Redo last action',
    category: 'Edit',
    action: () => console.log('Redo'),
  },
  {
    id: 'redo-alt',
    keys: ['ctrl', 'shift', 'z'],
    description: 'Redo last action (alternative)',
    category: 'Edit',
    action: () => console.log('Redo'),
  },
  {
    id: 'copy',
    keys: ['ctrl', 'c'],
    description: 'Copy selection',
    category: 'Edit',
    action: () => console.log('Copy'),
  },
  {
    id: 'cut',
    keys: ['ctrl', 'x'],
    description: 'Cut selection',
    category: 'Edit',
    action: () => console.log('Cut'),
  },
  {
    id: 'paste',
    keys: ['ctrl', 'v'],
    description: 'Paste from clipboard',
    category: 'Edit',
    action: () => console.log('Paste'),
  },
  {
    id: 'select-all',
    keys: ['ctrl', 'a'],
    description: 'Select all',
    category: 'Edit',
    action: () => console.log('Select All'),
  },
  {
    id: 'delete',
    keys: ['delete'],
    description: 'Delete selection',
    category: 'Edit',
    action: () => console.log('Delete'),
  },

  // Synthesizer controls
  {
    id: 'randomize-synth',
    keys: ['shift', 'r'],
    description: 'Randomize synthesizer settings',
    category: 'Synthesizer',
    action: () => console.log('Randomize Synth'),
  },
  {
    id: 'reset-synth',
    keys: ['ctrl', 'r'],
    description: 'Reset synthesizer to default',
    category: 'Synthesizer',
    action: () => console.log('Reset Synth'),
  },
  {
    id: 'next-preset',
    keys: ['ctrl', 'right'],
    description: 'Next preset',
    category: 'Synthesizer',
    action: () => console.log('Next Preset'),
  },
  {
    id: 'prev-preset',
    keys: ['ctrl', 'left'],
    description: 'Previous preset',
    category: 'Synthesizer',
    action: () => console.log('Previous Preset'),
  },

  // Piano keyboard
  {
    id: 'octave-up',
    keys: ['x'],
    description: 'Octave up',
    category: 'Piano',
    action: () => console.log('Octave Up'),
  },
  {
    id: 'octave-down',
    keys: ['z'],
    description: 'Octave down',
    category: 'Piano',
    action: () => console.log('Octave Down'),
  },

  // Piano keys (C to B)
  {
    id: 'play-c',
    keys: ['a'],
    description: 'Play note C',
    category: 'Piano Keys',
    action: () => console.log('Play C'),
  },
  {
    id: 'play-c-sharp',
    keys: ['w'],
    description: 'Play note C#',
    category: 'Piano Keys',
    action: () => console.log('Play C#'),
  },
  {
    id: 'play-d',
    keys: ['s'],
    description: 'Play note D',
    category: 'Piano Keys',
    action: () => console.log('Play D'),
  },
  {
    id: 'play-d-sharp',
    keys: ['e'],
    description: 'Play note D#',
    category: 'Piano Keys',
    action: () => console.log('Play D#'),
  },
  {
    id: 'play-e',
    keys: ['d'],
    description: 'Play note E',
    category: 'Piano Keys',
    action: () => console.log('Play E'),
  },
  {
    id: 'play-f',
    keys: ['f'],
    description: 'Play note F',
    category: 'Piano Keys',
    action: () => console.log('Play F'),
  },
  {
    id: 'play-f-sharp',
    keys: ['t'],
    description: 'Play note F#',
    category: 'Piano Keys',
    action: () => console.log('Play F#'),
  },
  {
    id: 'play-g',
    keys: ['g'],
    description: 'Play note G',
    category: 'Piano Keys',
    action: () => console.log('Play G'),
  },
  {
    id: 'play-g-sharp',
    keys: ['y'],
    description: 'Play note G#',
    category: 'Piano Keys',
    action: () => console.log('Play G#'),
  },
  {
    id: 'play-a',
    keys: ['h'],
    description: 'Play note A',
    category: 'Piano Keys',
    action: () => console.log('Play A'),
  },
  {
    id: 'play-a-sharp',
    keys: ['u'],
    description: 'Play note A#',
    category: 'Piano Keys',
    action: () => console.log('Play A#'),
  },
  {
    id: 'play-b',
    keys: ['j'],
    description: 'Play note B',
    category: 'Piano Keys',
    action: () => console.log('Play B'),
  },

  // View controls
  {
    id: 'toggle-fullscreen',
    keys: ['f11'],
    description: 'Toggle fullscreen',
    category: 'View',
    action: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    preventDefault: false,
  },
  {
    id: 'toggle-settings',
    keys: ['ctrl', ','],
    description: 'Toggle settings panel',
    category: 'View',
    action: () => console.log('Toggle Settings'),
  },
  {
    id: 'toggle-help',
    keys: ['f1'],
    description: 'Toggle help panel',
    category: 'View',
    action: () => console.log('Toggle Help'),
    preventDefault: false,
  },

  // Audio controls
  {
    id: 'master-volume-up',
    keys: ['ctrl', 'up'],
    description: 'Increase master volume',
    category: 'Audio',
    action: () => console.log('Volume Up'),
  },
  {
    id: 'master-volume-down',
    keys: ['ctrl', 'down'],
    description: 'Decrease master volume',
    category: 'Audio',
    action: () => console.log('Volume Down'),
  },
  {
    id: 'mute-master',
    keys: ['m'],
    description: 'Mute/unmute master output',
    category: 'Audio',
    action: () => console.log('Mute Master'),
  },

  // Utility
  {
    id: 'panic',
    keys: ['escape'],
    description: 'Stop all audio (panic)',
    category: 'Utility',
    action: () => console.log('Panic - Stop All'),
  },
  {
    id: 'quick-save',
    keys: ['ctrl', 'q'],
    description: 'Quick save (auto-name)',
    category: 'Utility',
    action: () => console.log('Quick Save'),
  },
  {
    id: 'focus-search',
    keys: ['ctrl', 'f'],
    description: 'Focus search/find',
    category: 'Utility',
    action: () => console.log('Focus Search'),
  }
];

// Helper functions
export function formatShortcut(keys: string[]): string {
  const keyMap: Record<string, string> = {
    'ctrl': '⌘',
    'shift': '⇧',
    'alt': '⌥',
    'meta': '⌘',
    'enter': '↵',
    'space': '␣',
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
    'escape': 'Esc',
    'delete': 'Del',
    'backspace': '⌫'
  };

  return keys
    .map(key => keyMap[key.toLowerCase()] || key.toUpperCase())
    .join(' + ');
}

export function getShortcutsByCategory(shortcuts: KeyboardShortcut[]): ShortcutCategory[] {
  const categories = new Map<string, KeyboardShortcut[]>();
  
  shortcuts.forEach(shortcut => {
    if (!categories.has(shortcut.category)) {
      categories.set(shortcut.category, []);
    }
    categories.get(shortcut.category)!.push(shortcut);
  });

  return Array.from(categories.entries()).map(([name, shortcuts]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description))
  }));
}

// React hook for using shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    shortcutManager.registerMultiple(shortcuts);
    shortcutManager.startListening();

    return () => {
      shortcuts.forEach(shortcut => {
        shortcutManager.unregister(shortcut.keys);
      });
    };
  }, [shortcuts, isEnabled]);

  const enable = useCallback(() => {
    setIsEnabled(true);
    shortcutManager.startListening();
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    shortcutManager.stopListening();
  }, []);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutManager.register(shortcut);
  }, []);

  const unregisterShortcut = useCallback((keys: string[]) => {
    shortcutManager.unregister(keys);
  }, []);

  return {
    isEnabled,
    enable,
    disable,
    registerShortcut,
    unregisterShortcut
  };
}