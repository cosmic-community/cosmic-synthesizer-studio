'use client';

import { useState, useEffect, useRef } from 'react';
import { AudioEngine } from '@/lib/audioEngine';
import { isCosmicConfigured } from '@/lib/cosmic';
import { SynthState, RecordingState, DrumSequencerState, DrumSound } from '@/types';
import SynthControls from '@/components/SynthControls';
import EffectsRack from '@/components/EffectsRack';
import PianoKeyboard from '@/components/PianoKeyboard';
import DrumSequencer from '@/components/DrumSequencer';
import RecordingControls from '@/components/RecordingControls';
import AudioVisualizer from '@/components/AudioVisualizer';
import PresetManager from '@/components/PresetManager';
import TabSystem, { Tab, useTabs } from '@/components/TabSystem';
import MixerConsole from '@/components/MixerConsole';
import TrackSequencer from '@/components/TrackSequencer';
import SampleLibrary from '@/components/SampleLibrary';
import MIDIController from '@/components/MIDIController';
import LoopStation from '@/components/LoopStation';
import VoiceRecorder from '@/components/VoiceRecorder';
import ProjectManager from '@/components/ProjectManager';
import WaveformEditor from '@/components/WaveformEditor';
import ParameterAutomation from '@/components/ParameterAutomation';
import MetronomeControl from '@/components/MetronomeControl';
import CloudSync from '@/components/CloudSync';
import PatternEditor from '@/components/PatternEditor';
import InstrumentRack from '@/components/InstrumentRack';
import MasterEQ from '@/components/MasterEQ';
import CompressorLimiter from '@/components/CompressorLimiter';
import ReverbHall from '@/components/ReverbHall';
import DelayEcho from '@/components/DelayEcho';
import ChorusFlanger from '@/components/ChorusFlanger';
import Distortion from '@/components/Distortion';
import FilterSweep from '@/components/FilterSweep';
import Toolbar from '@/components/Toolbar';
import StatusBar from '@/components/StatusBar';
import { 
  Play, 
  Square, 
  Save, 
  Settings, 
  AlertTriangle, 
  RefreshCw,
  Music4,
  Music,
  Zap,
  Layers,
  Mic,
  Sliders,
  Boxes,
  Headphones,
  FileAudio,
  Gamepad2,
  RotateCcw,
  Grid3x3,
  Cloud,
  Edit,
  Activity
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
    reverb: { active: false, amount: 0.3, roomSize: 0.5 },
    delay: { active: false, time: 0.25, feedback: 0.3 },
    distortion: { active: false, amount: 50, type: 'soft' },
    chorus: { active: false, rate: 1, depth: 0.5 },
    phaser: { active: false, rate: 0.5, depth: 0.7 },
    flanger: { active: false, rate: 0.3, feedback: 0.6 },
    compressor: { active: false, threshold: -20, ratio: 4 },
    eq: { active: false, low: 0, mid: 0, high: 0 }
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
    { name: 'Open Hat', type: 'openhat', frequency: 9000, decay: 0.3, volume: 0.5 },
    { name: 'Crash', type: 'crash', frequency: 5000, decay: 0.8, volume: 0.6 },
    { name: 'Ride', type: 'ride', frequency: 3000, decay: 0.6, volume: 0.5 },
    { name: 'Tom 1', type: 'kick', frequency: 100, decay: 0.3, volume: 0.7 },
    { name: 'Tom 2', type: 'kick', frequency: 80, decay: 0.35, volume: 0.7 }
  ]
};

