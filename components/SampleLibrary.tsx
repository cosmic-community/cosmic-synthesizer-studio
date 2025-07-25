'use client';

import { useState } from 'react';
import { Play, Download, Upload, Search, Filter, FolderOpen, FileAudio } from 'lucide-react';

interface Sample {
  id: string;
  name: string;
  category: string;
  duration: number;
  bpm?: number;
  key?: string;
  tags: string[];
  size: string;
  format: string;
  waveform?: number[];
}

export default function SampleLibrary() {
  const [samples] = useState<Sample[]>([
    {
      id: '1',
      name: 'Analog Bass Hit',
      category: 'Bass',
      duration: 2.3,
      bpm: 128,
      key: 'C',
      tags: ['analog', 'deep', 'punchy'],
      size: '1.2 MB',
      format: 'WAV'
    },
    {
      id: '2',
      name: 'Vintage Drum Loop',
      category: 'Drums',
      duration: 4.0,
      bpm: 120,
      tags: ['vintage', 'loop', 'groove'],
      size: '2.1 MB',
      format: 'WAV'
    },
    {
      id: '3',
      name: 'Ethereal Pad',
      category: 'Synth',
      duration: 8.5,
      key: 'Am',
      tags: ['ambient', 'atmospheric', 'dreamy'],
      size: '3.8 MB',
      format: 'WAV'
    },
    {
      id: '4',
      name: 'Acoustic Guitar Strum',
      category: 'Guitar',
      duration: 1.8,
      bpm: 90,
      key: 'G',
      tags: ['acoustic', 'natural', 'warm'],
      size: '0.9 MB',
      format: 'WAV'
    },
    {
      id: '5',
      name: 'Electronic Glitch',
      category: 'FX',
      duration: 0.5,
      tags: ['glitch', 'digital', 'percussive'],
      size: '0.3 MB',
      format: 'WAV'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingSample, setPlayingSample] = useState<string | null>(null);

  const categories = ['All', 'Bass', 'Drums', 'Synth', 'Guitar', 'FX', 'Vocals'];

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || sample.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaySample = (sampleId: string) => {
    if (playingSample === sampleId) {
      setPlayingSample(null);
    } else {
      setPlayingSample(sampleId);
      // In a real implementation, this would trigger audio playback
      setTimeout(() => setPlayingSample(null), 2000);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Sample Library
          </h3>
          <div className="flex gap-2">
            <button className="synth-button flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="synth-button flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-synth-control border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-synth-accent focus:outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-synth-control border border-gray-600 rounded-lg text-white focus:border-synth-accent focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sample Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="bg-synth-control rounded-lg p-4 border border-gray-600 hover:border-synth-accent/50 transition-colors group cursor-pointer"
            >
              {/* Waveform Preview */}
              <div className="h-16 bg-gray-800 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                {sample.waveform ? (
                  <div className="flex items-center h-full w-full px-2">
                    {/* Simplified waveform visualization */}
                    {Array.from({ length: 50 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-synth-accent/40 mx-px"
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                          opacity: playingSample === sample.id ? 1 : 0.6
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-gray-500">
                    <FileAudio className="w-8 h-8" />
                  </div>
                )}
                
                {/* Play button overlay */}
                <button
                  onClick={() => handlePlaySample(sample.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className={`w-8 h-8 text-white ${playingSample === sample.id ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              {/* Sample Info */}
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">{sample.name}</h4>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="bg-synth-accent/20 text-synth-accent px-2 py-1 rounded">
                    {sample.category}
                  </span>
                  <span>{formatDuration(sample.duration)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex gap-2">
                    {sample.bpm && <span>{sample.bpm} BPM</span>}
                    {sample.key && <span>{sample.key}</span>}
                  </div>
                  <div className="flex gap-1">
                    <span>{sample.format}</span>
                    <span>•</span>
                    <span>{sample.size}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {sample.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {sample.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{sample.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{filteredSamples.length} samples</span>
          <div className="flex items-center gap-4">
            <span>Total: {samples.reduce((acc, sample) => acc + parseFloat(sample.size), 0).toFixed(1)} MB</span>
            <button className="text-synth-accent hover:text-synth-accent/80">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}