'use client';

import { useState } from 'react';
import { DrumKit, DrumSoundConfig, drumKits, getDrumKitById, soundCategories } from '@/lib/drumSounds';
import { Volume2, Play, Settings, Shuffle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface DrumSoundSelectorProps {
  selectedKit: string;
  selectedSounds: DrumSoundConfig[];
  onKitChange: (kitId: string) => void;
  onSoundsChange: (sounds: DrumSoundConfig[]) => void;
  onPlaySound?: (sound: DrumSoundConfig) => void;
}

export default function DrumSoundSelector({
  selectedKit,
  selectedSounds,
  onKitChange,
  onSoundsChange,
  onPlaySound
}: DrumSoundSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['low', 'mid', 'high']);
  const [customizingSound, setCustomizingSound] = useState<number | null>(null);
  const [showKitSelector, setShowKitSelector] = useState(false);

  const currentKit = getDrumKitById(selectedKit);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleSoundChange = (index: number, newSound: DrumSoundConfig) => {
    const newSounds = [...selectedSounds];
    newSounds[index] = newSound;
    onSoundsChange(newSounds);
  };

  const handleParameterChange = (soundIndex: number, parameter: string, value: number) => {
    const newSounds = [...selectedSounds];
    if (newSounds[soundIndex]) {
      newSounds[soundIndex] = {
        ...newSounds[soundIndex],
        [parameter]: value
      };
      onSoundsChange(newSounds);
    }
  };

  const randomizeKit = () => {
    if (currentKit) {
      const shuffled = [...currentKit.sounds].sort(() => Math.random() - 0.5);
      onSoundsChange(shuffled.slice(0, 8));
    }
  };

  const resetToDefault = () => {
    if (currentKit) {
      onSoundsChange(currentKit.sounds.slice(0, 8));
    }
  };

  const getSoundsByCategory = (category: string) => {
    if (!currentKit) return [];
    return currentKit.sounds.filter(sound => sound.category === category);
  };

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-synth-accent flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Drum Sound Selector
        </h3>
        
        <div className="flex items-center gap-2">
          <button onClick={randomizeKit} className="synth-button text-sm flex items-center gap-1">
            <Shuffle className="w-3 h-3" />
            Random
          </button>
          
          <button onClick={resetToDefault} className="synth-button text-sm flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Kit Selector */}
      <div className="mb-6">
        <div className="relative">
          <button
            onClick={() => setShowKitSelector(!showKitSelector)}
            className="w-full bg-synth-control border border-gray-600 rounded-lg px-4 py-3 flex items-center justify-between text-left hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentKit?.color || '#888888' }}
              />
              <div>
                <div className="font-medium text-white">{currentKit?.name || 'Select Kit'}</div>
                <div className="text-sm text-gray-400">{currentKit?.description}</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showKitSelector ? 'rotate-180' : ''}`} />
          </button>

          {showKitSelector && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-synth-control border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {drumKits.map(kit => (
                <button
                  key={kit.id}
                  onClick={() => {
                    onKitChange(kit.id);
                    onSoundsChange(kit.sounds.slice(0, 8));
                    setShowKitSelector(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-600 transition-colors text-left ${
                    kit.id === selectedKit ? 'bg-gray-600' : ''
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: kit.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{kit.name}</div>
                    <div className="text-sm text-gray-400 truncate">{kit.description}</div>
                    <div className="text-xs text-synth-accent">{kit.category.toUpperCase()}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sound Categories */}
      {currentKit && (
        <div className="space-y-4">
          {Object.entries(soundCategories).map(([categoryKey, category]) => {
            const categorySounds = getSoundsByCategory(categoryKey);
            const isExpanded = expandedCategories.includes(categoryKey);
            
            if (categorySounds.length === 0) return null;

            return (
              <div key={categoryKey} className="border border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full bg-synth-control px-4 py-3 flex items-center justify-between hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="font-medium text-white">{category.name}</div>
                      <div className="text-xs text-gray-400">{category.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{categorySounds.length} sounds</span>
                    <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-gray-800 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categorySounds.map((sound, soundIndex) => {
                      const globalIndex = currentKit.sounds.findIndex(s => s === sound);
                      const isSelected = selectedSounds.some(s => s.name === sound.name);
                      
                      return (
                        <div
                          key={soundIndex}
                          className={`relative group rounded-lg border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-synth-accent bg-synth-accent bg-opacity-10' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <button
                            onClick={() => {
                              const existingIndex = selectedSounds.findIndex(s => s.name === sound.name);
                              if (existingIndex >= 0) {
                                // Replace existing sound
                                handleSoundChange(existingIndex, sound);
                              } else {
                                // Add to first available slot
                                const emptySlot = selectedSounds.findIndex((s, i) => i >= 8 || !s);
                                if (emptySlot >= 0 && emptySlot < 8) {
                                  handleSoundChange(emptySlot, sound);
                                } else {
                                  // Replace last sound if no empty slots
                                  handleSoundChange(7, sound);
                                }
                              }
                            }}
                            className="w-full p-3 text-left"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: sound.color || category.color }}
                              />
                              <span className="font-medium text-white text-sm truncate">{sound.name}</span>
                            </div>
                            <div className="text-xs text-gray-400 space-y-1">
                              <div>Type: {sound.type}</div>
                              <div>Freq: {sound.frequency}Hz</div>
                              <div>Decay: {sound.decay.toFixed(2)}s</div>
                            </div>
                          </button>

                          {/* Play button */}
                          {onPlaySound && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlaySound(sound);
                              }}
                              className="absolute top-2 right-2 w-6 h-6 bg-synth-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-synth-info"
                            >
                              <Play className="w-3 h-3 text-black" />
                            </button>
                          )}

                          {/* Customize button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomizingSound(customizingSound === globalIndex ? null : globalIndex);
                            }}
                            className="absolute bottom-2 right-2 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                          >
                            <Settings className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Sounds Display */}
      <div className="mt-6 border-t border-gray-600 pt-4">
        <h4 className="text-lg font-semibold text-white mb-3">Selected Sounds ({selectedSounds.length}/8)</h4>
        <div className="grid grid-cols-4 gap-2">
          {Array(8).fill(null).map((_, index) => {
            const sound = selectedSounds[index];
            return (
              <div
                key={index}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                  sound 
                    ? 'border-synth-accent bg-synth-accent bg-opacity-10 text-white' 
                    : 'border-gray-600 border-dashed text-gray-500'
                }`}
                style={sound ? { borderColor: sound.color } : {}}
              >
                {sound ? (
                  <div className="text-center p-2">
                    <div className="truncate">{sound.name}</div>
                    <div className="text-xs text-gray-400">{sound.type}</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div>Empty</div>
                    <div className="text-xs">Slot {index + 1}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sound Parameter Customization */}
      {customizingSound !== null && currentKit && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Customize: {currentKit.sounds[customizingSound]?.name}
            </h4>
            <button
              onClick={() => setCustomizingSound(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          {currentKit.sounds[customizingSound] && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Volume */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentKit.sounds[customizingSound].volume}
                  onChange={(e) => handleParameterChange(customizingSound, 'volume', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Pitch */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Pitch</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={currentKit.sounds[customizingSound].pitch || 1}
                  onChange={(e) => handleParameterChange(customizingSound, 'pitch', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Decay */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Decay</label>
                <input
                  type="range"
                  min="0.05"
                  max="3"
                  step="0.05"
                  value={currentKit.sounds[customizingSound].decay}
                  onChange={(e) => handleParameterChange(customizingSound, 'decay', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Resonance */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Resonance</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentKit.sounds[customizingSound].resonance || 0.5}
                  onChange={(e) => handleParameterChange(customizingSound, 'resonance', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Distortion */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Distortion</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentKit.sounds[customizingSound].distortion || 0}
                  onChange={(e) => handleParameterChange(customizingSound, 'distortion', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Reverb */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Reverb</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentKit.sounds[customizingSound].reverb || 0}
                  onChange={(e) => handleParameterChange(customizingSound, 'reverb', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}