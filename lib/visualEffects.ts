export interface VisualEffect {
  id: string;
  name: string;
  render: (canvas: HTMLCanvasElement, audioData: number[] | Uint8Array, options?: any) => void;
}

// Advanced waveform visualizer with multiple display modes
export class WaveformVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gradientCache: Map<string, CanvasGradient> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to get 2D context');
    this.ctx = context;
  }

  public render(audioData: number[], mode: 'oscilloscope' | 'line' | 'filled' | 'mirror' = 'oscilloscope', color = '#00ff88'): void {
    const { width, height } = this.canvas;
    
    // Clear with subtle gradient background
    const bgGradient = this.getOrCreateGradient('background', width, height, 
      ['#0a0a0a', '#1a1a1a', '#0a0a0a']);
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, width, height);

    if (audioData.length === 0) return;

    switch (mode) {
      case 'oscilloscope':
        this.renderOscilloscope(audioData, color);
        break;
      case 'line':
        this.renderLine(audioData, color);
        break;  
      case 'filled':
        this.renderFilled(audioData, color);
        break;
      case 'mirror':
        this.renderMirror(audioData, color);
        break;
    }

    this.addGridLines();
    this.addGlowEffect(audioData, color);
  }

  private renderOscilloscope(audioData: number[], color: string): void {
    const { width, height } = this.canvas;
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    
    const sliceWidth = width / audioData.length;
    let x = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const v = (audioData[i] ?? 0) * 0.8;
      const y = (height / 2) + (v * height / 2);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    this.ctx.stroke();
  }

  private renderLine(audioData: number[], color: string): void {
    const { width, height } = this.canvas;
    
    // Create gradient from bottom to top
    const gradient = this.ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color + '80');
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    
    const sliceWidth = width / audioData.length;
    let x = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const v = Math.abs(audioData[i] ?? 0);
      const y = height - (v * height * 0.9);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    this.ctx.stroke();
  }

  private renderFilled(audioData: number[], color: string): void {
    const { width, height } = this.canvas;
    
    const gradient = this.ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, color + '20');
    gradient.addColorStop(0.5, color + '60');
    gradient.addColorStop(1, color + '10');
    
    this.ctx.fillStyle = gradient;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    
    const sliceWidth = width / audioData.length;
    let x = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const v = Math.abs(audioData[i] ?? 0);
      const y = height - (v * height * 0.9);
      this.ctx.lineTo(x, y);
      x += sliceWidth;
    }
    
    this.ctx.lineTo(width, height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add outline
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private renderMirror(audioData: number[], color: string): void {
    const { width, height } = this.canvas;
    const midY = height / 2;
    
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '80');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color + '80');
    
    this.ctx.fillStyle = gradient;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, midY);
    
    const sliceWidth = width / audioData.length;
    let x = 0;
    
    // Top half
    for (let i = 0; i < audioData.length; i++) {
      const v = Math.abs(audioData[i] ?? 0);
      const y = midY - (v * midY * 0.9);
      this.ctx.lineTo(x, y);
      x += sliceWidth;
    }
    
    // Bottom half (mirrored)
    x = width;
    for (let i = audioData.length - 1; i >= 0; i--) {
      const v = Math.abs(audioData[i] ?? 0);
      const y = midY + (v * midY * 0.9);
      this.ctx.lineTo(x, y);
      x -= sliceWidth;
    }
    
    this.ctx.closePath();
    this.ctx.fill();
  }

  private addGridLines(): void {
    const { width, height } = this.canvas;
    
    this.ctx.strokeStyle = '#2a2a2a';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 4]);
    
    // Horizontal center line
    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
    
    // Vertical grid lines
    for (let i = 1; i < 8; i++) {
      const x = (i * width) / 8;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
  }

  private addGlowEffect(audioData: number[], color: string): void {
    if (audioData.length === 0) return;
    
    const peak = Math.max(...audioData.map(Math.abs));
    if (peak > 0.7) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 20;
      this.ctx.globalAlpha = 0.5;
      this.renderLine(audioData, color);
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1.0;
    }
  }

  private getOrCreateGradient(id: string, width: number, height: number, colors: string[]): CanvasGradient {
    const key = `${id}-${width}-${height}-${colors.join(',')}`;
    
    const existingGradient = this.gradientCache.get(key);
    if (existingGradient) {
      return existingGradient;
    }
    
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    this.gradientCache.set(key, gradient);
    
    return gradient;
  }
}

