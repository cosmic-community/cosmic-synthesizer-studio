'use client';

import { useState } from 'react';
import SynthesizerKeyboardStudio from '@/components/SynthesizerKeyboardStudio';
import AnimatedBackground from '@/components/AnimatedBackground';
import { backgroundPresets } from '@/components/AnimatedBackground';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground 
        {...backgroundPresets.studio}
        className="fixed inset-0 z-0"
      />
      
      {/* Main Application - Focused Synthesizer */}
      <div className="relative z-10">
        <SynthesizerKeyboardStudio />
      </div>
    </div>
  );
}