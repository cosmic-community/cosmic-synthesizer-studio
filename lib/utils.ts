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

export function formatTime(seconds: number): string {
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
  
  const noteName = noteNames[n]
  return noteName ? `${noteName}${octave}` : null
}

export function noteToFrequency(note: string, octave?: number): number {
  if (!note || typeof note !== 'string') return 0
  
  // If octave is provided as separate parameter
  if (typeof octave === 'number') {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const noteIndex = noteNames.indexOf(note)
    
    if (noteIndex === -1) return 0
    
    const A4 = 440
    const C0 = A4 * Math.pow(2, -4.75)
    const h = octave * 12 + noteIndex
    
    return C0 * Math.pow(2, h / 12)
  }
  
  // Parse note with octave from string (e.g., "C4")
  const noteMatch = note.match(/^([A-G]#?)([0-9])$/)
  if (!noteMatch) return 0
  
  const [, noteName, octaveStr] = noteMatch
  if (!noteName || !octaveStr) return 0
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const noteIndex = noteNames.indexOf(noteName)
  const parsedOctave = parseInt(octaveStr, 10)
  
  if (noteIndex === -1 || isNaN(parsedOctave)) return 0
  
  const A4 = 440
  const C0 = A4 * Math.pow(2, -4.75)
  const h = parsedOctave * 12 + noteIndex
  
  return C0 * Math.pow(2, h / 12)
}

// Audio visualization utility
export function normalizeAudioData(dataArray: Uint8Array): number[] {
  const normalized: number[] = []
  for (let i = 0; i < dataArray.length; i++) {
    const value = dataArray[i]
    if (value !== undefined) {
      normalized[i] = value / 255
    }
  }
  return normalized
}

// Social sharing utilities
export function shareToTwitter(text: string, url?: string): void {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ''}`
  window.open(twitterUrl, '_blank', 'width=550,height=420')
}

export function shareToFacebook(url: string): void {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  window.open(facebookUrl, '_blank', 'width=580,height=296')
}

export function shareViaWebAPI(shareData: ShareData): Promise<void> {
  if (navigator.share) {
    return navigator.share(shareData)
  } else {
    // Fallback for browsers that don't support Web Share API
    return Promise.reject(new Error('Web Share API not supported'))
  }
}

// File download utility
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}