// Advanced spectrum analyzer with logarithmic scaling
export class SpectrumAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private peakHold: number[] = [];
  private peakFallRate = 2;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to get 2D context');
    this.ctx = context;
  }

  public render(audioData: Uint8Array, barCount = 64, logarithmic = true, color = '#00ff88'): void {
    const { width, height } = this.canvas;
    
    // Clear with gradient background
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0f0f0f');
    bgGradient.addColorStop(1, '#0a0a0a');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, width, height);

    if (audioData.length === 0) return;

    this.drawGrid();
    this.drawBars(audioData, barCount, logarithmic, color);
    this.drawPeakHold(barCount, color);
    this.drawFrequencyLabels();
  }

  private drawGrid(): void {
    const { width, height } = this.canvas;
    
    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 1;
    
    // Horizontal grid lines (dB levels)
    for (let i = 0; i <= 8; i++) {
      const y = (i * height) / 8;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
    
    // Vertical grid lines (frequency bands)
    for (let i = 0; i <= 16; i++) {
      const x = (i * width) / 16;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
  }

  private drawBars(audioData: Uint8Array, barCount: number, logarithmic: boolean, color: string): void {
    const { width, height } = this.canvas;
    const barWidth = width / barCount;
    
    // Create multi-color gradient for spectrum
    const gradient = this.ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(0.6, '#4dabf7');
    gradient.addColorStop(0.8, '#ffaa00');
    gradient.addColorStop(1, '#ff6b6b');
    
    this.ctx.fillStyle = gradient;
    
    for (let i = 0; i < barCount; i++) {
      let value = 0;
      
      if (logarithmic) {
        // Logarithmic frequency distribution
        const startIdx = Math.floor(Math.pow(i / barCount, 2) * audioData.length);
        const endIdx = Math.floor(Math.pow((i + 1) / barCount, 2) * audioData.length);
        
        for (let j = startIdx; j < endIdx && j < audioData.length; j++) {
          const dataValue = audioData[j];
          if (dataValue !== undefined) {
            value = Math.max(value, dataValue);
          }
        }
      } else {
        // Linear distribution
        const idx = Math.floor((i * audioData.length) / barCount);
        const dataValue = audioData[idx];
        value = dataValue ?? 0;
      }
      
      const barHeight = (value / 255) * height * 0.9;
      const x = i * barWidth;
      const y = height - barHeight;
      
      // Draw main bar
      this.ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      
      // Add peak highlight for high values
      if (barHeight > height * 0.7) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 1, y, barWidth - 2, 2);
        this.ctx.fillStyle = gradient;
      }
      
      // Update peak hold
      const currentPeak = this.peakHold[i];
      if (!currentPeak || value > currentPeak) {
        this.peakHold[i] = value;
      } else {
        this.peakHold[i] = Math.max(0, currentPeak - this.peakFallRate);
      }
    }
  }

  private drawPeakHold(barCount: number, color: string): void {
    const { width, height } = this.canvas;
    const barWidth = width / barCount;
    
    this.ctx.fillStyle = color;
    
    for (let i = 0; i < barCount; i++) {
      const peakValue = this.peakHold[i] ?? 0;
      const peakHeight = (peakValue / 255) * height * 0.9;
      const x = i * barWidth;
      const y = height - peakHeight - 2;
      
      if (peakHeight > 5) {
        this.ctx.fillRect(x + 1, y, barWidth - 2, 1);
      }
    }
  }

  private drawFrequencyLabels(): void {
    const { width, height } = this.canvas;
    const labels = ['20', '100', '500', '1k', '5k', '10k', '20k'];
    
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    
    labels.forEach((label, index) => {
      const x = (index * width) / (labels.length - 1);
      this.ctx.fillText(label, x, height - 5);
    });
  }
}

