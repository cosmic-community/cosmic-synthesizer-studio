export interface AdvancedEffectProcessor {
  id: string;
  name: string;
  type: 'reverb' | 'delay' | 'modulation' | 'distortion' | 'dynamics' | 'filter' | 'eq' | 'spatial';
  input: AudioNode;
  output: AudioNode;
  parameters: Map<string, AudioParam | any>;
  active: boolean;
  bypass(): void;
  activate(): void;
  updateParameter(param: string, value: number): void;
  getAnalysisData?(): any;
}

// Advanced Convolution Reverb with Room Modeling
export class ConvolutionReverb implements AdvancedEffectProcessor {
  public id = 'convolution-reverb';
  public name = 'Convolution Reverb';
  public type: 'reverb' = 'reverb';
  public input: GainNode;
  public output: GainNode;
  public parameters = new Map();
  public active = false;

  private context: AudioContext;
  private convolver: ConvolverNode;
  private earlyReflections: DelayNode[] = [];
  private lateReverb: ConvolverNode;
  private predelay: DelayNode;
  private damping: BiquadFilterNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private widthProcessor: ChannelSplitterNode;
  private widthMerger: ChannelMergerNode;
  private currentRoomType = 'hall';

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.convolver = audioContext.createConvolver();
    this.lateReverb = audioContext.createConvolver();
    this.predelay = audioContext.createDelay(0.5);
    this.damping = audioContext.createBiquadFilter();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.widthProcessor = audioContext.createChannelSplitter(2);
    this.widthMerger = audioContext.createChannelMerger(2);

