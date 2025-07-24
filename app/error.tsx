'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-synth-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-synth-warning mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Audio Engine Error
          </h1>
          <p className="text-gray-400">
            Something went wrong with the synthesizer engine. This might be due to 
            browser compatibility or audio permissions.
          </p>
        </div>

        <div className="bg-synth-panel p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-300 font-mono">
            {error.message || 'Unknown audio error occurred'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="synth-button flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <div className="text-sm text-gray-400">
            <p className="mb-2">Troubleshooting tips:</p>
            <ul className="text-left space-y-1">
              <li>• Make sure your browser supports Web Audio API</li>
              <li>• Check that audio permissions are enabled</li>
              <li>• Try refreshing the page</li>
              <li>• Use a modern browser (Chrome, Firefox, Safari)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}