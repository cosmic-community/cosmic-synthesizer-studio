import { SynthState, DrumSound, OscillatorType, EffectType } from '@/types';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private reverb: ConvolverNode | null = null;
  private delay: DelayNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private distortion: WaveShaperNode | null = null;
  private chorus: DelayNode | null = null;
  private activeNotes: Map<string, { oscillator: OscillatorNode; envelope: GainNode }> = new Map();
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
      // Create delay
      this.delay = this.audioContext.createDelay(1.0);
      const delayFeedback = this.audioContext.createGain();
      delayFeedback.gain.value = 0.3;
      this.delay.connect(delayFeedback);
      delayFeedback.connect(this.delay);

      console.log('Creating distortion...');
      // Create distortion
      this.distortion = this.audioContext.createWaveShaper();
      this.distortion.curve = this.makeDistortionCurve(400);
      this.distortion.oversample = '4x';

      console.log('Creating chorus...');
      // Create chorus (using delay and LFO)
      this.chorus = this.audioContext.createDelay(0.02);
      const chorusLFO = this.audioContext.createOscillator();
      const chorusGain = this.audioContext.createGain();
      chorusLFO.connect(chorusGain);
      chorusGain.connect(this.chorus.delayTime);
      chorusLFO.frequency.value = 1;
      chorusGain.gain.value = 0.005;
      chorusLFO.start();

      console.log('Effects initialization completed');
    } catch (error) {
      console.error('Effects initialization failed:', error);
      // Don't throw here - basic functionality should still work without effects
    }
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    return curve;
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

      // Connect audio chain
      oscillator.connect(envelope);
      this.connectEffects(envelope, synthState);

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
      this.activeNotes.set(noteKey, { oscillator, envelope });
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  public stopNote(frequency: number): void {
    if (!this.isInitialized || !this.audioContext) return;

    const noteKey = frequency.toString();
    const activeNote = this.activeNotes.get(noteKey);

    if (activeNote) {
      try {
        const { oscillator, envelope } = activeNote;
        const now = this.audioContext.currentTime;

        // Apply release
        envelope.gain.cancelScheduledValues(now);
        envelope.gain.setValueAtTime(envelope.gain.value, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Release time

        // Stop oscillator after release
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // Oscillator might already be stopped
          }
        }, 500);

        // Clean up
        this.activeNotes.delete(noteKey);
      } catch (error) {
        console.error('Error stopping note:', error);
        this.activeNotes.delete(noteKey);
      }
    }
  }

  private connectEffects(source: AudioNode, synthState: SynthState): void {
    if (!this.masterGain) return;

    let currentNode = source;

    try {
      // Apply effects based on state
      if (synthState.effects.distortion.active && this.distortion) {
        currentNode.connect(this.distortion);
        currentNode = this.distortion;
      }

      if (synthState.effects.chorus.active && this.chorus) {
        const chorusGain = this.audioContext!.createGain();
        chorusGain.gain.value = 0.5;
        currentNode.connect(chorusGain);
        chorusGain.connect(this.chorus);
        this.chorus.connect(this.masterGain);
      }

      if (synthState.effects.delay.active && this.delay) {
        const delayGain = this.audioContext!.createGain();
        delayGain.gain.value = 0.3;
        currentNode.connect(delayGain);
        delayGain.connect(this.delay);
        this.delay.connect(this.masterGain);
        
        // Set delay parameters
        this.delay.delayTime.value = synthState.effects.delay.time;
      }

      if (synthState.effects.reverb.active && this.reverb) {
        const reverbGain = this.audioContext!.createGain();
        reverbGain.gain.value = synthState.effects.reverb.amount;
        currentNode.connect(reverbGain);
        reverbGain.connect(this.reverb);
        this.reverb.connect(this.masterGain);
      }

      // Always connect dry signal
      currentNode.connect(this.masterGain);
    } catch (error) {
      console.error('Error connecting effects:', error);
      // Fallback to direct connection
      source.connect(this.masterGain);
    }
  }

  public playDrumSound(sound: DrumSound): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) return;

    // Try to resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.resume().catch(console.error);
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      // Configure based on drum type
      switch (sound.type) {
        case 'kick':
          oscillator.frequency.value = 60;
          oscillator.type = 'sine';
          filter.type = 'lowpass';
          filter.frequency.value = 100;
          break;
        case 'snare':
          oscillator.frequency.value = 200;
          oscillator.type = 'square';
          filter.type = 'highpass';
          filter.frequency.value = 1000;
          break;
        case 'hihat':
          oscillator.frequency.value = 8000;
          oscillator.type = 'square';
          filter.type = 'highpass';
          filter.frequency.value = 5000;
          break;
        default:
          oscillator.frequency.value = sound.frequency || 440;
          oscillator.type = 'square';
      }

      // Connect and configure envelope
      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.masterGain);

      const now = this.audioContext.currentTime;
      const decay = sound.decay || 0.1;

      envelope.gain.setValueAtTime(0.8, now);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + decay);

      oscillator.start(now);
      setTimeout(() => {
        try {
          oscillator.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
      }, decay * 1000);
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
        note.oscillator.stop();
      } catch (error) {
        // Ignore errors when stopping oscillators
      }
    });
    this.activeNotes.clear();
    
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
    this.filter = null;
    this.distortion = null;
    this.chorus = null;
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