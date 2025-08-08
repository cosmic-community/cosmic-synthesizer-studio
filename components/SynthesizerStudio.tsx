'use client';

import { useState, useEffect, useRef } from 'react';
import { AudioEngine } from '@/lib/audioEngine';
import { isCosmicConfigured } from '@/lib/cosmic';
import { SynthState, RecordingState, DrumSequencerState } from '@/types';
import SynthControls from '@/components/SynthControls';
import EffectsRack from '@/components/EffectsRack';
import PianoKeyboard from '@/components/PianoKeyboard';
import DrumSequencer from '@/components/DrumSequencer';
import RecordingControls from '@/components/RecordingControls';
import AudioVisualizer from '@/components/AudioVisualizer';
import PresetManager from '@/components/PresetManager';
import { 
  Play, 
  Square, 
  Mic, 
  Volume2, 
  Settings,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const defaultSynthState: SynthState = {
  oscillatorType: 'sawtooth',
  filterCutoff: 1000,
  filterResonance: 1,
  attack: 0.1,
  decay: 0.3,
  sustain: 0.7,
  release: 0.5,
  volume: 0.5,
  effects: {
    reverb: { 
      active: false, 
      amount: 0.3, 
      roomSize: 0.5, 
      damping: 0.5, 
      predelay: 0, 
      width: 1.0, 
      type: 'hall' 
    },
    delay: { 
      active: false, 
      time: 0.25, 
      feedback: 0.3, 
      highCut: 8000, 
      wetLevel: 0.3, 
      stereo: false 
    },
    distortion: { 
      active: false, 
      amount: 50, 
      type: 'soft', 
      drive: 30, 
      tone: 0.7, 
      level: 0.8, 
      bias: 0, 
      oversampling: '2x' 
    },
    chorus: { 
      active: false, 
      rate: 1, 
      depth: 0.5, 
      feedback: 0.2, 
      mix: 0.3, 
      voices: 3, 
      waveform: 'sine' 
    },
    phaser: { active: false, rate: 0.5, depth: 0.7 },
    flanger: { active: false, rate: 0.3, feedback: 0.6 },
    compressor: { 
      active: false, 
      threshold: -20, 
      ratio: 4, 
      attack: 5, 
      release: 100, 
      knee: 2, 
      makeup: 0 
    },
    eq: { 
      active: false, 
      low: 0, 
      mid: 0, 
      high: 0, 
      lowMid: 0, 
      highMid: 0, 
      lowFreq: 100, 
      lowMidFreq: 500, 
      highMidFreq: 2000, 
      highFreq: 10000 
    },
    filter: { 
      active: false, 
      cutoff: 1000, 
      resonance: 0.3, 
      type: 'lowpass', 
      drive: 0, 
      keyFollow: 0.5, 
      slope: '24db' 
    },
    stereo: { 
      active: false, 
      width: 1.0, 
      bass: 0.8, 
      delay: 0.5, 
      phase: 0 
    }
  }
};

const defaultRecordingState: RecordingState = {
  isRecording: false,
  isPlaying: false,
  duration: 0,
  audioBuffer: null,
  waveformData: []
};

const defaultDrumState: DrumSequencerState = {
  isPlaying: false,
  currentStep: 0,
  bpm: 128,
  pattern: Array(8).fill(null).map(() => Array(16).fill(false)),
  selectedSound: 0,
  sounds: [
    { name: 'Kick', type: 'kick', frequency: 60, decay: 0.5, volume: 0.8 },
    { name: 'Snare', type: 'snare', frequency: 200, decay: 0.2, volume: 0.7 },
    { name: 'Hi-Hat', type: 'hihat', frequency: 8000, decay: 0.1, volume: 0.6 },
    { name: 'Open Hat', type: 'openhat', frequency: 9000, decay: 0.3, volume: 0.5 }
  ]
};

export default function SynthesizerStudio() {
  const [synthState, setSynthState] = useState<SynthState>(defaultSynthState);
  const [recordingState, setRecordingState] = useState<RecordingState>(defaultRecordingState);
  const [drumState, setDrumState] = useState<DrumSequencerState>(defaultDrumState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [activeTab, setActiveTab] = useState<'synth' | 'drums' | 'effects' | 'recording'>('synth');
  const [globalTransport, setGlobalTransport] = useState({
    isPlaying: false,
    isRecording: false,
    bpm: 128,
    masterVolume: 0.7
  });

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const drumIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio engine with timeout
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        console.log('Starting audio engine initialization...');
        const audioEngine = new AudioEngine();
        audioEngineRef.current = audioEngine;
        
        // Set a timeout for initialization
        const initPromise = audioEngine.init();
        const timeoutPromise = new Promise<never>((_, reject) => {
          initTimeoutRef.current = setTimeout(() => {
            reject(new Error('Audio initialization timed out. Please try again.'));
          }, 10000); // 10 second timeout
        });
        
        await Promise.race([initPromise, timeoutPromise]);
        
        // Clear timeout if successful
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        
        console.log('Audio engine initialization completed');
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Audio initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Audio initialization failed');
        setIsInitialized(false);
      } finally {
        setIsInitializing(false);
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
      }
    };

    initializeAudio();

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
      }
      if (drumIntervalRef.current) {
        clearInterval(drumIntervalRef.current);
      }
    };
  }, []);

  // Handle user interaction to resume audio context
  const handleUserInteraction = async () => {
    if (audioEngineRef.current && !audioEngineRef.current.initialized) {
      try {
        await audioEngineRef.current.resume();
        setError(null);
      } catch (error) {
        setError('Failed to enable audio - please try clicking again');
      }
    }
  };

  // Handle key press/release for piano
  function handleKeyPress(frequency: number) {
    if (audioEngineRef.current?.initialized) {
      audioEngineRef.current.playNote(frequency, synthState);
    } else {
      handleUserInteraction();
    }
  }

  function handleKeyRelease(frequency: number) {
    if (audioEngineRef.current?.initialized) {
      audioEngineRef.current.stopNote(frequency);
    }
  }

  // Transport controls
  const handlePlay = () => {
    setGlobalTransport(prev => ({ ...prev, isPlaying: true }));
    if (activeTab === 'drums') {
      toggleDrumSequencer();
    }
  };

  const handleStop = () => {
    setGlobalTransport(prev => ({ ...prev, isPlaying: false }));
    if (drumIntervalRef.current) {
      clearInterval(drumIntervalRef.current);
      drumIntervalRef.current = null;
    }
    setDrumState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
  };

  const toggleDrumSequencer = async () => {
    if (!audioEngineRef.current?.initialized) {
      await handleUserInteraction();
      return;
    }

    if (drumState.isPlaying) {
      if (drumIntervalRef.current) {
        clearInterval(drumIntervalRef.current);
        drumIntervalRef.current = null;
      }
      setDrumState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
    } else {
      const stepTime = (60 / drumState.bpm / 4) * 1000;
      drumIntervalRef.current = setInterval(() => {
        setDrumState(prev => {
          const nextStep = (prev.currentStep + 1) % 16;
          
          prev.pattern?.forEach((track, soundIndex) => {
            if (track?.[prev.currentStep] && prev.sounds?.[soundIndex]) {
              const sound = prev.sounds[soundIndex];
              if (sound && audioEngineRef.current?.initialized) {
                audioEngineRef.current.playDrumSound(sound);
              }
            }
          });
          
          return { ...prev, currentStep: nextStep };
        });
      }, stepTime);
      
      setDrumState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleRecord = () => {
    setGlobalTransport(prev => ({ ...prev, isRecording: !prev.isRecording }));
  };

  const handleVolumeChange = (volume: number) => {
    setGlobalTransport(prev => ({ ...prev, masterVolume: volume }));
    if (audioEngineRef.current) {
      audioEngineRef.current.setMasterVolume(volume);
    }
  };

  const handleLoadPreset = (preset: any) => {
    // Load preset logic here
    setShowPresets(false);
  };

  const retryAudioInit = async () => {
    setIsInitializing(true);
    setError(null);
    
    // Clean up existing engine
    if (audioEngineRef.current) {
      audioEngineRef.current.destroy();
      audioEngineRef.current = null;
    }
    
    // Retry initialization
    try {
      const audioEngine = new AudioEngine();
      audioEngineRef.current = audioEngine;
      await audioEngine.init();
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Audio retry failed:', err);
      setError(err instanceof Error ? err.message : 'Audio initialization failed');
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  if (!isInitialized && error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center p-8 glass-panel rounded-2xl border border-slate-700">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Audio Engine Error</h2>
          <p className="text-red-400 mb-6 max-w-md mx-auto">{error}</p>
          
          <button 
            onClick={retryAudioInit}
            className="btn-primary flex items-center gap-2 mx-auto mb-4"
            disabled={isInitializing}
          >
            <RefreshCw className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
            {isInitializing ? 'Retrying...' : 'Retry'}
          </button>
          
          <div className="text-sm text-slate-400 space-y-1">
            <p>• Make sure your browser supports Web Audio API</p>
            <p>• Try using Chrome, Firefox, or Safari</p>
            <p>• Click anywhere on the page to enable audio</p>
            <p>• Check that audio is not muted in your browser</p>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-cyan-400 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-cyan-400 mb-2">Initializing Audio Engine...</p>
            <p className="text-sm text-slate-400">Setting up Web Audio API</p>
            <div className="mt-4 text-xs text-slate-500">
              This may take a few seconds on first load
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Warning for missing Cosmic config */}
      {!isCosmicConfigured && (
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Cosmic CMS not configured</h3>
              <p className="text-sm text-slate-300">
                Add COSMIC_BUCKET_SLUG to save presets and recordings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audio context suspended warning */}
      {isInitialized && audioEngineRef.current?.contextState === 'suspended' && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-blue-400 font-medium mb-1">Audio needs activation</h3>
              <p className="text-sm text-slate-300 mb-2">
                Click anywhere or press a key to enable audio playback.
              </p>
              <button
                onClick={handleUserInteraction}
                className="btn-secondary text-sm"
              >
                Enable Audio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Transport Controls */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlay}
              className={`btn-transport ${globalTransport.isPlaying ? 'btn-transport-active' : ''}`}
              disabled={!isInitialized}
            >
              <Play className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleStop}
              className="btn-transport"
              disabled={!isInitialized}
            >
              <Square className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRecord}
              className={`btn-transport ${globalTransport.isRecording ? 'btn-transport-record' : ''}`}
              disabled={!isInitialized}
            >
              <Mic className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-3 py-2 glass-panel rounded-lg">
              <span className="text-sm text-slate-300">BPM:</span>
              <input
                type="number"
                min="60"
                max="200"
                value={globalTransport.bpm}
                onChange={(e) => setGlobalTransport(prev => ({ ...prev, bpm: parseInt(e.target.value) }))}
                className="w-16 bg-transparent text-white text-sm font-mono text-center border-none outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={globalTransport.masterVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 slider-modern"
              />
              <span className="text-sm text-slate-300 w-8">
                {Math.round(globalTransport.masterVolume * 100)}%
              </span>
            </div>

            <button
              onClick={() => setShowPresets(true)}
              className="btn-secondary"
              disabled={!isCosmicConfigured}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Piano Keyboard */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Piano Keyboard</h3>
            <PianoKeyboard 
              onKeyPress={handleKeyPress}
              onKeyRelease={handleKeyRelease}
            />
          </div>
        </div>

        {/* Right Column - Audio Visualizer */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Audio Visualizer</h3>
          <AudioVisualizer audioEngine={audioEngineRef.current} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-600/50">
          {[
            { id: 'synth', label: 'Synthesizer' },
            { id: 'drums', label: 'Drum Sequencer' },
            { id: 'effects', label: 'Effects' },
            { id: 'recording', label: 'Recording' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-700/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'synth' && (
            <SynthControls 
              synthState={synthState} 
              onStateChange={setSynthState} 
            />
          )}
          
          {activeTab === 'drums' && (
            <DrumSequencer 
              drumState={drumState} 
              onStateChange={setDrumState} 
            />
          )}
          
          {activeTab === 'effects' && (
            <EffectsRack 
              synthState={synthState} 
              onStateChange={setSynthState} 
            />
          )}
          
          {activeTab === 'recording' && (
            <RecordingControls 
              recordingState={recordingState}
              onStateChange={setRecordingState}
            />
          )}
        </div>
      </div>

      {/* Preset Manager Modal */}
      {showPresets && isCosmicConfigured && (
        <PresetManager 
          onClose={() => setShowPresets(false)}
          onLoadPreset={handleLoadPreset}
          currentState={synthState}
        />
      )}
    </div>
  );
}