    this.setupEarlyReflections();
    this.setupLateReverb();
    this.connectNodes();
    this.initializeParameters();
  }

  private setupEarlyReflections(): void {
    const reflectionPattern = {
      hall: [0.012, 0.023, 0.041, 0.067, 0.089, 0.109, 0.127, 0.149],
      room: [0.005, 0.011, 0.018, 0.024, 0.031, 0.038],
      chamber: [0.008, 0.016, 0.029, 0.045, 0.063, 0.082, 0.103],
      cathedral: [0.020, 0.045, 0.078, 0.112, 0.151, 0.194, 0.241, 0.293],
      plate: [0.003, 0.007, 0.012, 0.018, 0.025, 0.033],
      spring: [0.001, 0.003, 0.006, 0.010, 0.015, 0.021]
    };

    const gainPattern = {
      hall: [0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3, 0.25],
      room: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
      chamber: [0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25],
      cathedral: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35],
      plate: [0.95, 0.9, 0.85, 0.8, 0.75, 0.7],
      spring: [0.98, 0.95, 0.92, 0.89, 0.86, 0.83]
    };

    this.generateEarlyReflections(
      reflectionPattern[this.currentRoomType as keyof typeof reflectionPattern],
      gainPattern[this.currentRoomType as keyof typeof gainPattern]
    );
  }

  private generateEarlyReflections(times: number[], gains: number[]): void {
    // Clear existing reflections
    this.earlyReflections.forEach(delay => delay.disconnect());
    this.earlyReflections = [];

    times.forEach((time, index) => {
      const delay = this.context.createDelay(0.5);
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();

      delay.delayTime.value = time;
      gain.gain.value = gains[index] || 0.1;
      
      // Add frequency-dependent decay
      filter.type = 'lowpass';
      filter.frequency.value = 8000 - (index * 500);
      filter.Q.value = 0.7;

      this.input.connect(delay);
      delay.connect(filter);
      filter.connect(gain);
      gain.connect(this.output);

      this.earlyReflections.push(delay);
    });
  }

  private setupLateReverb(): void {
    this.generateImpulseResponse(this.currentRoomType, 2.0, 0.8);
  }

  private generateImpulseResponse(roomType: string, decayTime: number, damping: number): void {
    const roomCharacteristics = {
      hall: { length: 3.0, diffusion: 0.8, absorption: 0.3 },
      room: { length: 1.2, diffusion: 0.6, absorption: 0.5 },
      chamber: { length: 2.0, diffusion: 0.7, absorption: 0.4 },
      cathedral: { length: 4.5, diffusion: 0.9, absorption: 0.2 },
      plate: { length: 0.8, diffusion: 0.9, absorption: 0.6 },
      spring: { length: 0.5, diffusion: 0.5, absorption: 0.7 }
    };

    const room = roomCharacteristics[roomType as keyof typeof roomCharacteristics] || roomCharacteristics.hall;
    const length = Math.floor(this.context.sampleRate * room.length);
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const decay = Math.pow(1 - t, decayTime * room.absorption);
        
        // Generate complex reflection pattern
        let sample = 0;
        for (let harmonic = 1; harmonic <= 8; harmonic++) {
          const harmonicFrequency = 440 * harmonic;
          const phase = Math.random() * Math.PI * 2;
          const amplitude = decay / harmonic;
          sample += amplitude * Math.sin(2 * Math.PI * harmonicFrequency * t + phase);
        }
        
        // Add diffusion
        const diffusion = (Math.random() * 2 - 1) * room.diffusion * decay;
        sample = sample * (1 - room.diffusion) + diffusion * room.diffusion;
        
        // Apply damping (frequency-dependent decay)
        const dampingFactor = 1 - (damping * t * (harmonicFrequency / 1000));
        sample *= Math.max(0.1, dampingFactor);
        
        channelData[i] = sample * 0.3;
      }
    }

    this.lateReverb.buffer = impulse;
  }

  private connectNodes(): void {
    // Setup signal routing
    this.input.connect(this.predelay);
    this.input.connect(this.dryGain);
    
    this.predelay.connect(this.damping);
    this.damping.connect(this.lateReverb);
    this.lateReverb.connect(this.wetGain);
    
    // Stereo width processing
    this.wetGain.connect(this.widthProcessor);
    this.widthProcessor.connect(this.widthMerger, 0, 0);
    this.widthProcessor.connect(this.widthMerger, 1, 1);
    
    this.widthMerger.connect(this.output);
    this.dryGain.connect(this.output);

    // Setup damping filter
    this.damping.type = 'lowpass';
    this.damping.frequency.value = 8000;
    this.damping.Q.value = 0.7;
  }

  private initializeParameters(): void {
    this.parameters.set('roomSize', { value: 0.5, min: 0, max: 1 });
    this.parameters.set('damping', { value: 0.5, min: 0, max: 1 });
    this.parameters.set('predelay', { value: 0, min: 0, max: 500 });
    this.parameters.set('width', { value: 1.0, min: 0, max: 2 });
    this.parameters.set('wetLevel', { value: 0.3, min: 0, max: 1 });
    this.parameters.set('dryLevel', { value: 0.7, min: 0, max: 1 });
    this.parameters.set('roomType', { value: 'hall', options: ['hall', 'room', 'chamber', 'cathedral', 'plate', 'spring'] });
  }

  public updateParameter(param: string, value: number | string): void {
    const parameter = this.parameters.get(param);
    if (!parameter) return;

    switch (param) {
      case 'roomSize':
        parameter.value = value;
        this.generateImpulseResponse(this.currentRoomType, 0.5 + (value as number) * 2.5, this.parameters.get('damping')?.value || 0.5);
        break;
      case 'damping':
        parameter.value = value;
        this.damping.frequency.value = 20000 * (1 - (value as number) * 0.9);
        break;
      case 'predelay':
        parameter.value = value;
        this.predelay.delayTime.value = (value as number) / 1000;
        break;
      case 'width':
        parameter.value = value;
        // Implement stereo width control
        break;
      case 'wetLevel':
        parameter.value = value;
        this.wetGain.gain.value = value as number;
        break;
      case 'dryLevel':
        parameter.value = value;
        this.dryGain.gain.value = value as number;
        break;
      case 'roomType':
        parameter.value = value;
        this.currentRoomType = value as string;
        this.setupEarlyReflections();
        this.setupLateReverb();
        break;
    }
  }

  public bypass(): void {
    this.active = false;
    this.wetGain.gain.value = 0;
    this.dryGain.gain.value = 1;
  }

  public activate(): void {
    this.active = true;
    this.wetGain.gain.value = this.parameters.get('wetLevel')?.value || 0.3;
    this.dryGain.gain.value = this.parameters.get('dryLevel')?.value || 0.7;
  }
}

// Multi-Tap Delay with Advanced Filtering
export class MultiTapDelay implements AdvancedEffectProcessor {
  public id = 'multi-tap-delay';
  public name = 'Multi-Tap Delay';
  public type: 'delay' = 'delay';
  public input: GainNode;
  public output: GainNode;
  public parameters = new Map();
  public active = false;

