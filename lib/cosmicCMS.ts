import { createBucketClient } from '@cosmicjs/sdk';

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
});

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
      'Hip-Hop': { key: 'hip-hop', value: 'Hip-Hop' },
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