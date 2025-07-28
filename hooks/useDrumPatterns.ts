import { useState, useEffect, useCallback } from 'react';
import { DrumPatternData, getDrumPatterns, saveDrumPattern, updateDrumPattern, deleteDrumPattern } from '@/lib/cosmicCMS';

export interface DrumPatternHook {
  patterns: DrumPatternData[];
  loading: boolean;
  error: string | null;
  refreshPatterns: () => Promise<void>;
  savePattern: (patternData: any) => Promise<DrumPatternData>;
  updatePattern: (id: string, patternData: any) => Promise<DrumPatternData>;
  deletePattern: (id: string) => Promise<void>;
  getPatternsByStyle: (style: string) => DrumPatternData[];
  getPatternsByBPM: (minBpm: number, maxBpm: number) => DrumPatternData[];
  searchPatterns: (query: string) => DrumPatternData[];
}

export function useDrumPatterns(): DrumPatternHook {
  const [patterns, setPatterns] = useState<DrumPatternData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPatterns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const patternsData = await getDrumPatterns();
      setPatterns(patternsData);
    } catch (err) {
      console.error('Failed to load drum patterns:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patterns');
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePattern = useCallback(async (patternData: any): Promise<DrumPatternData> => {
    try {
      const savedPattern = await saveDrumPattern(patternData);
      setPatterns(prev => [...prev, savedPattern]);
      return savedPattern;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to save pattern';
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updatePattern = useCallback(async (id: string, patternData: any): Promise<DrumPatternData> => {
    try {
      const updatedPattern = await updateDrumPattern(id, patternData);
      setPatterns(prev => prev.map(p => p.id === id ? updatedPattern : p));
      return updatedPattern;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update pattern';
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deletePattern = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteDrumPattern(id);
      setPatterns(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete pattern';
      setError(error);
      throw new Error(error);
    }
  }, []);

  const getPatternsByStyle = useCallback((style: string): DrumPatternData[] => {
    return patterns.filter(pattern => 
      pattern.metadata.style?.key === style.toLowerCase() ||
      pattern.metadata.style?.value === style
    );
  }, [patterns]);

  const getPatternsByBPM = useCallback((minBpm: number, maxBpm: number): DrumPatternData[] => {
    return patterns.filter(pattern => 
      pattern.metadata.bpm >= minBpm && pattern.metadata.bpm <= maxBpm
    );
  }, [patterns]);

  const searchPatterns = useCallback((query: string): DrumPatternData[] => {
    const lowercaseQuery = query.toLowerCase();
    return patterns.filter(pattern =>
      pattern.title.toLowerCase().includes(lowercaseQuery) ||
      pattern.metadata.pattern_name?.toLowerCase().includes(lowercaseQuery) ||
      pattern.metadata.description?.toLowerCase().includes(lowercaseQuery) ||
      pattern.metadata.style?.value.toLowerCase().includes(lowercaseQuery)
    );
  }, [patterns]);

  useEffect(() => {
    refreshPatterns();
  }, [refreshPatterns]);

  return {
    patterns,
    loading,
    error,
    refreshPatterns,
    savePattern,
    updatePattern,
    deletePattern,
    getPatternsByStyle,
    getPatternsByBPM,
    searchPatterns
  };
}