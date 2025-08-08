import { useState, useEffect, useCallback } from 'react';
import { cloudStorage } from '@/lib/cloudStorage';

export interface SyncItem {
  id: string;
  name: string;
  type: 'preset' | 'recording' | 'pattern' | 'project';
  size: string;
  lastModified: Date;
  status: 'synced' | 'pending' | 'error' | 'uploading' | 'downloading';
  progress?: number;
  localData?: any;
  cloudData?: any;
}

export interface CloudSyncHook {
  syncItems: SyncItem[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  storageUsed: number;
  storageLimit: number;
  autoSync: boolean;
  refreshSyncStatus: () => Promise<void>;
  syncAll: () => Promise<void>;
  syncItem: (itemId: string) => Promise<void>;
  retrySync: (itemId: string) => Promise<void>;
  setAutoSync: (enabled: boolean) => void;
  uploadFile: (file: File, type: string) => Promise<void>;
  downloadFile: (itemId: string) => Promise<Blob>;
}

export function useCloudSync(): CloudSyncHook {
  const [syncItems, setSyncItems] = useState<SyncItem[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(1000); // MB
  const [autoSync, setAutoSyncState] = useState(() => {
    const saved = localStorage.getItem('cloud-auto-sync');
    return saved ? JSON.parse(saved) : true;
  });

  const setAutoSync = useCallback((enabled: boolean) => {
    setAutoSyncState(enabled);
    localStorage.setItem('cloud-auto-sync', JSON.stringify(enabled));
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      await cloudStorage.healthCheck();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError('Connection failed');
    }
  }, []);

  const refreshSyncStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get local items
      const localItems = await cloudStorage.getLocalItems();
      
      // Get cloud items
      const cloudItems = await cloudStorage.getCloudItems();
      
      // Compare and create sync items
      const allItems = new Map<string, SyncItem>();
      
      // Add local items
      localItems.forEach(item => {
        allItems.set(item.id, {
          ...item,
          status: 'pending'
        });
      });
      
      // Update with cloud status
      cloudItems.forEach(cloudItem => {
        const localItem = allItems.get(cloudItem.id);
        if (localItem) {
          // Compare timestamps to determine sync status
          const localTime = localItem.lastModified.getTime();
          const cloudTime = cloudItem.lastModified.getTime();
          
          if (localTime === cloudTime) {
            allItems.set(cloudItem.id, { ...localItem, status: 'synced' });
          } else if (localTime > cloudTime) {
            allItems.set(cloudItem.id, { ...localItem, status: 'pending' });
          } else {
            allItems.set(cloudItem.id, { ...localItem, status: 'pending' });
          }
        } else {
          // Cloud-only item
          allItems.set(cloudItem.id, {
            ...cloudItem,
            status: 'pending'
          });
        }
      });
      
      setSyncItems(Array.from(allItems.values()));
      
      // Calculate storage used
      const totalSize = Array.from(allItems.values()).reduce((total, item) => {
        const sizeInMB = parseFloat(item.size.replace(' MB', '').replace(' KB', '')) / 1000;
        return total + sizeInMB;
      }, 0);
      setStorageUsed(totalSize);
      
    } catch (err) {
      console.error('Failed to refresh sync status:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh sync status');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncItem = useCallback(async (itemId: string) => {
    const item = syncItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      setSyncItems(prev => prev.map(i => 
        i.id === itemId 
          ? { ...i, status: 'uploading', progress: 0 }
          : i
      ));

      await cloudStorage.syncItem(item, (progress: number) => {
        setSyncItems(prev => prev.map(i => 
          i.id === itemId 
            ? { ...i, progress }
            : i
        ));
      });

      setSyncItems(prev => prev.map(i => 
        i.id === itemId 
          ? { ...i, status: 'synced', progress: undefined }
          : i
      ));

    } catch (err) {
      console.error('Failed to sync item:', err);
      setSyncItems(prev => prev.map(i => 
        i.id === itemId 
          ? { ...i, status: 'error', progress: undefined }
          : i
      ));
    }
  }, [syncItems]);

  const syncAll = useCallback(async () => {
    const pendingItems = syncItems.filter(item => item.status === 'pending' || item.status === 'error');
    
    for (const item of pendingItems) {
      await syncItem(item.id);
      // Add delay between syncs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [syncItems, syncItem]);

  const retrySync = useCallback(async (itemId: string) => {
    await syncItem(itemId);
  }, [syncItem]);

  const uploadFile = useCallback(async (file: File, type: string) => {
    try {
      setLoading(true);
      await cloudStorage.uploadFile(file, type);
      await refreshSyncStatus();
    } catch (err) {
      console.error('Failed to upload file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  }, [refreshSyncStatus]);

  const downloadFile = useCallback(async (itemId: string): Promise<Blob> => {
    try {
      return await cloudStorage.downloadFile(itemId);
    } catch (err) {
      console.error('Failed to download file:', err);
      throw err;
    }
  }, []);

  // Auto-sync effect
  useEffect(() => {
    if (autoSync && isConnected) {
      const interval = setInterval(async () => {
        const pendingItems = syncItems.filter(item => item.status === 'pending');
        if (pendingItems.length > 0) {
          await syncAll();
        }
      }, 30000); // Auto-sync every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoSync, isConnected, syncItems, syncAll]);

  // Connection check effect
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Initial sync status load
  useEffect(() => {
    refreshSyncStatus();
  }, [refreshSyncStatus]);

  return {
    syncItems,
    isConnected,
    loading,
    error,
    storageUsed,
    storageLimit,
    autoSync,
    refreshSyncStatus,
    syncAll,
    syncItem,
    retrySync,
    setAutoSync,
    uploadFile,
    downloadFile
  };
}