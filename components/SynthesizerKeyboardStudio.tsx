'use client';

import { useState, useEffect, useRef } from 'react';
import { AudioEngine } from '@/lib/audioEngine';
import { SynthState } from '@/types';
import EnhancedEffectsRack from '@/components/EnhancedEffectsRack';
import PianoKeyboard from '@/components/PianoKeyboard';
import AudioVisualizer from '@/components/AudioVisualizer';
import { 
  Play, 
  Square, 
  Mic, 
  Volume2, 
  Settings,
  AlertTriangle,
  RefreshCw,
  Power,
  Headphones
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

export default function SynthesizerKeyboardStudio() {
  const [synthState, setSynthState] = useState<SynthState>(defaultSynthState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isRecording, setIsRecording] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(false);

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio engine with timeout
  useEffect(() => {
    if (!isPoweredOn) return;
    
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
    };
  }, [isPoweredOn]);

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
  function handleKeyPress(frequency: number, velocity?: number) {
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

  const handleVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    if (audioEngineRef.current) {
      audioEngineRef.current.setMasterVolume(volume);
    }
  };

  const handlePowerToggle = () => {
    setIsPoweredOn(!isPoweredOn);
    if (isPoweredOn && audioEngineRef.current) {
      audioEngineRef.current.destroy();
      audioEngineRef.current = null;
      setIsInitialized(false);
    }
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

  // Power-off state
  if (!isPoweredOn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-md">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full mx-auto flex items-center justify-center shadow-2xl border-4 border-slate-600">
              <Power className="w-16 h-16 text-slate-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-300 mb-2">
              Cosmic Synthesizer Studio
            </h1>
            <p className="text-slate-400 mb-6">
              Professional Web-Based Synthesizer
            </p>
            
            <button
              onClick={handlePowerToggle}
              className="btn-primary flex items-center gap-3 mx-auto text-lg px-8 py-4"
            >
              <Power className="w-5 h-5" />
              Power On
            </button>
          </div>
          
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Professional synthesis engine</p>
            <p>• Full-width keyboard interface</p>
            <p>• Advanced effects processing</p>
            <p>• Web Audio API powered</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized && error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center p-8 glass-panel rounded-2xl border border-slate-700 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Audio Engine Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          
          <div className="space-y-4">
            <button 
              onClick={retryAudioInit}
              className="btn-primary flex items-center gap-2 mx-auto"
              disabled={isInitializing}
            >
              <RefreshCw className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
              {isInitializing ? 'Retrying...' : 'Retry'}
            </button>
            
            <button 
              onClick={handlePowerToggle}
              className="btn-secondary flex items-center gap-2 mx-auto"
            >
              <Power className="w-4 h-4" />
              Power Off
            </button>
          </div>
          
          <div className="text-sm text-slate-400 space-y-1 mt-6">
            <p>• Make sure your browser supports Web Audio API</p>
            <p>• Try using Chrome, Firefox, or Safari</p>
            <p>• Check that audio is not muted</p>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-cyan-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-cyan-400 mb-2">Initializing Audio Engine</h2>
          <p className="text-sm text-slate-400">Setting up Web Audio API...</p>
          <div className="mt-4 text-xs text-slate-500">
            This may take a few seconds on first load
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Control Bar - Like a Real Synthesizer */}
      <div className="glass-panel p-4 border-b border-slate-600/50">
        <div className="flex items-center justify-between">
          {/* Left Side - Branding & Power */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePowerToggle}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-400 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <Power className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">COSMIC SYNTH</h1>
                <p className="text-xs text-slate-400">Professional Edition</p>
              </div>
            </div>

            {/* Audio Status */}
            {isInitialized && audioEngineRef.current?.contextState === 'suspended' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-300">Click anywhere to enable audio</span>
                <button
                  onClick={handleUserInteraction}
                  className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                >
                  Enable
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Controls */}
          <div className="flex items-center gap-6">
            {/* Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 flex items-center justify-center transition-all"
                disabled={!isInitialized}
              >
                <Play className="w-4 h-4" />
              </button>
              
              <button
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 flex items-center justify-center transition-all"
                disabled={!isInitialized}
              >
                <Square className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-600 border-red-400 text-white animate-pulse' 
                    : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'
                }`}
                disabled={!isInitialized}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Master Volume */}
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 slider-modern"
              />
              <span className="text-sm text-slate-300 w-8">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>

            {/* Audio Visualizer */}
            <div className="w-32 h-8">
              <AudioVisualizer audioEngine={audioEngineRef.current} />
            </div>

            {/* Settings */}
            <button className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-400 hover:text-white flex items-center justify-center transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Effects Rack - Top Half */}
        <div className="flex-1 p-6 overflow-y-auto">
          <EnhancedEffectsRack 
            synthState={synthState} 
            onStateChange={setSynthState} 
          />
        </div>

        {/* Keyboard - Bottom Half, Full Width */}
        <div className="p-6 pt-0">
          <div className="glass-panel rounded-xl p-4">
            <PianoKeyboard 
              onKeyPress={handleKeyPress}
              onKeyRelease={handleKeyRelease}
              disabled={!isInitialized}
              showLabels={true}
              keySize="large"
              maxPolyphony={32}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="glass-panel p-2 border-t border-slate-600/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Audio Engine: {isInitialized ? '✓ Ready' : '⚠ Initializing'}</span>
            <span>Sample Rate: 44.1kHz</span>
            <span>Buffer: 256 samples</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Polyphony: 32 voices</span>
            <span>Latency: ~5.8ms</span>
            <Headphones className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}