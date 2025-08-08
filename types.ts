// Core synthesizer types
export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';
export type EffectType = 'reverb' | 'delay' | 'distortion' | 'chorus' | 'phaser' | 'flanger' | 'compressor' | 'eq';

// Effect configurations
export interface ReverbEffect {
  active: boolean;
  amount: number;
  roomSize: number;
  damping: number;
  predelay: number;
  width: number;
  type: string;
}

export interface DelayEffect {
  active: boolean;
  time: number;
  feedback: number;
  highCut: number;
  wetLevel: number;
  stereo: boolean;
}

export interface DistortionEffect {
  active: boolean;
  amount: number;
  type: 'soft' | 'hard' | 'tube' | 'fuzz' | 'bitcrush';
  drive: number;
  tone: number;
  level: number;
  bias: number;
  oversampling: string;
}

export interface ChorusEffect {
  active: boolean;
  rate: number;
  depth: number;
  feedback: number;
  mix: number;
  voices: number;
  waveform: string;
}

export interface PhaserEffect {
  active: boolean;
  rate: number;
  depth: number;
}

export interface FlangerEffect {
  active: boolean;
  rate: number;
  feedback: number;
}

export interface CompressorEffect {
  active: boolean;
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
  makeup: number;
}

export interface EQEffect {
  active: boolean;
  low: number;
  mid: number;
  high: number;
  lowMid: number;
  highMid: number;
  lowFreq: number;
  lowMidFreq: number;
  highMidFreq: number;
  highFreq: number;
}

export interface FilterEffect {
  active: boolean;
  cutoff: number;
  resonance: number;
  type: string;
  drive: number;
  keyFollow: number;
  slope: string;
}

export interface StereoEffect {
  active: boolean;
  width: number;
  bass: number;
  delay: number;
  phase: number;
}

export interface EffectsState {
  reverb: ReverbEffect;
  delay: DelayEffect;
  distortion: DistortionEffect;
  chorus: ChorusEffect;
  phaser: PhaserEffect;
  flanger: FlangerEffect;
  compressor: CompressorEffect;
  eq: EQEffect;
  filter: FilterEffect;
  stereo: StereoEffect;
}

// Main synthesizer state
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

// Recording state
export interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  duration: number;
  audioBuffer: Blob | null;
  waveformData: number[];
}

// Drum sequencer types
export interface DrumSoundConfig {
  name: string;
  type: 'kick' | 'snare' | 'hihat' | 'openhat' | 'clap' | 'crash' | 'ride' | 'tom' | 'perc';
  frequency: number;
  decay: number;
  volume: number;
  oscillatorType?: OscillatorType;
}

export interface DrumSequencerState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  pattern: boolean[][];
  selectedSound: number;
  sounds: DrumSoundConfig[];
}

// Piano sound configuration
export interface PianoHarmonic {
  frequency: number;
  gain: number;
  type: OscillatorType;
}

export interface PianoEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface PianoFilter {
  type: FilterType;
  frequency: number;
  resonance: number;
  envelopeAmount: number;
}

export interface PianoEffects {
  reverb?: {
    amount: number;
  };
  chorus?: {
    amount: number;
    rate: number;
    depth: number;
  };
  eq?: {
    low: number;
    mid: number;
    high: number;
  };
  compression?: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
}

export interface PianoSoundConfig {
  name: string;
  baseVolume: number;
  oscillatorType: OscillatorType;
  harmonics?: PianoHarmonic[];
  envelope: PianoEnvelope;
  filter: PianoFilter;
  effects: PianoEffects;
}

// Cosmic CMS types - Updated with proper interfaces
export interface CosmicObject {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  modified_at: string;
  metadata?: Record<string, any>;
}

export interface CosmicResponse<T> {
  objects: T[];
  total: number;
}

// Recording types for Cosmic CMS - Updated interface
export interface Recording extends CosmicObject {
  metadata: {
    title: string;
    description?: string;
    audio_file: {
      url: string;
      imgix_url: string;
    };
    duration: number;
    genre?: {
      key: string;
      value: string;
    };
    recording_date?: string;
  };
}

