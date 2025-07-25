export interface DrumSoundConfig {
  name: string;
  type: 'kick' | 'snare' | 'hihat' | 'openhat' | 'crash' | 'ride' | 'clap' | 'perc' | 'cymbal' | 'tom';
  frequency: number;
  decay: number;
  volume: number;
  pitch?: number;
  resonance?: number;
  distortion?: number;
  reverb?: number;
  compression?: number;
  oscillatorType?: OscillatorType;
  filterType?: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  filterFrequency?: number;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  noise?: {
    amount: number;
    frequency: number;
  };
  color?: string;
  category?: string;
}

export interface DrumKit {
  id: string;
  name: string;
  description: string;
  category: 'electronic' | 'acoustic' | 'vintage' | 'experimental' | 'trap' | 'house' | 'techno' | 'ambient';
  sounds: DrumSoundConfig[];
  color: string;
  bpm?: number;
}

export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

// Electronic Drum Kit
const electronicKit: DrumKit = {
  id: 'electronic',
  name: 'Electronic Kit',
  description: 'Modern electronic drum sounds with punchy kicks and crisp snares',
  category: 'electronic',
  color: '#00d4ff',
  bpm: 128,
  sounds: [
    {
      name: 'Kick',
      type: 'kick',
      frequency: 60,
      decay: 0.8,
      volume: 0.9,
      pitch: 1.0,
      resonance: 0.3,
      distortion: 0.1,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 150,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.2, release: 0.5 },
      color: '#ff4444',
      category: 'low'
    },
    {
      name: 'Snare',
      type: 'snare',
      frequency: 200,
      decay: 0.2,
      volume: 0.8,
      pitch: 1.0,
      resonance: 0.6,
      distortion: 0.2,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 800,
      envelope: { attack: 0.001, decay: 0.15, sustain: 0.1, release: 0.2 },
      noise: { amount: 0.7, frequency: 3000 },
      color: '#ffaa00',
      category: 'mid'
    },
    {
      name: 'Hi-Hat',
      type: 'hihat',
      frequency: 8000,
      decay: 0.1,
      volume: 0.6,
      pitch: 1.0,
      resonance: 0.8,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 6000,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0.05, release: 0.1 },
      noise: { amount: 0.9, frequency: 10000 },
      color: '#44ff44',
      category: 'high'
    },
    {
      name: 'Open Hat',
      type: 'openhat',
      frequency: 7000,
      decay: 0.4,
      volume: 0.7,
      pitch: 1.0,
      resonance: 0.7,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 5000,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.3, release: 0.4 },
      noise: { amount: 0.8, frequency: 8000 },
      color: '#88ff88',
      category: 'high'
    },
    {
      name: 'Clap',
      type: 'clap',
      frequency: 1500,
      decay: 0.3,
      volume: 0.8,
      pitch: 1.0,
      resonance: 0.5,
      oscillatorType: 'square',
      filterType: 'bandpass',
      filterFrequency: 2000,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.2, release: 0.3 },
      noise: { amount: 0.6, frequency: 2500 },
      color: '#ff8844',
      category: 'mid'
    },
    {
      name: 'Crash',
      type: 'crash',
      frequency: 5000,
      decay: 2.0,
      volume: 0.8,
      pitch: 1.0,
      resonance: 0.4,
      reverb: 0.3,
      oscillatorType: 'sawtooth',
      filterType: 'highpass',
      filterFrequency: 3000,
      envelope: { attack: 0.001, decay: 1.0, sustain: 0.3, release: 2.0 },
      noise: { amount: 0.7, frequency: 6000 },
      color: '#ffff44',
      category: 'high'
    },
    {
      name: 'Perc',
      type: 'perc',
      frequency: 800,
      decay: 0.15,
      volume: 0.6,
      pitch: 1.2,
      resonance: 0.6,
      oscillatorType: 'triangle',
      filterType: 'bandpass',
      filterFrequency: 1200,
      envelope: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.15 },
      color: '#ff44ff',
      category: 'mid'
    },
    {
      name: 'Sub Kick',
      type: 'kick',
      frequency: 40,
      decay: 1.2,
      volume: 0.9,
      pitch: 0.8,
      resonance: 0.2,
      distortion: 0.05,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 80,
      envelope: { attack: 0.001, decay: 0.6, sustain: 0.3, release: 1.0 },
      color: '#8844ff',
      category: 'low'
    }
  ]
};

