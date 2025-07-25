import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioAnalyzerConfig {
  fftSize: number;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
  updateInterval: number;
}

export interface AudioAnalyzerData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  floatFrequencyData: Float32Array;
  floatTimeDomainData: Float32Array;
  volume: number;
  peak: number;
  rms: number;
  spectralCentroid: number;
  spectralSpread: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  isActive: boolean;
}

const defaultConfig: AudioAnalyzerConfig = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
  updateInterval: 16 // ~60fps
};

export function useAudioAnalyzer(
  audioContext: AudioContext | null,
  sourceNode: AudioNode | null,
  config: Partial<AudioAnalyzerConfig> = {}
) {
  const [data, setData] = useState<AudioAnalyzerData>({
    frequencyData: new Uint8Array(0),
    timeDomainData: new Uint8Array(0),
    floatFrequencyData: new Float32Array(0),
    floatTimeDomainData: new Float32Array(0),
    volume: 0,
    peak: 0,
    rms: 0,
    spectralCentroid: 0,
    spectralSpread: 0,
    spectralRolloff: 0,
    zeroCrossingRate: 0,
    isActive: false
  });

  const [isRunning, setIsRunning] = useState(false);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const configRef = useRef<AudioAnalyzerConfig>({ ...defaultConfig, ...config });

  // Update config
  useEffect(() => {
    configRef.current = { ...defaultConfig, ...config };
  }, [config]);

  // Initialize analyzer
  const initializeAnalyzer = useCallback(() => {
    if (!audioContext || !sourceNode) return null;

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = configRef.current.fftSize;
    analyzer.smoothingTimeConstant = configRef.current.smoothingTimeConstant;
    analyzer.minDecibels = configRef.current.minDecibels;
    analyzer.maxDecibels = configRef.current.maxDecibels;

    sourceNode.connect(analyzer);
    return analyzer;
  }, [audioContext, sourceNode]);

  // Calculate spectral features
  const calculateSpectralFeatures = useCallback((
    frequencyData: Float32Array,
    sampleRate: number
  ) => {
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / frequencyData.length;
    
    let weightedSum = 0;
    let totalMagnitude = 0;
    
    // Convert dB to linear magnitude and calculate spectral centroid
    const magnitudes = new Float32Array(frequencyData.length);
    
    for (let i = 0; i < frequencyData.length; i++) {
      const freq = i * binWidth;
      const mag = Math.pow(10, (frequencyData[i] ?? 0) / 20); // dB to linear
      magnitudes[i] = mag;
      
      weightedSum += freq * mag;
      totalMagnitude += mag;
    }
    
    const spectralCentroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
    
    // Calculate spectral spread
    let spreadSum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      const freq = i * binWidth;
      const mag = magnitudes[i] ?? 0;
      spreadSum += Math.pow(freq - spectralCentroid, 2) * mag;
    }
    
    const spectralSpread = totalMagnitude > 0 ? Math.sqrt(spreadSum / totalMagnitude) : 0;
    
    // Calculate spectral rolloff (85% of energy)
    let energySum = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      const mag = magnitudes[i] ?? 0;
      totalEnergy += mag * mag;
    }
    
    const targetEnergy = totalEnergy * 0.85;
    let spectralRolloff = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      const mag = magnitudes[i] ?? 0;
      energySum += mag * mag;
      if (energySum >= targetEnergy) {
        spectralRolloff = i * binWidth;
        break;
      }
    }
    
    return { spectralCentroid, spectralSpread, spectralRolloff };
  }, []);

  // Calculate time domain features
  const calculateTimeDomainFeatures = useCallback((timeDomainData: Float32Array) => {
    let rms = 0;
    let peak = 0;
    let zeroCrossings = 0;
    let previousSample = 0;
    
    for (let i = 0; i < timeDomainData.length; i++) {
      const sample = timeDomainData[i] ?? 0;
      
      // RMS calculation
      rms += sample * sample;
      
      // Peak calculation
      peak = Math.max(peak, Math.abs(sample));
      
      // Zero crossing rate
      if (i > 0 && ((previousSample >= 0 && sample < 0) || (previousSample < 0 && sample >= 0))) {
        zeroCrossings++;
      }
      
      previousSample = sample;
    }
    
    rms = Math.sqrt(rms / timeDomainData.length);
    const zeroCrossingRate = zeroCrossings / (timeDomainData.length - 1);
    
    return { rms, peak, zeroCrossingRate };
  }, []);

  // Analysis loop
  const analyze = useCallback(() => {
    if (!analyzerRef.current || !audioContext) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    
    // Get data arrays
    const frequencyData = new Uint8Array(bufferLength);
    const timeDomainData = new Uint8Array(analyzer.fftSize);
    const floatFrequencyData = new Float32Array(bufferLength);
    const floatTimeDomainData = new Float32Array(analyzer.fftSize);
    
    analyzer.getByteFrequencyData(frequencyData);
    analyzer.getByteTimeDomainData(timeDomainData);
    analyzer.getFloatFrequencyData(floatFrequencyData);
    analyzer.getFloatTimeDomainData(floatTimeDomainData);
    
    // Calculate volume (average of frequency data)
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i] ?? 0;
    }
    const volume = sum / frequencyData.length / 255;
    
    // Calculate spectral features
    const spectralFeatures = calculateSpectralFeatures(floatFrequencyData, audioContext.sampleRate);
    
    // Calculate time domain features
    const timeDomainFeatures = calculateTimeDomainFeatures(floatTimeDomainData);
    
    // Check if audio is active (above threshold)
    const isActive = volume > 0.01 || timeDomainFeatures.rms > 0.001;
    
    setData({
      frequencyData,
      timeDomainData,
      floatFrequencyData,
      floatTimeDomainData,
      volume,
      peak: timeDomainFeatures.peak,
      rms: timeDomainFeatures.rms,
      spectralCentroid: spectralFeatures.spectralCentroid,
      spectralSpread: spectralFeatures.spectralSpread,
      spectralRolloff: spectralFeatures.spectralRolloff,
      zeroCrossingRate: timeDomainFeatures.zeroCrossingRate,
      isActive
    });
    
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(analyze);
    }
  }, [audioContext, isRunning, calculateSpectralFeatures, calculateTimeDomainFeatures]);

  // Start analysis
  const start = useCallback(() => {
    if (isRunning) return;
    
    analyzerRef.current = initializeAnalyzer();
    if (!analyzerRef.current) return;
    
    setIsRunning(true);
  }, [isRunning, initializeAnalyzer]);

  // Stop analysis
  const stop = useCallback(() => {
    setIsRunning(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (analyzerRef.current && sourceNode) {
      sourceNode.disconnect(analyzerRef.current);
      analyzerRef.current = null;
    }
  }, [sourceNode]);

  // Auto start/stop based on dependencies
  useEffect(() => {
    if (audioContext && sourceNode && !isRunning) {
      start();
    } else if ((!audioContext || !sourceNode) && isRunning) {
      stop();
    }
    
    return () => {
      if (isRunning) {
        stop();
      }
    };
  }, [audioContext, sourceNode, isRunning, start, stop]);

  // Start analysis loop when running
  useEffect(() => {
    if (isRunning && analyzerRef.current) {
      analyze();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, analyze]);

  // Get frequency data for specific frequency range
  const getFrequencyRange = useCallback((minFreq: number, maxFreq: number): number[] => {
    if (!audioContext || !data.floatFrequencyData.length) return [];
    
    const nyquist = audioContext.sampleRate / 2;
    const binWidth = nyquist / data.floatFrequencyData.length;
    
    const startBin = Math.floor(minFreq / binWidth);
    const endBin = Math.ceil(maxFreq / binWidth);
    
    const result: number[] = [];
    for (let i = startBin; i <= endBin && i < data.floatFrequencyData.length; i++) {
      result.push(data.floatFrequencyData[i] ?? 0);
    }
    
    return result;
  }, [audioContext, data.floatFrequencyData]);

  // Get peak frequency
  const getPeakFrequency = useCallback((): number => {
    if (!audioContext || !data.floatFrequencyData.length) return 0;
    
    let maxMagnitude = -Infinity;
    let peakIndex = 0;
    
    for (let i = 0; i < data.floatFrequencyData.length; i++) {
      const magnitude = data.floatFrequencyData[i] ?? -Infinity;
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude;
        peakIndex = i;
      }
    }
    
    const nyquist = audioContext.sampleRate / 2;
    const binWidth = nyquist / data.floatFrequencyData.length;
    
    return peakIndex * binWidth;
  }, [audioContext, data.floatFrequencyData]);

  // Detect onset (simple energy-based)
  const [previousEnergy, setPreviousEnergy] = useState(0);
  const detectOnset = useCallback((threshold = 1.5): boolean => {
    const currentEnergy = data.rms;
    const isOnset = currentEnergy > previousEnergy * threshold && currentEnergy > 0.01;
    setPreviousEnergy(currentEnergy);
    return isOnset;
  }, [data.rms, previousEnergy]);

  // Get frequency bin for specific frequency
  const getFrequencyBin = useCallback((frequency: number): number => {
    if (!audioContext) return 0;
    
    const nyquist = audioContext.sampleRate / 2;
    const binWidth = nyquist / (data.floatFrequencyData.length || 1);
    
    return Math.round(frequency / binWidth);
  }, [audioContext, data.floatFrequencyData.length]);

  return {
    data,
    isRunning,
    start,
    stop,
    getFrequencyRange,
    getPeakFrequency,
    detectOnset,
    getFrequencyBin,
    analyzer: analyzerRef.current
  };
}

