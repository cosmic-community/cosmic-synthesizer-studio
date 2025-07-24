export interface AudioProcessorNode {
  input: AudioNode;
  output: AudioNode;
  bypass: boolean;
  parameters: Map<string, AudioParam>;
}

export interface AudioEffect {
  id: string;
  name: string;
  type: 'filter' | 'modulation' | 'dynamics' | 'spatial' | 'distortion' | 'utility';
  processor: AudioProcessorNode;
  parameters: EffectParameter[];
}

export interface EffectParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  default: number;
  unit: string;
  logarithmic?: boolean;
  automation?: AudioParam;
}

export interface AudioAnalyzerData {
  frequencyData: Float32Array;
  waveformData: Float32Array;
  rms: number;
  peak: number;
  spectralCentroid: number;
  spectralRolloff: number;
  mfcc: Float32Array;
}

export class AdvancedAudioProcessor {
  private context: AudioContext;
  private inputGain: GainNode;
  private outputGain: GainNode;
  private effects: Map<string, AudioEffect> = new Map();
  private analyzer: AnalyserNode;
  private compressor: DynamicsCompressorNode;
  private limiter: DynamicsCompressorNode;
  private spectralAnalyzer: AnalyserNode;
  private isInitialized = false;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.inputGain = audioContext.createGain();
    this.outputGain = audioContext.createGain();
    this.analyzer = audioContext.createAnalyser();
    this.compressor = audioContext.createDynamicsCompressor();
    this.limiter = audioContext.createDynamicsCompressor();
    this.spectralAnalyzer = audioContext.createAnalyser();
    
