'use client';

import { useState, useEffect } from 'react';
import { SynthState } from '@/types';
import { getPresets, savePreset } from '@/lib/cosmic';
import { X, Save, Download, Search } from 'lucide-react';

interface PresetManagerProps {
  onClose: () => void;
  onLoadPreset: (preset: any) => void;
  currentState: SynthState;
}

export default function PresetManager({ onClose, onLoadPreset, currentState }: PresetManagerProps) {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const presetsData = await getPresets();
      setPresets(presetsData);
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    try {
      setSaving(true);
      
      const presetData = {
        title: presetName,
        oscillator_type: currentState.oscillatorType,
        filter_cutoff: currentState.filterCutoff,
        filter_resonance: currentState.filterResonance,
        envelope_attack: currentState.attack,
        envelope_decay: currentState.decay,
        envelope_sustain: currentState.sustain,
        envelope_release: currentState.release,
        effects: Object.keys(currentState.effects).filter(
          key => currentState.effects[key as keyof typeof currentState.effects]?.active
        ),
        reverb_amount: currentState.effects.reverb?.amount || 0,
        delay_time: currentState.effects.delay?.time || 0,
        delay_feedback: currentState.effects.delay?.feedback || 0,
        distortion_amount: currentState.effects.distortion?.amount || 0,
        chorus_rate: currentState.effects.chorus?.rate || 0,
        chorus_depth: currentState.effects.chorus?.depth || 0
      };

      await savePreset(presetData);
      setPresetName('');
      await loadPresets(); // Reload presets
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPresets = presets.filter(preset =>
    preset.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Preset Manager</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Save New Preset */}
          <div className="glass-panel p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Save Current Settings</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
              <button
                onClick={handleSavePreset}
                disabled={saving || !presetName.trim()}
                className="btn-primary flex items-center gap-2 px-4"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search presets..."
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400"
            />
          </div>

          {/* Presets List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-slate-400">Loading presets...</p>
              </div>
            ) : filteredPresets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">
                  {searchTerm ? 'No presets found matching your search.' : 'No presets saved yet.'}
                </p>
              </div>
            ) : (
              filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="glass-panel p-4 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{preset.title}</h4>
                      <div className="text-sm text-slate-400 mt-1">
                        {preset.metadata?.oscillator_type && (
                          <span className="mr-4">
                            Wave: {preset.metadata.oscillator_type}
                          </span>
                        )}
                        {preset.metadata?.effects && preset.metadata.effects.length > 0 && (
                          <span>
                            Effects: {preset.metadata.effects.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        onLoadPreset(preset);
                        onClose();
                      }}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Load
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}