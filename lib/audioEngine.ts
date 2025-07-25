import { SynthState, DrumSoundConfig, OscillatorType, EffectType } from '@/types';
import { PianoSoundConfig } from './pianoSounds';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private reverb: ConvolverNode | null = null;
  private delay: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private distortion: WaveShaperNode | null = null;
  private chorus: DelayNode | null = null;
  private chorusLFO: OscillatorNode | null = null;
  private chorusGain: GainNode | null = null;
  private activeNotes: Map<string, { oscillators: OscillatorNode[]; envelope: GainNode; filter?: BiquadFilterNode; effectsChain?: AudioNode[] }> = new Map();
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize immediately - let the init method handle initialization
  }

  public async init(): Promise<void> {
    // Return existing initialization promise if already initializing
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized) {
      return Promise.resolve();
    }

    // Create and store the initialization promise
    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
    } catch (error) {
      // Reset promise on failure so retry is possible
      this.initializationPromise = null;
      throw error;
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('Starting audio engine initialization...');

      // Check for Web Audio API support
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Create audio context
      console.log('Creating audio context...');
      this.audioContext = new AudioContextClass();

      // Check if context was created successfully
      if (!this.audioContext) {
        throw new Error('Failed to create audio context');
      }

      console.log('Audio context created, state:', this.audioContext.state);

      // Handle suspended context (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        console.log('Audio context is suspended, attempting to resume...');
        try {
          await this.audioContext.resume();
          console.log('Audio context resumed, state:', this.audioContext.state);
        } catch (resumeError) {
          console.warn('Failed to resume audio context:', resumeError);
          // Continue initialization - we'll try to resume later when user interacts
        }
      }

      // Create basic audio nodes
      console.log('Creating audio nodes...');
      this.masterGain = this.audioContext.createGain();
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.analyser = this.audioContext.createAnalyser();
      this.filter = this.audioContext.createBiquadFilter();

      if (!this.masterGain || !this.compressor || !this.analyser || !this.filter) {
        throw new Error('Failed to create required audio nodes');
      }

      // Set up the basic audio chain
      console.log('Setting up audio chain...');
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.filter);
      this.filter.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Configure analyser
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Configure compressor
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Configure filter
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 20000;
      this.filter.Q.value = 1;

      // Set initial master volume
      this.masterGain.gain.value = 0.7;

      // Initialize effects (non-critical)
      console.log('Initializing effects...');
      await this.initializeEffects();

      this.isInitialized = true;
      console.log('Audio engine initialization completed successfully');
    } catch (error) {
      console.error('Audio engine initialization failed:', error);
      this.cleanup();
      throw new Error(`Audio engine initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async initializeEffects(): Promise<void> {
    if (!this.audioContext) return;

    try {
      console.log('Creating reverb...');
      // Create reverb impulse response
      this.reverb = this.audioContext.createConvolver();
      const impulseLength = Math.min(this.audioContext.sampleRate * 2, 88200); // Limit size
      const impulse = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
        }
      }
      this.reverb.buffer = impulse;

      console.log('Creating delay...');
      // Create delay with feedback
      this.delay = this.audioContext.createDelay(1.0);
      this.delayFeedback = this.audioContext.createGain();
      this.delayFeedback.gain.value = 0.3;
      this.delay.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delay);

      console.log('Creating distortion...');
      // Create distortion
      this.distortion = this.audioContext.createWaveShaper();
      this.updateDistortionCurve('soft', 30);
      this.distortion.oversample = '4x';

      console.log('Creating chorus...');
      // Create chorus (using delay and LFO)
      this.chorus = this.audioContext.createDelay(0.02);
      this.chorusLFO = this.audioContext.createOscillator();
      this.chorusGain = this.audioContext.createGain();
      this.chorusLFO.connect(this.chorusGain);
      this.chorusGain.connect(this.chorus.delayTime);
      this.chorusLFO.frequency.value = 1;
      this.chorusGain.gain.value = 0.005;
      this.chorusLFO.start();

      console.log('Effects initialization completed');
    } catch (error) {
      console.error('Effects initialization failed:', error);
      // Don't throw here - basic functionality should still work without effects
    }
  }

  private updateDistortionCurve(type: string, amount: number): void {
    if (!this.distortion) return;

    const samples = 44100;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      
      switch (type) {
        case 'soft':
          curve[i] = Math.tanh(x * (amount / 20)) * 0.7;
          break;
        case 'hard':
          curve[i] = Math.max(-0.8, Math.min(0.8, x * (amount / 10)));
          break;
        case 'tube':
          const abs_x = Math.abs(x * (amount / 30));
          if (abs_x < 0.5) {
            curve[i] = x * 2;
          } else {
            curve[i] = Math.sign(x) * (0.75 + (abs_x - 0.5) * 0.5);
          }
          curve[i] *= 0.6;
          break;
        case 'fuzz':
          curve[i] = Math.sign(x) * Math.pow(Math.abs(x * (amount / 30)), 0.3) * 0.8;
          break;
        case 'bitcrush':
          const bits = Math.max(1, 8 - Math.floor(amount / 12));
          const step = Math.pow(2, bits - 1);
          curve[i] = Math.round(x * step) / step;
          break;
        default:
          curve[i] = Math.tanh(x * (amount / 20)) * 0.7;
      }
    }

    this.distortion.curve = curve;
  }

  public async resume(): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    if (this.audioContext.state === 'suspended') {
      console.log('Resuming suspended audio context...');
      await this.audioContext.resume();
      console.log('Audio context resumed, state:', this.audioContext.state);
    }
  }

  public playNote(frequency: number, synthState: SynthState): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized, cannot play note');
      return;
    }

    // Try to resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.resume().catch(console.error);
      return;
    }

    const noteKey = frequency.toString();
    
    // Stop existing note if playing
    if (this.activeNotes.has(noteKey)) {
      this.stopNote(frequency);
    }

    try {
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = synthState.oscillatorType;
      oscillator.frequency.value = frequency;

      // Create envelope
      const envelope = this.audioContext.createGain();
      envelope.gain.value = 0;

      // Connect audio chain with effects
      oscillator.connect(envelope);
      const effectsChain = this.createEffectsChain(synthState);
      this.connectToEffectsChain(envelope, effectsChain);

      // Apply ADSR envelope
      const now = this.audioContext.currentTime;
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(synthState.volume, now + synthState.attack);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.001, synthState.volume * synthState.sustain),
        now + synthState.attack + synthState.decay
      );

      // Update filter
      if (this.filter) {
        this.filter.frequency.value = synthState.filterCutoff;
        this.filter.Q.value = synthState.filterResonance;
      }

      // Start oscillator
      oscillator.start();

      // Store active note
      this.activeNotes.set(noteKey, { 
        oscillators: [oscillator], 
        envelope,
        effectsChain
      });
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  private createEffectsChain(synthState: SynthState): AudioNode[] {
    const chain: AudioNode[] = [];
    
    if (!this.audioContext || !this.masterGain) return chain;

    try {
      // Distortion first
      if (synthState.effects.distortion?.active && this.distortion) {
        // Update distortion parameters
        this.updateDistortionCurve(
          synthState.effects.distortion.type || 'soft',
          synthState.effects.distortion.amount || 30
        );
        chain.push(this.distortion);
      }

      // Chorus
      if (synthState.effects.chorus?.active && this.chorus && this.chorusLFO && this.chorusGain) {
        // Update chorus parameters
        this.chorusLFO.frequency.value = synthState.effects.chorus.rate || 1.0;
        this.chorusGain.gain.value = (synthState.effects.chorus.depth || 0.5) * 0.01;
        chain.push(this.chorus);
      }

      // Delay
      if (synthState.effects.delay?.active && this.delay && this.delayFeedback) {
        // Update delay parameters
        this.delay.delayTime.value = synthState.effects.delay.time || 0.25;
        this.delayFeedback.gain.value = synthState.effects.delay.feedback || 0.3;
        chain.push(this.delay);
      }

      // Reverb last
      if (synthState.effects.reverb?.active && this.reverb) {
        chain.push(this.reverb);
      }

    } catch (error) {
      console.error('Error creating effects chain:', error);
    }

    return chain;
  }

  private connectToEffectsChain(source: AudioNode, chain: AudioNode[]): void {
    if (!this.masterGain) return;

    try {
      let currentNode = source;
      
      // Always connect dry signal to master
      source.connect(this.masterGain);

      // Connect wet signal through effects chain
      if (chain.length > 0) {
        const wetGain = this.audioContext!.createGain();
        wetGain.gain.value = 0.3; // Mix level for wet signal
        
        currentNode.connect(wetGain);
        currentNode = wetGain;

        // Chain effects together
        for (const effect of chain) {
          currentNode.connect(effect);
          currentNode = effect;
        }

        // Connect final effect to master
        currentNode.connect(this.masterGain);
      }
    } catch (error) {
      console.error('Error connecting effects chain:', error);
      // Fallback to direct connection
      source.connect(this.masterGain);
    }
  }

  public playPianoNote(frequency: number, pianoSound: PianoSoundConfig): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized, cannot play piano note');
      return;
    }

    // Try to resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.resume().catch(console.error);
      return;
    }

    const noteKey = frequency.toString();
    
    // Stop existing note if playing
    if (this.activeNotes.has(noteKey)) {
      this.stopNote(frequency);
    }

    try {
      const now = this.audioContext.currentTime;
      const oscillators: OscillatorNode[] = [];

      // Create main oscillator
      const mainOscillator = this.audioContext.createOscillator();
      mainOscillator.type = pianoSound.oscillatorType;
      mainOscillator.frequency.value = frequency;
      oscillators.push(mainOscillator);

      // Create harmonic oscillators
      if (pianoSound.harmonics) {
        for (const harmonic of pianoSound.harmonics) {
          const harmonicOsc = this.audioContext.createOscillator();
          harmonicOsc.type = harmonic.type;
          harmonicOsc.frequency.value = frequency * harmonic.frequency;
          
          const harmonicGain = this.audioContext.createGain();
          harmonicGain.gain.value = harmonic.gain;
          
          harmonicOsc.connect(harmonicGain);
          oscillators.push(harmonicOsc);
        }
      }

      // Create filter for this note
      const noteFilter = this.audioContext.createBiquadFilter();
      noteFilter.type = pianoSound.filter.type;
      noteFilter.frequency.value = pianoSound.filter.frequency;
      noteFilter.Q.value = pianoSound.filter.resonance;

      // Create envelope
      const envelope = this.audioContext.createGain();
      envelope.gain.value = 0;

      // Create volume control
      const volumeGain = this.audioContext.createGain();
      volumeGain.gain.value = pianoSound.baseVolume;

      // Connect the main audio chain
      const mixer = this.audioContext.createGain();
      
      // Connect all oscillators to mixer
      oscillators.forEach((osc, index) => {
        if (index === 0) {
          // Main oscillator
          osc.connect(mixer);
        } else {
          // Harmonic oscillators (already have their gain nodes)
          const harmonicNodes = this.getConnectedNodes(osc);
          if (harmonicNodes.length > 0) {
            harmonicNodes[harmonicNodes.length - 1].connect(mixer);
          }
        }
      });

      mixer.connect(noteFilter);
      noteFilter.connect(envelope);
      envelope.connect(volumeGain);
      
      // Apply piano-specific effects
      this.connectPianoEffects(volumeGain, pianoSound);

      // Apply ADSR envelope
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(1, now + pianoSound.envelope.attack);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.001, pianoSound.envelope.sustain),
        now + pianoSound.envelope.attack + pianoSound.envelope.decay
      );

      // Apply filter envelope
      if (pianoSound.filter.envelopeAmount > 0) {
        const filterEnvelope = pianoSound.filter.envelopeAmount * 2000; // Scale envelope amount
        noteFilter.frequency.setValueAtTime(pianoSound.filter.frequency, now);
        noteFilter.frequency.linearRampToValueAtTime(
          pianoSound.filter.frequency + filterEnvelope,
          now + pianoSound.envelope.attack
        );
        noteFilter.frequency.exponentialRampToValueAtTime(
          Math.max(100, pianoSound.filter.frequency + filterEnvelope * pianoSound.envelope.sustain),
          now + pianoSound.envelope.attack + pianoSound.envelope.decay
        );
      }

      // Start all oscillators
      oscillators.forEach(osc => osc.start(now));

      // Store active note
      this.activeNotes.set(noteKey, { oscillators, envelope, filter: noteFilter });
    } catch (error) {
      console.error('Error playing piano note:', error);
    }
  }

  private getConnectedNodes(node: AudioNode): AudioNode[] {
    // This is a simplified approach - in practice, you might want to track connections more carefully
    return [node];
  }

  private connectPianoEffects(source: AudioNode, pianoSound: PianoSoundConfig): void {
    if (!this.masterGain) return;

    let currentNode = source;

    try {
      // Apply EQ if specified
      if (pianoSound.effects.eq) {
        const lowShelf = this.audioContext!.createBiquadFilter();
        const midPeak = this.audioContext!.createBiquadFilter();
        const highShelf = this.audioContext!.createBiquadFilter();

        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 250;
        lowShelf.gain.value = (pianoSound.effects.eq.low - 1) * 12; // Convert to dB

        midPeak.type = 'peaking';
        midPeak.frequency.value = 1000;
        midPeak.Q.value = 1;
        midPeak.gain.value = (pianoSound.effects.eq.mid - 1) * 12;

        highShelf.type = 'highshelf';
        highShelf.frequency.value = 4000;
        highShelf.gain.value = (pianoSound.effects.eq.high - 1) * 12;

        currentNode.connect(lowShelf);
        lowShelf.connect(midPeak);
        midPeak.connect(highShelf);
        currentNode = highShelf;
      }

      // Apply compression if specified
      if (pianoSound.effects.compression) {
        const compressor = this.audioContext!.createDynamicsCompressor();
        compressor.threshold.value = pianoSound.effects.compression.threshold;
        compressor.ratio.value = pianoSound.effects.compression.ratio;
        compressor.attack.value = pianoSound.effects.compression.attack;
        compressor.release.value = pianoSound.effects.compression.release;
        
        currentNode.connect(compressor);
        currentNode = compressor;
      }

      // Apply chorus if specified
      if (pianoSound.effects.chorus && this.chorus) {
        const chorusGain = this.audioContext!.createGain();
        chorusGain.gain.value = pianoSound.effects.chorus.amount;
        currentNode.connect(chorusGain);
        chorusGain.connect(this.chorus);
        this.chorus.connect(this.masterGain);
        
        // Update chorus parameters
        // Note: This is simplified - in practice you'd want separate chorus instances
      }

      // Apply reverb if specified
      if (pianoSound.effects.reverb && this.reverb) {
        const reverbGain = this.audioContext!.createGain();
        reverbGain.gain.value = pianoSound.effects.reverb.amount;
        currentNode.connect(reverbGain);
        reverbGain.connect(this.reverb);
        this.reverb.connect(this.masterGain);
      }

      // Always connect dry signal
      currentNode.connect(this.masterGain);
    } catch (error) {
      console.error('Error connecting piano effects:', error);
      // Fallback to direct connection
      source.connect(this.masterGain);
    }
  }

  public stopNote(frequency: number): void {
    if (!this.isInitialized || !this.audioContext) return;

    const noteKey = frequency.toString();
    const activeNote = this.activeNotes.get(noteKey);

    if (activeNote) {
      try {
        const { oscillators, envelope } = activeNote;
        const now = this.audioContext.currentTime;

        // Get the piano sound from the active note (if available)
        // For now, we'll use a default release time, but this could be improved
        const releaseTime = 0.5; // Default release time

        // Apply release
        envelope.gain.cancelScheduledValues(now);
        envelope.gain.setValueAtTime(envelope.gain.value, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

        // Stop all oscillators after release
        setTimeout(() => {
          try {
            oscillators.forEach(osc => osc.stop());
          } catch (e) {
            // Oscillators might already be stopped
          }
        }, releaseTime * 1000);

        // Clean up
        this.activeNotes.delete(noteKey);
      } catch (error) {
        console.error('Error stopping note:', error);
        this.activeNotes.delete(noteKey);
      }
    }
  }

  public playDrumSound(sound: DrumSoundConfig): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) return;

    // Try to resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.resume().catch(console.error);
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      // Create main oscillator
      const oscillator = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      const volumeGain = this.audioContext.createGain();

      // Configure oscillator
      oscillator.type = sound.oscillatorType || 'sine';
      oscillator.frequency.value = sound.frequency * (sound.pitch || 1.0);

      // Configure filter
      filter.type = sound.filterType || 'lowpass';
      filter.frequency.value = sound.filterFrequency || sound.frequency * 2;
      filter.Q.value = sound.resonance || 0.5;

      // Configure volume
      volumeGain.gain.value = sound.volume || 0.8;

      // Create noise source for certain drum types
      let noiseSource: AudioBufferSourceNode | null = null;
      let noiseGain: GainNode | null = null;
      
      if (sound.noise && sound.noise.amount > 0) {
        const bufferSize = this.audioContext.sampleRate * 0.1; // 100ms of noise
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        noiseGain = this.audioContext.createGain();
        noiseGain.gain.value = sound.noise.amount;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = sound.noise.frequency || 1000;
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
      }

      // Connect the audio chain
      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(volumeGain);
      
      if (noiseGain) {
        noiseGain.connect(envelope);
      }

      // Apply effects if specified
      let outputNode: AudioNode = volumeGain;

      if (sound.distortion && sound.distortion > 0 && this.distortion) {
        const distortionGain = this.audioContext.createGain();
        distortionGain.gain.value = sound.distortion;
        volumeGain.connect(distortionGain);
        distortionGain.connect(this.distortion);
        outputNode = this.distortion;
      }

      if (sound.reverb && sound.reverb > 0 && this.reverb) {
        const reverbGain = this.audioContext.createGain();
        reverbGain.gain.value = sound.reverb;
        outputNode.connect(reverbGain);
        reverbGain.connect(this.reverb);
        this.reverb.connect(this.masterGain);
      }

      // Always connect dry signal
      outputNode.connect(this.masterGain);

      // Configure envelope
      const envelope_config = sound.envelope || {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.3,
        release: sound.decay
      };

      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(1, now + envelope_config.attack);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.001, envelope_config.sustain),
        now + envelope_config.attack + envelope_config.decay
      );
      envelope.gain.exponentialRampToValueAtTime(
        0.001,
        now + envelope_config.attack + envelope_config.decay + envelope_config.release
      );

      // Start sources
      oscillator.start(now);
      if (noiseSource) {
        noiseSource.start(now);
      }

      // Stop sources after decay time
      const stopTime = now + envelope_config.attack + envelope_config.decay + envelope_config.release + 0.1;
      oscillator.stop(stopTime);
      if (noiseSource) {
        noiseSource.stop(stopTime);
      }

    } catch (error) {
      console.error('Error playing drum sound:', error);
    }
  }

  public startRecording(): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) return;

    try {
      if (!this.mediaRecorder) {
        const dest = this.audioContext.createMediaStreamDestination();
        this.masterGain.connect(dest);
        
        this.mediaRecorder = new MediaRecorder(dest.stream);
        this.recordedChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
      }

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          resolve(blob);
        };
        this.mediaRecorder.onerror = reject;
        this.mediaRecorder.stop();
      } else {
        reject(new Error('No active recording'));
      }
    });
  }

  public getAnalyserData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(0);
    }
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  private cleanup(): void {
    // Stop all active notes
    this.activeNotes.forEach((note) => {
      try {
        note.oscillators.forEach(osc => osc.stop());
      } catch (error) {
        // Ignore errors when stopping oscillators
      }
    });
    this.activeNotes.clear();
    
    // Stop and clean up LFOs
    if (this.chorusLFO) {
      try {
        this.chorusLFO.stop();
      } catch (error) {
        // Ignore errors when stopping LFOs
      }
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(console.error);
    }
    
    // Reset all references
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.analyser = null;
    this.reverb = null;
    this.delay = null;
    this.delayFeedback = null;
    this.filter = null;
    this.distortion = null;
    this.chorus = null;
    this.chorusLFO = null;
    this.chorusGain = null;
    this.mediaRecorder = null;
    
    this.isInitialized = false;
  }

  public destroy(): void {
    this.cleanup();
  }

  public get initialized(): boolean {
    return this.isInitialized && this.audioContext !== null && this.audioContext.state !== 'closed';
  }

  public get contextState(): string {
    return this.audioContext?.state || 'closed';
  }
}