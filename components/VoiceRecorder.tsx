'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download, AudioWaveform, MicIcon } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  blob?: Blob;
  url?: string;
}

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Set up audio analysis for level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start level monitoring
      monitorAudioLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
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
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
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
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const playRecording = async (recording: Recording) => {
    if (!recording.url) return;

    if (playingId === recording.id) {
      // Stop playback
      setPlayingId(null);
      return;
    }

    try {
      const audio = new Audio(recording.url);
      setPlayingId(recording.id);
      
      audio.onended = () => {
        setPlayingId(null);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing recording:', error);
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
    }
  };

  const downloadRecording = (recording: Recording) => {
    if (!recording.blob) return;

    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="bg-synth-control rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <MicIcon className="w-5 h-5 text-synth-accent" />
        <h3 className="text-lg font-semibold text-white">Voice Recorder</h3>
      </div>

      {/* Recording Controls */}
      <div className="space-y-4">
        {/* Main Record Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
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
              <div>
                <div className="text-white font-medium">{currentRecording.name}</div>
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
            <h4 className="text-sm font-medium text-gray-300">Recent Recordings</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {recordings.slice(0, 5).map((recording) => (
                <div
                  key={recording.id}
                  className="bg-synth-panel rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <AudioWaveform className="w-4 h-4 text-synth-accent" />
                    <div>
                      <div className="text-white text-sm">{recording.name}</div>
                      <div className="text-xs text-gray-400">
                        {formatTime(recording.duration)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
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