  private context: AudioContext;
  private delays: DelayNode[] = [];
  private feedbacks: GainNode[] = [];
  private filters: BiquadFilterNode[] = [];
  private panners: StereoPannerNode[] = [];
  private wetGain: GainNode;
  private dryGain: GainNode;
  private feedbackSum: GainNode;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.feedbackSum = audioContext.createGain();

    this.setupDelayTaps();
    this.connectNodes();
    this.initializeParameters();
  }

  private setupDelayTaps(): void {
    const tapTimes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0];
    const tapGains = [0.8, 0.6, 0.4, 0.3, 0.25, 0.2, 0.15, 0.1];
    const tapPans = [-0.8, 0.6, -0.4, 0.2, -0.6, 0.8, -0.2, 0.4];

    tapTimes.forEach((time, index) => {
      const delay = this.context.createDelay(2.0);
      const feedback = this.context.createGain();
      const filter = this.context.createBiquadFilter();
      const panner = this.context.createStereoPanner();

      delay.delayTime.value = time;
      feedback.gain.value = tapGains[index];
      
      filter.type = 'lowpass';
      filter.frequency.value = 8000 - (index * 800);
      filter.Q.value = 0.5;

      panner.pan.value = tapPans[index];

      // Connect tap
      this.input.connect(delay);
      delay.connect(filter);
      filter.connect(feedback);
      feedback.connect(panner);
      panner.connect(this.wetGain);

      // Connect feedback
      feedback.connect(this.feedbackSum);

      this.delays.push(delay);
      this.feedbacks.push(feedback);
      this.filters.push(filter);
      this.panners.push(panner);
    });
  }

  private connectNodes(): void {
    // Connect feedback sum back to delays
    this.delays.forEach(delay => {
      this.feedbackSum.connect(delay);
    });

    // Mix wet and dry
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);
    this.wetGain.connect(this.output);

    // Set initial levels
    this.dryGain.gain.value = 0.7;
    this.wetGain.gain.value = 0.3;
    this.feedbackSum.gain.value = 0.3;
  }

  private initializeParameters(): void {
    this.parameters.set('time', { value: 0.25, min: 0.01, max: 2.0 });
    this.parameters.set('feedback', { value: 0.3, min: 0, max: 0.95 });
    this.parameters.set('wetLevel', { value: 0.3, min: 0, max: 1 });
    this.parameters.set('highCut', { value: 8000, min: 200, max: 20000 });
    this.parameters.set('stereoWidth', { value: 1.0, min: 0, max: 2.0 });
    this.parameters.set('sync', { value: false });
  }

  public updateParameter(param: string, value: number | boolean): void {
    const parameter = this.parameters.get(param);
    if (!parameter) return;

    switch (param) {
      case 'time':
        parameter.value = value;
        this.delays.forEach((delay, index) => {
          delay.delayTime.value = (value as number) * (index + 1) / 8;
        });
        break;
      case 'feedback':
        parameter.value = value;
        this.feedbackSum.gain.value = value as number;
        break;
      case 'wetLevel':
        parameter.value = value;
        this.wetGain.gain.value = value as number;
        this.dryGain.gain.value = 1 - (value as number);
        break;
      case 'highCut':
        parameter.value = value;
        this.filters.forEach((filter, index) => {
          filter.frequency.value = (value as number) - (index * 500);
        });
        break;
      case 'stereoWidth':
        parameter.value = value;
        this.panners.forEach((panner, index) => {
          const basePan = [-0.8, 0.6, -0.4, 0.2, -0.6, 0.8, -0.2, 0.4][index];
          panner.pan.value = basePan * (value as number);
        });
        break;
    }
  }

  public bypass(): void {
    this.active = false;
    this.wetGain.gain.value = 0;
    this.dryGain.gain.value = 1;
  }

  public activate(): void {
    this.active = true;
    this.wetGain.gain.value = this.parameters.get('wetLevel')?.value || 0.3;
    this.dryGain.gain.value = 1 - (this.parameters.get('wetLevel')?.value || 0.3);
  }
}

// Vintage Chorus with Multiple LFO Shapes
export class VintageChorus implements AdvancedEffectProcessor {
  public id = 'vintage-chorus';
  public name = 'Vintage Chorus';
  public type: 'modulation' = 'modulation';
  public input: GainNode;
  public output: GainNode;
  public parameters = new Map();
  public active = false;

