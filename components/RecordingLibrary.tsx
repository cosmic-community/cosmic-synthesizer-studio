'use client';

import { useState, useEffect } from 'react';
import { useRecordings } from '@/hooks/useRecordings';
import { Recording } from '@/types';
import { 
  Music2, 
  Play, 
  Pause,
  Save, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Clock,
  Tag,
  Star,
  StarOff,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Volume2,
  Calendar,
  User,
  Headphones,
  MoreHorizontal
} from 'lucide-react';

interface RecordingLibraryProps {
  onRecordingLoad?: (recording: Recording) => void;
  currentRecording?: Recording;
  audioEngine?: any;
}

export default function RecordingLibrary({ 
  onRecordingLoad, 
  currentRecording,
  audioEngine 
}: RecordingLibraryProps) {
  const { 
    recordings, 
    loading, 
    error, 
    refreshRecordings, 
    saveRecording,
    deleteRecording,
    getRecordingsByGenre,
    searchRecordings,
    updateRecording
  } = useRecordings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'date' | 'genre'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRecordings, setSelectedRecordings] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('recording-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (recordingId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recordingId)) {
      newFavorites.delete(recordingId);
    } else {
      newFavorites.add(recordingId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('recording-favorites', JSON.stringify([...newFavorites]));
  };

  // Filter and search recordings
  const filteredRecordings = recordings.filter(recording => {
    // Text search
    if (searchTerm && !searchRecordings(searchTerm).includes(recording)) {
      return false;
    }

    // Genre filter
    if (selectedGenre !== 'all' && recording.metadata.genre?.key !== selectedGenre) {
      return false;
    }

    // Date range filter
    if (dateRange.start && recording.metadata.recording_date) {
      const recordingDate = new Date(recording.metadata.recording_date);
      const startDate = new Date(dateRange.start);
      if (recordingDate < startDate) return false;
    }
    
    if (dateRange.end && recording.metadata.recording_date) {
      const recordingDate = new Date(recording.metadata.recording_date);
      const endDate = new Date(dateRange.end);
      if (recordingDate > endDate) return false;
    }

    return true;
  });

  // Sort recordings
  const sortedRecordings = [...filteredRecordings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'duration':
        comparison = (a.metadata.duration || 0) - (b.metadata.duration || 0);
        break;
      case 'date':
        const aDate = a.metadata.recording_date ? new Date(a.metadata.recording_date).getTime() : 0;
        const bDate = b.metadata.recording_date ? new Date(b.metadata.recording_date).getTime() : 0;
        comparison = aDate - bDate;
        break;
      case 'genre':
        comparison = (a.metadata.genre?.value || '').localeCompare(b.metadata.genre?.value || '');
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const playRecording = async (recording: Recording) => {
    if (!recording.metadata.audio_file?.url) return;

    // Stop current playback
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }

    if (playingRecording === recording.id) {
      setPlayingRecording(null);
      return;
    }

    try {
      const audio = new Audio(recording.metadata.audio_file.url);
      setAudioElement(audio);
      setPlayingRecording(recording.id);
      
      audio.onended = () => {
        setPlayingRecording(null);
        setPlaybackTime(0);
      };

      audio.ontimeupdate = () => {
        setPlaybackTime(audio.currentTime);
      };

      audio.onerror = () => {
        console.error('Failed to play recording');
        setPlayingRecording(null);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing recording:', error);
      setPlayingRecording(null);
    }
  };

  const downloadRecording = (recording: Recording) => {
    if (!recording.metadata.audio_file?.url) return;

    const link = document.createElement('a');
    link.href = recording.metadata.audio_file.url;
    link.download = `${recording.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyRecordingLink = async (recording: Recording) => {
    if (!recording.metadata.audio_file?.url) return;
    
    try {
      await navigator.clipboard.writeText(recording.metadata.audio_file.url);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareRecording = async (recording: Recording) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recording.title,
          text: recording.metadata.description || '',
          url: recording.metadata.audio_file?.url
        });
      } catch (error) {
        console.error('Failed to share recording:', error);
      }
    } else {
      copyRecordingLink(recording);
    }
  };

  const toggleRecordingSelection = (recordingId: string) => {
    const newSelected = new Set(selectedRecordings);
    if (newSelected.has(recordingId)) {
      newSelected.delete(recordingId);
    } else {
      newSelected.add(recordingId);
    }
    setSelectedRecordings(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllRecordings = () => {
    if (selectedRecordings.size === sortedRecordings.length) {
      setSelectedRecordings(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedRecordings(new Set(sortedRecordings.map(r => r.id)));
      setShowBulkActions(true);
    }
  };

  const bulkDeleteRecordings = async () => {
    if (window.confirm(`Delete ${selectedRecordings.size} recordings?`)) {
      try {
        await Promise.all(
          Array.from(selectedRecordings).map(id => deleteRecording(id))
        );
        setSelectedRecordings(new Set());
        setShowBulkActions(false);
      } catch (error) {
        console.error('Failed to delete recordings:', error);
      }
    }
  };

  const handleEditRecording = async (recording: Recording) => {
    setEditingRecording(recording);
  };

  const saveEditedRecording = async (updatedData: Partial<Recording>) => {
    if (!editingRecording) return;

    try {
      await updateRecording(editingRecording.id, updatedData);
      setEditingRecording(null);
      await refreshRecordings();
    } catch (error) {
      console.error('Failed to update recording:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const genres = [
    { key: 'all', value: 'All Genres' },
    { key: 'electronic', value: 'Electronic' },
    { key: 'rock', value: 'Rock' },
    { key: 'jazz', value: 'Jazz' },
    { key: 'classical', value: 'Classical' },
    { key: 'hip-hop', value: 'Hip-Hop' },
    { key: 'ambient', value: 'Ambient' },
    { key: 'experimental', value: 'Experimental' },
    { key: 'other', value: 'Other' }
  ];

  return (
    <div className="glass-panel rounded-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <Music2 className="w-5 h-5" />
          Recording Library
          {recordings.length > 0 && (
            <span className="text-sm text-slate-400">({recordings.length})</span>
          )}
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-1 ${showFilters ? 'bg-cyan-500 text-black' : ''}`}
          >
            <Filter className="w-3 h-3" />
            Filters
          </button>
          
          <button
            onClick={selectAllRecordings}
            className="btn-secondary"
          >
            {selectedRecordings.size === sortedRecordings.length ? 'Deselect All' : 'Select All'}
          </button>
          
          <button
            onClick={refreshRecordings}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recordings..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="glass-panel rounded-lg p-4 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  {genres.map(genre => (
                    <option key={genre.key} value={genre.key}>{genre.value}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value="title">Title</option>
                    <option value="duration">Duration</option>
                    <option value="date">Date</option>
                    <option value="genre">Genre</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white hover:bg-slate-600"
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="glass-panel rounded-lg p-3 mb-4 border border-cyan-400/30">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 text-sm">
              {selectedRecordings.size} recordings selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={bulkDeleteRecordings}
                className="btn-secondary text-red-400 hover:bg-red-600/20"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recordings List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-400">Loading recordings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">Error: {error}</p>
            <button onClick={refreshRecordings} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : sortedRecordings.length === 0 ? (
          <div className="text-center py-8">
            <Music2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchTerm || selectedGenre !== 'all' ? 'No recordings match your filters.' : 'No recordings found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRecordings.map((recording) => (
              <div
                key={recording.id}
                className={`glass-panel rounded-lg p-4 border transition-all hover:border-cyan-400/50 ${
                  selectedRecordings.has(recording.id) ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedRecordings.has(recording.id)}
                      onChange={() => toggleRecordingSelection(recording.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{recording.title}</h4>
                      <p className="text-sm text-slate-400 truncate">{recording.metadata.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(recording.metadata.duration || 0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {recording.metadata.genre?.value || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {recording.metadata.recording_date ? formatDate(recording.metadata.recording_date) : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleFavorite(recording.id)}
                    className="ml-2 text-slate-400 hover:text-yellow-400 transition-colors"
                  >
                    {favorites.has(recording.id) ? (
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Playback Progress */}
                {playingRecording === recording.id && recording.metadata.duration && (
                  <div className="mb-3">
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div
                        className="bg-cyan-400 h-1 rounded-full transition-all"
                        style={{ width: `${(playbackTime / recording.metadata.duration) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatDuration(playbackTime)} / {formatDuration(recording.metadata.duration)}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => playRecording(recording)}
                      className={`btn-secondary flex items-center gap-1 ${playingRecording === recording.id ? 'bg-cyan-500 text-black' : ''}`}
                    >
                      {playingRecording === recording.id ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      {playingRecording === recording.id ? 'Playing' : 'Play'}
                    </button>
                    
                    {onRecordingLoad && (
                      <button
                        onClick={() => onRecordingLoad(recording)}
                        className="btn-secondary flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Load
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditRecording(recording)}
                      className="btn-secondary p-1"
                      title="Edit recording"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="btn-secondary p-1"
                      title="Download recording"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => copyRecordingLink(recording)}
                      className="btn-secondary p-1"
                      title="Copy link"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => shareRecording(recording)}
                      className="btn-secondary p-1"
                      title="Share recording"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="btn-secondary p-1 hover:bg-red-600"
                      title="Delete recording"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Recording Dialog */}
      {editingRecording && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-lg p-6 w-full max-w-md border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Recording</h3>
              <button
                onClick={() => setEditingRecording(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingRecording.title}
                  onChange={(e) => setEditingRecording(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingRecording.metadata.description || ''}
                  onChange={(e) => setEditingRecording(prev => prev ? {
                    ...prev,
                    metadata: { ...prev.metadata, description: e.target.value }
                  } : null)}
                  rows={3}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Genre
                </label>
                <select
                  value={editingRecording.metadata.genre?.key || 'other'}
                  onChange={(e) => {
                    const selectedGenre = genres.find(g => g.key === e.target.value);
                    setEditingRecording(prev => prev ? {
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        genre: selectedGenre ? { key: selectedGenre.key, value: selectedGenre.value } : undefined
                      }
                    } : null);
                  }}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  {genres.slice(1).map(genre => (
                    <option key={genre.key} value={genre.key}>{genre.value}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingRecording(null)}
                className="flex-1 px-4 py-2 bg-slate-700/50 text-white rounded hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEditedRecording(editingRecording)}
                className="flex-1 px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}