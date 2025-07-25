'use client';

import { useState } from 'react';
import { Sliders, RotateCcw, Power } from 'lucide-react';

export default function MasterEQ() {
  const [enabled, setEnabled] = useState(true);
  const [bands, setBands] = useState({
    low: 0,      // -12 to +12 dB
    lowMid: 0,   // -12 to +12 dB  
    highMid: 0,  // -12 to +12 dB
    high: 0      // -12 to +12 dB
  });

  const updateBand = (band: keyof typeof bands, value: number) => {
    setBands(prev => ({ ...prev, [band]: value }));
  };

  const resetEQ = () => {
    setBands({ low: 0, lowMid: 0, highMid: 0, high: 0 });
  };

  const bandLabels = {
    low: 'Low\n80Hz',
    lowMid: 'Low Mid\n500Hz', 
    highMid: 'High Mid\n3kHz',
    high: 'High\n12kHz'
  };

  return (
    <div className="bg-synth-control rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-synth-accent" />
          <h3 className="text-lg font-semibold text-white">Master EQ</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetEQ}
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`${enabled ? 'text-synth-accent' : 'text-gray-500'}`}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        {Object.entries(bands).map(([band, value]) => (
          <div key={band} className="flex flex-col items-center">
            <div className="text-xs text-gray-400 text-center mb-2 leading-tight">
              {bandLabels[band as keyof typeof bandLabels].split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            
            <div className="h-32 flex flex-col-reverse items-center relative bg-gray-800 rounded px-2 py-1">
              {/* Scale markers */}
              <div className="absolute left-0 top-1 text-xs text-gray-500">+12</div>
              <div className="absolute left-0 top-1/2 text-xs text-gray-500 transform -translate-y-1/2">0</div>
              <div className="absolute left-0 bottom-1 text-xs text-gray-500">-12</div>
              
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={value}
                onChange={(e) => updateBand(band as keyof typeof bands, parseFloat(e.target.value))}
                disabled={!enabled}
                className="h-28 w-4 slider-vertical appearance-none bg-gray-600 rounded-lg cursor-pointer disabled:opacity-50"
                style={{
                  writingMode: 'bt-lr',
                  WebkitAppearance: 'slider-vertical'
                }}
              />
            </div>
            
            <div className="text-xs text-white mt-2 text-center min-h-[2rem] flex items-center">
              {value > 0 ? '+' : ''}{value.toFixed(1)}dB
            </div>
          </div>
        ))}
      </div>

      {/* Frequency Response Visualization */}
      <div className="mt-4 h-16 bg-gray-800 rounded relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="10" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="200" height="60" fill="url(#grid)" />
          
          {/* Frequency response curve (simplified) */}
          <path
            d={`M 0 30 Q 50 ${30 - bands.low * 2} 100 ${30 - bands.lowMid * 2} Q 150 ${30 - bands.highMid * 2} 200 ${30 - bands.high * 2}`}
            stroke="#63b3ed"
            strokeWidth="2"
            fill="none"
            opacity={enabled ? 1 : 0.3}
          />
        </svg>
      </div>
    </div>
  );
}