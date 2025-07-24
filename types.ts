// Base Cosmic object interface
interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Synthesizer preset type
interface SynthPreset extends CosmicObject {
  type: 'presets';
  metadata: {
    oscillator_type: OscillatorType;
    filter_cutoff: number;
    filter_resonance: number;
    envelope_attack: number;
    envelope_decay: number;
    envelope_sustain: number;
    envelope_release: number;
    effects: EffectType[];
    reverb_amount?: number;
    delay_time?: number;
    delay_feedback?: number;
    distortion_amount?: number;
    chorus_rate?: number;
    chorus_depth?: number;
  };
}

// Recording type
interface Recording extends CosmicObject {
  type: 'recordings';
  metadata: {
    duration: number;
    bpm: number;
    audio_data?: {
      url: string;
      imgix_url: string;
    };
    waveform_data?: number[];
    social_shares: number;
    tags: string[];
    preset_used?: string;
    drum_pattern?: DrumPattern;
  };
}

// Drum pattern type
interface DrumPattern extends CosmicObject {
  type: 'drum_patterns';
  metadata: {
    bpm: number;
    steps: number;
    pattern: boolean[][];
    sounds: DrumSound[];
  };
}

// Audio types
type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';
type EffectType = 'reverb' | 'delay' | 'filter' | 'distortion' | 'chorus';

interface DrumSound {
  name: string;
  type: 'kick' | 'snare' | 'hihat' | 'openhat' | 'crash' | 'ride';
  frequency?: number;
  decay?: number;
}

// Synthesizer state
interface SynthState {
  oscillatorType: OscillatorType;
  filterCutoff: number;
  filterResonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  effects: {
    reverb: { active: boolean; amount: number };
    delay: { active: boolean; time: number; feedback: number };
    distortion: { active: boolean; amount: number };
    chorus: { active: boolean; rate: number; depth: number };
  };
}

// Recording state
interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  duration: number;
  audioBuffer: AudioBuffer | null;
  waveformData: number[];
}

// Drum sequencer state
interface DrumSequencerState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  pattern: boolean[][];
  selectedSound: number;
  sounds: DrumSound[];
}

// API response types
interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Utility types
type CreatePresetData = Omit<SynthPreset, 'id' | 'created_at' | 'modified_at'>;
type CreateRecordingData = Omit<Recording, 'id' | 'created_at' | 'modified_at'>;

// Type guards
function isPreset(obj: CosmicObject): obj is SynthPreset {
  return obj.type === 'presets';
}

function isRecording(obj: CosmicObject): obj is Recording {
  return obj.type === 'recordings';
}

function isDrumPattern(obj: CosmicObject): obj is DrumPattern {
  return obj.type === 'drum_patterns';
}

export type {
  CosmicObject,
  SynthPreset,
  Recording,
  DrumPattern,
  OscillatorType,
  EffectType,
  DrumSound,
  SynthState,
  RecordingState,
  DrumSequencerState,
  CosmicResponse,
  CreatePresetData,
  CreateRecordingData
};

export {
  isPreset,
  isRecording,
  isDrumPattern
};