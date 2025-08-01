'use client';

import { useState } from 'react';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import SynthesizerStudio from '@/components/SynthesizerStudio';
import AnimatedBackground from '@/components/AnimatedBackground';
import { backgroundPresets } from '@/components/AnimatedBackground';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('synth');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Cosmic Synthesizer Studio
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                Professional web-based music production platform featuring advanced synthesis, 
                drum programming, effects processing, and multi-track recording capabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="glass-panel p-6 rounded-xl text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    🎹
                  </div>
                  <h3 className="font-semibold text-white mb-2">Advanced Synthesis</h3>
                  <p className="text-sm text-gray-400">
                    Professional synthesizer with multiple oscillators, filters, and modulation options
                  </p>
                </div>
                <div className="glass-panel p-6 rounded-xl text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    🥁
                  </div>
                  <h3 className="font-semibold text-white mb-2">Drum Machine</h3>
                  <p className="text-sm text-gray-400">
                    16-step sequencer with multiple drum sounds and pattern programming
                  </p>
                </div>
                <div className="glass-panel p-6 rounded-xl text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    🎛️
                  </div>
                  <h3 className="font-semibold text-white mb-2">Effects Rack</h3>
                  <p className="text-sm text-gray-400">
                    Professional effects including reverb, delay, distortion, and modulation
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'synth':
      case 'drums':
      case 'effects':
      case 'mixer':
      case 'recording':
        return <SynthesizerStudio />;
      
      case 'library':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Sound Library</h2>
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-gray-400 text-center py-12">
                Sound library coming soon - browse and load presets, samples, and patterns
              </p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-gray-400 text-center py-12">
                Settings panel coming soon - configure audio, MIDI, and application preferences
              </p>
            </div>
          </div>
        );
      
      default:
        return <SynthesizerStudio />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground 
        {...backgroundPresets.studio}
        className="fixed inset-0 z-0"
      />
      
      {/* Main Application */}
      <div className="relative z-10">
        <ResponsiveLayout
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isPlaying={isPlaying}
          isRecording={isRecording}
          onPlay={handlePlay}
          onStop={handleStop}
          onRecord={handleRecord}
          masterVolume={masterVolume}
          onVolumeChange={setMasterVolume}
          showStatusBar={true}
        >
          {renderContent()}
        </ResponsiveLayout>
      </div>
    </div>
  );
}