// Hook for beat detection
export function useBeatDetection(
  audioAnalyzer: ReturnType<typeof useAudioAnalyzer>,
  sensitivity = 1.5,
  minInterval = 300 // minimum ms between beats
) {
  const [bpm, setBpm] = useState(0);
  const [lastBeatTime, setLastBeatTime] = useState(0);
  const [beatIntervals, setBeatIntervals] = useState<number[]>([]);
  const [isBeating, setIsBeating] = useState(false);

  const detectBeat = useCallback(() => {
    const now = Date.now();
    
    if (audioAnalyzer.detectOnset(sensitivity) && now - lastBeatTime > minInterval) {
      setIsBeating(true);
      
      // Calculate BPM from recent intervals
      if (lastBeatTime > 0) {
        const interval = now - lastBeatTime;
        setBeatIntervals(prev => {
          const newIntervals = [...prev, interval].slice(-8); // Keep last 8 intervals
          
          // Calculate average BPM
          const averageInterval = newIntervals.reduce((a, b) => a + b, 0) / newIntervals.length;
          const calculatedBpm = 60000 / averageInterval;
          setBpm(Math.round(calculatedBpm));
          
          return newIntervals;
        });
      }
      
      setLastBeatTime(now);
      
      // Reset beat indicator after a short time
      setTimeout(() => setIsBeating(false), 100);
    }
  }, [audioAnalyzer, sensitivity, minInterval, lastBeatTime]);

  useEffect(() => {
    if (audioAnalyzer.isRunning) {
      const interval = setInterval(detectBeat, 10);
      return () => clearInterval(interval);
    }
  }, [audioAnalyzer.isRunning, detectBeat]);

  return {
    bpm,
    isBeating,
    beatIntervals
  };
}

