'use client';

import { useState, useEffect } from 'react';
import { useDrumPatterns } from '@/hooks/useDrumPatterns';
import { DrumPatternData } from '@/lib/cosmicCMS';
import { DrumSequencerState, DrumSoundConfig } from '@/types';
import { 
  Library, 
  Play, 
  Save, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Music, 
  Clock,
  Tag,
  Star,
  StarOff,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface DrumPatternLibraryProps {
  onPatternLoad: (pattern: DrumPatternData) => void;
  currentPattern?: DrumSequencerState;
  onSaveCurrentPattern?: () => void;
  audioEngine?: any;
}

export default function DrumPatternLibrary({ 
  onPatternLoad, 
  currentPattern, 
  onSaveCurrentPattern,
  audioEngine 
}: DrumPatternLibraryProps) {
  const { 
    patterns, 
    loading, 
    error, 
    refreshPatterns, 
    savePattern, 
    deletePattern,
    getPatternsByStyle,
    getPatternsByBPM,
    searchPatterns
  } = useDrumPatterns();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [bpmRange, setBpmRange] = useState({ min: 60, max: 200 });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogData, setSaveDialogData] = useState({
    name: '',
    description: '',
    style: 'electronic'
  });
  const [previewingPattern, setPreviewingPattern] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'bpm' | 'style' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('drum-pattern-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (patternId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(patternId)) {
      newFavorites.delete(patternId);
    } else {
      newFavorites.add(patternId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('drum-pattern-favorites', JSON.stringify([...newFavorites]));
  };

  // Filter and search patterns
  const filteredPatterns = patterns.filter(pattern => {
    // Text search
    if (searchTerm && !searchPatterns(searchTerm).includes(pattern)) {
      return false;
    }

    // Style filter
    if (selectedStyle !== 'all' && pattern.metadata.style?.key !== selectedStyle) {
      return false;
    }

    // BPM filter
    if (pattern.metadata.bpm < bpmRange.min || pattern.metadata.bpm > bpmRange.max) {
      return false;
    }

    return true;
  });

  // Sort patterns
  const sortedPatterns = [...filteredPatterns].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'bpm':
        comparison = a.metadata.bpm - b.metadata.bpm;
        break;
      case 'style':
        comparison = (a.metadata.style?.value || '').localeCompare(b.metadata.style?.value || '');
        break;
      case 'date':
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = aDate - bDate;
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSavePattern = async () => {
    if (!currentPattern || !onSaveCurrentPattern) return;

    try {
      // Convert current pattern to Cosmic format
      const patternData = {
        title: saveDialogData.name,
        pattern_name: saveDialogData.name,
        description: saveDialogData.description,
        bpm: currentPattern.bpm,
        time_signature: '4/4', // Default for now
        style: saveDialogData.style,
        pattern_data: {
          steps: 16,
          tracks: convertPatternToTracks(currentPattern.pattern, currentPattern.sounds),
          velocity: currentPattern.sounds.reduce((acc, sound, index) => {
            acc[sound.name.toLowerCase()] = Math.round(sound.volume * 127);
            return acc;
          }, {} as Record<string, number>)
        }
      };

      await savePattern(patternData);
      setShowSaveDialog(false);
      setSaveDialogData({ name: '', description: '', style: 'electronic' });
    } catch (error) {
      console.error('Failed to save pattern:', error);
    }
  };

  const convertPatternToTracks = (pattern: boolean[][], sounds: DrumSoundConfig[]) => {
    const tracks: Record<string, number[]> = {};
    
    pattern.forEach((track, trackIndex) => {
      if (sounds[trackIndex]) {
        const trackName = sounds[trackIndex].name.toLowerCase();
        tracks[trackName] = track.map(step => step ? 1 : 0);
      }
    });

    return tracks;
  };

  const previewPattern = async (pattern: DrumPatternData) => {
    if (!audioEngine) return;

    if (previewingPattern === pattern.id) {
      setPreviewingPattern(null);
      return;
    }

    setPreviewingPattern(pattern.id);
    
    // Convert Cosmic pattern format to playable format
    const tracks = pattern.metadata.pattern_data.tracks;
    const velocity = pattern.metadata.pattern_data.velocity;
    
    // Play a short preview (first 8 steps)
    const stepTime = (60 / pattern.metadata.bpm / 4) * 1000;
    
    for (let step = 0; step < 8; step++) {
      setTimeout(() => {
        Object.entries(tracks).forEach(([soundName, trackData]) => {
          if (trackData[step]) {
            // Create a basic drum sound config for preview
            const drumSound: DrumSoundConfig = {
              name: soundName,
              type: soundName as any,
              frequency: getDrumFrequency(soundName),
              decay: 0.5,
              volume: (velocity[soundName] || 100) / 127,
              oscillatorType: 'sine'
            };
            
            try {
              audioEngine.playDrumSound(drumSound);
            } catch (error) {
              console.error('Error playing preview sound:', error);
            }
          }
        });
        
        if (step === 7) {
          setTimeout(() => setPreviewingPattern(null), stepTime);
        }
      }, step * stepTime);
    }
  };

  const getDrumFrequency = (soundName: string): number => {
    const frequencies: Record<string, number> = {
      kick: 60,
      snare: 200,
      hihat: 8000,
      openhat: 7000,
      clap: 1500,
      crash: 5000,
      ride: 3000,
      perc: 800
    };
    
    return frequencies[soundName] || 440;
  };

  const copyPatternData = async (pattern: DrumPatternData) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(pattern.metadata.pattern_data, null, 2));
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy pattern data:', error);
    }
  };

  const sharePattern = async (pattern: DrumPatternData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pattern.title,
          text: pattern.metadata.description,
          url: window.location.href // Could be pattern-specific URL
        });
      } catch (error) {
        console.error('Failed to share pattern:', error);
      }
    } else {
      // Fallback to clipboard
      const shareText = `Check out this drum pattern: ${pattern.title}\n${pattern.metadata.description}\nBPM: ${pattern.metadata.bpm} | Style: ${pattern.metadata.style?.value}`;
      try {
        await navigator.clipboard.writeText(shareText);
        // Could add toast notification here
      } catch (error) {
        console.error('Failed to copy share text:', error);
      }
    }
  };

  const styles = [
    { key: 'all', value: 'All Styles' },
    { key: 'rock', value: 'Rock' },
    { key: 'electronic', value: 'Electronic' },
    { key: 'jazz', value: 'Jazz' },
    { key: 'latin', value: 'Latin' },
    { key: 'funk', value: 'Funk' },
    { key: 'hip-hop', value: 'Hip-Hop' },
    { key: 'experimental', value: 'Experimental' }
  ];

  return (
    <div className="bg-synth-panel rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-synth-accent flex items-center gap-2">
          <Library className="w-5 h-5" />
          Pattern Library
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`synth-button-small flex items-center gap-1 ${showFilters ? 'bg-synth-accent text-black' : ''}`}
          >
            <Filter className="w-3 h-3" />
            Filters
          </button>
          
          {onSaveCurrentPattern && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="synth-button-small flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              Save Current
            </button>
          )}
          
          <button
            onClick={refreshPatterns}
            disabled={loading}
            className="synth-button-small"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patterns..."
            className="w-full bg-synth-control border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-synth-control rounded-lg p-4 border border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Style Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  {styles.map(style => (
                    <option key={style.key} value={style.key}>{style.value}</option>
                  ))}
                </select>
              </div>

              {/* BPM Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BPM Range: {bpmRange.min} - {bpmRange.max}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpmRange.min}
                    onChange={(e) => setBpmRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpmRange.max}
                    onChange={(e) => setBpmRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="name">Name</option>
                    <option value="bpm">BPM</option>
                    <option value="style">Style</option>
                    <option value="date">Date</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white hover:bg-gray-600"
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pattern Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-synth-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Loading patterns...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={refreshPatterns} className="synth-button">
            Try Again
          </button>
        </div>
      ) : sortedPatterns.length === 0 ? (
        <div className="text-center py-8">
          <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {searchTerm || selectedStyle !== 'all' ? 'No patterns match your filters.' : 'No patterns found.'}
          </p>
          {onSaveCurrentPattern && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="synth-button mt-4"
            >
              Save Your First Pattern
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className="bg-synth-control rounded-lg p-4 border border-gray-600 hover:border-synth-accent transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{pattern.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{pattern.metadata.description}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(pattern.id)}
                  className="ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  {favorites.has(pattern.id) ? (
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pattern.metadata.bpm} BPM
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {pattern.metadata.style?.value}
                </div>
                <div className="flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  {pattern.metadata.time_signature?.value}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    onClick={() => onPatternLoad(pattern)}
                    className="synth-button-small flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Load
                  </button>
                  
                  {audioEngine && (
                    <button
                      onClick={() => previewPattern(pattern)}
                      className={`synth-button-small flex items-center gap-1 ${previewingPattern === pattern.id ? 'bg-synth-accent text-black' : ''}`}
                    >
                      <Play className="w-3 h-3" />
                      {previewingPattern === pattern.id ? 'Playing' : 'Preview'}
                    </button>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => copyPatternData(pattern)}
                    className="synth-button-small p-1"
                    title="Copy pattern data"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => sharePattern(pattern)}
                    className="synth-button-small p-1"
                    title="Share pattern"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => deletePattern(pattern.id)}
                    className="synth-button-small p-1 hover:bg-red-600"
                    title="Delete pattern"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Pattern Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-synth-panel rounded-lg p-6 w-full max-w-md border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Save Pattern</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pattern Name *
                </label>
                <input
                  type="text"
                  value={saveDialogData.name}
                  onChange={(e) => setSaveDialogData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter pattern name..."
                  className="w-full bg-synth-control border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={saveDialogData.description}
                  onChange={(e) => setSaveDialogData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your pattern..."
                  rows={3}
                  className="w-full bg-synth-control border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Style
                </label>
                <select
                  value={saveDialogData.style}
                  onChange={(e) => setSaveDialogData(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full bg-synth-control border border-gray-600 rounded px-3 py-2 text-white"
                >
                  {styles.slice(1).map(style => (
                    <option key={style.key} value={style.key}>{style.value}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePattern}
                disabled={!saveDialogData.name.trim()}
                className="flex-1 px-4 py-2 bg-synth-accent text-black rounded hover:bg-synth-info transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Pattern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}