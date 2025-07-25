'use client';

import { useState } from 'react';
import { Save, FolderOpen, Plus, Trash2, Download, Upload, Clock, Music } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  lastModified: Date;
  duration: number;
  tracks: number;
  bpm: number;
  key: string;
  size: string;
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Epic House Track',
      lastModified: new Date('2024-01-15T14:30:00'),
      duration: 245,
      tracks: 8,
      bpm: 128,
      key: 'Am',
      size: '12.5 MB'
    },
    {
      id: '2',
      name: 'Ambient Soundscape',
      lastModified: new Date('2024-01-14T09:15:00'),
      duration: 320,
      tracks: 5,
      bpm: 90,
      key: 'C',
      size: '18.2 MB'
    },
    {
      id: '3',
      name: 'Drum Pattern Test',
      lastModified: new Date('2024-01-13T16:45:00'),
      duration: 60,
      tracks: 3,
      bpm: 140,
      key: 'E',
      size: '4.1 MB'
    }
  ]);

  const [currentProject, setCurrentProject] = useState<Project | null>(projects[0]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const createNewProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      lastModified: new Date(),
      duration: 0,
      tracks: 0,
      bpm: 120,
      key: 'C',
      size: '0 MB'
    };

    setProjects([newProject, ...projects]);
    setCurrentProject(newProject);
    setNewProjectName('');
    setShowNewProjectDialog(false);
  };

  const deleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(projects.find(p => p.id !== projectId) || null);
      }
    }
  };

  const loadProject = (project: Project) => {
    setCurrentProject(project);
    console.log('Loading project:', project.name);
  };

  const saveCurrentProject = () => {
    if (currentProject) {
      console.log('Saving project:', currentProject.name);
      // Update last modified time
      setProjects(projects.map(p => 
        p.id === currentProject.id 
          ? { ...p, lastModified: new Date() }
          : p
      ));
    }
  };

  const exportProject = (project: Project) => {
    console.log('Exporting project:', project.name);
    // In a real implementation, this would create and download a project file
  };

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Project Manager
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewProjectDialog(true)}
              className="synth-button flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            <button
              onClick={saveCurrentProject}
              className="synth-button flex items-center gap-2"
              disabled={!currentProject}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Current Project Info */}
        {currentProject && (
          <div className="bg-synth-control rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">{currentProject.name}</h4>
                <div className="text-sm text-gray-400 flex items-center gap-3">
                  <span>{formatDuration(currentProject.duration)}</span>
                  <span>{currentProject.tracks} tracks</span>
                  <span>{currentProject.bpm} BPM</span>
                  <span>{currentProject.key}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportProject(currentProject)}
                  className="synth-button-small"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`rounded-lg border cursor-pointer transition-colors ${
                currentProject?.id === project.id
                  ? 'bg-synth-accent/20 border-synth-accent'
                  : 'bg-synth-control border-gray-600 hover:border-synth-accent/50'
              }`}
              onClick={() => loadProject(project)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-synth-accent" />
                    <h4 className="text-white font-medium">{project.name}</h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-3">
                    <span>{formatDuration(project.duration)}</span>
                    <span>{project.tracks} tracks</span>
                    <span>{project.bpm} BPM</span>
                    <span>{project.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(project.lastModified)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>{project.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-synth-panel rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">New Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full px-3 py-2 bg-synth-control border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-synth-accent focus:outline-none"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      createNewProject();
                    }
                  }}
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowNewProjectDialog(false);
                    setNewProjectName('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewProject}
                  disabled={!newProjectName.trim()}
                  className="synth-button"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{projects.length} projects</span>
          <button className="flex items-center gap-2 text-synth-accent hover:text-synth-accent/80">
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>
    </div>
  );
}