// Trap Kit
const trapKit: DrumKit = {
  id: 'trap',
  name: 'Trap Kit',
  description: 'Hard-hitting trap drums with booming 808s and crisp snares',
  category: 'trap',
  color: '#ff0080',
  bpm: 140,
  sounds: [
    {
      name: '808 Kick',
      type: 'kick',
      frequency: 45,
      decay: 1.5,
      volume: 1.0,
      pitch: 0.9,
      resonance: 0.4,
      distortion: 0.15,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 120,
      envelope: { attack: 0.001, decay: 0.8, sustain: 0.4, release: 1.2 },
      color: '#ff0040',
      category: 'low'
    },
    {
      name: 'Trap Snare',
      type: 'snare',
      frequency: 220,
      decay: 0.25,
      volume: 0.9,
      pitch: 1.1,
      resonance: 0.7,
      distortion: 0.3,
      reverb: 0.2,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 1200,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0.15, release: 0.25 },
      noise: { amount: 0.8, frequency: 4000 },
      color: '#ff4080',
      category: 'mid'
    },
    {
      name: 'Trap Hat',
      type: 'hihat',
      frequency: 9000,
      decay: 0.08,
      volume: 0.7,
      pitch: 1.2,
      resonance: 0.9,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 7000,
      envelope: { attack: 0.001, decay: 0.04, sustain: 0.02, release: 0.08 },
      noise: { amount: 0.95, frequency: 12000 },
      color: '#ff8080',
      category: 'high'
    },
    {
      name: 'Open Trap Hat',
      type: 'openhat',
      frequency: 8000,
      decay: 0.3,
      volume: 0.8,
      pitch: 1.1,
      resonance: 0.8,
      reverb: 0.1,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 6000,
      envelope: { attack: 0.001, decay: 0.15, sustain: 0.2, release: 0.3 },
      noise: { amount: 0.85, frequency: 9000 },
      color: '#ffb3b3',
      category: 'high'
    },
    {
      name: 'Trap Clap',
      type: 'clap',
      frequency: 1800,
      decay: 0.4,
      volume: 0.85,
      pitch: 1.0,
      resonance: 0.6,
      reverb: 0.15,
      oscillatorType: 'square',
      filterType: 'bandpass',
      filterFrequency: 2500,
      envelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.4 },
      noise: { amount: 0.7, frequency: 3000 },
      color: '#ff6600',
      category: 'mid'
    },
    {
      name: 'Ride Bell',
      type: 'ride',
      frequency: 2500,
      decay: 1.0,
      volume: 0.7,
      pitch: 1.0,
      resonance: 0.5,
      reverb: 0.2,
      oscillatorType: 'triangle',
      filterType: 'highpass',
      filterFrequency: 2000,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0.4, release: 1.0 },
      color: '#ffcc00',
      category: 'high'
    },
    {
      name: 'Shaker',
      type: 'perc',
      frequency: 6000,
      decay: 0.2,
      volume: 0.5,
      pitch: 1.0,
      resonance: 0.7,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 4000,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.05, release: 0.2 },
      noise: { amount: 0.9, frequency: 8000 },
      color: '#ccff00',
      category: 'high'
    },
    {
      name: 'Sub Bass',
      type: 'kick',
      frequency: 35,
      decay: 2.0,
      volume: 0.95,
      pitch: 0.7,
      resonance: 0.3,
      distortion: 0.1,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 70,
      envelope: { attack: 0.001, decay: 1.0, sustain: 0.5, release: 1.8 },
      color: '#4400ff',
      category: 'low'
    }
  ]
};

