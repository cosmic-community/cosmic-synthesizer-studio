'use client';

import { useState, useEffect } from 'react';
import { X, Save, Download, Trash2, Play } from 'lucide-react';
import { SynthState, SynthPreset } from '@/types';
import { getPresets, savePreset } from '@/lib/cosmic';

interface PresetManagerProps {
  onClose: () => void;
  onLoadPreset: (preset: SynthPreset) => void;
  currentState: SynthState;
}

export default function PresetManager({ onClose, onLoadPreset, currentState }: PresetManagerProps) {
  const [presets, setPresets] = useState<SynthPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const fetchedPresets = await getPresets();
      setPresets(fetchedPresets);
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) return;

    setSaving(true);
    try {
      const effects: string[] = [];
      if (currentState.effects.reverb.active) effects.push('reverb');
      if (currentState.effects.delay.active) effects.push('delay');
      if (currentState.effects.distortion.active) effects.push('distortion');
      if (currentState.effects.chorus.active) effects.push('chorus');

      const presetData = {
        title: newPresetName,
        oscillator_type: currentState.oscillatorType,
        filter_cutoff: currentState.filterCutoff,
        filter_resonance: currentState.filterResonance,
        envelope_attack: currentState.attack,
        envelope_decay: currentState.decay,
        envelope_sustain: currentState.sustain,
        envelope_release: currentState.release,
        effects,
        reverb_amount: currentState.effects.reverb.amount,
        delay_time: currentState.effects.delay.time,
        delay_feedback: currentState.effects.delay.feedback,
        distortion_amount: currentState.effects.distortion.amount,
        chorus_rate: currentState.effects.chorus.rate,
        chorus_depth: currentState.effects.chorus.depth
      };

      const savedPreset = await savePreset(presetData);
      setPresets(prev => [savedPreset, ...prev]);
      setNewPresetName('');
      setShowSaveForm(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPresetPreview = (preset: SynthPreset) => {
    const effects = preset.metadata?.effects || [];
    return {
      oscillator: preset.metadata?.oscillator_type || 'sawtooth',
      filter: `${preset.metadata?.filter_cutoff || 1000}Hz`,
      effects: effects.length > 0 ? effects.join(', ') : 'None'
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-synth-panel rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-synth-accent">Preset Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Save Current State */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Save Current State</h3>
              <button
                onClick={() => setShowSaveForm(!showSaveForm)}
                className="synth-button flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Preset
              </button>
            </div>

            {showSaveForm && (
              <div className="bg-synth-bg p-4 rounded-lg">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Enter preset name..."
                    className="flex-1 px-3 py-2 bg-synth-control border border-gray-600 rounded text-white"
                    disabled={saving}
                  />
                  <button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim() || saving}
                    className="synth-button disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowSaveForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Presets Grid */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Saved Presets ({presets.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-synth-control border-t-synth-accent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading presets...</p>
              </div>
            ) : presets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No presets saved yet.</p>
                <p className="text-sm mt-2">Save your first preset above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => {
                  const preview = getPresetPreview(preset);
                  
                  return (
                    <div
                      key={preset.id}
                      className="bg-synth-bg p-4 rounded-lg border border-gray-700 hover:border-synth-accent transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white truncate">
                          {preset.title}
                        </h4>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => onLoadPreset(preset)}
                            className="p-1 text-synth-info hover:text-white transition-colors"
                            title="Load Preset"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Download Preset"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Preset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Oscillator:</span>
                          <span className="text-white capitalize">{preview.oscillator}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Filter:</span>
                          <span className="text-white">{preview.filter}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Effects:</span>
                          <span className="text-white text-right">{preview.effects}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-xs text-gray-500">
                          {preset.created_at && new Date(preset.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-synth-bg">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <p>Presets are automatically synced to your Cosmic CMS bucket</p>
            <button
              onClick={onClose}
              className="synth-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}