  private context: AudioContext;
  private delays: DelayNode[] = [];
  private lfos: OscillatorNode[] = [];
  private lfoGains: GainNode[] = [];
  private voiceGains: GainNode[] = [];
  private feedback: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private preFilter: BiquadFilterNode;
  private postFilter: BiquadFilterNode;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.feedback = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.preFilter = audioContext.createBiquadFilter();
    this.postFilter = audioContext.createBiquadFilter();

    this.setupChorusVoices();
    this.connectNodes();
    this.initializeParameters();
  }

  private setupChorusVoices(): void {
    const numVoices = 6;
    const baseDelayTime = 0.005;
    const voiceSpread = 0.003;

    for (let i = 0; i < numVoices; i++) {
      const delay = this.context.createDelay(0.05);
      const lfo = this.context.createOscillator();
      const lfoGain = this.context.createGain();
      const voiceGain = this.context.createGain();

      // Set delay time with voice spread
      delay.delayTime.value = baseDelayTime + (i * voiceSpread);

      // Configure LFO with slight detuning for richness
      lfo.type = 'sine';
      lfo.frequency.value = 0.5 + (i * 0.1);
      lfoGain.gain.value = 0.002;

      // Set voice gain with alternating levels
      voiceGain.gain.value = i % 2 === 0 ? 0.8 : 0.6;

      // Connect LFO to delay modulation
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      lfo.start();

      this.delays.push(delay);
      this.lfos.push(lfo);
      this.lfoGains.push(lfoGain);
      this.voiceGains.push(voiceGain);
    }
  }

  private connectNodes(): void {
    // Setup filters
    this.preFilter.type = 'highpass';
    this.preFilter.frequency.value = 80;
    this.preFilter.Q.value = 0.7;

    this.postFilter.type = 'lowpass';
    this.postFilter.frequency.value = 12000;
    this.postFilter.Q.value = 0.7;

    // Connect signal path
    this.input.connect(this.preFilter);

    // Connect each voice
    this.delays.forEach((delay, index) => {
      this.preFilter.connect(delay);
      delay.connect(this.voiceGains[index]);
      this.voiceGains[index].connect(this.postFilter);
      
      // Add feedback from each voice
      this.voiceGains[index].connect(this.feedback);
    });

    // Connect feedback back to input
    this.feedback.connect(this.preFilter);

    // Mix wet and dry
    this.postFilter.connect(this.wetGain);
    this.wetGain.connect(this.output);
    
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // Set initial values
    this.feedback.gain.value = 0.2;
    this.wetGain.gain.value = 0.3;
    this.dryGain.gain.value = 0.7;
  }

  private initializeParameters(): void {
    this.parameters.set('rate', { value: 1.0, min: 0.1, max: 10 });
    this.parameters.set('depth', { value: 0.5, min: 0, max: 1 });
    this.parameters.set('feedback', { value: 0.2, min: 0, max: 0.8 });
    this.parameters.set('mix', { value: 0.3, min: 0, max: 1 });
    this.parameters.set('voices', { value: 6, min: 2, max: 8 });
    this.parameters.set('waveform', { value: 'sine', options: ['sine', 'triangle', 'sawtooth', 'square'] });
    this.parameters.set('vintage', { value: 0.5, min: 0, max: 1 });
  }

  public updateParameter(param: string, value: number | string): void {
    const parameter = this.parameters.get(param);
    if (!parameter) return;

    switch (param) {
      case 'rate':
        parameter.value = value;
        this.lfos.forEach((lfo, index) => {
          lfo.frequency.value = (value as number) + (index * 0.1);
        });
        break;
      case 'depth':
        parameter.value = value;
        this.lfoGains.forEach(lfoGain => {
          lfoGain.gain.value = (value as number) * 0.005;
        });
        break;
      case 'feedback':
        parameter.value = value;
        this.feedback.gain.value = value as number;
        break;
      case 'mix':
        parameter.value = value;
        this.wetGain.gain.value = value as number;
        this.dryGain.gain.value = 1 - (value as number);
        break;
      case 'waveform':
        parameter.value = value;
        this.lfos.forEach(lfo => {
          lfo.type = value as OscillatorType;
        });
        break;
      case 'vintage':
        parameter.value = value;
        // Adjust filters for vintage character
        const vintageAmount = value as number;
        this.preFilter.frequency.value = 80 + (vintageAmount * 120);
        this.postFilter.frequency.value = 12000 - (vintageAmount * 4000);
        break;
    }
  }

  public bypass(): void {
    this.active = false;
    this.wetGain.gain.value = 0;
    this.dryGain.gain.value = 1;
  }

  public activate(): void {
    this.active = true;
    this.wetGain.gain.value = this.parameters.get('mix')?.value || 0.3;
    this.dryGain.gain.value = 1 - (this.parameters.get('mix')?.value || 0.3);
  }
}

