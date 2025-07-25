export interface CosmicObject {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'published' | 'draft';
  created_at: string;
  modified_at: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface SynthPreset {
  id: string;
  name: string;
  oscillator: {
    type: 'sine' | 'square' | 'sawtooth' | 'triangle';
    frequency: number;
    detune: number;
  };
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass';
    frequency: number;
    resonance: number;
  };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  effects: {
    reverb: number;
    delay: number;
    distortion: number;
  };
}

export interface AudioEngineState {
  isPlaying: boolean;
  bpm: number;
  volume: number;
  currentStep: number;
  sequence: boolean[][];
}

export interface ChannelStripConfig {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  effects: EffectConfig[];
}

export interface EffectConfig {
  id: string;
  type: 'reverb' | 'delay' | 'distortion' | 'chorus' | 'phaser' | 'filter';
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface KeyboardEvent {
  note: string;
  velocity: number;
  type: 'noteOn' | 'noteOff';
}

export interface AudioAnalyzerData {
  frequencyData: Uint8Array;
  waveformData: Uint8Array;
  volume: number;
  peak: number;
}

export interface VisualizerConfig {
  type: 'bars' | 'waveform' | 'spectrum';
  sensitivity: number;
  smoothing: number;
  color: string;
}

export interface StudioTheme {
  colors: {
    background: string;
    panel: string;
    control: string;
    accent: string;
    text: string;
  };
  fonts: {
    main: string;
    mono: string;
  };
}

export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
}

export interface TooltipData {
  content: string;
  position: { x: number; y: number };
  visible: boolean;
}

export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  recordedBlob?: Blob;
  duration: number;
  format: 'wav' | 'mp3';
}