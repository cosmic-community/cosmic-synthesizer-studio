import { OscillatorType } from '@/types';

export interface PianoSoundConfig {
  id: string;
  name: string;
  category: 'acoustic' | 'electric' | 'synth' | 'vintage';
  description: string;
  oscillatorType: OscillatorType;
  baseVolume: number;
  harmonics?: {
    type: OscillatorType;
    frequency: number;
    gain: number;
  }[];
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
    frequency: number;
    resonance: number;
    envelopeAmount: number;
  };
  effects: {
    reverb?: {
      amount: number;
      roomSize: number;
    };
    chorus?: {
      rate: number;
      depth: number;
      amount: number;
    };
    compression?: {
      threshold: number;
      ratio: number;
      attack: number;
      release: number;
    };
    eq?: {
      low: number;
      mid: number;
      high: number;
    };
  };
  velocity: {
    curve: 'linear' | 'exponential' | 'logarithmic';
    sensitivity: number;
  };
  color: string;
}

export const pianoSounds: PianoSoundConfig[] = [
  {
    id: 'grand-piano',
    name: 'Grand Piano',
    category: 'acoustic',
    description: 'Rich, warm acoustic grand piano with natural harmonics',
    oscillatorType: 'sine',
    baseVolume: 0.8,
    harmonics: [
      { type: 'sine', frequency: 2.0, gain: 0.3 },
      { type: 'sine', frequency: 3.0, gain: 0.2 },
      { type: 'sine', frequency: 4.0, gain: 0.1 }
    ],
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.6,
      release: 1.2
    },
    filter: {
      type: 'lowpass',
      frequency: 8000,
      resonance: 0.2,
      envelopeAmount: 0.3
    },
    effects: {
      reverb: {
        amount: 0.25,
        roomSize: 0.8
      },
      compression: {
        threshold: -18,
        ratio: 3,
        attack: 0.003,
        release: 0.1
      },
      eq: {
        low: 1.1,
        mid: 1.0,
        high: 0.9
      }
    },
    velocity: {
      curve: 'exponential',
      sensitivity: 0.7
    },
    color: '#8B4513'
  },
  {
    id: 'electric-piano',
    name: 'Electric Piano',
    category: 'electric',
    description: 'Classic electric piano with bell-like timbres',
    oscillatorType: 'sine',
    baseVolume: 0.75,
    harmonics: [
      { type: 'sine', frequency: 1.5, gain: 0.4 },
      { type: 'triangle', frequency: 2.5, gain: 0.25 },
      { type: 'sine', frequency: 4.5, gain: 0.15 }
    ],
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.4,
      release: 0.8
    },
    filter: {
      type: 'lowpass',
      frequency: 6000,
      resonance: 0.3,
      envelopeAmount: 0.4
    },
    effects: {
      chorus: {
        rate: 0.5,
        depth: 0.3,
        amount: 0.4
      },
      reverb: {
        amount: 0.15,
        roomSize: 0.5
      },
      eq: {
        low: 0.9,
        mid: 1.2,
        high: 1.1
      }
    },
    velocity: {
      curve: 'linear',
      sensitivity: 0.8
    },
    color: '#DC143C'
  },
  {
    id: 'synth-piano',
    name: 'Synth Piano',
    category: 'synth',
    description: 'Modern synthesized piano with digital clarity',
    oscillatorType: 'sawtooth',
    baseVolume: 0.7,
    harmonics: [
      { type: 'square', frequency: 0.5, gain: 0.3 },
      { type: 'sawtooth', frequency: 2.0, gain: 0.2 }
    ],
    envelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.7,
      release: 0.6
    },
    filter: {
      type: 'lowpass',
      frequency: 4000,
      resonance: 0.4,
      envelopeAmount: 0.5
    },
    effects: {
      chorus: {
        rate: 1.2,
        depth: 0.4,
        amount: 0.3
      },
      reverb: {
        amount: 0.2,
        roomSize: 0.3
      },
      eq: {
        low: 1.0,
        mid: 1.1,
        high: 1.3
      }
    },
    velocity: {
      curve: 'linear',
      sensitivity: 0.9
    },
    color: '#4169E1'
  },
  {
    id: 'vintage-piano',
    name: 'Vintage Piano',
    category: 'vintage',
    description: 'Warm, nostalgic piano with analog character',
    oscillatorType: 'triangle',
    baseVolume: 0.65,
    harmonics: [
      { type: 'sine', frequency: 1.0, gain: 0.5 },
      { type: 'triangle', frequency: 2.0, gain: 0.3 },
      { type: 'sine', frequency: 3.0, gain: 0.2 }
    ],
    envelope: {
      attack: 0.03,
      decay: 0.5,
      sustain: 0.5,
      release: 1.5
    },
    filter: {
      type: 'lowpass',
      frequency: 5000,
      resonance: 0.25,
      envelopeAmount: 0.3
    },
    effects: {
      reverb: {
        amount: 0.35,
        roomSize: 0.9
      },
      compression: {
        threshold: -20,
        ratio: 4,
        attack: 0.005,
        release: 0.15
      },
      eq: {
        low: 1.2,
        mid: 0.9,
        high: 0.8
      }
    },
    velocity: {
      curve: 'logarithmic',
      sensitivity: 0.6
    },
    color: '#CD853F'
  },
  {
    id: 'bright-piano',
    name: 'Bright Piano',
    category: 'acoustic',
    description: 'Crisp, bright piano perfect for cutting through mixes',
    oscillatorType: 'sine',
    baseVolume: 0.8,
    harmonics: [
      { type: 'sine', frequency: 2.0, gain: 0.4 },
      { type: 'sine', frequency: 4.0, gain: 0.3 },
      { type: 'sine', frequency: 6.0, gain: 0.2 }
    ],
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.8,
      release: 0.9
    },
    filter: {
      type: 'lowpass',
      frequency: 12000,
      resonance: 0.15,
      envelopeAmount: 0.2
    },
    effects: {
      reverb: {
        amount: 0.15,
        roomSize: 0.4
      },
      eq: {
        low: 0.8,
        mid: 1.1,
        high: 1.4
      }
    },
    velocity: {
      curve: 'exponential',
      sensitivity: 0.85
    },
    color: '#FFD700'
  },
  {
    id: 'soft-piano',
    name: 'Soft Piano',
    category: 'acoustic',
    description: 'Gentle, mellow piano ideal for ballads and ambient music',
    oscillatorType: 'sine',
    baseVolume: 0.6,
    harmonics: [
      { type: 'sine', frequency: 1.0, gain: 0.6 },
      { type: 'sine', frequency: 2.0, gain: 0.2 }
    ],
    envelope: {
      attack: 0.05,
      decay: 0.6,
      sustain: 0.4,
      release: 2.0
    },
    filter: {
      type: 'lowpass',
      frequency: 4000,
      resonance: 0.1,
      envelopeAmount: 0.2
    },
    effects: {
      reverb: {
        amount: 0.4,
        roomSize: 1.0
      },
      compression: {
        threshold: -24,
        ratio: 2,
        attack: 0.01,
        release: 0.2
      },
      eq: {
        low: 1.0,
        mid: 0.8,
        high: 0.6
      }
    },
    velocity: {
      curve: 'logarithmic',
      sensitivity: 0.5
    },
    color: '#DDA0DD'
  },
  {
    id: 'honky-tonk',
    name: 'Honky-Tonk Piano',
    category: 'vintage',
    description: 'Detuned, character-rich piano with vintage charm',
    oscillatorType: 'sawtooth',
    baseVolume: 0.7,
    harmonics: [
      { type: 'sawtooth', frequency: 1.02, gain: 0.4 }, // Slightly detuned
      { type: 'square', frequency: 0.98, gain: 0.3 }, // Detuned the other way
      { type: 'triangle', frequency: 2.05, gain: 0.2 }
    ],
    envelope: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.6,
      release: 1.0
    },
    filter: {
      type: 'bandpass',
      frequency: 3000,
      resonance: 0.6,
      envelopeAmount: 0.4
    },
    effects: {
      reverb: {
        amount: 0.3,
        roomSize: 0.7
      },
      eq: {
        low: 1.3,
        mid: 0.7,
        high: 0.9
      }
    },
    velocity: {
      curve: 'exponential',
      sensitivity: 0.75
    },
    color: '#D2691E'
  },
  {
    id: 'fm-piano',
    name: 'FM Piano',
    category: 'synth',
    description: 'Classic FM synthesis piano with metallic overtones',
    oscillatorType: 'sine',
    baseVolume: 0.75,
    harmonics: [
      { type: 'sine', frequency: 1.41, gain: 0.5 }, // FM-like ratios
      { type: 'sine', frequency: 3.14, gain: 0.3 },
      { type: 'sine', frequency: 7.0, gain: 0.2 }
    ],
    envelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.5,
      release: 0.7
    },
    filter: {
      type: 'lowpass',
      frequency: 7000,
      resonance: 0.3,
      envelopeAmount: 0.6
    },
    effects: {
      chorus: {
        rate: 0.8,
        depth: 0.25,
        amount: 0.3
      },
      reverb: {
        amount: 0.2,
        roomSize: 0.5
      },
      eq: {
        low: 0.9,
        mid: 1.2,
        high: 1.1
      }
    },
    velocity: {
      curve: 'linear',
      sensitivity: 0.9
    },
    color: '#00CED1'
  }
];

export function getPianoSoundById(id: string): PianoSoundConfig | undefined {
  return pianoSounds.find(sound => sound.id === id);
}

export function getPianoSoundsByCategory(category: PianoSoundConfig['category']): PianoSoundConfig[] {
  return pianoSounds.filter(sound => sound.category === category);
}

export const pianoCategories = [
  { id: 'acoustic', name: 'Acoustic', description: 'Traditional acoustic piano sounds' },
  { id: 'electric', name: 'Electric', description: 'Electric piano and tine sounds' },
  { id: 'synth', name: 'Synthesized', description: 'Modern digital piano synthesis' },
  { id: 'vintage', name: 'Vintage', description: 'Classic and character pianos' }
] as const;