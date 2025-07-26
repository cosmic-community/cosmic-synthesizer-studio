'use client';

import { useState } from 'react';
import { RecordingState } from '@/types';
import { Mic, Square, Play, Pause, Download, Save } from 'lucide-react';

interface RecordingControlsProps {
  recordingState: RecordingState;
  onStateChange: (state: RecordingState) => void;
}

export default function RecordingControls({ recordingState, onStateChange }: RecordingControlsProps) {
  const [recordingName, setRecordingName] = useState('');

  const startRecording = () => {
    onStateChange({
      ...recordingState,
      isRecording: true,
      duration: 0
    });
  };

  const stopRecording = () => {
    onStateChange({
      ...recordingState,
      isRecording: false
    });
  };

  const playRecording = () => {
    if (!recordingState.audioBuffer) return;
    
    onStateChange({
      ...recordingState,
      isPlaying: !recordingState.isPlaying
    });
  };

  const downloadRecording = () => {
    if (!recordingState.audioBuffer) return;
    
    // Create download link
    const url = URL.createObjectURL(recordingState.audioBuffer);
    const a = document.createElement('a');
    a.href = url;
    a.download = recordingName || `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToCloud = async () => {
    if (!recordingState.audioBuffer) return;
    
    try {
      // Here you would implement saving to Cosmic CMS
      console.log('Saving recording to cloud...');
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Recording Studio</h3>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={recordingState.isRecording ? stopRecording : startRecording}
              className={`btn-transport ${recordingState.isRecording ? 'btn-transport-record' : ''}`}
            >
              {recordingState.isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={playRecording}
              className="btn-transport"
              disabled={!recordingState.audioBuffer}
            >
              {recordingState.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <div className="text-sm text-slate-300">
              Duration: {formatDuration(recordingState.duration)}
            </div>
          </div>

          <div className={`px-3 py-1 rounded text-xs ${
            recordingState.isRecording 
              ? 'bg-red-900/50 text-red-400 animate-pulse' 
              : 'bg-slate-700/50 text-slate-400'
          }`}>
            {recordingState.isRecording ? 'REC' : 'READY'}
          </div>
        </div>

        {/* Recording Name Input */}
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-2">Recording Name</label>
          <input
            type="text"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            placeholder="Enter recording name..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={downloadRecording}
            disabled={!recordingState.audioBuffer}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <button
            onClick={saveToCloud}
            disabled={!recordingState.audioBuffer}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save to Cloud
          </button>
        </div>
      </div>

      {/* Waveform Display */}
      <div className="glass-panel p-6 rounded-xl">
        <h4 className="text-sm font-semibold text-cyan-400 mb-3">Waveform</h4>
        
        <div className="h-32 bg-slate-800/50 rounded-lg relative overflow-hidden">
          {recordingState.waveformData && recordingState.waveformData.length > 0 ? (
            <div className="flex items-center h-full px-2">
              {recordingState.waveformData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 mx-px"
                  style={{
                    height: `${(value / 255) * 100}%`,
                    minHeight: '2px'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              {recordingState.isRecording ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>Recording...</p>
                </div>
              ) : (
                <p>No recording available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recording Tips */}
      <div className="glass-panel p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Recording Tips</h4>
        <ul className="text-xs text-slate-300 space-y-1">
          <li>• Click the record button to start capturing audio</li>
          <li>• Play notes on the keyboard or drum sequencer while recording</li>
          <li>• Use effects to enhance your recording</li>
          <li>• Download locally or save to cloud for sharing</li>
        </ul>
      </div>
    </div>
  );
}