import { createBucketClient } from '@cosmicjs/sdk';
import { SynthPreset, Recording, DrumPattern, CosmicResponse } from '@/types';

// Check for required environment variables with better error handling
const bucketSlug = process.env.COSMIC_BUCKET_SLUG;
const readKey = process.env.COSMIC_READ_KEY;
const writeKey = process.env.COSMIC_WRITE_KEY;

// Create a flag to track if Cosmic is properly configured
export const isCosmicConfigured = Boolean(bucketSlug && readKey);

// Only create the client if we have the required configuration
export const cosmic = isCosmicConfigured ? createBucketClient({
  bucketSlug: bucketSlug!,
  readKey: readKey || '',
  writeKey: writeKey || '',
  apiEnvironment: "staging"
}) : null;

// Simple error helper for Cosmic SDK
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Helper function to check if Cosmic is available
function checkCosmicAvailability(): void {
  if (!isCosmicConfigured) {
    throw new Error('Cosmic CMS is not configured. Please set COSMIC_BUCKET_SLUG and COSMIC_READ_KEY environment variables.');
  }
}

// Preset functions
export async function savePreset(presetData: {
  title: string;
  oscillator_type: string;
  filter_cutoff: number;
  filter_resonance: number;
  envelope_attack: number;
  envelope_decay: number;
  envelope_sustain: number;
  envelope_release: number;
  effects: string[];
  reverb_amount?: number;
  delay_time?: number;
  delay_feedback?: number;
  distortion_amount?: number;
  chorus_rate?: number;
  chorus_depth?: number;
}): Promise<SynthPreset> {
  checkCosmicAvailability();
  
  if (!cosmic) {
    throw new Error('Cosmic client not initialized');
  }

  try {
    const response = await cosmic.objects.insertOne({
      type: 'presets',
      title: presetData.title,
      metadata: {
        oscillator_type: presetData.oscillator_type,
        filter_cutoff: presetData.filter_cutoff,
        filter_resonance: presetData.filter_resonance,
        envelope_attack: presetData.envelope_attack,
        envelope_decay: presetData.envelope_decay,
        envelope_sustain: presetData.envelope_sustain,
        envelope_release: presetData.envelope_release,
        effects: presetData.effects,
        reverb_amount: presetData.reverb_amount || 0,
        delay_time: presetData.delay_time || 0,
        delay_feedback: presetData.delay_feedback || 0,
        distortion_amount: presetData.distortion_amount || 0,
        chorus_rate: presetData.chorus_rate || 0,
        chorus_depth: presetData.chorus_depth || 0
      }
    });
    return response.object as SynthPreset;
  } catch (error) {
    console.error('Error saving preset:', error);
    throw new Error('Failed to save preset');
  }
}

export async function getPresets(): Promise<SynthPreset[]> {
  if (!isCosmicConfigured) {
    // Return empty array if Cosmic is not configured
    return [];
  }

  if (!cosmic) {
    return [];
  }

  try {
    const response = await cosmic.objects
      .find({ type: 'presets' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .sort('-created_at');
    
    return response.objects as SynthPreset[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Error fetching presets:', error);
    return []; // Return empty array instead of throwing
  }
}

export async function getPreset(slug: string): Promise<SynthPreset | null> {
  checkCosmicAvailability();
  
  if (!cosmic) {
    return null;
  }

  try {
    const response = await cosmic.objects.findOne({
      type: 'presets',
      slug
    });
    
    const preset = response.object as SynthPreset;
    
    if (!preset || !preset.metadata) {
      return null;
    }
    
    return preset;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// Recording functions
export async function saveRecording(recordingData: {
  title: string;
  duration: number;
  bpm: number;
  waveform_data?: number[];
  tags: string[];
  preset_used?: string;
}): Promise<Recording> {
  checkCosmicAvailability();
  
  if (!cosmic) {
    throw new Error('Cosmic client not initialized');
  }

  try {
    const response = await cosmic.objects.insertOne({
      type: 'recordings',
      title: recordingData.title,
      metadata: {
        duration: recordingData.duration,
        bpm: recordingData.bpm,
        waveform_data: recordingData.waveform_data || [],
        social_shares: 0,
        tags: recordingData.tags,
        preset_used: recordingData.preset_used || ''
      }
    });
    return response.object as Recording;
  } catch (error) {
    console.error('Error saving recording:', error);
    throw new Error('Failed to save recording');
  }
}

export async function getRecordings(): Promise<Recording[]> {
  if (!isCosmicConfigured) {
    return [];
  }

  if (!cosmic) {
    return [];
  }

  try {
    const response = await cosmic.objects
      .find({ type: 'recordings' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .sort('-created_at');
    
    return response.objects as Recording[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Error fetching recordings:', error);
    return [];
  }
}

export async function updateRecordingShares(id: string): Promise<void> {
  checkCosmicAvailability();
  
  if (!cosmic) {
    throw new Error('Cosmic client not initialized');
  }

  try {
    const recording = await cosmic.objects.findOne({ 
      type: 'recordings',
      id 
    });
    
    const currentShares = recording.object.metadata?.social_shares || 0;
    
    await cosmic.objects.updateOne(id, {
      metadata: {
        ...recording.object.metadata,
        social_shares: currentShares + 1
      }
    });
  } catch (error) {
    console.error('Error updating recording shares:', error);
    throw new Error('Failed to update shares');
  }
}

// Drum pattern functions
export async function saveDrumPattern(patternData: {
  title: string;
  bpm: number;
  steps: number;
  pattern: boolean[][];
  sounds: any[];
}): Promise<DrumPattern> {
  checkCosmicAvailability();
  
  if (!cosmic) {
    throw new Error('Cosmic client not initialized');
  }

  try {
    const response = await cosmic.objects.insertOne({
      type: 'drum_patterns',
      title: patternData.title,
      metadata: {
        bpm: patternData.bpm,
        steps: patternData.steps,
        pattern: patternData.pattern,
        sounds: patternData.sounds
      }
    });
    return response.object as DrumPattern;
  } catch (error) {
    console.error('Error saving drum pattern:', error);
    throw new Error('Failed to save drum pattern');
  }
}

export async function getDrumPatterns(): Promise<DrumPattern[]> {
  if (!isCosmicConfigured) {
    return [];
  }

  if (!cosmic) {
    return [];
  }

  try {
    const response = await cosmic.objects
      .find({ type: 'drum_patterns' })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .sort('-created_at');
    
    return response.objects as DrumPattern[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Error fetching drum patterns:', error);
    return [];
  }
}