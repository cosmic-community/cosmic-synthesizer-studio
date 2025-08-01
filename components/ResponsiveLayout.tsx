'use client';

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useResponsive } from '@/hooks/useResponsive';
import Navigation from './Navigation';
import StatusBar from './StatusBar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isPlaying?: boolean;
  isRecording?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  onRecord?: () => void;
  masterVolume?: number;
  onVolumeChange?: (volume: number) => void;
  showStatusBar?: boolean;
  className?: string;
}

export default function ResponsiveLayout({
  children,
  activeSection,
  onSectionChange,
  isPlaying = false,
  isRecording = false,
  onPlay,
  onStop,
  onRecord,
  masterVolume = 0.7,
  onVolumeChange,
  showStatusBar = true,
  className
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  // Calculate layout dimensions
  const sidebarWidth = sidebarCollapsed ? 64 : 256;
  const statusBarHeight = showStatusBar ? 64 : 0;

  return (
    <div className={clsx('responsive-layout h-screen flex flex-col overflow-hidden', className)}>
      {/* Navigation */}
      <Navigation
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        isPlaying={isPlaying}
        isRecording={isRecording}
        onPlay={onPlay}
        onStop={onStop}
        onRecord={onRecord}
        masterVolume={masterVolume}
        onVolumeChange={onVolumeChange}
      />

      {/* Main Content Area */}
      <div 
        className={clsx(
          'main-content flex-1 flex flex-col transition-all duration-300',
          'lg:ml-64', // Space for desktop sidebar
          sidebarCollapsed && 'lg:ml-16'
        )}
      >
        {/* Content */}
        <main 
          ref={contentRef}
          className={clsx(
            'content-area flex-1 overflow-auto',
            'px-4 py-6 lg:px-6 lg:py-8',
            showStatusBar && 'pb-20' // Space for status bar
          )}
          style={{
            paddingBottom: showStatusBar ? `${statusBarHeight + 24}px` : undefined
          }}
        >
          <div className={clsx(
            'content-container mx-auto',
            'w-full max-w-none', // Full width by default
            // Responsive max-widths based on content type
            activeSection === 'overview' && 'max-w-7xl',
            activeSection === 'settings' && 'max-w-4xl',
            // Studio sections use full width for maximum workspace
            ['synth', 'drums', 'effects', 'mixer', 'recording'].includes(activeSection) && 'max-w-none'
          )}>
            {children}
          </div>
        </main>

        {/* Status Bar */}
        {showStatusBar && (
          <StatusBar
            isConnected={true}
            cpuUsage={45}
            memoryUsage={32}
            audioLatency={12}
            sampleRate={44100}
            bufferSize={256}
            activeVoices={8}
            masterLevel={masterVolume}
            inputLevel={0.1}
            projectName="Untitled Project"
            isDirty={false}
            className="fixed bottom-0 left-0 right-0 lg:left-64"
            style={{
              left: isDesktop ? (sidebarCollapsed ? '64px' : '256px') : '0'
            }}
          />
        )}
      </div>

      {/* Responsive Indicators (Development/Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs text-white font-mono">
          <div>Breakpoint: {breakpoint}</div>
          <div>Screen: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</div>
          <div>Sidebar: {sidebarCollapsed ? 'Collapsed' : 'Expanded'}</div>
        </div>
      )}
    </div>
  );
}