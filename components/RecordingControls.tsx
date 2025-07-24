'use client';

import { useState } from 'react';
import { RecordingState } from '@/types';
import { formatTime, shareToTwitter, shareToFacebook, shareViaWebAPI, downloadBlob } from '@/lib/utils';
import { saveRecording } from '@/lib/cosmic';
import { Mic, Play, Square, Download, Share2, Save } from 'lucide-react';

interface RecordingControlsProps {
  recordingState: RecordingState;
  onStateChange: (state: RecordingState) => void;
}

export default function RecordingControls({ recordingState, onStateChange }: RecordingControlsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecording, setSavedRecording] = useState<any>(null);

  const handleSaveRecording = async () => {
    if (!recordingState.audioBuffer) return;

    setIsSaving(true);
    try {
      const title = `Recording ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      const recording = await saveRecording({
        title,
        duration: recordingState.duration,
        bpm: 128, // Default BPM
        waveform_data: recordingState.waveformData,
        tags: ['synthesizer', 'electronic']
      });
      
      setSavedRecording(recording);
    } catch (error) {
      console.error('Failed to save recording:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'native') => {
    const title = savedRecording?.title || 'My Synthesizer Recording';
    const text = `Check out my new track created with Cosmic Synthesizer Studio!`;
    const url = window.location.href;

    try {
      switch (platform) {
        case 'twitter':
          shareToTwitter(text, url);
          break;
        case 'facebook':
          shareToFacebook(url);
          break;
        case 'native':
          await shareViaWebAPI({ title, text, url });
          break;
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleDownload = () => {
    if (recordingState.audioBuffer) {
      // In a real implementation, you'd convert the AudioBuffer to a downloadable format
      const blob = new Blob(['audio data'], { type: 'audio/wav' });
      downloadBlob(blob, `recording-${Date.now()}.wav`);
    }
  };

  return (
    <div className="bg-synth-panel p-6 rounded-lg">
      <h3 className="text-xl font-bold text-synth-accent mb-6 flex items-center gap-2">
        <Mic className="w-5 h-5" />
        Recording Studio
      </h3>

      {/* Recording Status */}
      <div className="bg-synth-control p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              recordingState.isRecording 
                ? 'bg-red-500 recording-indicator' 
                : recordingState.audioBuffer 
                  ? 'bg-green-500' 
                  : 'bg-gray-500'
            }`} />
            <span className="text-white font-medium">
              {recordingState.isRecording 
                ? 'Recording...' 
                : recordingState.audioBuffer 
                  ? 'Recording Ready' 
                  : 'No Recording'
              }
            </span>
          </div>
          
          <div className="text-synth-accent font-mono text-lg">
            {formatTime(recordingState.duration)}
          </div>
        </div>

        {/* Waveform Preview */}
        {recordingState.waveformData.length > 0 && (
          <div className="h-12 bg-synth-bg rounded flex items-end gap-0.5 p-2">
            {recordingState.waveformData.slice(0, 100).map((value, index) => (
              <div
                key={index}
                className="waveform-bar flex-1 min-w-0"
                style={{ height: `${Math.max(2, value * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          disabled={recordingState.isRecording}
          className={`synth-button flex items-center justify-center gap-2 ${
            recordingState.isPlaying ? 'active' : ''
          } ${recordingState.isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {recordingState.isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {recordingState.isPlaying ? 'Stop' : 'Play'}
        </button>

        <button
          onClick={handleDownload}
          disabled={!recordingState.audioBuffer}
          className={`synth-button flex items-center justify-center gap-2 ${
            !recordingState.audioBuffer ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* Save to Cosmic */}
      <div className="mb-6">
        <button
          onClick={handleSaveRecording}
          disabled={!recordingState.audioBuffer || isSaving}
          className={`synth-button w-full flex items-center justify-center gap-2 ${
            !recordingState.audioBuffer || isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving to Cosmic...' : 'Save to Cosmic'}
        </button>
        
        {savedRecording && (
          <p className="text-green-400 text-sm mt-2 text-center">
            ✓ Saved: {savedRecording.title}
          </p>
        )}
      </div>

      {/* Social Sharing */}
      {savedRecording && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Your Track
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleShare('twitter')}
              className="synth-button text-sm bg-blue-600 hover:bg-blue-700"
            >
              Twitter
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="synth-button text-sm bg-blue-800 hover:bg-blue-900"
            >
              Facebook
            </button>
            
            <button
              onClick={() => handleShare('native')}
              className="synth-button text-sm"
            >
              More...
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        <p>Record your performance and share it with the world. Recordings are saved to your Cosmic bucket.</p>
      </div>
    </div>
  );
}