import { useState, useEffect, useCallback } from 'react';
import { Recording } from '@/types';
import { cosmic } from '@/lib/cosmicCMS';

export interface RecordingHook {
  recordings: Recording[];
  loading: boolean;
  error: string | null;
  refreshRecordings: () => Promise<void>;
  saveRecording: (recordingData: any) => Promise<Recording>;
  updateRecording: (id: string, recordingData: any) => Promise<Recording>;
  deleteRecording: (id: string) => Promise<void>;
  getRecordingsByGenre: (genre: string) => Recording[];
  searchRecordings: (query: string) => Recording[];
}

export function useRecordings(): RecordingHook {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRecordings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { objects } = await cosmic.objects
        .find({ type: 'recordings' })
        .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])
        .depth(1);
      
      setRecordings(objects as Recording[]);
    } catch (err) {
      console.error('Failed to load recordings:', err);
      if (err && typeof err === 'object' && 'status' in err && (err as any).status === 404) {
        setRecordings([]);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load recordings');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRecording = useCallback(async (recordingData: any): Promise<Recording> => {
    try {
      const genreOptions = {
        'Electronic': { key: 'electronic', value: 'Electronic' },
        'Rock': { key: 'rock', value: 'Rock' },
        'Jazz': { key: 'jazz', value: 'Jazz' },
        'Classical': { key: 'classical', value: 'Classical' },
        'Hip-Hop': { key: 'hip-hop', value: 'Hip-Hop' },
        'Ambient': { key: 'ambient', value: 'Ambient' },
        'Experimental': { key: 'experimental', value: 'Experimental' },
        'Other': { key: 'other', value: 'Other' }
      };

      const { object } = await cosmic.objects.insertOne({
        title: recordingData.title,
        type: 'recordings',
        metadata: {
          title: recordingData.title,
          description: recordingData.description || '',
          audio_file: recordingData.audio_file,
          duration: recordingData.duration || 0,
          genre: genreOptions[recordingData.genre as keyof typeof genreOptions] || genreOptions['Other'],
          recording_date: recordingData.recording_date || new Date().toISOString().split('T')[0]
        }
      });

      const newRecording = object as Recording;
      setRecordings(prev => [newRecording, ...prev]);
      return newRecording;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to save recording';
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updateRecording = useCallback(async (id: string, recordingData: any): Promise<Recording> => {
    try {
      const metadata: any = {};
      
      if (recordingData.title) metadata.title = recordingData.title;
      if (recordingData.description !== undefined) metadata.description = recordingData.description;
      if (recordingData.duration) metadata.duration = recordingData.duration;
      if (recordingData.recording_date) metadata.recording_date = recordingData.recording_date;
      
      if (recordingData.genre) {
        const genreOptions = {
          'Electronic': { key: 'electronic', value: 'Electronic' },
          'Rock': { key: 'rock', value: 'Rock' },
          'Jazz': { key: 'jazz', value: 'Jazz' },
          'Classical': { key: 'classical', value: 'Classical' },
          'Hip-Hop': { key: 'hip-hop', value: 'Hip-Hop' },
          'Ambient': { key: 'ambient', value: 'Ambient' },
          'Experimental': { key: 'experimental', value: 'Experimental' },
          'Other': { key: 'other', value: 'Other' }
        };
        metadata.genre = genreOptions[recordingData.genre as keyof typeof genreOptions];
      }

      const updateData: any = { metadata };
      if (recordingData.title) updateData.title = recordingData.title;

      const { object } = await cosmic.objects.updateOne(id, updateData);
      const updatedRecording = object as Recording;
      
      setRecordings(prev => prev.map(r => r.id === id ? updatedRecording : r));
      return updatedRecording;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update recording';
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deleteRecording = useCallback(async (id: string): Promise<void> => {
    try {
      await cosmic.objects.deleteOne(id);
      setRecordings(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete recording';
      setError(error);
      throw new Error(error);
    }
  }, []);

  const getRecordingsByGenre = useCallback((genre: string): Recording[] => {
    return recordings.filter(recording => 
      recording.metadata.genre?.key === genre.toLowerCase() ||
      recording.metadata.genre?.value === genre
    );
  }, [recordings]);

  const searchRecordings = useCallback((query: string): Recording[] => {
    const lowercaseQuery = query.toLowerCase();
    return recordings.filter(recording =>
      recording.title.toLowerCase().includes(lowercaseQuery) ||
      recording.metadata.title?.toLowerCase().includes(lowercaseQuery) ||
      recording.metadata.description?.toLowerCase().includes(lowercaseQuery) ||
      recording.metadata.genre?.value.toLowerCase().includes(lowercaseQuery)
    );
  }, [recordings]);

  useEffect(() => {
    refreshRecordings();
  }, [refreshRecordings]);

  return {
    recordings,
    loading,
    error,
    refreshRecordings,
    saveRecording,
    updateRecording,
    deleteRecording,
    getRecordingsByGenre,
    searchRecordings
  };
}