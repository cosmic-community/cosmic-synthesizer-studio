import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

export function frequencyToNote(frequency: number): string | null {
  if (!frequency || frequency <= 0) return null
  
  const A4 = 440
  const C0 = A4 * Math.pow(2, -4.75)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  const h = Math.round(12 * Math.log2(frequency / C0))
  const octave = Math.floor(h / 12)
  const n = h % 12
  
  return noteNames[n] ? `${noteNames[n]}${octave}` : null
}

export function noteToFrequency(note: string): number | null {
  if (!note || typeof note !== 'string') return null
  
  const noteMatch = note.match(/^([A-G]#?)([0-9])$/)
  if (!noteMatch) return null
  
  const [, noteName, octaveStr] = noteMatch
  if (!noteName || !octaveStr) return null
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const noteIndex = noteNames.indexOf(noteName)
  const octave = parseInt(octaveStr, 10)
  
  if (noteIndex === -1 || isNaN(octave)) return null
  
  const A4 = 440
  const C0 = A4 * Math.pow(2, -4.75)
  const h = octave * 12 + noteIndex
  
  return C0 * Math.pow(2, h / 12)
}