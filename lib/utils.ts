import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Musical utility functions
export function noteToFrequency(note: string, octave: number): number {
  const noteFrequencies: { [key: string]: number } = {
    'C': 261.63,
    'C#': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'B': 493.88
  };

  const baseFrequency = noteFrequencies[note] ?? 440; // Default to A4 if note not found

  // Adjust for octave (A4 = 440Hz is octave 4)
  const octaveMultiplier = Math.pow(2, octave - 4);
  return baseFrequency * octaveMultiplier;
}

export function frequencyToNote(frequency: number): { note: string; octave: number } {
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  
  if (frequency > 0) {
    const h = Math.round(12 * Math.log2(frequency / C0));
    const octave = Math.floor(h / 12);
    const n = h % 12;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const note = (n >= 0 && n < notes.length && notes[n]) ? notes[n] : 'A';
    return { note, octave };
  }
  
  return { note: 'A', octave: 4 };
}

// Audio processing utilities
export function normalizeAudioData(data: Uint8Array): number[] {
  const normalized = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    normalized[i] = data[i] / 255;
  }
  return normalized;
}

export function calculateRMS(data: number[]): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

// Time formatting
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// File utilities
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Social sharing utilities
export function shareToTwitter(title: string, url?: string): void {
  const text = encodeURIComponent(`Check out my new track: ${title}`);
  const shareUrl = url ? encodeURIComponent(url) : '';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
}

export function shareToFacebook(url: string): void {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
}

export function shareViaWebAPI(title: string, text: string, url?: string): Promise<void> {
  // Fix: Add comprehensive null checks for navigator and navigator.share
  if (typeof navigator !== 'undefined' && navigator?.share && typeof navigator.share === 'function') {
    return navigator.share({
      title,
      text,
      url
    });
  }
  return Promise.reject(new Error('Web Share API not supported'));
}

// Validation utilities
export function validateBPM(bpm: number): boolean {
  return bpm >= 60 && bpm <= 200;
}

export function validateFrequency(frequency: number): boolean {
  return frequency >= 20 && frequency <= 20000;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Storage utilities
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}