// House Kit
const houseKit: DrumKit = {
  id: 'house',
  name: 'House Kit',
  description: 'Classic four-on-the-floor house drums with punchy kicks and crisp percussion',
  category: 'house',
  color: '#00ff80',
  bpm: 125,
  sounds: [
    {
      name: 'House Kick',
      type: 'kick',
      frequency: 55,
      decay: 0.6,
      volume: 0.95,
      pitch: 1.0,
      resonance: 0.25,
      distortion: 0.05,
      compression: 0.3,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 140,
      envelope: { attack: 0.001, decay: 0.25, sustain: 0.2, release: 0.4 },
      color: '#00cc44',
      category: 'low'
    },
    {
      name: 'House Clap',
      type: 'clap',
      frequency: 1600,
      decay: 0.3,
      volume: 0.8,
      pitch: 1.0,
      resonance: 0.5,
      reverb: 0.1,
      oscillatorType: 'square',
      filterType: 'bandpass',
      filterFrequency: 2200,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0.2, release: 0.3 },
      noise: { amount: 0.6, frequency: 2800 },
      color: '#66ff66',
      category: 'mid'
    },
    {
      name: 'House Hat',
      type: 'hihat',
      frequency: 7500,
      decay: 0.12,
      volume: 0.6,
      pitch: 1.0,
      resonance: 0.7,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 6000,
      envelope: { attack: 0.001, decay: 0.06, sustain: 0.04, release: 0.12 },
      noise: { amount: 0.8, frequency: 9000 },
      color: '#99ff99',
      category: 'high'
    },
    {
      name: 'Open House Hat',
      type: 'openhat',
      frequency: 7000,
      decay: 0.5,
      volume: 0.7,
      pitch: 1.0,
      resonance: 0.6,
      reverb: 0.15,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 5500,
      envelope: { attack: 0.001, decay: 0.25, sustain: 0.3, release: 0.5 },
      noise: { amount: 0.75, frequency: 8000 },
      color: '#ccffcc',
      category: 'high'
    },
    {
      name: 'Ride Cymbal',
      type: 'ride',
      frequency: 3000,
      decay: 1.2,
      volume: 0.65,
      pitch: 1.0,
      resonance: 0.4,
      reverb: 0.25,
      oscillatorType: 'sawtooth',
      filterType: 'highpass',
      filterFrequency: 2500,
      envelope: { attack: 0.001, decay: 0.6, sustain: 0.4, release: 1.2 },
      color: '#ffff99',
      category: 'high'
    },
    {
      name: 'Perc 1',
      type: 'perc',
      frequency: 950,
      decay: 0.18,
      volume: 0.55,
      pitch: 1.1,
      resonance: 0.6,
      oscillatorType: 'triangle',
      filterType: 'bandpass',
      filterFrequency: 1400,
      envelope: { attack: 0.001, decay: 0.09, sustain: 0.08, release: 0.18 },
      color: '#ff9999',
      category: 'mid'
    },
    {
      name: 'Perc 2',
      type: 'perc',
      frequency: 1400,
      decay: 0.15,
      volume: 0.5,
      pitch: 0.9,
      resonance: 0.7,
      oscillatorType: 'triangle',
      filterType: 'bandpass',
      filterFrequency: 1800,
      envelope: { attack: 0.001, decay: 0.07, sustain: 0.06, release: 0.15 },
      color: '#ffcc99',
      category: 'mid'
    },
    {
      name: 'Deep Kick',
      type: 'kick',
      frequency: 48,
      decay: 0.8,
      volume: 0.9,
      pitch: 0.95,
      resonance: 0.3,
      distortion: 0.08,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 110,
      envelope: { attack: 0.001, decay: 0.35, sustain: 0.25, release: 0.6 },
      color: '#0088ff',
      category: 'low'
    }
  ]
};

