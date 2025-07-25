'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Mic, 
  Volume2, 
  Zap,
  Layers,
  Clock,
  Activity,
  Wifi,
  WifiOff,
  Grid,
  Headphones
} from 'lucide-react';
import { clsx } from 'clsx';
import AnimatedBackground from '@/components/AnimatedBackground';
import StatusBar from '@/components/StatusBar';
import Toolbar from '@/components/Toolbar';
import TabSystem, { Tab, useTabs } from '@/components/TabSystem';
import MixerBoard from '@/components/MixerBoard';
import SequencerGrid from '@/components/SequencerGrid';
import EffectsRack from '@/components/EffectsRack';
import DrumSequencer from '@/components/DrumSequencer';
import RecordingControls from '@/components/RecordingControls';

interface StudioLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

interface StudioPanel {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  resizable?: boolean;
}

export default function StudioLayout({ 
  children, 
  isLoading = false, 
  error = null 
}: StudioLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'studio' | 'ambient' | 'energetic'>('studio');
  const [showSettings, setShowSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(32);
  const [audioLatency, setAudioLatency] = useState(12);
  const [masterLevel, setMasterLevel] = useState(0.7);
  const [inputLevel, setInputLevel] = useState(0.2);
  
  const { tabs, activeTabId, setActiveTabId, addTab, removeTab, reorderTabs } = useTabs([
    {
      id: 'synthesizer',
      title: 'Synthesizer',
      icon: <Zap className="w-4 h-4" />,
      content: children,
      closable: false
    },
    {
      id: 'mixer',
      title: 'Mixer',
      icon: <Volume2 className="w-4 h-4" />,
      content: (
        <div className="h-full p-6">
          <MixerBoard
            channels={[
              { id: '1', name: 'Synth 1', volume: 0.8, muted: false, soloed: false, pan: 0 },
              { id: '2', name: 'Synth 2', volume: 0.6, muted: false, soloed: false, pan: -0.3 },
              { id: '3', name: 'Drums', volume: 0.9, muted: false, soloed: false, pan: 0.2 },
              { id: '4', name: 'Bass', volume: 0.7, muted: false, soloed: false, pan: 0 },
              { id: '5', name: 'Lead', volume: 0.5, muted: false, soloed: false, pan: 0.4 },
              { id: '6', name: 'Pad', volume: 0.4, muted: false, soloed: false, pan: -0.2 },
              { id: '7', name: 'FX', volume: 0.3, muted: false, soloed: false, pan: 0 },
              { id: '8', name: 'Master', volume: 0.8, muted: false, soloed: false, pan: 0 }
            ]}
            onChannelChange={(channelId, property, value) => {
              console.log(`Channel ${channelId} ${property} changed to ${value}`);
            }}
          />
        </div>
      ),
      closable: false
    },
    {
      id: 'sequencer',
      title: 'Sequencer',
      icon: <Clock className="w-4 h-4" />,
      content: (
        <div className="h-full p-6">
          <SequencerGrid
            patterns={Array(8).fill(null).map((_, i) => ({
              id: `pattern-${i}`,
              name: `Pattern ${i + 1}`,
              steps: Array(16).fill(false),
              note: 60 + i * 2,
              active: i === 0
            }))}
            currentStep={0}
            isPlaying={false}
            bpm={128}
            onPatternChange={(patternId, stepIndex, active) => {
              console.log(`Pattern ${patternId} step ${stepIndex} set to ${active}`);
            }}
            onPlayToggle={() => console.log('Play/pause toggle')}
            onBpmChange={(bpm) => console.log('BPM changed to', bpm)}
          />
        </div>
      ),
      closable: false
    },
    {
      id: 'effects',
      title: 'Effects',
      icon: <Layers className="w-4 h-4" />,
      content: (
        <div className="h-full p-6">
          <EffectsRack 
            synthState={{
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
            }}
            onStateChange={(state) => console.log('Effects state changed', state)}
          />
        </div>
      ),
      closable: false
    },
    {
      id: 'drums',
      title: 'Drums',
      icon: <Grid className="w-4 h-4" />,
      content: (
        <div className="h-full p-6">
          <DrumSequencer
            state={{
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
            }}
            onStateChange={(state) => console.log('Drum state changed', state)}
          />
        </div>
      ),
      closable: false
    },
    {
      id: 'recording',
      title: 'Recording',
      icon: <Mic className="w-4 h-4" />,
      content: (
        <div className="h-full p-6">
          <RecordingControls
            state={{
              isRecording: false,
              isPlaying: false,
              duration: 0,
              audioBuffer: null,
              waveformData: []
            }}
            onStateChange={(state) => console.log('Recording state changed', state)}
          />
        </div>
      ),
      closable: false
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      icon: <Headphones className="w-4 h-4" />,
      content: (
        <div className="h-full p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-synth-control p-6 rounded-lg">
              <h3 className="text-lg font-bold text-synth-accent mb-4">Audio Levels</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Master Output</span>
                    <span className="text-sm text-synth-accent">{Math.round(masterLevel * 100)}%</span>
                  </div>
                  <div className="h-3 bg-synth-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-150"
                      style={{ width: `${masterLevel * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Input Level</span>
                    <span className="text-sm text-synth-accent">{Math.round(inputLevel * 100)}%</span>
                  </div>
                  <div className="h-3 bg-synth-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-150"
                      style={{ width: `${inputLevel * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-synth-control p-6 rounded-lg">
              <h3 className="text-lg font-bold text-synth-accent mb-4">System Performance</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{cpuUsage}%</div>
                    <div className="text-sm text-gray-400">CPU Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{memoryUsage}%</div>
                    <div className="text-sm text-gray-400">Memory</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{audioLatency}ms</div>
                    <div className="text-sm text-gray-400">Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">44.1</div>
                    <div className="text-sm text-gray-400">kHz</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      closable: false
    }
  ]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle fullscreen with F11
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      
      // Toggle sidebar with Ctrl+B
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      
      // Tab switching with Ctrl+1-9
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTabId(tabs[tabIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, setActiveTabId]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate performance metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(10, Math.min(80, prev + (Math.random() - 0.5) * 5)));
      setAudioLatency(prev => Math.max(5, Math.min(50, prev + (Math.random() - 0.5) * 3)));
      setMasterLevel(prev => Math.max(0, Math.min(1, prev + (Math.random() - 0.5) * 0.1)));
      setInputLevel(prev => Math.max(0, Math.min(1, prev + (Math.random() - 0.5) * 0.1)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleThemeChange = (theme: 'studio' | 'ambient' | 'energetic') => {
    setCurrentTheme(theme);
  };

  // Toolbar handlers
  const toolbarHandlers = {
    onPlay: () => console.log('Play'),
    onStop: () => console.log('Stop'),
    onPause: () => console.log('Pause'),
    onRecord: () => console.log('Record'),
    onUndo: () => console.log('Undo'),
    onRedo: () => console.log('Redo'),
    onSave: () => console.log('Save'),
    onLoad: () => console.log('Load'),
    onExport: () => console.log('Export'),
    onImport: () => console.log('Import'),
    onSettings: () => setShowSettings(true),
    onBpmChange: (bpm: number) => console.log('BPM:', bpm),
    onVolumeChange: (volume: number) => setMasterLevel(volume)
  };

  if (isLoading) {
    return (
      <div className="studio-background min-h-screen flex items-center justify-center">
        <AnimatedBackground variant="neural" intensity={0.3} />
        <div className="studio-glass-panel p-8 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-studio-control border-t-studio-cyan rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-studio-cyan rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="studio-title">Loading Studio...</p>
          <p className="text-sm text-gray-400">Initializing audio engine and workspace</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="studio-background min-h-screen flex items-center justify-center">
        <AnimatedBackground variant="particles" color="#ff6b6b" intensity={0.2} />
        <div className="studio-glass-panel p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-studio-red to-studio-orange flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <h2 className="studio-title text-studio-red">Studio Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="studio-button"
          >
            Restart Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'studio-background min-h-screen flex flex-col',
      isFullscreen && 'fixed inset-0 z-50'
    )}>
      {/* Animated background */}
      <AnimatedBackground 
        variant={currentTheme === 'studio' ? 'neural' : currentTheme === 'ambient' ? 'particles' : 'frequency'}
        intensity={currentTheme === 'energetic' ? 0.8 : 0.3}
        speed={currentTheme === 'energetic' ? 1.5 : currentTheme === 'ambient' ? 0.5 : 1}
        color={currentTheme === 'studio' ? '#00ff88' : currentTheme === 'ambient' ? '#4dabf7' : '#ff6b6b'}
        interactive={true}
      />

      {/* Main toolbar */}
      <Toolbar
        isPlaying={false}
        isRecording={false}
        isPaused={false}
        canUndo={false}
        canRedo={false}
        bpm={128}
        masterVolume={masterLevel}
        {...toolbarHandlers}
        className="relative z-10"
      />

      {/* Main content area */}
      <div className="flex flex-1 relative z-10 overflow-hidden">
        {/* Sidebar */}
        <div className={clsx(
          'studio-glass-panel border-r-0 rounded-none transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          'flex flex-col border-r border-white/10'
        )}>
          {/* Sidebar header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="studio-title text-lg">Studio</h2>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="studio-button p-2"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex-1 p-4 space-y-4 studio-scrollbar overflow-y-auto">
            {!sidebarCollapsed && (
              <>
                {/* Theme selector */}
                <div>
                  <div className="studio-label mb-2">Studio Theme</div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'studio', name: 'Professional', color: '#00ff88' },
                      { id: 'ambient', name: 'Ambient', color: '#4dabf7' },
                      { id: 'energetic', name: 'Energetic', color: '#ff6b6b' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id as any)}
                        className={clsx(
                          'studio-button text-sm text-left',
                          currentTheme === theme.id && 'active'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: theme.color }}
                          />
                          {theme.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div>
                  <div className="studio-label mb-2">Quick Actions</div>
                  <div className="space-y-2">
                    <button className="studio-button w-full text-sm text-left">
                      <Mic className="w-4 h-4 inline mr-2" />
                      New Recording
                    </button>
                    <button className="studio-button w-full text-sm text-left">
                      <Layers className="w-4 h-4 inline mr-2" />
                      Load Preset
                    </button>
                    <button className="studio-button w-full text-sm text-left">
                      <Settings className="w-4 h-4 inline mr-2" />
                      Studio Settings
                    </button>
                  </div>
                </div>

                {/* Performance monitor */}
                <div>
                  <div className="studio-label mb-2">Performance</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">CPU</span>
                      <span className="studio-value">{cpuUsage}%</span>
                    </div>
                    <div className="studio-meter h-2">
                      <div 
                        className="studio-meter-fill"
                        style={{ width: `${cpuUsage}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Memory</span>
                      <span className="studio-value">{memoryUsage}%</span>
                    </div>
                    <div className="studio-meter h-2">
                      <div 
                        className="studio-meter-fill"
                        style={{ width: `${memoryUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Collapsed sidebar icons */}
            {sidebarCollapsed && (
              <div className="flex flex-col items-center space-y-4">
                <button className="studio-button p-2" title="Record">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="studio-button p-2" title="Effects">
                  <Layers className="w-4 h-4" />
                </button>
                <button className="studio-button p-2" title="Settings">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center space-y-2 pt-4 border-t border-white/10">
                  <div className="studio-led active" title={`CPU: ${cpuUsage}%`} />
                  <div className={clsx(
                    'studio-led',
                    isOnline ? 'active' : 'error'
                  )} title={isOnline ? 'Online' : 'Offline'} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Tab system */}
          <TabSystem
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            onTabClose={removeTab}
            onTabReorder={reorderTabs}
            className="flex-1"
          />
        </div>
      </div>

      {/* Status bar */}
      <StatusBar
        isConnected={isOnline}
        cpuUsage={cpuUsage}
        memoryUsage={memoryUsage}
        audioLatency={audioLatency}
        sampleRate={44100}
        bufferSize={256}
        activeVoices={8}
        masterLevel={masterLevel}
        inputLevel={inputLevel}
        projectName="Untitled Studio Project"
        isDirty={false}
        className="relative z-10"
      />

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="studio-glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="studio-title">Studio Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="studio-button p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Audio Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="studio-label">Sample Rate</label>
                      <select className="w-full p-2 bg-studio-control border border-white/20 rounded text-white">
                        <option>44.1 kHz</option>
                        <option>48 kHz</option>
                        <option>96 kHz</option>
                      </select>
                    </div>
                    <div>
                      <label className="studio-label">Buffer Size</label>
                      <select className="w-full p-2 bg-studio-control border border-white/20 rounded text-white">
                        <option>128 samples</option>
                        <option>256 samples</option>
                        <option>512 samples</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Interface</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="studio-label">Theme</label>
                      <select 
                        className="w-full p-2 bg-studio-control border border-white/20 rounded text-white"
                        value={currentTheme}
                        onChange={(e) => handleThemeChange(e.target.value as any)}
                      >
                        <option value="studio">Professional</option>
                        <option value="ambient">Ambient</option>
                        <option value="energetic">Energetic</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="fullscreen"
                        checked={isFullscreen}
                        onChange={toggleFullscreen}
                        className="rounded"
                      />
                      <label htmlFor="fullscreen" className="studio-label">
                        Fullscreen Mode
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="studio-button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="studio-button active"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}