    this.initialize();
  }

  private initialize(): void {
    // Configure analyzer
    this.analyzer.fftSize = 8192;
    this.analyzer.smoothingTimeConstant = 0.8;
    this.analyzer.minDecibels = -90;
    this.analyzer.maxDecibels = -10;

    // Configure spectral analyzer
    this.spectralAnalyzer.fftSize = 4096;
    this.spectralAnalyzer.smoothingTimeConstant = 0.3;

    // Configure compressor
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 8;
    this.compressor.attack.value = 0.01;
    this.compressor.release.value = 0.1;

    // Configure limiter
    this.limiter.threshold.value = -1;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.01;

    // Create processing chain
    this.inputGain.connect(this.analyzer);
    this.analyzer.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.connect(this.spectralAnalyzer);
    this.spectralAnalyzer.connect(this.outputGain);

    this.isInitialized = true;
  }

  // Advanced multiband compressor
  public createMultibandCompressor(): AudioEffect {
    const lowpassFilter = this.context.createBiquadFilter();
    const highpassFilter = this.context.createBiquadFilter();
    const bandpassFilter = this.context.createBiquadFilter();
    
    const lowCompressor = this.context.createDynamicsCompressor();
    const midCompressor = this.context.createDynamicsCompressor();
    const highCompressor = this.context.createDynamicsCompressor();
    
    const merger = this.context.createGain();
    
    // Configure filters
    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.value = 250;
    lowpassFilter.Q.value = 0.7;
    
    highpassFilter.type = 'highpass';
    highpassFilter.frequency.value = 4000;
    highpassFilter.Q.value = 0.7;
    
    bandpassFilter.type = 'bandpass';
    bandpassFilter.frequency.value = 1000;
    bandpassFilter.Q.value = 0.5;
    
    // Configure compressors
    lowCompressor.threshold.value = -20;
    lowCompressor.ratio.value = 4;
    lowCompressor.attack.value = 0.01;
    lowCompressor.release.value = 0.1;
    
    midCompressor.threshold.value = -15;
    midCompressor.ratio.value = 3;
    midCompressor.attack.value = 0.005;
    midCompressor.release.value = 0.08;
    
    highCompressor.threshold.value = -12;
    highCompressor.ratio.value = 2;
    highCompressor.attack.value = 0.003;
    highCompressor.release.value = 0.05;
    
    // Connect processing chain
    lowpassFilter.connect(lowCompressor);
    bandpassFilter.connect(midCompressor);
    highpassFilter.connect(highCompressor);
    
    lowCompressor.connect(merger);
    midCompressor.connect(merger);
    highCompressor.connect(merger);

    const parameters = new Map<string, AudioParam>();
    parameters.set('lowThreshold', lowCompressor.threshold);
    parameters.set('midThreshold', midCompressor.threshold);
    parameters.set('highThreshold', highCompressor.threshold);
    parameters.set('lowRatio', lowCompressor.ratio);
    parameters.set('midRatio', midCompressor.ratio);
    parameters.set('highRatio', highCompressor.ratio);

    const processor: AudioProcessorNode = {
      input: lowpassFilter, // We'll split input to all three filters
      output: merger,
      bypass: false,
      parameters
    };

    return {
      id: 'multiband-compressor',
      name: 'Multiband Compressor',
      type: 'dynamics',
      processor,
      parameters: [
        {
          id: 'lowThreshold',
          name: 'Low Threshold',
          value: -20,
          min: -60,
          max: 0,
          default: -20,
          unit: 'dB',
          automation: lowCompressor.threshold
        },
        {
          id: 'midThreshold',
          name: 'Mid Threshold',
          value: -15,
          min: -60,
          max: 0,
          default: -15,
          unit: 'dB',
          automation: midCompressor.threshold
        },
        {
          id: 'highThreshold',
          name: 'High Threshold',
          value: -12,
          min: -60,
          max: 0,
          default: -12,
          unit: 'dB',
          automation: highCompressor.threshold
        }
      ]
    };
  }

  // Advanced spectral filter
  public createSpectralFilter(): AudioEffect {
    const analyzer = this.context.createAnalyser();
    const scriptProcessor = this.context.createScriptProcessor(4096, 1, 1);
    
    analyzer.fftSize = 4096;
    let filterEnabled = true;
    let cutoffFrequency = 1000;
    let resonance = 1;
    
    scriptProcessor.onaudioprocess = (event) => {
      if (!filterEnabled) return;
      
      const inputBuffer = event.inputBuffer.getChannelData(0);
      const outputBuffer = event.outputBuffer.getChannelData(0);
      
      // Get frequency data
      const frequencyData = new Float32Array(analyzer.frequencyBinCount);
      analyzer.getFloatFrequencyData(frequencyData);
      
      // Apply spectral filtering
      for (let i = 0; i < inputBuffer.length; i++) {
        // Simple spectral filter implementation
        // In a real implementation, you'd use FFT/IFFT
        outputBuffer[i] = inputBuffer[i] * this.calculateSpectralGain(i, cutoffFrequency, resonance);
      }
    };

    const parameters = new Map<string, AudioParam>();
    const cutoffParam = this.context.createGain().gain;
    const resonanceParam = this.context.createGain().gain;
    
    cutoffParam.value = cutoffFrequency;
    resonanceParam.value = resonance;
    
    parameters.set('cutoff', cutoffParam);
    parameters.set('resonance', resonanceParam);

    const processor: AudioProcessorNode = {
      input: analyzer,
      output: scriptProcessor,
      bypass: false,
      parameters
    };

    return {
      id: 'spectral-filter',
      name: 'Spectral Filter',
      type: 'filter',
      processor,
      parameters: [
        {
          id: 'cutoff',
          name: 'Cutoff Frequency',
          value: 1000,
          min: 20,
          max: 20000,
          default: 1000,
          unit: 'Hz',
          logarithmic: true,
          automation: cutoffParam
        },
        {
          id: 'resonance',
          name: 'Resonance',
          value: 1,
          min: 0.1,
          max: 30,
          default: 1,
          unit: '',
          logarithmic: true,
          automation: resonanceParam
        }
      ]
    };
  }

  // Advanced reverb with room simulation
  public createConvolutionReverb(): AudioEffect {
    const convolver = this.context.createConvolver();
    const wetGain = this.context.createGain();
    const dryGain = this.context.createGain();
    const output = this.context.createGain();
    
    // Create impulse response for different room types
    const impulseBuffer = this.createImpulseResponse(
      this.context.sampleRate * 2, // 2 seconds
      2, // stereo
      0.8, // decay
      false // reverse
    );
    
    convolver.buffer = impulseBuffer;
    
    // Set up wet/dry mix
    wetGain.gain.value = 0.3;
    dryGain.gain.value = 0.7;
    
    convolver.connect(wetGain);
    wetGain.connect(output);
    dryGain.connect(output);

    const parameters = new Map<string, AudioParam>();
    parameters.set('wet', wetGain.gain);
    parameters.set('dry', dryGain.gain);

    const processor: AudioProcessorNode = {
      input: convolver,
      output: output,
      bypass: false,
      parameters
    };

    return {
      id: 'convolution-reverb',
      name: 'Convolution Reverb',
      type: 'spatial',
      processor,
      parameters: [
        {
          id: 'wet',
          name: 'Wet Level',
          value: 0.3,
          min: 0,
          max: 1,
          default: 0.3,
          unit: '',
          automation: wetGain.gain
        },
        {
          id: 'dry',
          name: 'Dry Level',
          value: 0.7,
          min: 0,
          max: 1,
          default: 0.7,
          unit: '',
          automation: dryGain.gain
        }
      ]
    };
  }

  // Advanced pitch shifter
  public createPitchShifter(): AudioEffect {
    const bufferSize = 4096;
    const scriptProcessor = this.context.createScriptProcessor(bufferSize, 1, 1);
    
    let pitchShift = 0; // In semitones
    let overlapBuffer = new Float32Array(bufferSize);
    let grainSize = 1024;
    let overlap = 0.5;
    
    scriptProcessor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer.getChannelData(0);
      const outputBuffer = event.outputBuffer.getChannelData(0);
      
      // Implement PSOLA (Pitch Synchronous Overlap and Add) algorithm
      this.applePitchShift(inputBuffer, outputBuffer, pitchShift, grainSize, overlap, overlapBuffer);
    };

    const parameters = new Map<string, AudioParam>();
    const pitchParam = this.context.createGain().gain;
    pitchParam.value = 0;
    parameters.set('pitch', pitchParam);

    const processor: AudioProcessorNode = {
      input: scriptProcessor,
      output: scriptProcessor,
      bypass: false,
      parameters
    };

    return {
      id: 'pitch-shifter',
      name: 'Pitch Shifter',
      type: 'modulation',
      processor,
      parameters: [
        {
          id: 'pitch',
          name: 'Pitch Shift',
          value: 0,
          min: -24,
          max: 24,
          default: 0,
          unit: 'semitones',
          automation: pitchParam
        }
      ]
    };
  }

  // Advanced audio analysis
  public getAdvancedAnalysis(): AudioAnalyzerData {
    const frequencyData = new Float32Array(this.analyzer.frequencyBinCount);
    const waveformData = new Float32Array(this.analyzer.fftSize);
    
    this.analyzer.getFloatFrequencyData(frequencyData);
    this.analyzer.getFloatTimeDomainData(waveformData);
    
    // Calculate RMS
    let rms = 0;
    let peak = 0;
    
    for (let i = 0; i < waveformData.length; i++) {
      const sample = waveformData[i];
      rms += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    
    rms = Math.sqrt(rms / waveformData.length);
    
    // Calculate spectral centroid
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20); // Convert dB to linear
      const frequency = (i * this.context.sampleRate) / (2 * frequencyData.length);
      
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    
    // Calculate spectral rolloff (90% of energy)
    let energySum = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      totalEnergy += Math.pow(10, frequencyData[i] / 10);
    }
    
    const targetEnergy = totalEnergy * 0.9;
    let spectralRolloff = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      energySum += Math.pow(10, frequencyData[i] / 10);
      if (energySum >= targetEnergy) {
        spectralRolloff = (i * this.context.sampleRate) / (2 * frequencyData.length);
        break;
      }
    }
    
    // Calculate MFCCs (simplified)
    const mfcc = this.calculateMFCC(frequencyData, 13);
    
    return {
      frequencyData,
      waveformData,
      rms,
      peak,
      spectralCentroid,
      spectralRolloff,
      mfcc
    };
  }

  // Vocode effect
  public createVocoder(carrierInput: AudioNode): AudioEffect {
    const numBands = 16;
    const filters: BiquadFilterNode[] = [];
    const envelopes: GainNode[] = [];
    const output = this.context.createGain();
    
    const minFreq = 80;
    const maxFreq = 8000;
    const freqRatio = Math.pow(maxFreq / minFreq, 1 / (numBands - 1));
    
    for (let i = 0; i < numBands; i++) {
      const freq = minFreq * Math.pow(freqRatio, i);
      
      // Modulator band (input signal)
      const modFilter = this.context.createBiquadFilter();
      modFilter.type = 'bandpass';
      modFilter.frequency.value = freq;
      modFilter.Q.value = 5;
      
      // Carrier band
      const carrierFilter = this.context.createBiquadFilter();
      carrierFilter.type = 'bandpass';
      carrierFilter.frequency.value = freq;
      carrierFilter.Q.value = 5;
      
      // Envelope follower
      const envelope = this.context.createGain();
      const rectifier = this.context.createWaveShaper();
      const smoother = this.context.createBiquadFilter();
      
      // Full-wave rectifier
      const curve = new Float32Array(65536);
      for (let j = 0; j < 65536; j++) {
        curve[j] = Math.abs((j - 32768) / 32768);
      }
      rectifier.curve = curve;
      
      smoother.type = 'lowpass';
      smoother.frequency.value = 30;
      
      // Connect modulator chain
      modFilter.connect(rectifier);
      rectifier.connect(smoother);
      smoother.connect(envelope.gain);
      
      // Connect carrier chain
      carrierInput.connect(carrierFilter);
      carrierFilter.connect(envelope);
      envelope.connect(output);
      
      filters.push(modFilter);
      envelopes.push(envelope);
    }

    const parameters = new Map<string, AudioParam>();
    const wetGain = this.context.createGain();
    wetGain.gain.value = 1;
    parameters.set('wet', wetGain.gain);

    const processor: AudioProcessorNode = {
      input: filters[0], // Input will be split to all filters
      output: output,
      bypass: false,
      parameters
    };

    return {
      id: 'vocoder',
      name: 'Vocoder',
      type: 'modulation',
      processor,
      parameters: [
        {
          id: 'wet',
          name: 'Wet Level',
          value: 1,
          min: 0,
          max: 1,
          default: 1,
          unit: '',
          automation: wetGain.gain
        }
      ]
    };
  }

  // Helper methods
  private createImpulseResponse(length: number, channels: number, decay: number, reverse: boolean): AudioBuffer {
    const impulse = this.context.createBuffer(channels, length, this.context.sampleRate);
    
    for (let channel = 0; channel < channels; channel++) {
      const channelData = impulse.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const envelope = Math.pow(1 - t, decay);
        const noise = (Math.random() * 2 - 1) * envelope;
        
        channelData[reverse ? length - 1 - i : i] = noise;
      }
    }
    
    return impulse;
  }

  private calculateSpectralGain(index: number, cutoff: number, resonance: number): number {
    const nyquist = this.context.sampleRate / 2;
    const frequency = (index / 4096) * nyquist;
    const normalizedCutoff = cutoff / nyquist;
    
    // Simple lowpass filter approximation
    const ratio = frequency / cutoff;
    return 1 / (1 + Math.pow(ratio * resonance, 2));
  }

  private applePitchShift(
    input: Float32Array, 
    output: Float32Array, 
    pitchShift: number, 
    grainSize: number, 
    overlap: number, 
    overlapBuffer: Float32Array
  ): void {
    const pitchRatio = Math.pow(2, pitchShift / 12);
    const hopSize = Math.floor(grainSize * (1 - overlap));
    
    // Simplified pitch shifting implementation
    for (let i = 0; i < output.length; i++) {
      const scaledIndex = i * pitchRatio;
      const index = Math.floor(scaledIndex);
      const fraction = scaledIndex - index;
      
      if (index < input.length - 1) {
        // Linear interpolation
        output[i] = input[index] * (1 - fraction) + input[index + 1] * fraction;
      } else {
        output[i] = 0;
      }
    }
  }

  private calculateMFCC(frequencyData: Float32Array, numCoefficients: number): Float32Array {
    // Simplified MFCC calculation
    const melFilters = this.createMelFilterBank(frequencyData.length, numCoefficients);
    const mfcc = new Float32Array(numCoefficients);
    
    // Apply mel filter bank
    for (let i = 0; i < numCoefficients; i++) {
      let sum = 0;
      for (let j = 0; j < frequencyData.length; j++) {
        sum += frequencyData[j] * melFilters[i][j];
      }
      mfcc[i] = Math.log(Math.max(sum, 1e-10));
    }
    
    // Apply DCT
    const dct = new Float32Array(numCoefficients);
    for (let i = 0; i < numCoefficients; i++) {
      let sum = 0;
      for (let j = 0; j < numCoefficients; j++) {
        sum += mfcc[j] * Math.cos((Math.PI * i * (j + 0.5)) / numCoefficients);
      }
      dct[i] = sum;
    }
    
    return dct;
  }

  private createMelFilterBank(fftSize: number, numFilters: number): number[][] {
    const melFilters: number[][] = [];
    const melMin = this.hzToMel(0);
    const melMax = this.hzToMel(this.context.sampleRate / 2);
    const melPoints = new Array(numFilters + 2);
    
    for (let i = 0; i < numFilters + 2; i++) {
      melPoints[i] = melMin + (i * (melMax - melMin)) / (numFilters + 1);
    }
    
    const hzPoints = melPoints.map(mel => this.melToHz(mel));
    const binPoints = hzPoints.map(hz => Math.floor((fftSize + 1) * hz / (this.context.sampleRate / 2)));
    
    for (let i = 0; i < numFilters; i++) {
      const filter = new Array(fftSize).fill(0);
      
      for (let j = binPoints[i]; j < binPoints[i + 1]; j++) {
        filter[j] = (j - binPoints[i]) / (binPoints[i + 1] - binPoints[i]);
      }
      
      for (let j = binPoints[i + 1]; j < binPoints[i + 2]; j++) {
        filter[j] = (binPoints[i + 2] - j) / (binPoints[i + 2] - binPoints[i + 1]);
      }
      
      melFilters.push(filter);
    }
    
    return melFilters;
  }

  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  // Add effect to processing chain
  public addEffect(effect: AudioEffect): void {
    this.effects.set(effect.id, effect);
  }

  // Remove effect from processing chain
  public removeEffect(effectId: string): void {
    this.effects.delete(effectId);
  }

  // Get all effects
  public getEffects(): AudioEffect[] {
    return Array.from(this.effects.values());
  }

  // Update effect parameter
  public updateEffectParameter(effectId: string, parameterId: string, value: number): void {
    const effect = this.effects.get(effectId);
    if (effect) {
      const parameter = effect.parameters.find(p => p.id === parameterId);
      if (parameter && parameter.automation) {
        parameter.automation.value = value;
        parameter.value = value;
      }
    }
  }

  // Get input/output nodes for connection
  public getInputNode(): AudioNode {
    return this.inputGain;
  }

  public getOutputNode(): AudioNode {
    return this.outputGain;
  }

  // Cleanup
  public destroy(): void {
    this.effects.clear();
    // Disconnect all nodes
    this.inputGain.disconnect();
    this.outputGain.disconnect();
    this.analyzer.disconnect();
    this.compressor.disconnect();
    this.limiter.disconnect();
    this.spectralAnalyzer.disconnect();
  }
}

// Export for use in main audio engine
export { AdvancedAudioProcessor };