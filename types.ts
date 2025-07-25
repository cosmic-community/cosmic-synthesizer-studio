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

export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type EffectType = 'reverb' | 'delay' | 'distortion' | 'chorus' | 'phaser' | 'filter';

export interface SynthState {
  oscillatorType: OscillatorType;
  filterCutoff: number;
  filterResonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  effects: {
    reverb: { active: boolean; amount: number; roomSize?: number };
    delay: { active: boolean; time: number; feedback: number };
    distortion: { active: boolean; amount: number; type?: string };
    chorus: { active: boolean; rate: number; depth: number };
    phaser?: { active: boolean; rate: number; depth: number };
    flanger?: { active: boolean; rate: number; feedback: number };
    compressor?: { active: boolean; threshold: number; ratio: number };
    eq?: { active: boolean; low: number; mid: number; high: number };
  };
}

export interface SynthPreset extends CosmicObject {
  title: string;
  metadata: {
    oscillator_type: OscillatorType;
    filter_cutoff: number;
    filter_resonance: number;
    envelope_attack: number;
    envelope_decay: number;
    envelope_sustain: number;
    envelope_release: number;
    effects: string[];
    reverb_amount?: number;
    delay_time?: number;
    delay_feedback?: number;
    distortion_amount?: number;
    chorus_rate?: number;
    chorus_depth?: number;
  };
}

export interface DrumSound {
  name: string;
  type: 'kick' | 'snare' | 'hihat' | 'openhat' | 'crash' | 'ride';
  frequency: number;
  decay: number;
  volume: number;
}

export interface DrumSequencerState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  pattern: boolean[][];
  selectedSound: number;
  sounds: DrumSound[];
}

export interface MixerChannel {
  id: string;
  name: string;
  type: 'synth' | 'drum' | 'audio' | 'aux';
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  recording?: boolean;
  input?: string;
  output?: string;
  insert?: string | null;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  sends: {
    reverb: number;
    delay: number;
    chorus: number;
  };
}

export interface RecordingState {
  isRecording: boolean;
  isPlaying?: boolean;
  duration: number;
  format: 'wav' | 'mp3';
  audioBuffer?: AudioBuffer | null;
  waveformData: number[];
  recordedBlob?: Blob;
}

export interface Recording extends CosmicObject {
  metadata: {
    duration: number;
    bpm: number;
    waveform_data: number[];
    social_shares: number;
    tags: string[];
    preset_used?: string;
  };
}

export interface DrumPattern extends CosmicObject {
  metadata: {
    bpm: number;
    steps: number;
    pattern: boolean[][];
    sounds: DrumSound[];
  };
}

export interface CosmicResponse<T = any> {
  object?: T;
  objects?: T[];
  total?: number;
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

export interface Tab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  closable?: boolean;
  modified?: boolean;
  disabled?: boolean;
}