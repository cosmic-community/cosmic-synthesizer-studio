'use client';

import { useState, useRef, useEffect } from 'react';
import { SynthState } from '@/types';
import ModernKnob from './ModernKnob';
import { 
  Settings, 
  Power, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight, 
  Home,
  Waves,
  Zap,
  Clock,
  Maximize2,
  Filter,
  Volume2,
  Sliders
} from 'lucide-react';

interface EnhancedEffectsRackProps {
  synthState: SynthState;
  onStateChange: (state: SynthState) => void;
}

interface EffectSection {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  expanded: boolean;
  active: boolean;
  color: string;
}

export default function EnhancedEffectsRack({ synthState, onStateChange }: EnhancedEffectsRackProps) {
  const [sections, setSections] = useState<EffectSection[]>([
    { id: 'reverb', name: 'Convolution Reverb', icon: Home, expanded: true, active: false, color: 'cyan' },
    { id: 'delay', name: 'Multi-Tap Delay', icon: Clock, expanded: true, active: false, color: 'green' },
    { id: 'chorus', name: 'Vintage Chorus', icon: Waves, expanded: true, active: false, color: 'blue' },
    { id: 'distortion', name: 'Tube Overdrive', icon: Zap, expanded: true, active: false, color: 'red' },
    { id: 'compressor', name: 'Multiband Compressor', icon: Maximize2, expanded: false, active: false, color: 'yellow' },
    { id: 'filter', name: 'State Variable Filter', icon: Filter, expanded: false, active: false, color: 'purple' },
    { id: 'eq', name: 'Parametric EQ', icon: Sliders, expanded: false, active: false, color: 'orange' },
    { id: 'stereo', name: 'Stereo Enhancer', icon: Volume2, expanded: false, active: false, color: 'pink' }
  ]);

  const [globalBypass, setGlobalBypass] = useState(false);
  const [processingLoad, setProcessingLoad] = useState(0);
  const analysisInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate processing load calculation
    analysisInterval.current = setInterval(() => {
      const activeEffects = sections.filter(s => s.active).length;
      setProcessingLoad(Math.min(100, activeEffects * 12 + Math.random() * 5));
    }, 100);

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  };

  const toggleEffect = (effectName: string) => {
    const effect = synthState.effects[effectName as keyof typeof synthState.effects];
    updateEffect(effectName, 'active', !effect?.active);
    
    setSections(prev => prev.map(section =>
      section.id === effectName
        ? { ...section, active: !section.active }
        : section
    ));
  };

  const updateEffect = (effectName: string, property: string, value: any) => {
    onStateChange({
      ...synthState,
      effects: {
        ...synthState.effects,
        [effectName]: {
          ...synthState.effects[effectName as keyof typeof synthState.effects],
          [property]: value
        }
      }
    });
  };

  const resetEffect = (effectName: string) => {
    const defaultValues: Record<string, any> = {
      reverb: { active: false, amount: 0.3, roomSize: 0.5, damping: 0.5, predelay: 0, width: 1.0 },
      delay: { active: false, time: 0.25, feedback: 0.3, wetLevel: 0.3, highCut: 8000, sync: false },
      chorus: { active: false, rate: 1.0, depth: 0.5, feedback: 0.2, mix: 0.3, voices: 3 },
      distortion: { active: false, drive: 30, tone: 0.7, level: 0.8, type: 'tube', bias: 0 },
      compressor: { active: false, threshold: -18, ratio: 4, attack: 5, release: 100, knee: 2, makeup: 0 },
      filter: { active: false, cutoff: 1000, resonance: 0.3, type: 'lowpass', drive: 0, keyFollow: 0.5 },
      eq: { active: false, low: 0, lowMid: 0, highMid: 0, high: 0, lowFreq: 100, highFreq: 10000 },
      stereo: { active: false, width: 1.0, bass: 0.8, delay: 0.5, phase: 0 }
    };

    onStateChange({
      ...synthState,
      effects: {
        ...synthState.effects,
        [effectName]: defaultValues[effectName] || {}
      }
    });
  };

  const getColorClasses = (color: string, active: boolean) => {
    const colors: Record<string, { bg: string, border: string, text: string, accent: string }> = {
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', accent: 'bg-cyan-500' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', accent: 'bg-green-500' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', accent: 'bg-blue-500' },
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', accent: 'bg-red-500' },
      yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', accent: 'bg-yellow-500' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', accent: 'bg-purple-500' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', accent: 'bg-orange-500' },
      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', accent: 'bg-pink-500' }
    };
    
    return colors[color] || colors.cyan;
  };

  const renderReverbControls = () => {
    const effect = synthState.effects.reverb || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ModernKnob
          label="Room Size"
          value={effect.roomSize || 0.5}
          min={0}
          max={1}
          onChange={(value) => updateEffect('reverb', 'roomSize', value)}
          size="sm"
        />
        <ModernKnob
          label="Damping"
          value={effect.damping || 0.5}
          min={0}
          max={1}
          onChange={(value) => updateEffect('reverb', 'damping', value)}
          size="sm"
        />
        <ModernKnob
          label="Pre-delay"
          value={effect.predelay || 0}
          min={0}
          max={500}
          onChange={(value) => updateEffect('reverb', 'predelay', value)}
          size="sm"
          unit="ms"
        />
        <ModernKnob
          label="Width"
          value={effect.width || 1.0}
          min={0}
          max={2}
          onChange={(value) => updateEffect('reverb', 'width', value)}
          size="sm"
        />
        <ModernKnob
          label="Wet"
          value={effect.amount || 0.3}
          min={0}
          max={1}
          onChange={(value) => updateEffect('reverb', 'amount', value)}
          size="sm"
        />
        <div>
          <label className="block text-xs text-slate-300 mb-2">Type</label>
          <select
            value={effect.type || 'hall'}
            onChange={(e) => updateEffect('reverb', 'type', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="hall">Concert Hall</option>
            <option value="room">Small Room</option>
            <option value="chamber">Chamber</option>
            <option value="cathedral">Cathedral</option>
            <option value="plate">Plate</option>
            <option value="spring">Spring</option>
          </select>
        </div>
      </div>
    );
  };

  const renderDelayControls = () => {
    const effect = synthState.effects.delay || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ModernKnob
          label="Time"
          value={effect.time || 0.25}
          min={0.01}
          max={2}
          onChange={(value) => updateEffect('delay', 'time', value)}
          size="sm"
          unit="s"
        />
        <ModernKnob
          label="Feedback"
          value={effect.feedback || 0.3}
          min={0}
          max={0.95}
          onChange={(value) => updateEffect('delay', 'feedback', value)}
          size="sm"
        />
        <ModernKnob
          label="High Cut"
          value={effect.highCut || 8000}
          min={200}
          max={20000}
          onChange={(value) => updateEffect('delay', 'highCut', value)}
          size="sm"
          unit="Hz"
        />
        <ModernKnob
          label="Wet Level"
          value={effect.wetLevel || 0.3}
          min={0}
          max={1}
          onChange={(value) => updateEffect('delay', 'wetLevel', value)}
          size="sm"
        />
        <div>
          <label className="block text-xs text-slate-300 mb-2">Sync</label>
          <div className="flex gap-2">
            <button
              onClick={() => updateEffect('delay', 'time', 0.125)}
              className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
            >
              1/8
            </button>
            <button
              onClick={() => updateEffect('delay', 'time', 0.25)}
              className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
            >
              1/4
            </button>
            <button
              onClick={() => updateEffect('delay', 'time', 0.5)}
              className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
            >
              1/2
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-2">Stereo</label>
          <input
            type="checkbox"
            checked={effect.stereo || false}
            onChange={(e) => updateEffect('delay', 'stereo', e.target.checked)}
            className="rounded"
          />
        </div>
      </div>
    );
  };

  const renderChorusControls = () => {
    const effect = synthState.effects.chorus || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ModernKnob
          label="Rate"
          value={effect.rate || 1.0}
          min={0.1}
          max={10}
          onChange={(value) => updateEffect('chorus', 'rate', value)}
          size="sm"
          unit="Hz"
        />
        <ModernKnob
          label="Depth"
          value={effect.depth || 0.5}
          min={0}
          max={1}
          onChange={(value) => updateEffect('chorus', 'depth', value)}
          size="sm"
        />
        <ModernKnob
          label="Feedback"
          value={effect.feedback || 0.2}
          min={0}
          max={0.8}
          onChange={(value) => updateEffect('chorus', 'feedback', value)}
          size="sm"
        />
        <ModernKnob
          label="Mix"
          value={effect.mix || 0.3}
          min={0}
          max={1}
          onChange={(value) => updateEffect('chorus', 'mix', value)}
          size="sm"
        />
        <ModernKnob
          label="Voices"
          value={effect.voices || 3}
          min={2}
          max={8}
          step={1}
          onChange={(value) => updateEffect('chorus', 'voices', Math.round(value))}
          size="sm"
        />
        <div>
          <label className="block text-xs text-slate-300 mb-2">Waveform</label>
          <select
            value={effect.waveform || 'sine'}
            onChange={(e) => updateEffect('chorus', 'waveform', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
          </select>
        </div>
      </div>
    );
  };

  const renderDistortionControls = () => {
    const effect = synthState.effects.distortion || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ModernKnob
          label="Drive"
          value={effect.drive || 30}
          min={0}
          max={100}
          onChange={(value) => updateEffect('distortion', 'drive', value)}
          size="sm"
        />
        <ModernKnob
          label="Tone"
          value={effect.tone || 0.7}
          min={0}
          max={1}
          onChange={(value) => updateEffect('distortion', 'tone', value)}
          size="sm"
        />
        <ModernKnob
          label="Level"
          value={effect.level || 0.8}
          min={0}
          max={1}
          onChange={(value) => updateEffect('distortion', 'level', value)}
          size="sm"
        />
        <ModernKnob
          label="Bias"
          value={effect.bias || 0}
          min={-1}
          max={1}
          onChange={(value) => updateEffect('distortion', 'bias', value)}
          size="sm"
        />
        <div>
          <label className="block text-xs text-slate-300 mb-2">Type</label>
          <select
            value={effect.type || 'tube'}
            onChange={(e) => updateEffect('distortion', 'type', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="tube">Tube</option>
            <option value="transistor">Transistor</option>
            <option value="diode">Diode</option>
            <option value="fuzz">Fuzz</option>
            <option value="bitcrush">Bit Crush</option>
            <option value="tape">Tape Saturation</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-2">Oversampling</label>
          <select
            value={effect.oversampling || '2x'}
            onChange={(e) => updateEffect('distortion', 'oversampling', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="none">None</option>
            <option value="2x">2x</option>
            <option value="4x">4x</option>
          </select>
        </div>
      </div>
    );
  };

  const renderCompressorControls = () => {
    const effect = synthState.effects.compressor || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ModernKnob
          label="Threshold"
          value={effect.threshold || -18}
          min={-60}
          max={0}
          onChange={(value) => updateEffect('compressor', 'threshold', value)}
          size="sm"
          unit="dB"
        />
        <ModernKnob
          label="Ratio"
          value={effect.ratio || 4}
          min={1}
          max={20}
          onChange={(value) => updateEffect('compressor', 'ratio', value)}
          size="sm"
        />
        <ModernKnob
          label="Attack"
          value={effect.attack || 5}
          min={0.1}
          max={100}
          onChange={(value) => updateEffect('compressor', 'attack', value)}
          size="sm"
          unit="ms"
        />
        <ModernKnob
          label="Release"
          value={effect.release || 100}
          min={10}
          max={1000}
          onChange={(value) => updateEffect('compressor', 'release', value)}
          size="sm"
          unit="ms"
        />
        <ModernKnob
          label="Knee"
          value={effect.knee || 2}
          min={0}
          max={10}
          onChange={(value) => updateEffect('compressor', 'knee', value)}
          size="sm"
          unit="dB"
        />
        <ModernKnob
          label="Makeup"
          value={effect.makeup || 0}
          min={0}
          max={20}
          onChange={(value) => updateEffect('compressor', 'makeup', value)}
          size="sm"
          unit="dB"
        />
      </div>
    );
  };

  const renderFilterControls = () => {
    const effect = synthState.effects.filter || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ModernKnob
          label="Cutoff"
          value={effect.cutoff || 1000}
          min={20}
          max={20000}
          onChange={(value) => updateEffect('filter', 'cutoff', value)}
          size="sm"
          unit="Hz"
        />
        <ModernKnob
          label="Resonance"
          value={effect.resonance || 0.3}
          min={0}
          max={0.95}
          onChange={(value) => updateEffect('filter', 'resonance', value)}
          size="sm"
        />
        <ModernKnob
          label="Drive"
          value={effect.drive || 0}
          min={0}
          max={1}
          onChange={(value) => updateEffect('filter', 'drive', value)}
          size="sm"
        />
        <ModernKnob
          label="Key Follow"
          value={effect.keyFollow || 0.5}
          min={0}
          max={1}
          onChange={(value) => updateEffect('filter', 'keyFollow', value)}
          size="sm"
        />
        <div>
          <label className="block text-xs text-slate-300 mb-2">Type</label>
          <select
            value={effect.type || 'lowpass'}
            onChange={(e) => updateEffect('filter', 'type', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="lowpass">Low Pass</option>
            <option value="highpass">High Pass</option>
            <option value="bandpass">Band Pass</option>
            <option value="notch">Notch</option>
            <option value="allpass">All Pass</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-2">Slope</label>
          <select
            value={effect.slope || '24db'}
            onChange={(e) => updateEffect('filter', 'slope', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="12db">12 dB/Oct</option>
            <option value="24db">24 dB/Oct</option>
            <option value="36db">36 dB/Oct</option>
            <option value="48db">48 dB/Oct</option>
          </select>
        </div>
      </div>
    );
  };

  const renderEQControls = () => {
    const effect = synthState.effects.eq || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernKnob
          label="Low"
          value={effect.low || 0}
          min={-12}
          max={12}
          onChange={(value) => updateEffect('eq', 'low', value)}
          size="sm"
          unit="dB"
        />
        <ModernKnob
          label="Low Mid"
          value={effect.lowMid || 0}
          min={-12}
          max={12}
          onChange={(value) => updateEffect('eq', 'lowMid', value)}
          size="sm"
          unit="dB"
        />
        <ModernKnob
          label="High Mid"
          value={effect.highMid || 0}
          min={-12}
          max={12}
          onChange={(value) => updateEffect('eq', 'highMid', value)}
          size="sm"
          unit="dB"
        />
        <ModernKnob
          label="High"
          value={effect.high || 0}
          min={-12}
          max={12}
          onChange={(value) => updateEffect('eq', 'high', value)}
          size="sm"
          unit="dB"
        />
        <ModernKnob
          label="Low Freq"
          value={effect.lowFreq || 100}
          min={20}
          max={500}
          onChange={(value) => updateEffect('eq', 'lowFreq', value)}
          size="sm"
          unit="Hz"
        />
        <ModernKnob
          label="Low Mid Freq"
          value={effect.lowMidFreq || 500}
          min={200}
          max={2000}
          onChange={(value) => updateEffect('eq', 'lowMidFreq', value)}
          size="sm"
          unit="Hz"
        />
        <ModernKnob
          label="High Mid Freq"
          value={effect.highMidFreq || 2000}
          min={1000}
          max={8000}
          onChange={(value) => updateEffect('eq', 'highMidFreq', value)}
          size="sm"
          unit="Hz"
        />
        <ModernKnob
          label="High Freq"
          value={effect.highFreq || 10000}
          min={5000}
          max={20000}
          onChange={(value) => updateEffect('eq', 'highFreq', value)}
          size="sm"
          unit="Hz"
        />
      </div>
    );
  };

  const renderStereoControls = () => {
    const effect = synthState.effects.stereo || {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ModernKnob
          label="Width"
          value={effect.width || 1.0}
          min={0}
          max={2}
          onChange={(value) => updateEffect('stereo', 'width', value)}
          size="sm"
        />
        <ModernKnob
          label="Bass Width"
          value={effect.bass || 0.8}
          min={0}
          max={1}
          onChange={(value) => updateEffect('stereo', 'bass', value)}
          size="sm"
        />
        <ModernKnob
          label="Delay"
          value={effect.delay || 0.5}
          min={0}
          max={5}
          onChange={(value) => updateEffect('stereo', 'delay', value)}
          size="sm"
          unit="ms"
        />
        <ModernKnob
          label="Phase"
          value={effect.phase || 0}
          min={-180}
          max={180}
          onChange={(value) => updateEffect('stereo', 'phase', value)}
          size="sm"
          unit="°"
        />
      </div>
    );
  };

  const renderEffectControls = (sectionId: string) => {
    switch (sectionId) {
      case 'reverb': return renderReverbControls();
      case 'delay': return renderDelayControls();
      case 'chorus': return renderChorusControls();
      case 'distortion': return renderDistortionControls();
      case 'compressor': return renderCompressorControls();
      case 'filter': return renderFilterControls();
      case 'eq': return renderEQControls();
      case 'stereo': return renderStereoControls();
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Global Controls */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Enhanced Effects Rack
          </h3>
          <div className="flex items-center gap-4">
            {/* Processing Load */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">CPU:</span>
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    processingLoad > 80 ? 'bg-red-500' : 
                    processingLoad > 60 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${processingLoad}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-8">{Math.round(processingLoad)}%</span>
            </div>
            
            {/* Global Bypass */}
            <button
              onClick={() => setGlobalBypass(!globalBypass)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                globalBypass 
                  ? 'bg-red-500 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              {globalBypass ? 'BYPASSED' : 'ACTIVE'}
            </button>
          </div>
        </div>
      </div>

      {/* Effect Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const colorClasses = getColorClasses(section.color, section.active);
          const IconComponent = section.icon;
          
          return (
            <div 
              key={section.id}
              className={`glass-panel rounded-xl border transition-all duration-300 ${
                section.active 
                  ? `${colorClasses.bg} ${colorClasses.border}` 
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              {/* Section Header */}
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {section.expanded ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                    
                    <IconComponent 
                      className={`w-5 h-5 ${
                        section.active ? colorClasses.text : 'text-slate-400'
                      }`} 
                    />
                    
                    <h4 className={`font-semibold ${
                      section.active ? colorClasses.text : 'text-slate-300'
                    }`}>
                      {section.name}
                    </h4>
                    
                    {section.active && (
                      <div className={`w-2 h-2 rounded-full ${colorClasses.accent} animate-pulse`} />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resetEffect(section.id)}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                      title="Reset to defaults"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleEffect(section.id)}
                      className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
                        section.active 
                          ? colorClasses.accent
                          : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 absolute top-0.5 ${
                        section.active 
                          ? 'translate-x-6' 
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {section.expanded && (
                <div className="px-4 pb-4">
                  <div className={`transition-opacity duration-200 ${
                    section.active ? 'opacity-100' : 'opacity-50'
                  }`}>
                    {renderEffectControls(section.id)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}