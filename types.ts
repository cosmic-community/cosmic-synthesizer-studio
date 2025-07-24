export interface SynthState {
  oscillatorType: OscillatorType;
  filterCutoff: number;
  filterResonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  effects: EffectsState;
}

export interface EffectsState {
  reverb: {
    active: boolean;
    amount: number;
    roomSize?: number;
  };
  delay: {
    active: boolean;
    time: number;
    feedback: number;
  };
  distortion: {
    active: boolean;
    amount: number;
    type?: 'soft' | 'hard' | 'tube' | 'fuzz' | 'bitcrush';
  };
  chorus: {
    active: boolean;
    rate: number;
    depth: number;
  };
  phaser?: {
    active: boolean;
    rate: number;
    depth: number;
  };
  flanger?: {
    active: boolean;
    rate: number;
    feedback: number;
  };
  compressor?: {
    active: boolean;
    threshold: number;
    ratio: number;
  };
  eq?: {
    active: boolean;
    low: number;
    mid: number;
    high: number;
  };
}

export interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  duration: number;
  audioBuffer: AudioBuffer | null;
  waveformData: number[];
}

export interface DrumSequencerState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  pattern?: boolean[][];
  selectedSound: number;
  sounds?: DrumSound[];
}

export interface DrumSound {
  name: string;
  type: 'kick' | 'snare' | 'hihat' | 'openhat' | 'crash' | 'ride';
  frequency: number;
  decay: number;
  volume?: number;
}

export interface AudioNode {
  connect(destination: AudioNode | AudioParam): void;
  disconnect(): void;
}

export interface AudioParam {
  value: number;
  setValueAtTime(value: number, startTime: number): void;
  linearRampToValueAtTime(value: number, endTime: number): void;
  exponentialRampToValueAtTime(value: number, endTime: number): void;
}

export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface Preset {
  id: string;
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
    reverb_room_size?: number;
    delay_time?: number;
    delay_feedback?: number;
    distortion_amount?: number;
    distortion_type?: string;
    chorus_rate?: number;
    chorus_depth?: number;
    phaser_rate?: number;
    phaser_depth?: number;
    flanger_rate?: number;
    flanger_feedback?: number;
    compressor_threshold?: number;
    compressor_ratio?: number;
    eq_low?: number;
    eq_mid?: number;
    eq_high?: number;
  };
}

export interface VisualizationData {
  waveform: number[];
  frequency: number[];
  volume: number;
}

export interface CosmicObjectBase {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  created_at: string;
  modified_at: string;
  thumbnail?: string;
}

export interface PresetObject extends CosmicObjectBase {
  type: 'presets';
  metadata: Preset['metadata'];
}

export interface RecordingObject extends CosmicObjectBase {
  type: 'recordings';
  metadata: {
    duration: number;
    file_size: number;
    recording_date: string;
    audio_file: {
      url: string;
      imgix_url: string;
    };
  };
}

export interface DrumPatternObject extends CosmicObjectBase {
  type: 'drum-patterns';
  metadata: {
    bpm: number;
    pattern_data: string; // JSON stringified pattern
    sounds_config: string; // JSON stringified sounds array
  };
}