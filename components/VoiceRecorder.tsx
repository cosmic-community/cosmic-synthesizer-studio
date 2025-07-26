'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download, Activity, MicIcon, Save, Upload } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  blob?: Blob;
  url?: string;
  waveformData?: number[];
}

interface VoiceRecorderProps {
  onRecordingComplete?: (recording: Recording) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize recorder
  useEffect(() => {
    checkMicrophonePermission();
    return cleanup;
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }
      
      // Check if we have permission
      const permission = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
      if (permission?.state === 'denied') {
        throw new Error('Microphone permission denied');
      }
      
      setIsReady(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      setIsReady(false);
    }
  };

  const startRecording = async () => {
    if (!isReady) {
      await checkMicrophonePermission();
      if (!isReady) return;
    }

    try {
      setError(null);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      audioStreamRef.current = stream;

      // Set up audio analysis for level monitoring
      const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start level monitoring
      monitorAudioLevel();

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        handleRecordingStop();
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        stopRecording();
      };

      // Start recording
      mediaRecorder.start(100); // Collect 100ms chunks
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);

    } catch (err) {
      console.error('Error starting recording:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      cleanup();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setAudioLevel(0);
      
      // Stop audio monitoring
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Stop microphone stream
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const handleRecordingStop = () => {
    const blob = new Blob(chunksRef.current, { 
      type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
    });
    const url = URL.createObjectURL(blob);
    
    const recording: Recording = {
      id: Date.now().toString(),
      name: `Recording ${recordings.length + 1}`,
      duration: recordingTime,
      timestamp: new Date(),
      blob,
      url
    };

    setRecordings(prev => [recording, ...prev]);
    setCurrentRecording(recording);
    
    if (onRecordingComplete) {
      onRecordingComplete(recording);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const playRecording = async (recording: Recording) => {
    if (!recording.url) return;

    // Stop current playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (playingId === recording.id) {
      setPlayingId(null);
      return;
    }

    try {
      const audio = new Audio(recording.url);
      currentAudioRef.current = audio;
      setPlayingId(recording.id);
      
      audio.onended = () => {
        setPlayingId(null);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setError('Failed to play recording');
        setPlayingId(null);
        currentAudioRef.current = null;
      };
      
      await audio.play();
    } catch (err) {
      console.error('Error playing recording:', err);
      setError('Failed to play recording');
      setPlayingId(null);
    }
  };

  const deleteRecording = (id: string) => {
    const recording = recordings.find(r => r.id === id);
    if (recording?.url) {
      URL.revokeObjectURL(recording.url);
    }
    
    setRecordings(prev => prev.filter(r => r.id !== id));
    
    if (currentRecording?.id === id) {
      setCurrentRecording(null);
    }
    
    if (playingId === id) {
      setPlayingId(null);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    }
  };

  const downloadRecording = (recording: Recording) => {
    if (!recording.blob) return;

    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renameRecording = (id: string, newName: string) => {
    setRecordings(prev => prev.map(r => 
      r.id === id ? { ...r, name: newName } : r
    ));
    
    if (currentRecording?.id === id) {
      setCurrentRecording({ ...currentRecording, name: newName });
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  if (error) {
    return (
      <div className="bg-synth-control rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <MicIcon className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Voice Recorder</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">❌ {error}</div>
          <button
            onClick={checkMicrophonePermission}
            className="synth-button text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-synth-control rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <MicIcon className="w-5 h-5 text-synth-accent" />
        <h3 className="text-lg font-semibold text-white">Voice Recorder</h3>
        <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>

      {/* Recording Controls */}
      <div className="space-y-4">
        {/* Main Record Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isReady}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 scale-110'
                : 'bg-synth-accent hover:bg-synth-accent/80'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="text-center space-y-2">
            <div className="text-red-400 text-sm flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Recording...
            </div>
            <div className="text-white font-mono text-lg">
              {formatTime(recordingTime)}
            </div>
            
            {/* Audio Level Meter */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-gray-400">Level:</span>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Current Recording Info */}
        {currentRecording && !isRecording && (
          <div className="bg-synth-panel rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  value={currentRecording.name}
                  onChange={(e) => renameRecording(currentRecording.id, e.target.value)}
                  className="bg-transparent text-white font-medium text-sm border-none outline-none w-full"
                />
                <div className="text-sm text-gray-400">
                  {formatTime(currentRecording.duration)} • {formatDate(currentRecording.timestamp)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => playRecording(currentRecording)}
                  className="synth-button-small"
                >
                  {playingId === currentRecording.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => downloadRecording(currentRecording)}
                  className="synth-button-small"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center justify-between">
              Recent Recordings ({recordings.length})
              <button
                onClick={() => {
                  recordings.forEach(r => r.url && URL.revokeObjectURL(r.url));
                  setRecordings([]);
                  setCurrentRecording(null);
                  setPlayingId(null);
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear All
              </button>
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {recordings.slice(0, 10).map((recording) => (
                <div
                  key={recording.id}
                  className="bg-synth-panel rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Activity className="w-4 h-4 text-synth-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={recording.name}
                        onChange={(e) => renameRecording(recording.id, e.target.value)}
                        className="bg-transparent text-white text-sm border-none outline-none w-full"
                      />
                      <div className="text-xs text-gray-400">
                        {formatTime(recording.duration)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => playRecording(recording)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {playingId === recording.id ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}