// Hook for pitch detection using autocorrelation
export function usePitchDetection(
  audioAnalyzer: ReturnType<typeof useAudioAnalyzer>,
  minFrequency = 80,
  maxFrequency = 1000
) {
  const [pitch, setPitch] = useState(0);
  const [clarity, setClarity] = useState(0);

  const detectPitch = useCallback(() => {
    if (!audioAnalyzer.data.floatTimeDomainData.length) return;

    const timeDomainData = audioAnalyzer.data.floatTimeDomainData;
    const sampleRate = 44100; // Assume standard sample rate
    
    const minPeriod = Math.floor(sampleRate / maxFrequency);
    const maxPeriod = Math.floor(sampleRate / minFrequency);
    
    let bestCorrelation = 0;
    let bestPeriod = 0;
    
    // Autocorrelation
    for (let period = minPeriod; period <= maxPeriod && period < timeDomainData.length / 2; period++) {
      let correlation = 0;
      let normalization = 0;
      
      for (let i = 0; i < timeDomainData.length - period; i++) {
        const currentSample = timeDomainData[i] ?? 0;
        const delayedSample = timeDomainData[i + period] ?? 0;
        correlation += currentSample * delayedSample;
        normalization += currentSample * currentSample;
      }
      
      if (normalization > 0) {
        correlation /= normalization;
        
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestPeriod = period;
        }
      }
    }
    
    if (bestPeriod > 0 && bestCorrelation > 0.3) {
      const detectedPitch = sampleRate / bestPeriod;
      setPitch(detectedPitch);
      setClarity(bestCorrelation);
    } else {
      setPitch(0);
      setClarity(0);
    }
  }, [audioAnalyzer.data.floatTimeDomainData, minFrequency, maxFrequency]);

  useEffect(() => {
    if (audioAnalyzer.isRunning) {
      const interval = setInterval(detectPitch, 50); // 20fps for pitch detection
      return () => clearInterval(interval);
    }
  }, [audioAnalyzer.isRunning, detectPitch]);

  return {
    pitch,
    clarity
  };
}