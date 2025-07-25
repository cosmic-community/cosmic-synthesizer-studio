'use client';

import { useState, useEffect } from 'react';
import { Cable, Settings, Power, Activity, Gamepad2 } from 'lucide-react';

interface MIDIDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  connected: boolean;
  channels: number[];
}

export default function MIDIController() {
  const [midiDevices, setMidiDevices] = useState<MIDIDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [midiSupported, setMidiSupported] = useState(false);
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Check MIDI support - fix for TS2774 error
    if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
      setMidiSupported(true);
      initializeMIDI();
    }

    return () => {
      if (midiAccess) {
        midiAccess.onstatechange = null;
      }
    };
  }, []);

  const initializeMIDI = async () => {
    try {
      const access = await navigator.requestMIDIAccess();
      setMidiAccess(access);
      
      // Listen for device changes
      access.onstatechange = handleMIDIStateChange;
      
      // Get initial devices
      updateDeviceList(access);
    } catch (error) {
      console.error('Failed to access MIDI devices:', error);
    }
  };

  const handleMIDIStateChange = (event: any) => {
    updateDeviceList(event.target);
  };

  const updateDeviceList = (access: any) => {
    const devices: MIDIDevice[] = [];
    
    // Input devices
    for (const input of access.inputs.values()) {
      devices.push({
        id: input.id,
        name: input.name || 'Unknown Input',
        type: 'input',
        connected: input.state === 'connected',
        channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      });
      
      // Set up message handling
      input.onmidimessage = handleMIDIMessage;
    }
    
    // Output devices
    for (const output of access.outputs.values()) {
      devices.push({
        id: output.id,
        name: output.name || 'Unknown Output',
        type: 'output',
        connected: output.state === 'connected',
        channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      });
    }
    
    setMidiDevices(devices);
  };

  const handleMIDIMessage = (message: any) => {
    const [status, note, velocity] = message.data;
    const command = status >> 4;
    const channel = status & 0xf;
    
    if (command === 9 && velocity > 0) {
      // Note on
      setActiveNotes(prev => new Set([...prev, note]));
    } else if (command === 8 || (command === 9 && velocity === 0)) {
      // Note off
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }
    
    console.log('MIDI Message:', {
      command: command === 9 ? 'Note On' : command === 8 ? 'Note Off' : 'Other',
      channel: channel + 1,
      note,
      velocity
    });
  };

  const connectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  const disconnectDevice = () => {
    setSelectedDevice(null);
  };

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const getNoteDisplay = (noteNumber: number) => {
    const octave = Math.floor(noteNumber / 12) - 1;
    const noteName = noteNames[noteNumber % 12];
    return `${noteName}${octave}`;
  };

  if (!midiSupported) {
    return (
      <div className="h-full flex flex-col bg-synth-panel">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            MIDI Controller
          </h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">MIDI Not Supported</p>
            <p className="text-sm">Your browser doesn't support Web MIDI API</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-synth-panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            MIDI Controller
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedDevice ? 'bg-green-400' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-400">
              {selectedDevice ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Device List */}
      <div className="p-4 border-b border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Available Devices</h4>
        
        {midiDevices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Cable className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No MIDI devices found</p>
            <p className="text-xs mt-1">Connect a MIDI device to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {midiDevices.map((device) => (
              <div
                key={device.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedDevice === device.id
                    ? 'bg-synth-accent/20 border-synth-accent'
                    : device.connected
                    ? 'bg-synth-control border-gray-600 hover:border-synth-accent/50'
                    : 'bg-gray-800 border-gray-700 opacity-50'
                }`}
                onClick={() => device.connected && connectDevice(device.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      device.connected ? 'bg-green-400' : 'bg-gray-500'
                    }`} />
                    <div>
                      <div className="text-white font-medium">{device.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{device.type}</div>
                    </div>
                  </div>
                  
                  {selectedDevice === device.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        disconnectDevice();
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MIDI Monitor */}
      <div className="flex-1 p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          MIDI Monitor
        </h4>
        
        {activeNotes.size > 0 ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-400 mb-2">Active Notes:</div>
            <div className="flex flex-wrap gap-2">
              {Array.from(activeNotes).map((note) => (
                <div
                  key={note}
                  className="bg-synth-accent text-white px-3 py-1 rounded-full text-sm font-mono"
                >
                  {getNoteDisplay(note)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <p>Play your MIDI device to see activity</p>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {midiDevices.filter(d => d.connected).length} device(s) connected
          </div>
          <button className="synth-button flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}