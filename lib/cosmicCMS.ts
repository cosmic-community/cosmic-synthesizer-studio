import { createBucketClient } from '@cosmicjs/sdk';

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
});

export { cosmic };

export interface DrumPatternData {
  id: string;
  title: string;
  slug: string;
  created_at?: string;
  modified_at?: string;
  metadata: {
    pattern_name: string;
    description: string;
    bpm: number;
    time_signature: {
      key: string;
      value: string;
    };
    pattern_data: {
      steps: number;
      tracks: Record<string, number[]>;
      velocity: Record<string, number>;
    };
    style: {
      key: string;
      value: string;
    };
  };
}

export interface RecordingData {
  id: string;
  title: string;
  slug: string;
  created_at?: string;
  modified_at?: string;
  metadata: {
    title: string;
    description?: string;
    audio_file: {
      url: string;
      imgix_url: string;
    };
    duration: number;
    genre?: {
      key: string;
      value: string;
    };
    recording_date?: string;
  };
}

export interface PresetData {
  id: string;
  title: string;
  slug: string;
  created_at?: string;
  modified_at?: string;
  metadata: {
    name: string;
    description?: string;
    instrument_type: {
      key: string;
      value: string;
    };
    settings_data: {
      oscillator?: any;
      filter?: any;
      envelope?: any;
      effects?: any;
    };
    tags?: string;
  };
}

// Drum Patterns
export async function getDrumPatterns(): Promise<DrumPatternData[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'drum-patterns' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])
      .depth(1);
    
    return objects as DrumPatternData[];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getDrumPatternBySlug(slug: string): Promise<DrumPatternData | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ type: 'drum-patterns', slug })
      .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])
      .depth(1);
    
    return object as DrumPatternData;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveDrumPattern(patternData: {
  title: string;
  pattern_name: string;
  description: string;
  bpm: number;
  time_signature: string;
  pattern_data: any;
  style: string;
}): Promise<DrumPatternData> {
  const timeSignatureOptions = {
    '4/4': { key: '4-4', value: '4/4' },
    '3/4': { key: '3-4', value: '3/4' },
    '2/4': { key: '2-4', value: '2/4' },
    '6/8': { key: '6-8', value: '6/8' },
    '7/8': { key: '7-8', value: '7/8' },
    'Other': { key: 'other', value: 'Other' }
  };

  const styleOptions = {
    'Rock': { key: 'rock', value: 'Rock' },
    'Electronic': { key: 'electronic', value: 'Electronic' },
    'Jazz': { key: 'jazz', value: 'Jazz' },
    'Latin': { key: 'latin', value: 'Latin' },
    'Funk': { key: 'funk', value: 'Funk' },
    'Hip-Hop': { key: 'hip-hop', value: 'Hip-Hop' },
    'Experimental': { key: 'experimental', value: 'Experimental' },
    'Other': { key: 'other', value: 'Other' }
  };

  const { object } = await cosmic.objects.insertOne({
    title: patternData.title,
    type: 'drum-patterns',
    metadata: {
      pattern_name: patternData.pattern_name,
      description: patternData.description,
      bpm: patternData.bpm,
      time_signature: timeSignatureOptions[patternData.time_signature as keyof typeof timeSignatureOptions] || timeSignatureOptions['4/4'],
      pattern_data: patternData.pattern_data,
      style: styleOptions[patternData.style as keyof typeof styleOptions] || styleOptions['Other']
    }
  });

  return object as DrumPatternData;
}

export async function updateDrumPattern(id: string, patternData: Partial<{
  title: string;
  pattern_name: string;
  description: string;
  bpm: number;
  time_signature: string;
  pattern_data: any;
  style: string;
}>): Promise<DrumPatternData> {
  const metadata: any = {};
  
  if (patternData.pattern_name) metadata.pattern_name = patternData.pattern_name;
  if (patternData.description) metadata.description = patternData.description;
  if (patternData.bpm) metadata.bpm = patternData.bpm;
  if (patternData.pattern_data) metadata.pattern_data = patternData.pattern_data;
  
  if (patternData.time_signature) {
    const timeSignatureOptions = {
      '4/4': { key: '4-4', value: '4/4' },
      '3/4': { key: '3-4', value: '3/4' },
      '2/4': { key: '2-4', value: '2/4' },
      '6/8': { key: '6-8', value: '6/8' },
      '7/8': { key: '7-8', value: '7/8' },
      'Other': { key: 'other', value: 'Other' }
    };
    metadata.time_signature = timeSignatureOptions[patternData.time_signature as keyof typeof timeSignatureOptions];
  }
  
  if (patternData.style) {
    const styleOptions = {
      'Rock': { key: 'rock', value: 'Rock' },
      'Electronic': { key: 'electronic', value: 'Electronic' },
      'Jazz': { key: 'jazz', value: 'Jazz' },
      'Latin': { key: 'latin', value: 'Latin' },
      'Funk': { key: 'funk', value: 'Funk' },
      'Hip-Hop': { key: 'hip-hop', value: 'Hip-Hip' },
      'Experimental': { key: 'experimental', value: 'Experimental' },
      'Other': { key: 'other', value: 'Other' }
    };
    metadata.style = styleOptions[patternData.style as keyof typeof styleOptions];
  }

  const updateData: any = { metadata };
  if (patternData.title) updateData.title = patternData.title;

  const { object } = await cosmic.objects.updateOne(id, updateData);
  return object as DrumPatternData;
}