// 3D Visualization with particle effects
export class ParticleVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private maxParticles = 200;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to get 2D context');
    this.ctx = context;
  }

  public render(audioData: number[], color = '#00ff88'): void {
    const { width, height } = this.canvas;
    
    // Clear with fade effect
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    this.ctx.fillRect(0, 0, width, height);
    
    if (audioData.length === 0) return;
    
    // Calculate audio intensity
    const intensity = audioData.reduce((sum, val) => sum + Math.abs(val), 0) / audioData.length;
    
    // Generate new particles based on audio intensity
    if (intensity > 0.1 && this.particles.length < this.maxParticles) {
      for (let i = 0; i < Math.floor(intensity * 10); i++) {
        this.particles.push(new Particle(width, height, color, intensity));
      }
    }
    
    // Update and draw particles
    this.particles = this.particles.filter(particle => {
      particle.update(audioData);
      particle.draw(this.ctx);
      return particle.life > 0;
    });
    
    // Add frequency-based effects
    this.addFrequencyEffects(audioData, color);
  }

  private addFrequencyEffects(audioData: number[], color: string): void {
    const { width, height } = this.canvas;
    
    // Create frequency bands visualization
    const bands = 8;
    const bandWidth = width / bands;
    
    for (let i = 0; i < bands; i++) {
      const startIdx = Math.floor((i * audioData.length) / bands);
      const endIdx = Math.floor(((i + 1) * audioData.length) / bands);
      
      let bandValue = 0;
      for (let j = startIdx; j < endIdx; j++) {
        const dataValue = audioData[j];
        if (dataValue !== undefined) {
          bandValue = Math.max(bandValue, Math.abs(dataValue));
        }
      }
      
      if (bandValue > 0.3) {
        const x = i * bandWidth + bandWidth / 2;
        const radius = bandValue * 30;
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, height / 2, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }
}

class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public size: number;
  public color: string;
  public hue: number;

  constructor(canvasWidth: number, canvasHeight: number, baseColor: string, intensity: number) {
    this.x = Math.random() * canvasWidth;
    this.y = canvasHeight / 2 + (Math.random() - 0.5) * 100;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.maxLife = 60 + Math.random() * 60;
    this.life = this.maxLife;
    this.size = 1 + Math.random() * 3 * intensity;
    this.color = baseColor;
    this.hue = Math.random() * 360;
  }

  public update(audioData: number[]): void {
    // Move particle
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply audio influence
    if (audioData.length > 0) {
      const idx = Math.floor((this.x / 800) * audioData.length);
      const audioInfluence = audioData[idx];
      if (audioInfluence !== undefined) {
        this.vy += audioInfluence * 0.5;
      }
    }
    
    // Add some physics
    this.vy += 0.02; // Gravity
    this.vx *= 0.99; // Air resistance
    this.vy *= 0.99;
    
    // Update life
    this.life--;
    
    // Update color based on life
    const alpha = this.life / this.maxLife;
    this.color = `hsla(${this.hue}, 70%, 60%, ${alpha})`;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.size * 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Export visual effects
export const visualEffects: VisualEffect[] = [
  {
    id: 'waveform-oscilloscope',
    name: 'Oscilloscope',
    render: (canvas, audioData, options = {}) => {
      const visualizer = new WaveformVisualizer(canvas);
      visualizer.render(
        Array.isArray(audioData) ? audioData : Array.from(audioData),
        'oscilloscope',
        options.color || '#00ff88'
      );
    }
  },
  {
    id: 'spectrum-analyzer',
    name: 'Spectrum Analyzer',
    render: (canvas, audioData, options = {}) => {
      const analyzer = new SpectrumAnalyzer(canvas);
      analyzer.render(
        audioData instanceof Uint8Array ? audioData : new Uint8Array(audioData),
        options.barCount || 64,
        options.logarithmic !== false,
        options.color || '#00ff88'
      );
    }
  },
  {
    id: 'particle-system',
    name: 'Particle System',
    render: (canvas, audioData, options = {}) => {
      const visualizer = new ParticleVisualizer(canvas);
      visualizer.render(
        Array.isArray(audioData) ? audioData : Array.from(audioData),
        options.color || '#00ff88'
      );
    }
  }
];

// Utility function to create visualization manager
export function createVisualizationManager(canvas: HTMLCanvasElement, type: 'waveform' | 'spectrum' | 'particles' = 'waveform') {
  switch (type) {
    case 'waveform':
      return new WaveformVisualizer(canvas);
    case 'spectrum':
      return new SpectrumAnalyzer(canvas);
    case 'particles':
      return new ParticleVisualizer(canvas);
    default:
      return new WaveformVisualizer(canvas);
  }
}