import { Suspense } from 'react';
import SynthesizerStudio from '@/components/SynthesizerStudio';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-synth-bg">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-synth-accent mb-4 text-shadow">
            🎵 Cosmic Synthesizer Studio
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional web-based music production platform with synthesizer, effects, 
            drum sequencing, recording, and social sharing capabilities.
          </p>
        </header>

        <Suspense fallback={<LoadingSpinner />}>
          <SynthesizerStudio />
        </Suspense>
      </div>
    </div>
  );
}