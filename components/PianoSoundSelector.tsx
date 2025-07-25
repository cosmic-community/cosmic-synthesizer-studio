'use client';

import { useState } from 'react';
import { ChevronDown, Volume2, Info } from 'lucide-react';
import { pianoSounds, pianoCategories, PianoSoundConfig } from '@/lib/pianoSounds';

interface PianoSoundSelectorProps {
  selectedSound: PianoSoundConfig;
  onSoundChange: (sound: PianoSoundConfig) => void;
  onTestSound?: (sound: PianoSoundConfig) => void;
}

export default function PianoSoundSelector({ 
  selectedSound, 
  onSoundChange, 
  onTestSound 
}: PianoSoundSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredSounds = selectedCategory === 'all' 
    ? pianoSounds 
    : pianoSounds.filter(sound => sound.category === selectedCategory);

  const handleSoundSelect = (sound: PianoSoundConfig) => {
    onSoundChange(sound);
    setIsOpen(false);
  };

  const handleTestSound = (sound: PianoSoundConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTestSound) {
      onTestSound(sound);
    }
  };

  return (
    <div className="relative">
      {/* Current Selection Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-synth-control border border-gray-600 rounded-lg p-3 flex items-center justify-between hover:border-synth-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: selectedSound.color }}
          />
          <div className="text-left">
            <div className="text-white font-medium">{selectedSound.name}</div>
            <div className="text-xs text-gray-400 capitalize">{selectedSound.category}</div>
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-synth-panel border border-gray-600 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Category Filter */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-synth-accent text-black'
                    : 'bg-synth-control text-gray-300 hover:text-white'
                }`}
              >
                All ({pianoSounds.length})
              </button>
              {pianoCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-synth-accent text-black'
                      : 'bg-synth-control text-gray-300 hover:text-white'
                  }`}
                >
                  {category.name} ({pianoSounds.filter(s => s.category === category.id).length})
                </button>
              ))}
            </div>
          </div>

          {/* Sound List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredSounds.map(sound => (
              <div
                key={sound.id}
                className={`p-3 border-b border-gray-700 last:border-b-0 hover:bg-synth-bg transition-colors cursor-pointer ${
                  selectedSound.id === sound.id ? 'bg-synth-bg' : ''
                }`}
                onClick={() => handleSoundSelect(sound)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sound.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {sound.name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {sound.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {/* Test Sound Button */}
                    {onTestSound && (
                      <button
                        onClick={(e) => handleTestSound(sound, e)}
                        className="p-1 text-gray-400 hover:text-synth-accent transition-colors"
                        title="Test sound"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(showDetails === sound.id ? null : sound.id);
                      }}
                      className="p-1 text-gray-400 hover:text-synth-info transition-colors"
                      title="Show details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sound Details */}
                {showDetails === sound.id && (
                  <div className="mt-3 pt-3 border-t border-gray-600 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-400">Oscillator:</span>
                        <span className="text-white ml-1 capitalize">{sound.oscillatorType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white ml-1 capitalize">{sound.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Attack:</span>
                        <span className="text-white ml-1">{sound.envelope.attack}s</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Release:</span>
                        <span className="text-white ml-1">{sound.envelope.release}s</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Filter:</span>
                        <span className="text-white ml-1">
                          {sound.filter.frequency}Hz {sound.filter.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Harmonics:</span>
                        <span className="text-white ml-1">
                          {sound.harmonics?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Close button */}
          <div className="p-3 border-t border-gray-700 bg-synth-bg">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}