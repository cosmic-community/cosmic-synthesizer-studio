'use client';

import { useState } from 'react';
import { Cloud, Upload, Download, Sync, Check, X, AlertCircle, Wifi, Clock } from 'lucide-react';

interface SyncItem {
  id: string;
  name: string;
  type: 'preset' | 'recording' | 'pattern' | 'project';
  size: string;
  lastModified: Date;
  status: 'synced' | 'pending' | 'error' | 'uploading' | 'downloading';
  progress?: number;
}

export default function CloudSync() {
  const [isConnected, setIsConnected] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncItems, setSyncItems] = useState<SyncItem[]>([
    {
      id: '1',
      name: 'Epic House Track',
      type: 'project',
      size: '12.5 MB',
      lastModified: new Date('2024-01-15T14:30:00'),
      status: 'synced'
    },
    {
      id: '2',
      name: 'Warm Analog Bass',
      type: 'preset',
      size: '2.1 KB',
      lastModified: new Date('2024-01-14T09:15:00'),
      status: 'pending'
    },
    {
      id: '3',
      name: 'Drum Loop 001',
      type: 'recording',
      size: '4.2 MB',
      lastModified: new Date('2024-01-13T16:45:00'),
      status: 'uploading',
      progress: 65
    },
    {
      id: '4',
      name: 'Rock Pattern',
      type: 'pattern',
      size: '1.8 KB',
      lastModified: new Date('2024-01-12T11:20:00'),
      status: 'error'
    }
  ]);

  const [storageUsed] = useState(156.7); // MB
  const [storageLimit] = useState(1000); // MB

  const getStatusIcon = (status: SyncItem['status']) => {
    switch (status) {
      case 'synced':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'uploading':
      case 'downloading':
        return <Sync className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'error':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: SyncItem['status']) => {
    switch (status) {
      case 'synced':
        return 'Synced';
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading';
      case 'downloading':
        return 'Downloading';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: SyncItem['type']) => {
    switch (type) {
      case 'preset':
        return '🎵';
      case 'recording':
        return '🎤';
      case 'pattern':
        return '🥁';
      case 'project':
        return '📁';
      default:
        return '📄';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const syncAll = () => {
    setSyncItems(items =>
      items.map(item =>
        item.status === 'pending' || item.status === 'error'
          ? { ...item, status: 'uploading', progress: 0 }
          : item
      )
    );

    // Simulate upload progress
    const interval = setInterval(() => {
      setSyncItems(items => {
        const hasUploading = items.some(item => item.status === 'uploading');
        if (!hasUploading) {
          clearInterval(interval);
          return items;
        }

        return items.map(item => {
          if (item.status === 'uploading') {
            const newProgress = (item.progress || 0) + Math.random() * 15;
            if (newProgress >= 100) {
              return { ...item, status: 'synced', progress: undefined };
            }
            return { ...item, progress: newProgress };
          }
          return item;
        });
      });
    }, 500);
  };

  const retrySync = (itemId: string) => {
    setSyncItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, status: 'uploading', progress: 0 }
          : item
      )
    );
  };

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Cloud Sync
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-synth-control rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-synth-accent" />
              <span className="text-white font-medium">Cosmic CMS</span>
            </div>
            <button
              onClick={syncAll}
              disabled={!isConnected}
              className="synth-button flex items-center gap-2"
            >
              <Sync className="w-4 h-4" />
              Sync All
            </button>
          </div>
          
          <div className="text-sm text-gray-400">
            Last sync: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Storage Used</span>
          <span className="text-sm text-white">
            {storageUsed.toFixed(1)} MB / {storageLimit} MB
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-synth-accent h-2 rounded-full transition-all"
            style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Sync Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {syncItems.map((item) => (
            <div
              key={item.id}
              className="bg-synth-control rounded-lg p-3 border border-gray-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.size} • {formatDate(item.lastModified)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm text-gray-400">
                    {getStatusText(item.status)}
                  </span>
                  
                  {item.status === 'error' && (
                    <button
                      onClick={() => retrySync(item.id)}
                      className="text-xs text-synth-accent hover:text-synth-accent/80"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {(item.status === 'uploading' || item.status === 'downloading') && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-blue-400 h-1 rounded-full transition-all"
                      style={{ width: `${item.progress || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.round(item.progress || 0)}% complete
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Auto-sync</span>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded"
            />
          </label>
          
          <div className="flex gap-2">
            <button className="synth-button flex items-center gap-2 flex-1">
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button className="synth-button flex items-center gap-2 flex-1">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Warning for offline mode */}
      {!isConnected && (
        <div className="p-4 bg-yellow-900/20 border-t border-yellow-600">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              You're offline. Changes will sync when connection is restored.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}