// Tube Overdrive with Harmonic Enhancement
export class TubeOverdrive implements AdvancedEffectProcessor {
  public id = 'tube-overdrive';
  public name = 'Tube Overdrive';
  public type: 'distortion' = 'distortion';
  public input: GainNode;
  public output: GainNode;
  public parameters = new Map();
  public active = false;

  private context: AudioContext;
  private preGain: GainNode;
  private waveshaper: WaveShaperNode;
  private postGain: GainNode;
  private preFilter: BiquadFilterNode;
  private postFilter: BiquadFilterNode;
  private harmonicEnhancer: GainNode[] = [];
  private compressor: DynamicsCompressorNode;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.preGain = audioContext.createGain();
    this.waveshaper = audioContext.createWaveShaper();
    this.postGain = audioContext.createGain();
    this.preFilter = audioContext.createBiquadFilter();
    this.postFilter = audioContext.createBiquadFilter();
    this.compressor = audioContext.createDynamicsCompressor();

    this.setupHarmonicEnhancement();
    this.connectNodes();
    this.initializeParameters();
    this.generateDistortionCurve('tube', 30);
  }

  private setupHarmonicEnhancement(): void {
    // Create subtle harmonic enhancement
    for (let i = 0; i < 3; i++) {
      const harmonicGain = this.context.createGain();
      harmonicGain.gain.value = 0.1 / (i + 1);
      this.harmonicEnhancer.push(harmonicGain);
    }
  }

  private connectNodes(): void {
    // Setup filters
    this.preFilter.type = 'highpass';
    this.preFilter.frequency.value = 20;
    this.preFilter.Q.value = 0.7;

    this.postFilter.type = 'lowpass';
    this.postFilter.frequency.value = 12000;
    this.postFilter.Q.value = 0.7;

    // Setup compressor
    this.compressor.threshold.value = -12;
    this.compressor.ratio.value = 3;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.1;

    // Connect main signal path
    this.input.connect(this.preFilter);
    this.preFilter.connect(this.preGain);
    this.preGain.connect(this.waveshaper);
    this.waveshaper.connect(this.compressor);
    this.compressor.connect(this.postFilter);
    this.postFilter.connect(this.postGain);
    this.postGain.connect(this.output);

    // Set initial values
    this.preGain.gain.value = 2;
    this.postGain.gain.value = 0.8;
  }

  private generateDistortionCurve(type: string, amount: number): void {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const gain = amount / 30;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      let output = x;

      switch (type) {
        case 'tube':
          // Warm tube-like saturation
          const absX = Math.abs(x * gain);
          if (absX < 0.33) {
            output = x * gain * 2;
          } else if (absX < 0.66) {
            output = Math.sign(x) * (3 - Math.pow(2 - 3 * absX, 2)) / 3;
          } else {
            output = Math.sign(x);
          }
          output *= 0.6;
          break;

        case 'transistor':
          // Sharp transistor clipping
          output = Math.tanh(x * gain * 3) * 0.8;
          break;

        case 'diode':
          // Asymmetric diode clipping
          if (x > 0) {
            output = Math.min(0.7, x * gain);
          } else {
            output = Math.max(-0.9, x * gain * 1.2);
          }
          break;

        case 'fuzz':
          // Heavy fuzz distortion
          output = Math.sign(x) * Math.pow(Math.abs(x * gain), 0.3) * 0.9;
          break;

        case 'bitcrush':
          // Digital bit crushing
          const bits = Math.max(2, 12 - Math.floor(amount / 10));
          const step = Math.pow(2, bits - 1);
          output = Math.round(x * gain * step) / step;
          break;

        case 'tape':
          // Tape saturation
          output = x * gain / (1 + Math.abs(x * gain * 0.5)) * 0.85;
          break;

        default:
          output = Math.tanh(x * gain) * 0.7;
      }

      curve[i] = output;
    }

    this.waveshaper.curve = curve;
    this.waveshaper.oversample = '4x';
  }

  private initializeParameters(): void {
    this.parameters.set('drive', { value: 30, min: 0, max: 100 });
    this.parameters.set('tone', { value: 0.7, min: 0, max: 1 });
    this.parameters.set('level', { value: 0.8, min: 0, max: 1 });
    this.parameters.set('bias', { value: 0, min: -1, max: 1 });
    this.parameters.set('type', { value: 'tube', options: ['tube', 'transistor', 'diode', 'fuzz', 'bitcrush', 'tape'] });
    this.parameters.set('harmonics', { value: 0.2, min: 0, max: 1 });
    this.parameters.set('compression', { value: 0.3, min: 0, max: 1 });
  }

  public updateParameter(param: string, value: number | string): void {
    const parameter = this.parameters.get(param);
    if (!parameter) return;

    switch (param) {
      case 'drive':
        parameter.value = value;
        this.preGain.gain.value = 1 + (value as number) / 50;
        this.generateDistortionCurve(this.parameters.get('type')?.value || 'tube', value as number);
        break;
      case 'tone':
        parameter.value = value;
        this.postFilter.frequency.value = 1000 + (value as number) * 11000;
        break;
      case 'level':
        parameter.value = value;
        this.postGain.gain.value = value as number;
        break;
      case 'bias':
        parameter.value = value;
        // Add DC bias for asymmetric distortion
        const biasNode = this.context.createConstantSource();
        biasNode.offset.value = (value as number) * 0.1;
        // Connect bias if needed
        break;
      case 'type':
        parameter.value = value;
        this.generateDistortionCurve(value as string, this.parameters.get('drive')?.value || 30);
        break;
      case 'harmonics':
        parameter.value = value;
        this.harmonicEnhancer.forEach((gain, index) => {
          gain.gain.value = (value as number) * 0.1 / (index + 1);
        });
        break;
      case 'compression':
        parameter.value = value;
        this.compressor.ratio.value = 1 + (value as number) * 7;
        break;
    }
  }

  public bypass(): void {
    this.active = false;
    // Bypass waveshaper
    this.preGain.disconnect();
    this.preGain.connect(this.postGain);
  }

  public activate(): void {
    this.active = true;
    // Reconnect waveshaper
    this.preGain.disconnect();
    this.preGain.connect(this.waveshaper);
  }
}

