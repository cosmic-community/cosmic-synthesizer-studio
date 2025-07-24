import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-synth-bg flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-synth-accent mt-4 text-lg">
          Initializing Audio Engine...
        </p>
      </div>
    </div>
  );
}