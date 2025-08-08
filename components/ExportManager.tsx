'use client';

import { useState } from 'react';
import { 
  Download, 
  Upload, 
  FileAudio, 
  FileText, 
  Settings, 
  Folder,
  Music,
  Archive,
  Share2,
  Zap,
  Clock,
  HardDrive,
  Cloud,
  X,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: React.ReactNode;
  quality: 'lossless' | 'high' | 'medium' | 'low';
  size: 'large' | 'medium' | 'small';
}

interface ExportJob {
  id: string;
  name: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  endTime?: Date;
  fileSize?: string;
  error?: string;
}

interface ExportManagerProps {
  onClose?: () => void;
  currentProject?: any;
  recordings?: any[];
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'wav',
    name: 'WAV',
    extension: 'wav',
    description: 'Uncompressed audio, best quality',
    icon: <FileAudio className="w-4 h-4" />,
    quality: 'lossless',
    size: 'large'
  },
  {
    id: 'mp3-320',
    name: 'MP3 (320kbps)',
    extension: 'mp3',
    description: 'High quality compressed audio',
    icon: <Music className="w-4 h-4" />,
    quality: 'high',
    size: 'medium'
  },
  {
    id: 'mp3-192',
    name: 'MP3 (192kbps)',
    extension: 'mp3',
    description: 'Good quality, smaller file size',
    icon: <Music className="w-4 h-4" />,
    quality: 'medium',
    size: 'small'
  },
  {
    id: 'flac',
    name: 'FLAC',
    extension: 'flac',
    description: 'Lossless compression',
    icon: <Archive className="w-4 h-4" />,
    quality: 'lossless',
    size: 'medium'
  },
  {
    id: 'project',
    name: 'Project File',
    extension: 'json',
    description: 'Complete project data',
    icon: <Folder className="w-4 h-4" />,
    quality: 'lossless',
    size: 'small'
  }
];

