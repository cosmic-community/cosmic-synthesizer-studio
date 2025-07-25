export interface ModernEffect {
  id: string;
  name: string;
  type: 'filter' | 'modulation' | 'dynamics' | 'spatial' | 'distortion';
  parameters: EffectParameter[];
  process: (audioContext: AudioContext, input: AudioNode, params: Record<string, number>) => AudioNode;
}

export interface EffectParameter {
  id: string;
  name: string;
  min: number;
  max: number;
  default: number;
  unit: string;
  curve: 'linear' | 'exponential' | 'logarithmic';
}

// Advanced Reverb with modern algorithms
export class ModernReverb {
  private context: AudioContext;
  private input: GainNode;
  public output: GainNode;
  private convolver: ConvolverNode;
  private earlyReflections: DelayNode[] = [];
  private lateReverb: ConvolverNode;
  private damping: BiquadFilterNode;
  private predelay: DelayNode;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.convolver = audioContext.createConvolver();
    this.predelay = audioContext.createDelay(0.5);
    this.damping = audioContext.createBiquadFilter();
    this.lateReverb = audioContext.createConvolver();
    
    this.setupEarlyReflections();
    this.setupLateReverb();
    this.connectNodes();
  }

  private setupEarlyReflections(): void {
    // Create early reflection pattern
    const reflectionTimes = [0.01, 0.023, 0.041, 0.067, 0.089, 0.109];
    const reflectionGains = [0.8, 0.6, 0.5, 0.4, 0.3, 0.2];
    
    this.earlyReflections = reflectionTimes.map((time, index) => {
      const delay = this.context.createDelay(0.5);
      const gain = this.context.createGain();
      
      delay.delayTime.value = time;
      gain.gain.value = reflectionGains[index] ?? 0.1;
      
      this.input.connect(delay);
      delay.connect(gain);
      gain.connect(this.output);
      
      return delay;
    });
  }

  private setupLateReverb(): void {
    // Generate impulse response for late reverb
    const length = this.context.sampleRate * 2; // 2 seconds
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 1.5);
        const noise = (Math.random() * 2 - 1) * decay;
        channelData[i] = noise;
      }
    }
    
    this.lateReverb.buffer = impulse;
  }

  private connectNodes(): void {
    // Setup damping filter
    this.damping.type = 'lowpass';
    this.damping.frequency.value = 8000;
    this.damping.Q.value = 0.7;
    
    // Connect the reverb chain
    this.input.connect(this.predelay);
    this.predelay.connect(this.damping);
    this.damping.connect(this.lateReverb);
    this.lateReverb.connect(this.output);
  }

  public setRoomSize(size: number): void {
    // 0 to 1, affects decay time and early reflections
    const decayTime = 0.5 + size * 1.5;
    this.regenerateImpulseResponse(decayTime);
  }

  public setDamping(damping: number): void {
    // 0 to 1, affects high frequency absorption
    const frequency = 20000 * (1 - damping * 0.8);
    this.damping.frequency.value = frequency;
  }

  public setPredelay(predelay: number): void {
    // 0 to 500ms
    this.predelay.delayTime.value = predelay / 1000;
  }

  private regenerateImpulseResponse(decayTime: number): void {
    const length = Math.floor(this.context.sampleRate * decayTime);
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2);
        const noise = (Math.random() * 2 - 1) * decay;
        channelData[i] = noise;
      }
    }
    
    this.lateReverb.buffer = impulse;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public getInput(): AudioNode {
    return this.input;
  }
}

// Advanced Distortion with multiple algorithms
export class ModernDistortion {
  private context: AudioContext;
  private input: GainNode;
  public output: GainNode;
  private waveshaper: WaveShaperNode;
  private preGain: GainNode;
  private postGain: GainNode;
  private lowpass: BiquadFilterNode;
  private highpass: BiquadFilterNode;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.waveshaper = audioContext.createWaveShaper();
    this.preGain = audioContext.createGain();
    this.postGain = audioContext.createGain();
    this.lowpass = audioContext.createBiquadFilter();
    this.highpass = audioContext.createBiquadFilter();