export default function SynthesizerStudio() {
  // Fix for TS7022, TS2552, TS2345, TS2448 errors - properly declare synthState with explicit typing
  const [synthState, setSynthState] = useState<SynthState>(defaultSynthState);
  const [recordingState, setRecordingState] = useState<RecordingState>(defaultRecordingState);
  const [drumState, setDrumState] = useState<DrumSequencerState>(defaultDrumState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showCosmicWarning, setShowCosmicWarning] = useState(!isCosmicConfigured);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [globalTransport, setGlobalTransport] = useState({
    isPlaying: false,
    isRecording: false,
    isPaused: false,
    bpm: 128,
    masterVolume: 0.7
  });

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const drumIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tabs with all the new components
  const initialTabs: Tab[] = [
    {
      id: 'keyboard',
      title: 'Keyboard',
      icon: <Music4 className="w-4 h-4" />,
      content: (
        <PianoKeyboard 
          onKeyPress={handleKeyPress}
          onKeyRelease={handleKeyRelease}
        />
      ),
      closable: false
    },
    {
      id: 'sequencer',
      title: 'Drums',
      icon: <Music className="w-4 h-4" />,
      content: (
        <DrumSequencer 
          drumState={drumState} 
          onStateChange={setDrumState} 
        />
      ),
      closable: false
    },
    {
      id: 'synthesizer',
      title: 'Synth',
      icon: <Zap className="w-4 h-4" />,
      content: (
        <SynthControls 
          synthState={synthState} 
          onStateChange={setSynthState} 
        />
      ),
      closable: false
    },
    {
      id: 'effects',
      title: 'Effects',
      icon: <Layers className="w-4 h-4" />,
      content: (
        <EffectsRack 
          synthState={synthState} 
          onStateChange={setSynthState} 
        />
      ),
      closable: false
    },
    {
      id: 'mixer',
      title: 'Mixer',
      icon: <Sliders className="w-4 h-4" />,
      content: <MixerConsole />,
      closable: false
    },
    {
      id: 'tracks',
      title: 'Tracks',
      icon: <Boxes className="w-4 h-4" />,
      content: <TrackSequencer />,
      closable: true
    },
    {
      id: 'samples',
      title: 'Samples',
      icon: <FileAudio className="w-4 h-4" />,
      content: <SampleLibrary />,
      closable: true
    },
    {
      id: 'midi',
      title: 'MIDI',
      icon: <Gamepad2 className="w-4 h-4" />,
      content: <MIDIController />,
      closable: true
    },
    {
      id: 'loops',
      title: 'Loops',
      icon: <RotateCcw className="w-4 h-4" />,
      content: <LoopStation />,
      closable: true
    },
    {
      id: 'recording',
      title: 'Studio',
      icon: <Mic className="w-4 h-4" />,
      content: (
        <RecordingControls 
          recordingState={recordingState}
          onStateChange={setRecordingState}
        />
      ),
      closable: false
    },
    {
      id: 'automation',
      title: 'Automation',
      icon: <Edit className="w-4 h-4" />,
      content: <ParameterAutomation />,
      closable: true
    },
    {
      id: 'waveform',
      title: 'Waveform',
      icon: <Activity className="w-4 h-4" />,
      content: <WaveformEditor />,
      closable: true
    },
    {
      id: 'cloud',
      title: 'Cloud',
      icon: <Cloud className="w-4 h-4" />,
      content: <CloudSync />,
      closable: true
    }
  ];

  const { tabs, activeTabId, setActiveTabId, addTab, removeTab } = useTabs(initialTabs);

  // Initialize audio engine with better error handling
  const initializeAudioEngine = async (attempt: number = 0) => {
    try {
      console.log(`Audio engine initialization attempt ${attempt + 1}`);
      setIsLoading(true);
      setError(null);

      // Clean up existing engine if any
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
        audioEngineRef.current = null;
      }

      // Create new audio engine
      const audioEngine = new AudioEngine();
      audioEngineRef.current = audioEngine;

      // Initialize the engine
      await audioEngine.init();
      
      // Try to resume the context (this might require user interaction)
      await audioEngine.resume();

      console.log('Audio engine initialized successfully');
      setIsLoading(false);
      setError(null);
      setInitializationAttempts(0);
    } catch (err) {
      console.error('Audio engine initialization failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Clean up failed engine
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
        audioEngineRef.current = null;
      }

      setError(errorMessage);
      setIsLoading(false);
      setInitializationAttempts(attempt + 1);
    }
  };

  // Initialize audio engine on mount
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeAudioEngine(0);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
      }
      if (drumIntervalRef.current) {
        clearInterval(drumIntervalRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Handle user interactions to resume audio context
  const handleUserInteraction = async () => {
    if (audioEngineRef.current && !audioEngineRef.current.initialized) {
      try {
        await audioEngineRef.current.resume();
        console.log('Audio context resumed after user interaction');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  };

  // Add click handler to document for audio context resume
  useEffect(() => {
    const handleClick = () => {
      handleUserInteraction();
    };

    document.addEventListener('click', handleClick, { once: true });
    document.addEventListener('keydown', handleClick, { once: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleClick);
    };
  }, []);

  // Handle key press for piano
  function handleKeyPress(frequency: number) {
    if (audioEngineRef.current && audioEngineRef.current.initialized) {
      audioEngineRef.current.playNote(frequency, synthState);
    } else {
      handleUserInteraction();
    }
  }

  function handleKeyRelease(frequency: number) {
    if (audioEngineRef.current && audioEngineRef.current.initialized) {
      audioEngineRef.current.stopNote(frequency);
    }
  }

  // Transport control handlers
  const handlePlay = () => {
    setGlobalTransport(prev => ({ ...prev, isPlaying: true, isPaused: false }));
  };

  const handleStop = () => {
    setGlobalTransport(prev => ({ ...prev, isPlaying: false, isPaused: false }));
  };

  const handlePause = () => {
    setGlobalTransport(prev => ({ ...prev, isPaused: true }));
  };

  const handleRecord = () => {
    setGlobalTransport(prev => ({ ...prev, isRecording: !prev.isRecording }));
  };

  const handleBpmChange = (bpm: number) => {
    setGlobalTransport(prev => ({ ...prev, bpm }));
    setDrumState(prev => ({ ...prev, bpm }));
  };

  const handleVolumeChange = (volume: number) => {
    setGlobalTransport(prev => ({ ...prev, masterVolume: volume }));
    if (audioEngineRef.current) {
      audioEngineRef.current.setMasterVolume(volume);
    }
  };

  // Handle drum sequencer
  const toggleDrumSequencer = async () => {
    if (!audioEngineRef.current) {
      setError('Audio engine not ready');
      return;
    }

    // Try to resume context if needed
    if (!audioEngineRef.current.initialized) {
      await handleUserInteraction();
      if (!audioEngineRef.current.initialized) {
        setError('Please click anywhere to enable audio');
        return;
      }
    }

    if (drumState.isPlaying) {
      if (drumIntervalRef.current) {
        clearInterval(drumIntervalRef.current);
        drumIntervalRef.current = null;
      }
      setDrumState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
    } else {
      const stepTime = (60 / drumState.bpm / 4) * 1000; // 16th notes
      drumIntervalRef.current = setInterval(() => {
        setDrumState(prev => {
          const nextStep = (prev.currentStep + 1) % 16;
          
          // Play sounds for current step
          if (audioEngineRef.current && audioEngineRef.current.initialized) {
            prev.pattern?.forEach((track, soundIndex) => {
              if (track?.[prev.currentStep] && prev.sounds?.[soundIndex]) {
                const sound = prev.sounds[soundIndex];
                if (sound) {
                  audioEngineRef.current!.playDrumSound(sound);
                }
              }
            });
          }
          
          return { ...prev, currentStep: nextStep };
        });
      }, stepTime);
      
      setDrumState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  // Handle recording
  const toggleRecording = async () => {
    if (!audioEngineRef.current) {
      setError('Audio engine not ready');
      return;
    }

    // Try to resume context if needed
    if (!audioEngineRef.current.initialized) {
      await handleUserInteraction();
      if (!audioEngineRef.current.initialized) {
        setError('Please click anywhere to enable audio');
        return;
      }
    }

    if (recordingState.isRecording) {
      // Stop recording
      try {
        const audioBlob = await audioEngineRef.current.stopRecording();
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          audioBuffer: null // We'd need to convert blob to AudioBuffer for playback
        }));
      } catch (err) {
        setError('Failed to stop recording');
      }
    } else {
      // Start recording
      try {
        audioEngineRef.current.startRecording();
        setRecordingState(prev => ({ ...prev, isRecording: true, duration: 0 }));
        
        recordingTimerRef.current = setInterval(() => {
          setRecordingState(prev => ({ ...prev, duration: prev.duration + 0.1 }));
        }, 100);
      } catch (err) {
        setError('Failed to start recording');
      }
    }
  };

  // Handle preset loading
  const handleLoadPreset = (preset: any) => {
    setSynthState({
      oscillatorType: preset.metadata?.oscillator_type || 'sawtooth',
      filterCutoff: preset.metadata?.filter_cutoff || 1000,
      filterResonance: preset.metadata?.filter_resonance || 1,
      attack: preset.metadata?.envelope_attack || 0.1,
      decay: preset.metadata?.envelope_decay || 0.3,
      sustain: preset.metadata?.envelope_sustain || 0.7,
      release: preset.metadata?.envelope_release || 0.5,
      volume: 0.5,
      effects: {
        reverb: { 
          active: preset.metadata?.effects?.includes('reverb') || false, 
          amount: preset.metadata?.reverb_amount || 0.3,
          roomSize: preset.metadata?.reverb_room_size || 0.5
        },
        delay: { 
          active: preset.metadata?.effects?.includes('delay') || false, 
          time: preset.metadata?.delay_time || 0.25, 
          feedback: preset.metadata?.delay_feedback || 0.3 
        },
        distortion: { 
          active: preset.metadata?.effects?.includes('distortion') || false, 
          amount: preset.metadata?.distortion_amount || 50,
          type: preset.metadata?.distortion_type || 'soft'
        },
        chorus: { 
          active: preset.metadata?.effects?.includes('chorus') || false, 
          rate: preset.metadata?.chorus_rate || 1, 
          depth: preset.metadata?.chorus_depth || 0.5 
        },
        phaser: {
          active: preset.metadata?.effects?.includes('phaser') || false,
          rate: preset.metadata?.phaser_rate || 0.5,
          depth: preset.metadata?.phaser_depth || 0.7
        },
        flanger: {
          active: preset.metadata?.effects?.includes('flanger') || false,
          rate: preset.metadata?.flanger_rate || 0.3,
          feedback: preset.metadata?.flanger_feedback || 0.6
        },
        compressor: {
          active: preset.metadata?.effects?.includes('compressor') || false,
          threshold: preset.metadata?.compressor_threshold || -20,
          ratio: preset.metadata?.compressor_ratio || 4
        },
        eq: {
          active: preset.metadata?.effects?.includes('eq') || false,
          low: preset.metadata?.eq_low || 0,
          mid: preset.metadata?.eq_mid || 0,
          high: preset.metadata?.eq_high || 0
        }
      }
    });
    setShowPresets(false);
  };

  // Retry audio initialization
  const retryAudioInit = async () => {
    await initializeAudioEngine(initializationAttempts);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-synth-control border-t-synth-accent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-synth-accent rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-synth-accent mb-2">Initializing Audio Engine...</p>
          <p className="text-sm text-gray-400">Setting up Web Audio API and audio nodes</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-synth-panel rounded-lg">
        <AlertTriangle className="w-16 h-16 text-synth-warning mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Audio Engine Error</h2>
        <p className="text-synth-warning mb-6">{error}</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={retryAudioInit}
              className="synth-button flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Retrying...' : 'Try Again'}
            </button>
            
            {initializationAttempts > 0 && (
              <span className="text-sm text-gray-400">
                Attempt {initializationAttempts + 1}
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            <p className="mb-2">Troubleshooting tips:</p>
            <ul className="text-left space-y-1 max-w-md mx-auto">
              <li>• Make sure your browser supports Web Audio API</li>
              <li>• Check that audio permissions are enabled</li>
              <li>• Try clicking anywhere on the page to enable audio</li>
              <li>• Use a modern browser (Chrome, Firefox, Safari)</li>
              <li>• Refresh the page and try again</li>
              <li>• Check browser console for detailed error messages</li>
            </ul>
          </div>
          
          {audioEngineRef.current && (
            <div className="text-xs text-gray-500 mt-4">
              Audio context state: {audioEngineRef.current.contextState}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Cosmic Configuration Warning */}
      {showCosmicWarning && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-yellow-500 font-medium mb-1">
                COSMIC_BUCKET_SLUG environment variable is required
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                To save presets, recordings, and drum patterns, you need to configure your Cosmic CMS environment variables.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCosmicWarning(false)}
                  className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Toolbar */}
      <Toolbar
        isPlaying={globalTransport.isPlaying}
        isRecording={globalTransport.isRecording}
        isPaused={globalTransport.isPaused}
        canUndo={false}
        canRedo={false}
        bpm={globalTransport.bpm}
        masterVolume={globalTransport.masterVolume}
        onPlay={handlePlay}
        onStop={handleStop}
        onPause={handlePause}
        onRecord={handleRecord}
        onUndo={() => {}}
        onRedo={() => {}}
        onSave={() => setShowPresets(true)}
        onLoad={() => setShowPresets(true)}
        onExport={() => {}}
        onImport={() => {}}
        onSettings={() => {}}
        onBpmChange={handleBpmChange}
        onVolumeChange={handleVolumeChange}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Advanced Audio Tools */}
        <div className="w-80 bg-synth-panel border-r border-gray-800 overflow-y-auto">
          <div className="p-4 space-y-4">
            <MetronomeControl />
            <InstrumentRack />
            <MasterEQ />
            <CompressorLimiter />
            <ReverbHall />
            <DelayEcho />
            <ChorusFlanger />
            <Distortion />
            <FilterSweep />
          </div>
        </div>

        {/* Center - Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab System for Main Content */}
          <div className="flex-1 bg-synth-panel overflow-hidden">
            <TabSystem
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={setActiveTabId}
              onTabClose={removeTab}
              showAddButton={true}
              scrollable={true}
              className="h-full"
            />
          </div>

          {/* Bottom Panel - Audio Visualizer and Project Manager */}
          <div className="h-48 bg-synth-panel border-t border-gray-800 flex">
            <div className="flex-1">
              <AudioVisualizer audioEngine={audioEngineRef.current} />
            </div>
            <div className="w-80 border-l border-gray-800">
              <ProjectManager />
            </div>
          </div>
        </div>

        {/* Right Panel - Pattern Editor and Voice Recorder */}
        <div className="w-80 bg-synth-panel border-l border-gray-800 overflow-y-auto">
          <div className="p-4 space-y-4">
            <PatternEditor />
            <VoiceRecorder />
          </div>
        </div>
      </div>

      {/* Professional Status Bar */}
      <StatusBar
        isConnected={true}
        cpuUsage={25}
        memoryUsage={45}
        audioLatency={12}
        sampleRate={44100}
        bufferSize={256}
        activeVoices={3}
        masterLevel={globalTransport.masterVolume}
        inputLevel={0.2}
        projectName="Untitled Project"
        isDirty={false}
        messages={[]}
      />

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