// Techno Kit
const technoKit: DrumKit = {
  id: 'techno',
  name: 'Techno Kit',
  description: 'Industrial techno sounds with driving rhythms and metallic percussion',
  category: 'techno',
  color: '#ff4400',
  bpm: 132,
  sounds: [
    {
      name: 'Techno Kick',
      type: 'kick',
      frequency: 62,
      decay: 0.4,
      volume: 1.0,
      pitch: 1.0,
      resonance: 0.2,
      distortion: 0.2,
      compression: 0.4,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 160,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.3 },
      color: '#ff2200',
      category: 'low'
    },
    {
      name: 'Industrial Snare',
      type: 'snare',
      frequency: 250,
      decay: 0.18,
      volume: 0.85,
      pitch: 1.0,
      resonance: 0.8,
      distortion: 0.4,
      reverb: 0.05,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 1500,
      envelope: { attack: 0.001, decay: 0.09, sustain: 0.1, release: 0.18 },
      noise: { amount: 0.9, frequency: 5000 },
      color: '#ff6600',
      category: 'mid'
    },
    {
      name: 'Metal Hat',
      type: 'hihat',
      frequency: 8500,
      decay: 0.09,
      volume: 0.7,
      pitch: 1.0,
      resonance: 1.0,
      distortion: 0.1,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 7000,
      envelope: { attack: 0.001, decay: 0.045, sustain: 0.02, release: 0.09 },
      noise: { amount: 0.95, frequency: 11000 },
      color: '#ffaa00',
      category: 'high'
    },
    {
      name: 'Open Metal Hat',
      type: 'openhat',
      frequency: 8000,
      decay: 0.25,
      volume: 0.75,
      pitch: 1.0,
      resonance: 0.9,
      distortion: 0.15,
      oscillatorType: 'square',
      filterType: 'highpass',
      filterFrequency: 6500,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0.15, release: 0.25 },
      noise: { amount: 0.9, frequency: 9500 },
      color: '#ffdd00',
      category: 'high'
    },
    {
      name: 'Techno Perc',
      type: 'perc',
      frequency: 1200,
      decay: 0.12,
      volume: 0.6,
      pitch: 1.3,
      resonance: 0.8,
      distortion: 0.2,
      oscillatorType: 'square',
      filterType: 'bandpass',
      filterFrequency: 1800,
      envelope: { attack: 0.001, decay: 0.06, sustain: 0.05, release: 0.12 },
      color: '#00ff66',
      category: 'mid'
    },
    {
      name: 'Crash Hit',
      type: 'crash',
      frequency: 4500,
      decay: 1.8,
      volume: 0.8,
      pitch: 1.0,
      resonance: 0.3,
      distortion: 0.1,
      reverb: 0.2,
      oscillatorType: 'sawtooth',
      filterType: 'highpass',
      filterFrequency: 3500,
      envelope: { attack: 0.001, decay: 0.9, sustain: 0.3, release: 1.8 },
      noise: { amount: 0.6, frequency: 5500 },
      color: '#66ff00',
      category: 'high'
    },
    {
      name: 'Sub Hit',
      type: 'kick',
      frequency: 42,
      decay: 1.0,
      volume: 0.9,
      pitch: 0.8,
      resonance: 0.25,
      distortion: 0.15,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 90,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0.3, release: 0.8 },
      color: '#0066ff',
      category: 'low'
    },
    {
      name: 'Zap Perc',
      type: 'perc',
      frequency: 2200,
      decay: 0.08,
      volume: 0.65,
      pitch: 1.5,
      resonance: 0.9,
      distortion: 0.3,
      oscillatorType: 'sawtooth',
      filterType: 'bandpass',
      filterFrequency: 3000,
      envelope: { attack: 0.001, decay: 0.04, sustain: 0.03, release: 0.08 },
      color: '#ff00ff',
      category: 'high'
    }
  ]
};

