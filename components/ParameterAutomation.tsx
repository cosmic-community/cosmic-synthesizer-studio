'use client';

import { useState } from 'react';
import { Edit, Plus, Trash2, Play, Square, TrendingUp } from 'lucide-react';

interface AutomationPoint {
  time: number;
  value: number;
}

interface AutomationLane {
  id: string;
  parameter: string;
  color: string;
  points: AutomationPoint[];
  enabled: boolean;
  min: number;
  max: number;
  unit: string;
}

export default function ParameterAutomation() {
  const [automationLanes, setAutomationLanes] = useState<AutomationLane[]>([
    {
      id: '1',
      parameter: 'Filter Cutoff',
      color: '#ff6b6b',
      points: [
        { time: 0, value: 1000 },
        { time: 2, value: 2000 },
        { time: 4, value: 500 },
        { time: 6, value: 1500 }
      ],
      enabled: true,
      min: 20,
      max: 5000,
      unit: 'Hz'
    },
    {
      id: '2',
      parameter: 'Volume',
      color: '#4ecdc4',
      points: [
        { time: 0, value: 0.8 },
        { time: 1, value: 0.4 },
        { time: 3, value: 1.0 },
        { time: 5, value: 0.6 }
      ],
      enabled: true,
      min: 0,
      max: 1,
      unit: ''
    },
    {
      id: '3',
      parameter: 'Reverb Amount',
      color: '#45b7d1',
      points: [
        { time: 0, value: 0.2 },
        { time: 4, value: 0.8 },
        { time: 8, value: 0.1 }
      ],
      enabled: false,
      min: 0,
      max: 1,
      unit: ''
    }
  ]);

  const [selectedLane, setSelectedLane] = useState<string | null>('1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAddParameter, setShowAddParameter] = useState(false);

  const timelineLength = 8; // seconds
  const timelineWidth = 600; // pixels

  const toggleLane = (laneId: string) => {
    setAutomationLanes(lanes =>
      lanes.map(lane =>
        lane.id === laneId ? { ...lane, enabled: !lane.enabled } : lane
      )
    );
  };

  const addAutomationPoint = (laneId: string, time: number, value: number) => {
    setAutomationLanes(lanes =>
      lanes.map(lane =>
        lane.id === laneId
          ? {
              ...lane,
              points: [...lane.points, { time, value }].sort((a, b) => a.time - b.time)
            }
          : lane
      )
    );
  };

  const removeAutomationPoint = (laneId: string, pointIndex: number) => {
    setAutomationLanes(lanes =>
      lanes.map(lane =>
        lane.id === laneId
          ? {
              ...lane,
              points: lane.points.filter((_, index) => index !== pointIndex)
            }
          : lane
      )
    );
  };

  const formatValue = (value: number, lane: AutomationLane) => {
    if (lane.unit === 'Hz') {
      return `${Math.round(value)}${lane.unit}`;
    } else if (lane.unit === '') {
      return (value * 100).toFixed(0) + '%';
    }
    return `${value.toFixed(2)}${lane.unit}`;
  };

  const drawAutomationCurve = (lane: AutomationLane) => {
    if (lane.points.length < 2) return null;

    const points = lane.points.map(point => ({
      x: (point.time / timelineLength) * 100,
      y: 100 - ((point.value - lane.min) / (lane.max - lane.min)) * 100
    }));

    const pathData = points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      } else {
        return `${path} L ${point.x} ${point.y}`;
      }
    }, '');

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={pathData}
          stroke={lane.color}
          strokeWidth="2"
          fill="none"
          opacity={lane.enabled ? 1 : 0.3}
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Parameter Automation
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="synth-button flex items-center gap-2"
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Stop' : 'Play'}
            </button>
            <button
              onClick={() => setShowAddParameter(true)}
              className="synth-button flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative h-8 bg-synth-control rounded">
          <div className="flex justify-between items-center h-full px-2 text-xs text-gray-400">
            {Array.from({ length: timelineLength + 1 }, (_, i) => (
              <span key={i}>{i}s</span>
            ))}
          </div>
          
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-synth-accent pointer-events-none"
            style={{ left: `${(currentTime / timelineLength) * 100}%` }}
          />
        </div>
      </div>

      {/* Automation Lanes */}
      <div className="flex-1 overflow-y-auto">
        {automationLanes.map((lane) => (
          <div
            key={lane.id}
            className={`border-b border-gray-700 ${
              selectedLane === lane.id ? 'bg-synth-accent/5' : ''
            }`}
          >
            {/* Lane Header */}
            <div className="flex items-center p-3 border-b border-gray-800">
              <button
                onClick={() => toggleLane(lane.id)}
                className={`w-4 h-4 rounded border-2 mr-3 ${
                  lane.enabled
                    ? 'bg-synth-accent border-synth-accent'
                    : 'border-gray-600'
                }`}
              />
              
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: lane.color }}
              />
              
              <div
                className="flex-1 cursor-pointer"
                onClick={() => setSelectedLane(lane.id)}
              >
                <div className="text-white font-medium">{lane.parameter}</div>
                <div className="text-xs text-gray-400">
                  {lane.points.length} points • {lane.min}-{lane.max}{lane.unit}
                </div>
              </div>

              <button
                onClick={() => setAutomationLanes(lanes => lanes.filter(l => l.id !== lane.id))}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Automation Curve */}
            <div className="relative h-24 bg-gray-900">
              {drawAutomationCurve(lane)}
              
              {/* Automation Points */}
              {lane.points.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-3 h-3 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(point.time / timelineLength) * 100}%`,
                    top: `${100 - ((point.value - lane.min) / (lane.max - lane.min)) * 100}%`,
                    backgroundColor: lane.color
                  }}
                  title={`${point.time}s: ${formatValue(point.value, lane)}`}
                  onClick={() => removeAutomationPoint(lane.id, index)}
                />
              ))}

              {/* Click area for adding points */}
              <div
                className="absolute inset-0 cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  const time = (x / rect.width) * timelineLength;
                  const valuePercent = 1 - (y / rect.height);
                  const value = lane.min + (valuePercent * (lane.max - lane.min));
                  
                  addAutomationPoint(lane.id, time, value);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Lane Details */}
      {selectedLane && (
        <div className="p-4 border-t border-gray-700">
          {(() => {
            const lane = automationLanes.find(l => l.id === selectedLane);
            if (!lane) return null;

            return (
              <div>
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {lane.parameter}
                </h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Points: {lane.points.length}</div>
                  <div>Range: {lane.min} - {lane.max}{lane.unit}</div>
                  <div>Status: {lane.enabled ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Parameter Dialog */}
      {showAddParameter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-synth-panel rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Add Parameter</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Parameter</label>
                <select className="w-full px-3 py-2 bg-synth-control border border-gray-600 rounded-lg text-white">
                  <option>Filter Resonance</option>
                  <option>Delay Time</option>
                  <option>Chorus Rate</option>
                  <option>Distortion Amount</option>
                  <option>Pan Position</option>
                </select>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddParameter(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddParameter(false)}
                  className="synth-button"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}