export async function deleteDrumPattern(id: string): Promise<void> {
  await cosmic.objects.deleteOne(id);
}

// Recordings
export async function getRecordings(): Promise<RecordingData[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'recordings' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])
      .depth(1);
    
    return objects as RecordingData[];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getRecordingBySlug(slug: string): Promise<RecordingData | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ type: 'recordings', slug })
      .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])
      .depth(1);
    
    return object as RecordingData;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveRecording(recordingData: {
  title: string;
  description?: string;
  audio_file: any;
  duration: number;
  genre: string;
  recording_date?: string;
}): Promise<RecordingData> {
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
      duration: recordingData.duration,
      genre: genreOptions[recordingData.genre as keyof typeof genreOptions] || genreOptions['Other'],
      recording_date: recordingData.recording_date || new Date().toISOString().split('T')[0]
    }
  });

  return object as RecordingData;
}

export async function updateRecording(id: string, recordingData: Partial<{
  title: string;
  description: string;
  duration: number;
  genre: string;
  recording_date: string;
}>): Promise<RecordingData> {
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
  return object as RecordingData;
}

export async function deleteRecording(id: string): Promise<void> {
  await cosmic.objects.deleteOne(id);
}

// Presets
export async function getPresets(): Promise<PresetData[]> {
  try {
    const { objects } = await cosmic.objects
      .find({ type: 'presets' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])
      .depth(1);
    
    return objects as PresetData[];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getPresetBySlug(slug: string): Promise<PresetData | null> {
  try {
    const { object } = await cosmic.objects
      .findOne({ type: 'presets', slug })
      .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])
      .depth(1);
    
    return object as PresetData;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function savePreset(presetData: any): Promise<PresetData> {
  const instrumentOptions = {
    'Synthesizer': { key: 'synth', value: 'Synthesizer' },
    'Piano': { key: 'piano', value: 'Piano' },
    'Guitar': { key: 'guitar', value: 'Guitar' },
    'Bass': { key: 'bass', value: 'Bass' },
    'Drums': { key: 'drums', value: 'Drums' },
    'Other': { key: 'other', value: 'Other' }
  };

  const { object } = await cosmic.objects.insertOne({
    title: presetData.title,
    type: 'presets',
    metadata: {
      name: presetData.title,
      description: presetData.description || '',
      instrument_type: instrumentOptions['Synthesizer'], // Default to synth
      settings_data: {
        oscillator_type: presetData.oscillator_type,
        filter_cutoff: presetData.filter_cutoff,
        filter_resonance: presetData.filter_resonance,
        envelope_attack: presetData.envelope_attack,
        envelope_decay: presetData.envelope_decay,
        envelope_sustain: presetData.envelope_sustain,
        envelope_release: presetData.envelope_release,
        effects: presetData.effects || [],
        reverb_amount: presetData.reverb_amount,
        delay_time: presetData.delay_time,
        delay_feedback: presetData.delay_feedback,
        distortion_amount: presetData.distortion_amount,
        chorus_rate: presetData.chorus_rate,
        chorus_depth: presetData.chorus_depth
      },
      tags: presetData.tags || ''
    }
  });

  return object as PresetData;
}

export async function updatePreset(id: string, presetData: any): Promise<PresetData> {
  const { object } = await cosmic.objects.updateOne(id, {
    title: presetData.title,
    metadata: {
      ...presetData,
      settings_data: {
        ...presetData.settings_data
      }
    }
  });

  return object as PresetData;
}

export async function deletePreset(id: string): Promise<void> {
  await cosmic.objects.deleteOne(id);
}