    this.setupFilters();
    this.connectNodes();
    this.setDistortionType('soft');
  }

  private setupFilters(): void {
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 8000;
    this.lowpass.Q.value = 0.7;

    this.highpass.type = 'highpass';
    this.highpass.frequency.value = 80;
    this.highpass.Q.value = 0.7;
  }

  private connectNodes(): void {
    this.input.connect(this.preGain);
    this.preGain.connect(this.highpass);
    this.highpass.connect(this.waveshaper);
    this.waveshaper.connect(this.lowpass);
    this.lowpass.connect(this.postGain);
    this.postGain.connect(this.output);
  }

  public setDistortionType(type: 'soft' | 'hard' | 'tube' | 'fuzz' | 'bitcrush'): void {
    let curve: Float32Array;
    const samples = 44100;
    
    switch (type) {
      case 'soft':
        curve = this.makeSoftClipCurve(samples);
        break;
      case 'hard':
        curve = this.makeHardClipCurve(samples);
        break;
      case 'tube':
        curve = this.makeTubeCurve(samples);
        break;
      case 'fuzz':
        curve = this.makeFuzzCurve(samples);
        break;
      case 'bitcrush':
        curve = this.makeBitcrushCurve(samples);
        break;
      default:
        curve = this.makeSoftClipCurve(samples);
    }
    
    this.waveshaper.curve = curve;
    this.waveshaper.oversample = '4x';
  }

  private makeSoftClipCurve(samples: number): Float32Array {
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * 2) * 0.7;
    }
    return curve;
  }

  private makeHardClipCurve(samples: number): Float32Array {
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.max(-0.8, Math.min(0.8, x * 3));
    }
    return curve;
  }

  private makeTubeCurve(samples: number): Float32Array {
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      const abs_x = Math.abs(x);
      if (abs_x < 0.5) {
        curve[i] = x * 2;
      } else {
        curve[i] = Math.sign(x) * (0.75 + (abs_x - 0.5) * 0.5);
      }
      curve[i] *= 0.6;
    }
    return curve;
  }

  private makeFuzzCurve(samples: number): Float32Array {
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.3) * 0.8;
    }
    return curve;
  }

  private makeBitcrushCurve(samples: number): Float32Array {
    const curve = new Float32Array(samples);
    const bits = 4; // Bit depth reduction
    const step = Math.pow(2, bits - 1);
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.round(x * step) / step;
    }
    return curve;
  }

  public setDrive(drive: number): void {
    // 0 to 10
    this.preGain.gain.value = 1 + drive * 0.5;
  }

  public setTone(tone: number): void {
    // 0 to 1, affects the lowpass filter
    const frequency = 1000 + tone * 7000;
    this.lowpass.frequency.value = frequency;
  }

  public setLevel(level: number): void {
    // 0 to 1
    this.postGain.gain.value = level * 0.7;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public getInput(): AudioNode {
    return this.input;
  }
}

// Advanced Chorus with modern modulation
export class ModernChorus {
  private context: AudioContext;
  private input: GainNode;
  public output: GainNode;
  private delays: DelayNode[];
  private lfos: OscillatorNode[];
  private lfoGains: GainNode[];
  private feedback: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.feedback = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    
    this.delays = [];
    this.lfos = [];
    this.lfoGains = [];
    
    this.setupChorusVoices();
    this.connectNodes();
  }

  private setupChorusVoices(): void {
    const numVoices = 3;
    const baseDelayTime = 0.005; // 5ms base delay
    
    for (let i = 0; i < numVoices; i++) {
      // Create delay line
      const delay = this.context.createDelay(0.05);
      delay.delayTime.value = baseDelayTime + (i * 0.003);
      
      // Create LFO for modulation
      const lfo = this.context.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.3 + (i * 0.2);
      
      // Create LFO gain for modulation depth
      const lfoGain = this.context.createGain();
      lfoGain.gain.value = 0.002; // 2ms modulation depth
      
      // Connect LFO to delay time
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      
      // Start LFO
      lfo.start();
      
      this.delays.push(delay);
      this.lfos.push(lfo);
      this.lfoGains.push(lfoGain);
    }
  }

  private connectNodes(): void {
    // Dry path
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);
    
    // Wet path with feedback
    this.delays.forEach(delay => {
      this.input.connect(delay);
      delay.connect(this.wetGain);
      delay.connect(this.feedback);
    });
    
    // Add proper null check for array access
    if (this.delays.length > 0 && this.delays[0]) {
      this.feedback.connect(this.delays[0]);
    }
    this.wetGain.connect(this.output);
    
    // Set initial levels
    this.dryGain.gain.value = 0.7;
    this.wetGain.gain.value = 0.3;
    this.feedback.gain.value = 0.1;
  }

  public setRate(rate: number): void {
    // 0.1 to 5 Hz
    this.lfos.forEach((lfo, index) => {
      lfo.frequency.value = rate + (index * 0.2);
    });
  }

  public setDepth(depth: number): void {
    // 0 to 1, affects modulation depth
    const modDepth = depth * 0.005; // Up to 5ms modulation
    this.lfoGains.forEach(lfoGain => {
      lfoGain.gain.value = modDepth;
    });
  }

  public setFeedback(feedback: number): void {
    // 0 to 1
    this.feedback.gain.value = feedback * 0.3;
  }

  public setMix(mix: number): void {
    // 0 to 1, 0 = dry, 1 = wet
    this.dryGain.gain.value = 1 - mix;
    this.wetGain.gain.value = mix;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public getInput(): AudioNode {
    return this.input;
  }
}