// Ambient Kit
const ambientKit: DrumKit = {
  id: 'ambient',
  name: 'Ambient Kit',
  description: 'Atmospheric and textural drum sounds for ambient and cinematic music',
  category: 'ambient',
  color: '#8080ff',
  bpm: 90,
  sounds: [
    {
      name: 'Soft Kick',
      type: 'kick',
      frequency: 52,
      decay: 1.2,
      volume: 0.7,
      pitch: 0.9,
      resonance: 0.15,
      reverb: 0.4,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 120,
      envelope: { attack: 0.01, decay: 0.6, sustain: 0.4, release: 1.0 },
      color: '#6060cc',
      category: 'low'
    },
    {
      name: 'Brush Snare',
      type: 'snare',
      frequency: 180,
      decay: 0.8,
      volume: 0.6,
      pitch: 0.95,
      resonance: 0.3,
      reverb: 0.5,
      oscillatorType: 'triangle',
      filterType: 'bandpass',
      filterFrequency: 1000,
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.3, release: 0.6 },
      noise: { amount: 0.4, frequency: 2000 },
      color: '#8080dd',
      category: 'mid'
    },
    {
      name: 'Whisper Hat',
      type: 'hihat',
      frequency: 6000,
      decay: 0.3,
      volume: 0.4,
      pitch: 0.9,
      resonance: 0.5,
      reverb: 0.6,
      oscillatorType: 'triangle',
      filterType: 'highpass',
      filterFrequency: 4000,
      envelope: { attack: 0.002, decay: 0.15, sustain: 0.1, release: 0.3 },
      noise: { amount: 0.6, frequency: 7000 },
      color: '#a0a0ee',
      category: 'high'
    },
    {
      name: 'Atmospheric Hit',
      type: 'crash',
      frequency: 3500,
      decay: 3.0,
      volume: 0.8,
      pitch: 0.8,
      resonance: 0.2,
      reverb: 0.7,
      oscillatorType: 'sawtooth',
      filterType: 'highpass',
      filterFrequency: 2000,
      envelope: { attack: 0.01, decay: 1.5, sustain: 0.5, release: 2.5 },
      noise: { amount: 0.3, frequency: 4000 },
      color: '#c0c0ff',
      category: 'high'
    },
    {
      name: 'Deep Tom',
      type: 'tom',
      frequency: 80,
      decay: 2.0,
      volume: 0.75,
      pitch: 0.85,
      resonance: 0.4,
      reverb: 0.5,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 200,
      envelope: { attack: 0.005, decay: 1.0, sustain: 0.4, release: 1.5 },
      color: '#4040aa',
      category: 'low'
    },
    {
      name: 'Wind Perc',
      type: 'perc',
      frequency: 1500,
      decay: 1.5,
      volume: 0.5,
      pitch: 0.7,
      resonance: 0.3,
      reverb: 0.8,
      oscillatorType: 'triangle',
      filterType: 'bandpass',
      filterFrequency: 2000,
      envelope: { attack: 0.02, decay: 0.7, sustain: 0.3, release: 1.2 },
      noise: { amount: 0.5, frequency: 3000 },
      color: '#e0e0ff',
      category: 'mid'
    },
    {
      name: 'Glass Bell',
      type: 'perc',
      frequency: 2800,
      decay: 2.5,
      volume: 0.6,
      pitch: 1.2,
      resonance: 0.6,
      reverb: 0.9,
      oscillatorType: 'triangle',
      filterType: 'highpass',
      filterFrequency: 2500,
      envelope: { attack: 0.001, decay: 1.2, sustain: 0.4, release: 2.0 },
      color: '#ffccff',
      category: 'high'
    },
    {
      name: 'Sub Drone',
      type: 'kick',
      frequency: 38,
      decay: 4.0,
      volume: 0.8,
      pitch: 0.6,
      resonance: 0.2,
      reverb: 0.3,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 75,
      envelope: { attack: 0.05, decay: 2.0, sustain: 0.6, release: 3.0 },
      color: '#2020bb',
      category: 'low'
    }
  ]
};