// Preset types for Cosmic CMS - Updated interface
export interface SynthPreset extends CosmicObject {
  metadata: {
    name: string;
    description?: string;
    instrument_type: {
      key: string;
      value: string;
    };
    settings_data: {
      oscillator_type?: string;
      filter_cutoff?: number;
      filter_resonance?: number;
      envelope_attack?: number;
      envelope_decay?: number;
      envelope_sustain?: number;
      envelope_release?: number;
      effects?: string[];
      reverb_amount?: number;
      delay_time?: number;
      delay_feedback?: number;
      distortion_amount?: number;
      chorus_rate?: number;
      chorus_depth?: number;
    };
    tags?: string;
  };
}

// Drum pattern types for Cosmic CMS - Updated interface
export interface DrumPattern extends CosmicObject {
  metadata: {
    pattern_name: string;
    description: string;
    bpm: number;
    time_signature: {
      key: string;
      value: string;
    };
    pattern_data: {
      steps: number;
      tracks: Record<string, number[]>;
      velocity: Record<string, number>;
    };
    style: {
      key: string;
      value: string;
    };
  };
}

// Audio analysis types
export interface AudioAnalyserData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  volume: number;
  pitch: number;
}

// Global transport state
export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;
  currentBar: number;
  currentBeat: number;
  masterVolume: number;
}

// MIDI types
export interface MIDINote {
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
}

export interface MIDIControlChange {
  controller: number;
  value: number;
  channel: number;
  timestamp: number;
}

// Project types
export interface ProjectData {
  id: string;
  name: string;
  bpm: number;
  synthState: SynthState;
  drumPattern: DrumSequencerState;
  recordings: Recording[];
  presets: SynthPreset[];
  created_at: string;
  modified_at: string;
  lastModified: Date;
}

// Loop station types
export interface LoopTrack {
  id: string;
  name: string;
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  volume: number;
  length: number;
}

export interface LoopStationState {
  tracks: LoopTrack[];
  masterTempo: number;
  isRecording: boolean;
  recordingTrack: number;
}

// Automation types
export interface AutomationPoint {
  time: number;
  value: number;
}

export interface AutomationLane {
  parameter: string;
  points: AutomationPoint[];
  isEnabled: boolean;
}

export interface AutomationState {
  lanes: AutomationLane[];
  isPlaying: boolean;
  currentTime: number;
}

// Sample library types
export interface Sample {
  id: string;
  name: string;
  url: string;
  duration: number;
  category: string;
  tags: string[];
  key?: string;
  bpm?: number;
}

export interface SampleCategory {
  id: string;
  name: string;
  samples: Sample[];
}

// Mixer types
export interface MixerChannel {
  id: string;
  name: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  effects: EffectsState;
}

export interface MixerState {
  channels: MixerChannel[];
  masterVolume: number;
  masterEffects: EffectsState;
}

// Spectrum analyzer types
export interface SpectrumAnalyzerSettings {
  fftSize: number;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
  showPeaks: boolean;
  logScale: boolean;
}

// Voice recorder types
export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  recordedChunks: Blob[];
}

// Cloud sync types
export interface CloudSyncItem {
  id: string;
  name: string;
  type: 'preset' | 'recording' | 'pattern' | 'project';
  size: string;
  lastModified: Date;
  status: 'synced' | 'pending' | 'error' | 'uploading' | 'downloading';
  progress?: number;
  localData?: any;
  cloudData?: any;
}

// Export types
export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  quality: 'lossless' | 'high' | 'medium' | 'low';
  size: 'large' | 'medium' | 'small';
}

export interface ExportJob {
  id: string;
  name: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  endTime?: Date;
  fileSize?: string;
  error?: string;
}

// Enhanced audio engine types
export interface AudioEngineConfig {
  sampleRate: number;
  bufferSize: number;
  latency: 'interactive' | 'balanced' | 'playback';
  enableProcessing: boolean;
}

export interface AudioNodeChain {
  input: AudioNode;
  output: AudioNode;
  nodes: AudioNode[];
}

// Performance monitoring types
export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  audioLatency: number;
  dropouts: number;
  activeVoices: number;
}