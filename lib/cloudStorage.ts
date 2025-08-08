import { cosmic } from '@/lib/cosmicCMS';

export interface CloudItem {
  id: string;
  name: string;
  type: 'preset' | 'recording' | 'pattern' | 'project';
  size: string;
  lastModified: Date;
  data?: any;
}

class CloudStorageService {
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check by trying to fetch object types
      await cosmic.objects.find({ type: 'presets' }).limit(1);
      return true;
    } catch (error) {
      console.error('Cloud storage health check failed:', error);
      return false;
    }
  }

  async getLocalItems(): Promise<CloudItem[]> {
    // Get items from local storage, IndexedDB, or other local storage mechanisms
    const items: CloudItem[] = [];
    
    try {
      // Get presets from local storage
      const presets = JSON.parse(localStorage.getItem('local-presets') || '[]');
      presets.forEach((preset: any) => {
        items.push({
          id: preset.id,
          name: preset.name,
          type: 'preset',
          size: this.calculateSize(preset),
          lastModified: new Date(preset.lastModified),
          data: preset
        });
      });

      // Get recordings from local storage
      const recordings = JSON.parse(localStorage.getItem('local-recordings') || '[]');
      recordings.forEach((recording: any) => {
        items.push({
          id: recording.id,
          name: recording.name,
          type: 'recording',
          size: this.calculateSize(recording),
          lastModified: new Date(recording.lastModified),
          data: recording
        });
      });

      // Get patterns from local storage
      const patterns = JSON.parse(localStorage.getItem('local-patterns') || '[]');
      patterns.forEach((pattern: any) => {
        items.push({
          id: pattern.id,
          name: pattern.name,
          type: 'pattern',
          size: this.calculateSize(pattern),
          lastModified: new Date(pattern.lastModified),
          data: pattern
        });
      });

      // Get projects from local storage
      const projects = JSON.parse(localStorage.getItem('local-projects') || '[]');
      projects.forEach((project: any) => {
        items.push({
          id: project.id,
          name: project.name,
          type: 'project',
          size: this.calculateSize(project),
          lastModified: new Date(project.lastModified),
          data: project
        });
      });

    } catch (error) {
      console.error('Failed to get local items:', error);
    }

    return items;
  }

  async getCloudItems(): Promise<CloudItem[]> {
    const items: CloudItem[] = [];

    try {
      // Get presets from Cosmic
      const { objects: presets } = await cosmic.objects
        .find({ type: 'presets' })
        .props(['id', 'title', 'metadata', 'modified_at']);
      
      presets.forEach((preset: any) => {
        items.push({
          id: preset.id,
          name: preset.title,
          type: 'preset',
          size: this.calculateSize(preset),
          lastModified: new Date(preset.modified_at),
          data: preset
        });
      });

      // Get recordings from Cosmic
      const { objects: recordings } = await cosmic.objects
        .find({ type: 'recordings' })
        .props(['id', 'title', 'metadata', 'modified_at']);
      
      recordings.forEach((recording: any) => {
        items.push({
          id: recording.id,
          name: recording.title,
          type: 'recording',
          size: this.calculateSize(recording),
          lastModified: new Date(recording.modified_at),
          data: recording
        });
      });

      // Get patterns from Cosmic
      const { objects: patterns } = await cosmic.objects
        .find({ type: 'drum-patterns' })
        .props(['id', 'title', 'metadata', 'modified_at']);
      
      patterns.forEach((pattern: any) => {
        items.push({
          id: pattern.id,
          name: pattern.title,
          type: 'pattern',
          size: this.calculateSize(pattern),
          lastModified: new Date(pattern.modified_at),
          data: pattern
        });
      });

    } catch (error) {
      // Handle 404 errors gracefully (no objects found)
      if (error && typeof error === 'object' && 'status' in error && (error as any).status === 404) {
        return items;
      }
      console.error('Failed to get cloud items:', error);
      throw error;
    }

    return items;
  }

  async syncItem(item: CloudItem, onProgress?: (progress: number) => void): Promise<void> {
    try {
      if (onProgress) onProgress(0);

      switch (item.type) {
        case 'preset':
          await this.syncPreset(item, onProgress);
          break;
        case 'recording':
          await this.syncRecording(item, onProgress);
          break;
        case 'pattern':
          await this.syncPattern(item, onProgress);
          break;
        case 'project':
          await this.syncProject(item, onProgress);
          break;
      }

      if (onProgress) onProgress(100);
    } catch (error) {
      console.error('Failed to sync item:', error);
      throw error;
    }
  }

  private async syncPreset(item: CloudItem, onProgress?: (progress: number) => void): Promise<void> {
    try {
      if (onProgress) onProgress(25);

      // Check if preset exists in cloud
      const { objects } = await cosmic.objects
        .find({ type: 'presets', 'metadata.preset_id': item.id })
        .limit(1);

      if (onProgress) onProgress(50);

      if (objects.length > 0) {
        // Update existing preset
        await cosmic.objects.updateOne(objects[0].id, {
          title: item.name,
          metadata: {
            ...item.data,
            preset_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      } else {
        // Create new preset
        await cosmic.objects.insertOne({
          title: item.name,
          type: 'presets',
          metadata: {
            ...item.data,
            preset_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      }

      if (onProgress) onProgress(100);
    } catch (error) {
      console.error('Failed to sync preset:', error);
      throw error;
    }
  }

  private async syncRecording(item: CloudItem, onProgress?: (progress: number) => void): Promise<void> {
    try {
      if (onProgress) onProgress(25);

      // Check if recording exists in cloud
      const { objects } = await cosmic.objects
        .find({ type: 'recordings', 'metadata.recording_id': item.id })
        .limit(1);

      if (onProgress) onProgress(50);

      if (objects.length > 0) {
        // Update existing recording
        await cosmic.objects.updateOne(objects[0].id, {
          title: item.name,
          metadata: {
            ...item.data,
            recording_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      } else {
        // Create new recording
        await cosmic.objects.insertOne({
          title: item.name,
          type: 'recordings',
          metadata: {
            ...item.data,
            recording_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      }

      if (onProgress) onProgress(100);
    } catch (error) {
      console.error('Failed to sync recording:', error);
      throw error;
    }
  }

  private async syncPattern(item: CloudItem, onProgress?: (progress: number) => void): Promise<void> {
    try {
      if (onProgress) onProgress(25);

      // Check if pattern exists in cloud
      const { objects } = await cosmic.objects
        .find({ type: 'drum-patterns', 'metadata.pattern_id': item.id })
        .limit(1);

      if (onProgress) onProgress(50);

      if (objects.length > 0) {
        // Update existing pattern
        await cosmic.objects.updateOne(objects[0].id, {
          title: item.name,
          metadata: {
            ...item.data,
            pattern_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      } else {
        // Create new pattern
        await cosmic.objects.insertOne({
          title: item.name,
          type: 'drum-patterns',
          metadata: {
            ...item.data,
            pattern_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      }

      if (onProgress) onProgress(100);
    } catch (error) {
      console.error('Failed to sync pattern:', error);
      throw error;
    }
  }

  private async syncProject(item: CloudItem, onProgress?: (progress: number) => void): Promise<void> {
    // For now, projects are stored as JSON in metadata
    // In a real implementation, you might want to create a separate object type for projects
    try {
      if (onProgress) onProgress(25);

      // Check if project exists in cloud (using presets type for now)
      const { objects } = await cosmic.objects
        .find({ type: 'presets', 'metadata.project_id': item.id })
        .limit(1);

      if (onProgress) onProgress(50);

      if (objects.length > 0) {
        // Update existing project
        await cosmic.objects.updateOne(objects[0].id, {
          title: item.name,
          metadata: {
            ...item.data,
            project_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      } else {
        // Create new project
        await cosmic.objects.insertOne({
          title: item.name,
          type: 'presets', // Using presets type for projects
          metadata: {
            ...item.data,
            project_id: item.id,
            last_synced: new Date().toISOString()
          }
        });
      }

      if (onProgress) onProgress(100);
    } catch (error) {
      console.error('Failed to sync project:', error);
      throw error;
    }
  }

  async uploadFile(file: File, type: string): Promise<string> {
    try {
      // For large files, we would typically use Cosmic's media upload
      // For this implementation, we'll convert to base64 and store in metadata
      const base64 = await this.fileToBase64(file);
      
      const { object } = await cosmic.objects.insertOne({
        title: file.name,
        type: 'recordings', // Default to recordings for uploaded files
        metadata: {
          title: file.name,
          file_data: base64,
          file_type: file.type,
          file_size: file.size,
          upload_type: type,
          uploaded_at: new Date().toISOString()
        }
      });

      return object.id;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  async downloadFile(itemId: string): Promise<Blob> {
    try {
      const { object } = await cosmic.objects
        .findOne({ type: 'recordings', id: itemId })
        .props(['id', 'title', 'metadata']);

      if (!object.metadata.file_data) {
        throw new Error('No file data found');
      }

      return this.base64ToBlob(object.metadata.file_data, object.metadata.file_type);
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  private calculateSize(data: any): string {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]); // Remove data:type;base64, prefix
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
    });
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

export const cloudStorage = new CloudStorageService();