// Acoustic Kit
const acousticKit: DrumKit = {
  id: 'acoustic',
  name: 'Acoustic Kit',
  description: 'Natural acoustic drum sounds with organic feel and dynamics',
  category: 'acoustic',
  color: '#dd8844',
  bpm: 110,
  sounds: [
    {
      name: 'Acoustic Kick',
      type: 'kick',
      frequency: 58,
      decay: 0.7,
      volume: 0.9,
      pitch: 1.0,
      resonance: 0.2,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 150,
      envelope: { attack: 0.002, decay: 0.35, sustain: 0.2, release: 0.5 },
      color: '#bb6622',
      category: 'low'
    },
    {
      name: 'Acoustic Snare',
      type: 'snare',
      frequency: 210,
      decay: 0.4,
      volume: 0.8,
      pitch: 1.0,
      resonance: 0.4,
      oscillatorType: 'triangle',
      filterType: 'bandpass',
      filterFrequency: 1200,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.2, release: 0.3 },
      noise: { amount: 0.5, frequency: 3500 },
      color: '#dd7733',
      category: 'mid'
    },
    {
      name: 'Acoustic Hat',
      type: 'hihat',
      frequency: 7000,
      decay: 0.15,
      volume: 0.6,
      pitch: 1.0,
      resonance: 0.6,
      oscillatorType: 'triangle',
      filterType: 'highpass',
      filterFrequency: 5000,
      envelope: { attack: 0.001, decay: 0.075, sustain: 0.05, release: 0.15 },
      noise: { amount: 0.7, frequency: 8000 },
      color: '#ee8844',
      category: 'high'
    },
    {
      name: 'Open Acoustic Hat',
      type: 'openhat',
      frequency: 6500,
      decay: 0.6,
      volume: 0.7,
      pitch: 1.0,
      resonance: 0.5,
      reverb: 0.1,
      oscillatorType: 'triangle',
      filterType: 'highpass',
      filterFrequency: 4500,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.3, release: 0.5 },
      noise: { amount: 0.6, frequency: 7500 },
      color: '#ff9955',
      category: 'high'
    },
    {
      name: 'Rim Shot',
      type: 'clap',
      frequency: 1000,
      decay: 0.1,
      volume: 0.7,
      pitch: 1.2,
      resonance: 0.8,
      oscillatorType: 'square',
      filterType: 'bandpass',
      filterFrequency: 1500,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0.02, release: 0.1 },
      color: '#ffaa66',
      category: 'mid'
    },
    {
      name: 'Floor Tom',
      type: 'tom',
      frequency: 65,
      decay: 1.5,
      volume: 0.8,
      pitch: 0.9,
      resonance: 0.3,
      reverb: 0.1,
      oscillatorType: 'sine',
      filterType: 'lowpass',
      filterFrequency: 180,
      envelope: { attack: 0.002, decay: 0.75, sustain: 0.3, release: 1.2 },
      color: '#cc7744',
      category: 'low'
    },
    {
      name: 'Hi Tom',
      type: 'tom',
      frequency: 150,
      decay: 0.8,
      volume: 0.75,
      pitch: 1.1,
      resonance: 0.35,
      reverb: 0.08,
      oscillatorType: 'sine',
      filterType: 'bandpass',
      filterFrequency: 300,
      envelope: { attack: 0.002, decay: 0.4, sustain: 0.25, release: 0.6 },
      color: '#ee9966',
      category: 'mid'
    },
    {
      name: 'Ride Cymbal',
      type: 'ride',
      frequency: 3200,
      decay: 2.0,
      volume: 0.7,
      pitch: 1.0,
      resonance: 0.4,
      reverb: 0.2,
      oscillatorType: 'sawtooth',
      filterType: 'highpass',
      filterFrequency: 2800,
      envelope: { attack: 0.001, decay: 1.0, sustain: 0.4, release: 1.8 },
      color: '#ffbb77',
      category: 'high'
    }
  ]
};

// Export all drum kits
export const drumKits: DrumKit[] = [
  electronicKit,
  trapKit,
  houseKit,
  technoKit,
  ambientKit,
  acousticKit
];

// Helper functions
export const getDrumKitById = (id: string): DrumKit | undefined => {
  return drumKits.find(kit => kit.id === id);
};

export const getDrumKitsByCategory = (category: DrumKit['category']): DrumKit[] => {
  return drumKits.filter(kit => kit.category === category);
};

export const getDefaultDrumKit = (): DrumKit => {
  return electronicKit;
};

export const createCustomSound = (
  name: string,
  type: DrumSoundConfig['type'],
  overrides: Partial<DrumSoundConfig> = {}
): DrumSoundConfig => {
  const defaults: DrumSoundConfig = {
    name,
    type,
    frequency: 440,
    decay: 0.5,
    volume: 0.8,
    pitch: 1.0,
    resonance: 0.5,
    oscillatorType: 'sine',
    filterType: 'lowpass',
    filterFrequency: 1000,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.3, release: 0.5 },
    color: '#888888',
    category: 'mid'
  };

  return { ...defaults, ...overrides };
};

// Sound categories for organization
export const soundCategories = {
  low: { name: 'Low End', color: '#ff4444', description: 'Kicks, subs, and low frequency sounds' },
  mid: { name: 'Mid Range', color: '#ffaa00', description: 'Snares, claps, and mid frequency sounds' },
  high: { name: 'High End', color: '#44ff44', description: 'Hi-hats, cymbals, and high frequency sounds' }
};