import SynthesizerStudio from '@/components/SynthesizerStudio';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto">
        <header className="text-center py-8 px-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Cosmic Synthesizer Studio
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Professional web-based music production platform
          </p>
        </header>
        <SynthesizerStudio />
      </div>
    </div>
  );
}