export default function ExportManager({ onClose, currentProject, recordings }: ExportManagerProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    quality: 'high',
    sampleRate: 44100,
    bitDepth: 16,
    normalizeAudio: true,
    addMetadata: true,
    includeEffects: true
  });

  const startExport = async (items: any[], format: ExportFormat) => {
    const jobId = Date.now().toString();
    const job: ExportJob = {
      id: jobId,
      name: `Export to ${format.name}`,
      format,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };

    setExportJobs(prev => [job, ...prev]);

    // Simulate export process
    try {
      // Update status to processing
      setExportJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'processing' } : j
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportJobs(prev => prev.map(j => 
          j.id === jobId ? { ...j, progress } : j
        ));
      }

      // Complete the job
      setExportJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              status: 'completed', 
              progress: 100,
              endTime: new Date(),
              fileSize: '12.5 MB' 
            } 
          : j
      ));

      // In a real implementation, this would trigger the actual download
      await downloadExportedFile(job, items);

    } catch (error) {
      setExportJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Export failed'
            } 
          : j
      ));
    }
  };

  const downloadExportedFile = async (job: ExportJob, items: any[]) => {
    // In a real implementation, this would process the audio/project data
    // and create the appropriate file format
    
    if (job.format.id === 'project') {
      // Export project data as JSON
      const projectData = {
        name: currentProject?.name || 'Untitled Project',
        version: '1.0.0',
        created: new Date().toISOString(),
        items: items,
        settings: exportSettings
      };

      const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For audio formats, we would need actual audio processing
      // This is a placeholder that creates a dummy file
      const blob = new Blob(['Audio export placeholder'], { 
        type: `audio/${job.format.extension}` 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${job.format.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const exportCurrentProject = () => {
    if (currentProject) {
      startExport([currentProject], selectedFormat);
    }
  };

  const exportSelectedRecordings = () => {
    if (recordings && recordings.length > 0) {
      startExport(recordings, selectedFormat);
    }
  };

  const exportAll = () => {
    const allItems = [
      ...(currentProject ? [currentProject] : []),
      ...(recordings || [])
    ];
    startExport(allItems, selectedFormat);
  };

  const retryExport = (jobId: string) => {
    const job = exportJobs.find(j => j.id === jobId);
    if (job) {
      // Reset the job and retry
      setExportJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { ...j, status: 'pending', progress: 0, error: undefined }
          : j
      ));
      // Restart export (simplified)
      startExport([], job.format);
    }
  };

  const deleteJob = (jobId: string) => {
    setExportJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'In progress...';
    const duration = end.getTime() - start.getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getQualityColor = (quality: ExportFormat['quality']) => {
    switch (quality) {
      case 'lossless': return 'text-green-400';
      case 'high': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getSizeIcon = (size: ExportFormat['size']) => {
    switch (size) {
      case 'large': return <HardDrive className="w-3 h-3" />;
      case 'medium': return <Archive className="w-3 h-3" />;
      case 'small': return <Zap className="w-3 h-3" />;
      default: return <HardDrive className="w-3 h-3" />;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Manager
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Options */}
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Export Format</h3>
            <div className="space-y-2">
              {EXPORT_FORMATS.map((format) => (
                <div
                  key={format.id}
                  className={`glass-panel p-3 rounded-lg cursor-pointer transition-all ${
                    selectedFormat.id === format.id
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-slate-600 hover:border-cyan-400/50'
                  }`}
                  onClick={() => setSelectedFormat(format)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {format.icon}
                      <div>
                        <div className="font-medium text-white">{format.name}</div>
                        <div className="text-sm text-slate-400">{format.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={getQualityColor(format.quality)}>
                        {format.quality}
                      </span>
                      {getSizeIcon(format.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Export Options</h3>
            <div className="space-y-3">
              <button
                onClick={exportCurrentProject}
                disabled={!currentProject}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Folder className="w-4 h-4" />
                Export Current Project
              </button>
              
              <button
                onClick={exportSelectedRecordings}
                disabled={!recordings || recordings.length === 0}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Music className="w-4 h-4" />
                Export Recordings ({recordings?.length || 0})
              </button>
              
              <button
                onClick={exportAll}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Export Everything
              </button>
            </div>
          </div>

          {/* Settings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-secondary p-2"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            {showSettings && (
              <div className="glass-panel p-4 rounded-lg border border-slate-600 space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Sample Rate</label>
                  <select
                    value={exportSettings.sampleRate}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, sampleRate: parseInt(e.target.value) }))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value={44100}>44.1 kHz</option>
                    <option value={48000}>48 kHz</option>
                    <option value={96000}>96 kHz</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Bit Depth</label>
                  <select
                    value={exportSettings.bitDepth}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, bitDepth: parseInt(e.target.value) }))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value={16}>16-bit</option>
                    <option value={24}>24-bit</option>
                    <option value={32}>32-bit</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportSettings.normalizeAudio}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, normalizeAudio: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-300">Normalize Audio</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportSettings.addMetadata}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, addMetadata: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-300">Add Metadata</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportSettings.includeEffects}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, includeEffects: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-300">Include Effects</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Jobs */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Export Queue ({exportJobs.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {exportJobs.length === 0 ? (
              <div className="glass-panel p-6 rounded-lg text-center border border-slate-600">
                <Download className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">No exports yet</p>
              </div>
            ) : (
              exportJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-panel p-4 rounded-lg border border-slate-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {job.format.icon}
                      <span className="font-medium text-white">{job.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {job.status === 'completed' && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                      {job.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {(job.status === 'processing' || job.status === 'pending') && (
                    <div className="mb-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-cyan-400 h-2 rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {job.progress}% complete
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div>
                      {job.status === 'completed' && job.fileSize && (
                        <span>{job.fileSize}</span>
                      )}
                      {job.status === 'error' && job.error && (
                        <span className="text-red-400">{job.error}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span>{formatDuration(job.startTime, job.endTime)}</span>
                      
                      {job.status === 'error' && (
                        <button
                          onClick={() => retryExport(job.id)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-6 glass-panel p-4 rounded-lg border border-blue-600/30 bg-blue-600/5">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Export Tips:</p>
            <ul className="space-y-1 text-blue-200">
              <li>• WAV format provides the best quality but larger file sizes</li>
              <li>• MP3 320kbps is ideal for sharing while maintaining good quality</li>
              <li>• Project files can be imported back into the synthesizer</li>
              <li>• Enable normalization to ensure consistent volume levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}