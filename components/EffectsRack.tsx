'use client';

import { SynthState } from '@/types';
import ModernKnob from './ModernKnob';

interface EffectsRackProps {
  synthState: SynthState;
  onStateChange: (state: SynthState) => void;
}

export default function EffectsRack({ synthState, onStateChange }: EffectsRackProps) {
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

  const toggleEffect = (effectName: string) => {
    const effect = synthState.effects[effectName as keyof typeof synthState.effects];
    updateEffect(effectName, 'active', !effect?.active);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reverb */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-cyan-400">Reverb</h4>
            <button
              onClick={() => toggleEffect('reverb')}
              className={`w-8 h-4 rounded-full transition-all duration-200 ${
                synthState.effects.reverb?.active 
                  ? 'bg-cyan-500' 
                  : 'bg-slate-600'
              }`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                synthState.effects.reverb?.active 
                  ? 'translate-x-4' 
                  : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="space-y-4">
            <ModernKnob
              label="Amount"
              value={synthState.effects.reverb?.amount || 0}
              min={0}
              max={1}
              onChange={(value) => updateEffect('reverb', 'amount', value)}
              size="small"
            />
            <ModernKnob
              label="Room Size"
              value={synthState.effects.reverb?.roomSize || 0}
              min={0}
              max={1}
              onChange={(value) => updateEffect('reverb', 'roomSize', value)}
              size="small"
            />
          </div>
        </div>

        {/* Delay */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-cyan-400">Delay</h4>
            <button
              onClick={() => toggleEffect('delay')}
              className={`w-8 h-4 rounded-full transition-all duration-200 ${
                synthState.effects.delay?.active 
                  ? 'bg-cyan-500' 
                  : 'bg-slate-600'
              }`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                synthState.effects.delay?.active 
                  ? 'translate-x-4' 
                  : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="space-y-4">
            <ModernKnob
              label="Time"
              value={synthState.effects.delay?.time || 0}
              min={0}
              max={1}
              onChange={(value) => updateEffect('delay', 'time', value)}
              size="small"
              unit="s"
            />
            <ModernKnob
              label="Feedback"
              value={synthState.effects.delay?.feedback || 0}
              min={0}
              max={0.95}
              onChange={(value) => updateEffect('delay', 'feedback', value)}
              size="small"
            />
          </div>
        </div>

        {/* Distortion */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-cyan-400">Distortion</h4>
            <button
              onClick={() => toggleEffect('distortion')}
              className={`w-8 h-4 rounded-full transition-all duration-200 ${
                synthState.effects.distortion?.active 
                  ? 'bg-cyan-500' 
                  : 'bg-slate-600'
              }`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                synthState.effects.distortion?.active 
                  ? 'translate-x-4' 
                  : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="space-y-4">
            <ModernKnob
              label="Amount"
              value={synthState.effects.distortion?.amount || 0}
              min={0}
              max={100}
              onChange={(value) => updateEffect('distortion', 'amount', value)}
              size="small"
            />
            <div>
              <label className="block text-xs text-slate-300 mb-2">Type</label>
              <select
                value={synthState.effects.distortion?.type || 'soft'}
                onChange={(e) => updateEffect('distortion', 'type', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
              >
                <option value="soft">Soft</option>
                <option value="hard">Hard</option>
                <option value="tube">Tube</option>
                <option value="fuzz">Fuzz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chorus */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-cyan-400">Chorus</h4>
            <button
              onClick={() => toggleEffect('chorus')}
              className={`w-8 h-4 rounded-full transition-all duration-200 ${
                synthState.effects.chorus?.active 
                  ? 'bg-cyan-500' 
                  : 'bg-slate-600'
              }`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                synthState.effects.chorus?.active 
                  ? 'translate-x-4' 
                  : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="space-y-4">
            <ModernKnob
              label="Rate"
              value={synthState.effects.chorus?.rate || 0}
              min={0.1}
              max={10}
              onChange={(value) => updateEffect('chorus', 'rate', value)}
              size="small"
              unit="Hz"
            />
            <ModernKnob
              label="Depth"
              value={synthState.effects.chorus?.depth || 0}
              min={0}
              max={1}
              onChange={(value) => updateEffect('chorus', 'depth', value)}
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  );
}