// Stereo Enhancer for width control
export class StereoEnhancer {
  private context: AudioContext;
  private splitter: ChannelSplitterNode;
  private merger: ChannelMergerNode;
  private leftDelay: DelayNode;
  private rightDelay: DelayNode;
  private leftGain: GainNode;
  private rightGain: GainNode;
  private widthGain: GainNode;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.splitter = audioContext.createChannelSplitter(2);
    this.merger = audioContext.createChannelMerger(2);
    this.leftDelay = audioContext.createDelay(0.01);
    this.rightDelay = audioContext.createDelay(0.01);
    this.leftGain = audioContext.createGain();
    this.rightGain = audioContext.createGain();
    this.widthGain = audioContext.createGain();
    
    this.connectNodes();
  }

  private connectNodes(): void {
    // Split stereo signal
    this.splitter.connect(this.leftDelay, 0);
    this.splitter.connect(this.rightDelay, 1);
    
    // Apply slight delays and gains
    this.leftDelay.connect(this.leftGain);
    this.rightDelay.connect(this.rightGain);
    
    // Merge back to stereo
    this.leftGain.connect(this.merger, 0, 0);
    this.rightGain.connect(this.merger, 0, 1);
    
    // Width control
    this.merger.connect(this.widthGain);
    
    // Set initial values
    this.leftDelay.delayTime.value = 0.001;
    this.rightDelay.delayTime.value = 0.002;
    this.leftGain.gain.value = 1;
    this.rightGain.gain.value = 1;
    this.widthGain.gain.value = 1;
  }

  public setWidth(width: number): void {
    // 0 to 2, 1 = normal, 0 = mono, 2 = extra wide
    if (width < 1) {
      // Narrow the stereo image
      this.leftGain.gain.value = 1 + (1 - width);
      this.rightGain.gain.value = 1 + (1 - width);
    } else {
      // Widen the stereo image
      this.leftGain.gain.value = width;
      this.rightGain.gain.value = width;
    }
  }

  public connect(destination: AudioNode): void {
    this.widthGain.connect(destination);
  }

  public getInput(): AudioNode {
    return this.splitter;
  }
}

// Export all modern effects
export const modernEffects: ModernEffect[] = [
  {
    id: 'modern-reverb',
    name: 'Modern Reverb',
    type: 'spatial',
    parameters: [
      { id: 'roomSize', name: 'Room Size', min: 0, max: 1, default: 0.5, unit: '', curve: 'linear' },
      { id: 'damping', name: 'Damping', min: 0, max: 1, default: 0.5, unit: '', curve: 'linear' },
      { id: 'predelay', name: 'Pre-delay', min: 0, max: 500, default: 0, unit: 'ms', curve: 'linear' },
    ],
    process: (audioContext, input, params) => {
      const reverb = new ModernReverb(audioContext);
      reverb.setRoomSize(params.roomSize ?? 0.5);
      reverb.setDamping(params.damping ?? 0.5);
      reverb.setPredelay(params.predelay ?? 0);
      input.connect(reverb.getInput());
      return reverb.output;
    }
  },
  {
    id: 'modern-distortion',
    name: 'Modern Distortion',
    type: 'distortion',
    parameters: [
      { id: 'drive', name: 'Drive', min: 0, max: 10, default: 2, unit: '', curve: 'linear' },
      { id: 'tone', name: 'Tone', min: 0, max: 1, default: 0.7, unit: '', curve: 'linear' },
      { id: 'level', name: 'Level', min: 0, max: 1, default: 0.8, unit: '', curve: 'linear' },
    ],
    process: (audioContext, input, params) => {
      const distortion = new ModernDistortion(audioContext);
      distortion.setDrive(params.drive ?? 2);
      distortion.setTone(params.tone ?? 0.7);
      distortion.setLevel(params.level ?? 0.8);
      input.connect(distortion.getInput());
      return distortion.output;
    }
  },
  {
    id: 'modern-chorus',
    name: 'Modern Chorus',
    type: 'modulation',
    parameters: [
      { id: 'rate', name: 'Rate', min: 0.1, max: 5, default: 1, unit: 'Hz', curve: 'logarithmic' },
      { id: 'depth', name: 'Depth', min: 0, max: 1, default: 0.5, unit: '', curve: 'linear' },
      { id: 'feedback', name: 'Feedback', min: 0, max: 1, default: 0.2, unit: '', curve: 'linear' },
      { id: 'mix', name: 'Mix', min: 0, max: 1, default: 0.3, unit: '', curve: 'linear' },
    ],
    process: (audioContext, input, params) => {
      const chorus = new ModernChorus(audioContext);
      chorus.setRate(params.rate ?? 1);
      chorus.setDepth(params.depth ?? 0.5);
      chorus.setFeedback(params.feedback ?? 0.2);
      chorus.setMix(params.mix ?? 0.3);
      input.connect(chorus.getInput());
      return chorus.output;
      }
  }
];