// Advanced Effects Factory
export class AdvancedEffectsFactory {
  private context: AudioContext;
  private effects: Map<string, AdvancedEffectProcessor> = new Map();

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
  }

  public createEffect(type: string): AdvancedEffectProcessor | null {
    switch (type) {
      case 'convolution-reverb':
        return new ConvolutionReverb(this.context);
      case 'multi-tap-delay':
        return new MultiTapDelay(this.context);
      case 'vintage-chorus':
        return new VintageChorus(this.context);
      case 'tube-overdrive':
        return new TubeOverdrive(this.context);
      default:
        return null;
    }
  }

  public registerEffect(effect: AdvancedEffectProcessor): void {
    this.effects.set(effect.id, effect);
  }

  public getEffect(id: string): AdvancedEffectProcessor | undefined {
    return this.effects.get(id);
  }

  public getAllEffects(): AdvancedEffectProcessor[] {
    return Array.from(this.effects.values());
  }

  public removeEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      effect.bypass();
      this.effects.delete(id);
    }
  }

  public createEffectsChain(effectTypes: string[]): AdvancedEffectProcessor[] {
    const chain: AdvancedEffectProcessor[] = [];
    
    effectTypes.forEach(type => {
      const effect = this.createEffect(type);
      if (effect) {
        this.registerEffect(effect);
        chain.push(effect);
      }
    });

    // Connect effects in chain
    for (let i = 0; i < chain.length - 1; i++) {
      chain[i].output.connect(chain[i + 1].input);
    }

    return chain;
  }
}

// Export utility functions
export const createAdvancedEffectsProcessor = (audioContext: AudioContext) => {
  return new AdvancedEffectsFactory(audioContext);
};

export const getEffectPresets = () => {
  return {
    vintage: ['vintage-chorus', 'tube-overdrive', 'convolution-reverb'],
    modern: ['multi-tap-delay', 'convolution-reverb'],
    experimental: ['tube-overdrive', 'multi-tap-delay', 'vintage-chorus'],
    clean: ['convolution-reverb'],
    distorted: ['tube-overdrive', 'multi-tap-delay']
  };
};