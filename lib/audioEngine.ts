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
  private activeNotes: Map<string, { 
    oscillators: OscillatorNode[]; 
    envelope: GainNode; 
    filter?: BiquadFilterNode; 
    effectsChain?: AudioNode[];
    startTime: number;
    velocity: number;
    noteId: string;
    priority: number;
    releaseStarted?: boolean; // CRITICAL FIX: Track if release has started
    sustainPedal?: boolean; // CRITICAL FIX: Track if note was affected by sustain
  }> = new Map();
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private maxPolyphony: number = 64; // Increased for better polyphonic support
  private voiceManager: Map<string, { time: number; priority: number }> = new Map();
  private noteIdCounter: number = 0;
  private voiceStealingEnabled: boolean = true;
  private polyphonicMode: boolean = true;

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
      console.log('Starting enhanced audio engine initialization...');

      // Check for Web Audio API support
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Create audio context with optimal settings for polyphony
      console.log('Creating audio context with enhanced polyphonic settings...');
      this.audioContext = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 44100
      });

      // Check if context was created successfully
      if (!this.audioContext) {
        throw new Error('Failed to create audio context');
      }

      console.log('Audio context created, state:', this.audioContext.state);

      // Create basic audio nodes first
      console.log('Creating enhanced audio nodes...');
      this.masterGain = this.audioContext.createGain();
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.analyser = this.audioContext.createAnalyser();
      this.filter = this.audioContext.createBiquadFilter();

      if (!this.masterGain || !this.compressor || !this.analyser || !this.filter) {
        throw new Error('Failed to create required audio nodes');
      }

      // Set up the basic audio chain
      console.log('Setting up enhanced audio chain...');
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.filter);
      this.filter.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Configure analyser for better visualization
      this.analyser.fftSize = 4096; // Increased for better frequency resolution
      this.analyser.smoothingTimeConstant = 0.85;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Configure compressor for enhanced polyphonic playback
      this.compressor.threshold.value = -12; // More aggressive to handle polyphony
      this.compressor.knee.value = 20;
      this.compressor.ratio.value = 6;
      this.compressor.attack.value = 0.0005; // Faster attack for transients
      this.compressor.release.value = 0.05; // Faster release to avoid pumping

      // Configure filter
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 20000;
      this.filter.Q.value = 0.7;

      // Set initial master volume (lower for polyphonic content)
      this.masterGain.gain.value = 0.6;

      // Initialize effects (non-critical, don't let this fail initialization)
      console.log('Initializing enhanced effects...');
      try {
        await this.initializeEffects();
      } catch (effectsError) {
        console.warn('Effects initialization failed, continuing without effects:', effectsError);
      }

      // Mark as initialized before trying to resume context
      this.isInitialized = true;

      // Handle suspended context (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        console.log('Audio context is suspended, will resume on user interaction');
        // Don't throw here - this is expected behavior
      }

      console.log('Enhanced audio engine initialization completed successfully');
      console.log(`Polyphonic support: ${this.maxPolyphony} voices, voice stealing: ${this.voiceStealingEnabled}`);
    } catch (error) {
      console.error('Enhanced audio engine initialization failed:', error);
      this.cleanup();
      throw new Error(`Enhanced audio engine initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async initializeEffects(): Promise<void> {
    if (!this.audioContext) return;

    try {
      console.log('Creating enhanced reverb...');
      // Create enhanced reverb impulse response
      this.reverb = this.audioContext.createConvolver();
      const impulseLength = Math.min(this.audioContext.sampleRate * 3, 132300); // Longer for richer reverb
      const impulse = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
          const decay = Math.pow(1 - i / impulseLength, 2.5); // More natural decay
          const noise = (Math.random() * 2 - 1) * decay;
          const earlyReflection = Math.sin(i * 0.01) * decay * 0.3;
          channelData[i] = noise + earlyReflection;
        }
      }
      this.reverb.buffer = impulse;

      console.log('Creating enhanced delay...');
      // Create delay with enhanced feedback
      this.delay = this.audioContext.createDelay(2.0); // Longer delay time
      this.delayFeedback = this.audioContext.createGain();
      this.delayFeedback.gain.value = 0.25; // Reduced for polyphonic content
      this.delay.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delay);

      console.log('Creating enhanced distortion...');
      // Create enhanced distortion
      this.distortion = this.audioContext.createWaveShaper();
      this.updateDistortionCurve('soft', 20); // Gentler for polyphonic content
      this.distortion.oversample = '4x';

      console.log('Creating enhanced chorus...');
      // Create enhanced chorus (using delay and LFO)
      this.chorus = this.audioContext.createDelay(0.03); // Slightly longer for richer effect
      this.chorusLFO = this.audioContext.createOscillator();
      this.chorusGain = this.audioContext.createGain();
      this.chorusLFO.connect(this.chorusGain);
      this.chorusGain.connect(this.chorus.delayTime);
      this.chorusLFO.frequency.value = 0.7; // Slower for smoother effect
      this.chorusGain.gain.value = 0.008;
      this.chorusLFO.start();

      console.log('Enhanced effects initialization completed');
    } catch (error) {
      console.error('Enhanced effects initialization failed:', error);
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
          curve[i] = Math.tanh(x * (amount / 25)) * 0.6; // Gentler for polyphony
          break;
        case 'hard':
          curve[i] = Math.max(-0.7, Math.min(0.7, x * (amount / 15)));
          break;
        case 'tube':
          const abs_x = Math.abs(x * (amount / 35));
          if (abs_x < 0.6) {
            curve[i] = x * 1.8;
          } else {
            curve[i] = Math.sign(x) * (0.8 + (abs_x - 0.6) * 0.4);
          }
          curve[i] *= 0.5;
          break;
        case 'fuzz':
          curve[i] = Math.sign(x) * Math.pow(Math.abs(x * (amount / 35)), 0.4) * 0.7;
          break;
        case 'bitcrush':
          const bits = Math.max(2, 10 - Math.floor(amount / 10));
          const step = Math.pow(2, bits - 1);
          curve[i] = Math.round(x * step) / step;
          break;
        default:
          curve[i] = Math.tanh(x * (amount / 25)) * 0.6;
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

  // Enhanced polyphonic note playing with advanced voice management
  public playNote(frequency: number, synthState: SynthState, velocity: number = 0.8): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized, cannot play note');
      return;
    }

    // Try to resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.resume().catch(console.error);
      return;
    }

    const noteKey = frequency.toFixed(3); // Higher precision for better note tracking
    const noteId = `note_${this.noteIdCounter++}`;
    const priority = this.calculateNotePriority(frequency, velocity);
    
    // CRITICAL FIX: Stop existing note if playing same frequency to prevent stuck notes
    if (this.activeNotes.has(noteKey)) {
      this.stopNote(frequency);
    }

    // Enhanced voice management with priority system
    if (this.activeNotes.size >= this.maxPolyphony && this.voiceStealingEnabled) {
      this.stealVoiceWithPriority(priority);
    }

    try {
      const now = this.audioContext.currentTime;

      // Create enhanced oscillator stack for richer sound
      const oscillators: OscillatorNode[] = [];
      const mixer = this.audioContext.createGain();
      mixer.gain.value = 0.3; // Reduced for polyphonic content

      // Main oscillator with enhanced configuration
      const mainOscillator = this.audioContext.createOscillator();
      mainOscillator.type = synthState.oscillatorType;
      mainOscillator.frequency.value = frequency;
      
      // Add subtle frequency modulation for organic feel
      const fmOsc = this.audioContext.createOscillator();
      const fmGain = this.audioContext.createGain();
      fmOsc.type = 'sine';
      fmOsc.frequency.value = frequency * 0.01; // Very subtle FM
      fmGain.gain.value = 0.5;
      fmOsc.connect(fmGain);
      fmGain.connect(mainOscillator.frequency);
      fmOsc.start(now);
      
      const mainGain = this.audioContext.createGain();
      mainGain.gain.value = 0.7;
      mainOscillator.connect(mainGain);
      mainGain.connect(mixer);
      oscillators.push(mainOscillator, fmOsc);

      // Sub oscillator for warmth (only for lower frequencies)
      if (frequency < 500) {
        const subOscillator = this.audioContext.createOscillator();
        subOscillator.type = 'sine';
        subOscillator.frequency.value = frequency / 2;
        
        const subGain = this.audioContext.createGain();
        subGain.gain.value = 0.15; // Reduced for polyphonic content
        subOscillator.connect(subGain);
        subGain.connect(mixer);
        oscillators.push(subOscillator);
      }

      // Slight detune for thickness (only for certain waveforms)
      if (synthState.oscillatorType !== 'sine' && frequency > 100) {
        const detuneOscillator = this.audioContext.createOscillator();
        detuneOscillator.type = synthState.oscillatorType;
        detuneOscillator.frequency.value = frequency * 1.005; // Subtle detune
        
        const detuneGain = this.audioContext.createGain();
        detuneGain.gain.value = 0.2; // Reduced for polyphonic content
        detuneOscillator.connect(detuneGain);
        detuneGain.connect(mixer);
        oscillators.push(detuneOscillator);
      }

      // Create per-note filter for better polyphonic control
      const noteFilter = this.audioContext.createBiquadFilter();
      noteFilter.type = 'lowpass';
      noteFilter.frequency.value = synthState.filterCutoff;
      noteFilter.Q.value = Math.min(synthState.filterResonance, 15); // Limit Q for stability

      // Create envelope with velocity sensitivity
      const envelope = this.audioContext.createGain();
      envelope.gain.value = 0;

      // Connect audio chain
      mixer.connect(noteFilter);
      noteFilter.connect(envelope);
      
      // Create effects chain for this note
      const effectsChain = this.createEffectsChain(synthState);
      this.connectToEffectsChain(envelope, effectsChain);

      // Apply ADSR envelope with enhanced velocity sensitivity
      const noteVolume = synthState.volume * velocity * 0.7; // Reduced for polyphonic content
      const velocityCurve = Math.pow(velocity, 1.5); // More expressive velocity curve
      
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(noteVolume * velocityCurve, now + synthState.attack);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.001, noteVolume * velocityCurve * synthState.sustain),
        now + synthState.attack + synthState.decay
      );

      // Apply enhanced filter envelope with velocity sensitivity
      const filterEnvelope = synthState.filterCutoff * 0.3 * velocity;
      noteFilter.frequency.setValueAtTime(synthState.filterCutoff, now);
      noteFilter.frequency.linearRampToValueAtTime(
        Math.min(20000, synthState.filterCutoff + filterEnvelope),
        now + synthState.attack
      );
      noteFilter.frequency.exponentialRampToValueAtTime(
        Math.max(20, synthState.filterCutoff + filterEnvelope * synthState.sustain),
        now + synthState.attack + synthState.decay
      );

      // Start all oscillators
      oscillators.forEach(osc => osc.start(now));

      // CRITICAL FIX: Store active note with enhanced metadata including release tracking
      this.activeNotes.set(noteKey, { 
        oscillators, 
        envelope,
        filter: noteFilter,
        effectsChain,
        startTime: now,
        velocity,
        noteId,
        priority,
        releaseStarted: false, // Track if release has started
        sustainPedal: false   // Track if affected by sustain pedal
      });

      // Track voice usage with priority
      this.voiceManager.set(noteKey, { time: now, priority });

    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  // Calculate note priority for voice stealing
  private calculateNotePriority(frequency: number, velocity: number): number {
    // Higher priority = more important note
    let priority = velocity * 1000; // Base priority from velocity
    
    // Favor notes in musical range
    if (frequency >= 220 && frequency <= 880) {
      priority += 500;
    }
    
    // Favor louder notes
    priority += velocity * 200;
    
    // Add some randomness to avoid always stealing the same notes
    priority += Math.random() * 100;
    
    return priority;
  }

  // Enhanced voice stealing with priority system
  private stealVoiceWithPriority(newNotePriority: number): void {
    if (this.voiceManager.size === 0) return;

    let victimNote = '';
    let lowestPriority = Infinity;
    let oldestTime = Infinity;

    // Find the note with lowest priority, or oldest if priorities are similar
    this.voiceManager.forEach((voiceData, noteKey) => {
      if (voiceData.priority < lowestPriority || 
          (Math.abs(voiceData.priority - lowestPriority) < 50 && voiceData.time < oldestTime)) {
        lowestPriority = voiceData.priority;
        oldestTime = voiceData.time;
        victimNote = noteKey;
      }
    });

    // Only steal if the new note has higher priority
    if (victimNote && newNotePriority > lowestPriority + 100) {
      const frequency = parseFloat(victimNote);
      this.stopNote(frequency);
      console.log(`Voice stolen: ${victimNote} (priority: ${lowestPriority}) for new note (priority: ${newNotePriority})`);
    }
  }

  private createEffectsChain(synthState: SynthState): AudioNode[] {
    const chain: AudioNode[] = [];
    
    if (!this.audioContext || !this.masterGain) return chain;

    try {
      // Distortion first (reduced for polyphonic content)
      if (synthState.effects.distortion?.active && this.distortion) {
        this.updateDistortionCurve(
          synthState.effects.distortion.type || 'soft',
          (synthState.effects.distortion.amount || 30) * 0.7 // Reduced for polyphony
        );
        chain.push(this.distortion);
      }

      // Chorus (enhanced for polyphonic content)
      if (synthState.effects.chorus?.active && this.chorus && this.chorusLFO && this.chorusGain) {
        this.chorusLFO.frequency.value = synthState.effects.chorus.rate || 0.7;
        this.chorusGain.gain.value = (synthState.effects.chorus.depth || 0.4) * 0.008;
        chain.push(this.chorus);
      }

      // Delay (reduced feedback for polyphonic content)
      if (synthState.effects.delay?.active && this.delay && this.delayFeedback) {
        this.delay.delayTime.value = synthState.effects.delay.time || 0.25;
        this.delayFeedback.gain.value = Math.min((synthState.effects.delay.feedback || 0.3) * 0.7, 0.6);
        chain.push(this.delay);
      }

      // Reverb last (enhanced for polyphonic content)
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
      // Always connect dry signal to master (reduced level for polyphonic content)
      const dryGain = this.audioContext!.createGain();
      dryGain.gain.value = 0.8; // Reduced dry level
      source.connect(dryGain);
      dryGain.connect(this.masterGain);

      // Connect wet signal through effects chain
      if (chain.length > 0) {
        const wetGain = this.audioContext!.createGain();
        wetGain.gain.value = 0.25; // Reduced wet level for polyphonic content
        
        source.connect(wetGain);
        let currentNode: AudioNode = wetGain;

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

  public playPianoNote(frequency: number, pianoSound: PianoSoundConfig, velocity: number = 0.8): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized, cannot play piano note');
      return;
    }

    // Try to resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.resume().catch(console.error);
      return;
    }

    const noteKey = frequency.toFixed(3);
    const noteId = `piano_${this.noteIdCounter++}`;
    const priority = this.calculateNotePriority(frequency, velocity) + 100; // Piano gets slight priority boost
    
    // CRITICAL FIX: Stop existing note if playing same frequency to prevent stuck notes
    if (this.activeNotes.has(noteKey)) {
      this.stopNote(frequency);
    }

    // Enhanced voice management
    if (this.activeNotes.size >= this.maxPolyphony && this.voiceStealingEnabled) {
      this.stealVoiceWithPriority(priority);
    }

    try {
      const now = this.audioContext.currentTime;
      const oscillators: OscillatorNode[] = [];
      const mixer = this.audioContext.createGain();
      mixer.gain.value = 0.4; // Adjusted for polyphonic content

      // Create main oscillator
      const mainOscillator = this.audioContext.createOscillator();
      mainOscillator.type = pianoSound.oscillatorType;
      mainOscillator.frequency.value = frequency;
      oscillators.push(mainOscillator);

      // Create harmonic oscillators (limited for polyphonic performance)
      if (pianoSound.harmonics && this.activeNotes.size < this.maxPolyphony * 0.7) {
        const maxHarmonics = Math.min(pianoSound.harmonics.length, 3); // Limit harmonics in polyphonic mode
        for (let i = 0; i < maxHarmonics; i++) {
          const harmonic = pianoSound.harmonics[i];
          const harmonicOsc = this.audioContext.createOscillator();
          harmonicOsc.type = harmonic.type;
          harmonicOsc.frequency.value = frequency * harmonic.frequency;
          
          const harmonicGain = this.audioContext.createGain();
          harmonicGain.gain.value = harmonic.gain * velocity * 0.6; // Reduced for polyphony
          
          harmonicOsc.connect(harmonicGain);
          harmonicGain.connect(mixer);
          oscillators.push(harmonicOsc);
        }
      }

      // Main oscillator connection
      const mainGain = this.audioContext.createGain();
      mainGain.gain.value = 0.8;
      mainOscillator.connect(mainGain);
      mainGain.connect(mixer);

      // Create filter for this note
      const noteFilter = this.audioContext.createBiquadFilter();
      noteFilter.type = pianoSound.filter.type;
      noteFilter.frequency.value = pianoSound.filter.frequency;
      noteFilter.Q.value = Math.min(pianoSound.filter.resonance, 20); // Limit Q for stability

      // Create envelope
      const envelope = this.audioContext.createGain();
      envelope.gain.value = 0;

      // Create volume control with velocity sensitivity
      const volumeGain = this.audioContext.createGain();
      volumeGain.gain.value = pianoSound.baseVolume * velocity * 0.6; // Reduced for polyphony

      // Connect the main audio chain
      mixer.connect(noteFilter);
      noteFilter.connect(envelope);
      envelope.connect(volumeGain);
      
      // Apply piano-specific effects
      this.connectPianoEffects(volumeGain, pianoSound);

      // Apply ADSR envelope with enhanced velocity curve
      const velocityScaled = this.applyVelocityCurve(velocity, pianoSound.velocity);
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(velocityScaled, now + pianoSound.envelope.attack);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.001, velocityScaled * pianoSound.envelope.sustain),
        now + pianoSound.envelope.attack + pianoSound.envelope.decay
      );

      // Apply filter envelope
      if (pianoSound.filter.envelopeAmount > 0) {
        const filterEnvelope = pianoSound.filter.envelopeAmount * 1500; // Reduced for polyphony
        noteFilter.frequency.setValueAtTime(pianoSound.filter.frequency, now);
        noteFilter.frequency.linearRampToValueAtTime(
          Math.min(20000, pianoSound.filter.frequency + filterEnvelope),
          now + pianoSound.envelope.attack
        );
        noteFilter.frequency.exponentialRampToValueAtTime(
          Math.max(100, pianoSound.filter.frequency + filterEnvelope * pianoSound.envelope.sustain),
          now + pianoSound.envelope.attack + pianoSound.envelope.decay
        );
      }

      // Start all oscillators
      oscillators.forEach(osc => osc.start(now));

      // CRITICAL FIX: Store active note with enhanced metadata including release tracking
      this.activeNotes.set(noteKey, { 
        oscillators, 
        envelope, 
        filter: noteFilter,
        startTime: now,
        velocity,
        noteId,
        priority,
        releaseStarted: false, // Track if release has started
        sustainPedal: false   // Track if affected by sustain pedal
      });

      this.voiceManager.set(noteKey, { time: now, priority });
    } catch (error) {
      console.error('Error playing piano note:', error);
    }
  }

  private applyVelocityCurve(velocity: number, velocityConfig: { curve: string; sensitivity: number }): number {
    const scaledVelocity = velocity * velocityConfig.sensitivity;
    
    switch (velocityConfig.curve) {
      case 'linear':
        return scaledVelocity;
      case 'exponential':
        return Math.pow(scaledVelocity, 1.8); // Slightly more exponential
      case 'logarithmic':
        return Math.log(scaledVelocity * 9 + 1) / Math.log(10);
      default:
        return scaledVelocity;
    }
  }

  private connectPianoEffects(source: AudioNode, pianoSound: PianoSoundConfig): void {
    if (!this.masterGain) return;

    let currentNode = source;

    try {
      // Apply EQ if specified (simplified for polyphonic performance)
      if (pianoSound.effects.eq) {
        const lowShelf = this.audioContext!.createBiquadFilter();
        const highShelf = this.audioContext!.createBiquadFilter();

        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 250;
        lowShelf.gain.value = (pianoSound.effects.eq.low - 1) * 8; // Reduced gain

        highShelf.type = 'highshelf';
        highShelf.frequency.value = 4000;
        highShelf.gain.value = (pianoSound.effects.eq.high - 1) * 8; // Reduced gain

        currentNode.connect(lowShelf);
        lowShelf.connect(highShelf);
        currentNode = highShelf;
      }

      // Apply compression if specified (lighter for polyphony)
      if (pianoSound.effects.compression && this.activeNotes.size < this.maxPolyphony * 0.5) {
        const compressor = this.audioContext!.createDynamicsCompressor();
        compressor.threshold.value = pianoSound.effects.compression.threshold + 6; // Higher threshold
        compressor.ratio.value = Math.min(pianoSound.effects.compression.ratio, 4); // Lower ratio
        compressor.attack.value = pianoSound.effects.compression.attack;
        compressor.release.value = pianoSound.effects.compression.release;
        
        currentNode.connect(compressor);
        currentNode = compressor;
      }

      // Apply chorus if specified (reduced level)
      if (pianoSound.effects.chorus && this.chorus) {
        const chorusGain = this.audioContext!.createGain();
        chorusGain.gain.value = pianoSound.effects.chorus.amount * 0.5; // Reduced for polyphony
        currentNode.connect(chorusGain);
        chorusGain.connect(this.chorus);
        this.chorus.connect(this.masterGain);
      }

      // Apply reverb if specified (reduced level)
      if (pianoSound.effects.reverb && this.reverb) {
        const reverbGain = this.audioContext!.createGain();
        reverbGain.gain.value = pianoSound.effects.reverb.amount * 0.6; // Reduced for polyphony
        currentNode.connect(reverbGain);
        reverbGain.connect(this.reverb);
        this.reverb.connect(this.masterGain);
      }

      // Always connect dry signal (enhanced level management)
      const dryGain = this.audioContext!.createGain();
      dryGain.gain.value = 0.8;
      currentNode.connect(dryGain);
      dryGain.connect(this.masterGain);
    } catch (error) {
      console.error('Error connecting piano effects:', error);
      source.connect(this.masterGain);
    }
  }

  // CRITICAL FIX: Enhanced stop note with immediate release
  public stopNote(frequency: number): void {
    if (!this.isInitialized || !this.audioContext) return;

    const noteKey = frequency.toFixed(3);
    const activeNote = this.activeNotes.get(noteKey);

    if (activeNote) {
      try {
        // CRITICAL FIX: Prevent double-release
        if (activeNote.releaseStarted) {
          return;
        }
        
        // Mark release as started
        activeNote.releaseStarted = true;

        const { oscillators, envelope } = activeNote;
        const now = this.audioContext.currentTime;

        // CRITICAL FIX: Use very fast release for immediate response
        const releaseTime = 0.05; // Very fast release (50ms)

        // CRITICAL FIX: Use proper exponential release for musical feel
        envelope.gain.cancelScheduledValues(now);
        envelope.gain.setValueAtTime(Math.max(envelope.gain.value, 0.001), now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

        // CRITICAL FIX: Stop all oscillators after release with proper timing
        const stopTime = now + releaseTime + 0.01; // Very small buffer for envelope completion
        
        // Stop oscillators immediately after release
        setTimeout(() => {
          try {
            oscillators.forEach(osc => {
              if (osc.context.state !== 'closed') {
                try {
                  osc.stop(stopTime);
                } catch (stopError) {
                  // Oscillator might already be stopped
                  console.debug('Oscillator already stopped:', stopError);
                }
              }
            });
          } catch (e) {
            console.debug('Error stopping oscillators:', e);
          }
          
          // Clean up after audio has stopped
          setTimeout(() => {
            this.activeNotes.delete(noteKey);
            this.voiceManager.delete(noteKey);
          }, 100);
        }, 10); // Start stop process almost immediately

      } catch (error) {
        console.error('Error stopping note:', error);
        // Always clean up tracking even if stopping fails
        this.activeNotes.delete(noteKey);
        this.voiceManager.delete(noteKey);
      }
    }
  }

  // Enhanced stop all notes with graceful fade
  public stopAllNotes(): void {
    const activeNoteKeys = Array.from(this.activeNotes.keys());
    
    if (activeNoteKeys.length > 0) {
      console.log(`Stopping ${activeNoteKeys.length} active notes`);
      
      // Use Promise.all to stop notes in parallel for better performance
      const stopPromises = activeNoteKeys.map(noteKey => {
        return new Promise<void>((resolve) => {
          const frequency = parseFloat(noteKey);
          this.stopNote(frequency);
          resolve();
        });
      });
      
      Promise.all(stopPromises).catch(console.error);
    }
  }

  public playDrumSound(sound: DrumSoundConfig): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized, cannot play drum sound');
      return;
    }

    // Try to resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.resume().catch(console.error);
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      // Create drum sound synthesis (optimized for polyphonic performance)
      const oscillator = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();
      const volumeGain = this.audioContext.createGain();
      
      // Configure oscillator based on drum type
      oscillator.type = sound.oscillatorType || 'sine';
      
      // Adjust frequency based on drum type
      let baseFreq = sound.frequency;
      switch (sound.type) {
        case 'kick':
          baseFreq = Math.max(35, Math.min(120, sound.frequency));
          oscillator.type = 'sine';
          break;
        case 'snare':
          baseFreq = Math.max(150, Math.min(400, sound.frequency));
          oscillator.type = 'square';
          break;
        case 'hihat':
        case 'openhat':
          baseFreq = Math.max(8000, Math.min(15000, sound.frequency));
          oscillator.type = 'square';
          break;
        default:
          baseFreq = sound.frequency;
      }
      
      oscillator.frequency.value = baseFreq;
      
      // Configure volume (reduced for polyphonic content)
      volumeGain.gain.value = Math.max(0.05, Math.min(0.8, (sound.volume || 0.8) * 0.7));
      
      // Create noise for snare/hihat sounds (optimized)
      let noiseSource: AudioBufferSourceNode | null = null;
      let noiseMixer: GainNode | null = null;
      
      if (['snare', 'hihat', 'openhat', 'clap'].includes(sound.type)) {
        try {
          const bufferSize = Math.min(this.audioContext.sampleRate * 0.05, 22050); // Smaller buffer
          const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          
          // Generate filtered noise for better drum sounds
          let lastSample = 0;
          for (let i = 0; i < bufferSize; i++) {
            const whitenoise = Math.random() * 2 - 1;
            // Simple high-pass filter for hihat/snare character
            const filtered = whitenoise - lastSample * 0.95;
            output[i] = filtered;
            lastSample = whitenoise;
          }
          
          noiseSource = this.audioContext.createBufferSource();
          noiseSource.buffer = noiseBuffer;
          
          noiseMixer = this.audioContext.createGain();
          
          // Set noise amount based on drum type
          switch (sound.type) {
            case 'snare':
              noiseMixer.gain.value = 0.5;
              break;
            case 'hihat':
            case 'openhat':
              noiseMixer.gain.value = 0.7;
              break;
            case 'clap':
              noiseMixer.gain.value = 0.4;
              break;
            default:
              noiseMixer.gain.value = 0.25;
          }
          
          noiseSource.connect(noiseMixer);
        } catch (noiseError) {
          console.warn('Failed to create noise source:', noiseError);
        }
      }
      
      // Connect the audio chain
      const mixer = this.audioContext.createGain();
      oscillator.connect(mixer);
      if (noiseMixer) {
        noiseMixer.connect(mixer);
      }
      
      mixer.connect(envelope);
      envelope.connect(volumeGain);
      volumeGain.connect(this.masterGain);
      
      // Apply enhanced envelope based on drum type
      const attack = 0.001;
      let decay = sound.decay || 0.4;
      let sustain = 0.2;
      let release = decay * 0.6;
      
      // Adjust envelope based on drum type
      switch (sound.type) {
        case 'kick':
          decay = Math.min(1.2, Math.max(0.2, decay));
          sustain = 0.3;
          release = decay * 0.5;
          break;
        case 'snare':
        case 'clap':
          decay = Math.min(0.25, Math.max(0.08, decay));
          sustain = 0.08;
          release = decay * 0.4;
          break;
        case 'hihat':
          decay = Math.min(0.12, Math.max(0.03, decay));
          sustain = 0.03;
          release = decay * 0.2;
          break;
        case 'openhat':
          decay = Math.min(0.6, Math.max(0.15, decay));
          sustain = 0.15;
          release = decay * 0.4;
          break;
        default:
          break;
      }
      
      // Apply envelope with smooth transitions
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(1, now + attack);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.001, sustain),
        now + attack + decay
      );
      envelope.gain.exponentialRampToValueAtTime(
        0.001,
        now + attack + decay + release
      );
      
      // Start sources
      oscillator.start(now);
      if (noiseSource) {
        noiseSource.start(now);
      }
      
      // Stop sources after total time
      const stopTime = now + attack + decay + release + 0.05;
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
        
        this.mediaRecorder = new MediaRecorder(dest.stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        this.recordedChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
      }

      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('Recording started with enhanced polyphonic support');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          console.log('Recording stopped, blob size:', blob.size);
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
      // Smooth volume changes to prevent clicking
      const now = this.audioContext?.currentTime || 0;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), now + 0.05);
    }
  }

  public getActiveNoteCount(): number {
    return this.activeNotes.size;
  }

  public getMaxPolyphony(): number {
    return this.maxPolyphony;
  }

  public setMaxPolyphony(polyphony: number): void {
    const newPolyphony = Math.max(1, Math.min(128, polyphony));
    console.log(`Setting max polyphony to ${newPolyphony} (was ${this.maxPolyphony})`);
    this.maxPolyphony = newPolyphony;
    
    // If we're over the new limit, stop oldest notes
    if (this.activeNotes.size > newPolyphony) {
      const notesToStop = this.activeNotes.size - newPolyphony;
      const oldestNotes = Array.from(this.voiceManager.entries())
        .sort((a, b) => a[1].time - b[1].time)
        .slice(0, notesToStop);
      
      oldestNotes.forEach(([noteKey]) => {
        const frequency = parseFloat(noteKey);
        this.stopNote(frequency);
      });
    }
  }

  public setVoiceStealingEnabled(enabled: boolean): void {
    this.voiceStealingEnabled = enabled;
    console.log(`Voice stealing ${enabled ? 'enabled' : 'disabled'}`);
  }

  public setPolyphonicMode(enabled: boolean): void {
    this.polyphonicMode = enabled;
    console.log(`Polyphonic mode ${enabled ? 'enabled' : 'disabled'}`);
    
    // If switching to monophonic, stop all but the most recent note
    if (!enabled && this.activeNotes.size > 1) {
      const mostRecentNote = Array.from(this.voiceManager.entries())
        .sort((a, b) => b[1].time - a[1].time)[0];
      
      this.activeNotes.forEach((_, noteKey) => {
        if (noteKey !== mostRecentNote[0]) {
          const frequency = parseFloat(noteKey);
          this.stopNote(frequency);
        }
      });
    }
  }

  public getVoiceStealingEnabled(): boolean {
    return this.voiceStealingEnabled;
  }

  public getPolyphonicMode(): boolean {
    return this.polyphonicMode;
  }

  // Get detailed voice information for debugging
  public getVoiceInfo(): Array<{noteKey: string, priority: number, age: number, velocity: number}> {
    const now = Date.now();
    return Array.from(this.voiceManager.entries()).map(([noteKey, voiceData]) => {
      const activeNote = this.activeNotes.get(noteKey);
      return {
        noteKey,
        priority: voiceData.priority,
        age: now - (voiceData.time * 1000),
        velocity: activeNote?.velocity || 0
      };
    }).sort((a, b) => b.priority - a.priority);
  }

  private cleanup(): void {
    // Stop all active notes gracefully
    this.stopAllNotes();
    
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
    
    this.activeNotes.clear();
    this.voiceManager.clear();
    this.isInitialized = false;
  }

  public destroy(): void {
    console.log('Destroying enhanced audio engine...');
    this.cleanup();
  }

  public get initialized(): boolean {
    return this.isInitialized && this.audioContext !== null && this.audioContext.state !== 'closed';
  }

  public get contextState(): string {
    return this.audioContext?.state || 'closed';
  }
}