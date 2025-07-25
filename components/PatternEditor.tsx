'use client';

import { useState } from 'react';
import { Grid3x3, Play, Pause, Copy, Trash2, RotateCcw, Shuffle } from 'lucide-react';

interface Pattern {
  id: string;
  name: string;
  steps: boolean[][];
  length: number;
  sounds: string[];
}

export default function PatternEditor() {
  const [currentPattern, setCurrentPattern] = useState<Pattern>({
    id: '1',
    name: 'Rock Beat',
    length: 16,
    sounds: ['Kick', 'Snare', 'Hi-Hat', 'Open Hat'],
    steps: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-Hat
      [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true] // Open Hat
    ]
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSound, setSelectedSound] = useState(0);
  const [bpm, setBpm] = useState(128);

  const toggleStep = (soundIndex: number, stepIndex: number) => {
    setCurrentPattern(prev => ({
      ...prev,
      steps: prev.steps.map((sound, i) =>
        i === soundIndex
          ? sound.map((step, j) => (j === stepIndex ? !step : step))
          : sound
      )
    }));
  };

  const clearPattern = () => {
    setCurrentPattern(prev => ({
      ...prev,
      steps: prev.steps.map(sound => sound.map(() => false))
    }));
  };

  const randomizePattern = () => {
    setCurrentPattern(prev => ({
      ...prev,
      steps: prev.steps.map(sound =>
        sound.map(() => Math.random() < 0.3) // 30% chance for each step
      )
    }));
  };

  const copyPattern = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPattern));
  };

  const getSoundColor = (index: number) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-synth-control rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="w-5 h-5 text-synth-accent" />
        <h3 className="text-lg font-semibold text-white">Pattern Editor</h3>
      </div>

      {/* Pattern Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <input
            type="text"
            value={currentPattern.name}
            onChange={(e) => setCurrentPattern(prev => ({ ...prev, name: e.target.value }))}
            className="bg-transparent text-white font-medium border-none outline-none"
          />
          <div className="text-sm text-gray-400">{currentPattern.length} steps • {bpm} BPM</div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="synth-button-small"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={copyPattern} className="synth-button-small">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={randomizePattern} className="synth-button-small">
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={clearPattern} className="synth-button-small">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BPM Control */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">BPM:</span>
        <input
          type="range"
          min="60"
          max="200"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-white w-8">{bpm}</span>
      </div>

      {/* Step Sequencer Grid */}
      <div className="space-y-2">
        {/* Step Numbers */}
        <div className="flex gap-1 ml-16">
          {Array.from({ length: currentPattern.length }, (_, i) => (
            <div
              key={i}
              className={`w-6 h-4 flex items-center justify-center text-xs rounded ${
                i === currentStep && isPlaying
                  ? 'bg-synth-accent text-white'
                  : i % 4 === 0
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Sound Rows */}
        {currentPattern.sounds.map((soundName, soundIndex) => (
          <div key={soundIndex} className="flex items-center gap-1">
            {/* Sound Label */}
            <button
              onClick={() => setSelectedSound(soundIndex)}
              className={`w-14 h-6 text-xs rounded flex items-center justify-center font-medium transition-colors ${
                selectedSound === soundIndex
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                backgroundColor: selectedSound === soundIndex ? getSoundColor(soundIndex) : 'transparent',
                border: `1px solid ${getSoundColor(soundIndex)}`
              }}
            >
              {soundName}
            </button>

            {/* Step Buttons */}
            {currentPattern.steps[soundIndex]?.map((isActive, stepIndex) => (
              <button
                key={stepIndex}
                onClick={() => toggleStep(soundIndex, stepIndex)}
                className={`w-6 h-6 rounded transition-all ${
                  isActive
                    ? 'shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${
                  stepIndex === currentStep && isPlaying
                    ? 'ring-2 ring-white'
                    : ''
                }`}
                style={{
                  backgroundColor: isActive ? getSoundColor(soundIndex) : undefined
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pattern Length Control */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm text-gray-400">Length:</span>
        <div className="flex gap-1">
          {[8, 16, 32].map(length => (
            <button
              key={length}
              onClick={() => {
                setCurrentPattern(prev => ({
                  ...prev,
                  length,
                  steps: prev.steps.map(sound => {
                    const newSound = [...sound];
                    if (length > sound.length) {
                      // Extend with false values
                      while (newSound.length < length) {
                        newSound.push(false);
                      }
                    } else {
                      // Truncate
                      newSound.splice(length);
                    }
                    return newSound;
                  })
                }));
              }}
              className={`px-2 py-1 text-xs rounded ${
                currentPattern.length === length
                  ? 'bg-synth-accent text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {length}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            // Shift pattern left
            setCurrentPattern(prev => ({
              ...prev,
              steps: prev.steps.map(sound => [...sound.slice(1), sound[0]])
            }));
          }}
          className="synth-button-small flex-1"
        >
          ← Shift
        </button>
        <button
          onClick={() => {
            // Shift pattern right
            setCurrentPattern(prev => ({
              ...prev,
              steps: prev.steps.map(sound => [sound[sound.length - 1], ...sound.slice(0, -1)])
            }));
          }}
          className="synth-button-small flex-1"
        >
          Shift →
        </button>
        <button
          onClick={() => {
            // Reverse pattern
            setCurrentPattern(prev => ({
              ...prev,
              steps: prev.steps.map(sound => [...sound].reverse())
            }));
          }}
          className="synth-button-small flex-1"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}