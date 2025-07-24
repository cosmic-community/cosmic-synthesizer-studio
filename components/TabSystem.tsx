'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Zap,
  Volume2,
  Layers,
  Mic,
  Play,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';

export interface Tab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  closable?: boolean;
  modified?: boolean;
  disabled?: boolean;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabAdd?: () => void;
  onTabReorder?: (tabs: Tab[]) => void;
  maxTabs?: number;
  showAddButton?: boolean;
  scrollable?: boolean;
  className?: string;
}

interface TabHeaderProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose?: () => void;
  onMiddleClick?: () => void;
  className?: string;
}

function TabHeader({ 
  tab, 
  isActive, 
  onClick, 
  onClose, 
  onMiddleClick,
  className 
}: TabHeaderProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 && onMiddleClick) { // Middle click
      e.preventDefault();
      onMiddleClick();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={clsx(
        'relative flex items-center gap-2 px-4 py-2 rounded-t-lg',
        'transition-all duration-200 cursor-pointer select-none',
        'border-b-2 min-w-0 max-w-48',
        isActive
          ? 'glass-panel border-synth-accent bg-synth-panel/80'
          : 'glass-light border-transparent hover:border-synth-accent/50 hover:bg-synth-control/50',
        tab.disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={!tab.disabled ? onClick : undefined}
      onMouseDown={handleMouseDown}
      role="tab"
      aria-selected={isActive}
      tabIndex={tab.disabled ? -1 : 0}
    >
      {/* Tab icon */}
      {tab.icon && (
        <span className={clsx(
          'w-4 h-4 flex-shrink-0',
          isActive ? 'text-synth-accent' : 'text-gray-400'
        )}>
          {tab.icon}
        </span>
      )}

      {/* Tab title */}
      <span className={clsx(
        'font-medium text-sm truncate flex-1',
        isActive ? 'text-white' : 'text-gray-300'
      )}>
        {tab.title}
        {tab.modified && (
          <span className="text-synth-accent ml-1">•</span>
        )}
      </span>

      {/* Close button */}
      {tab.closable !== false && onClose && (
        <button
          onClick={handleCloseClick}
          className={clsx(
            'w-4 h-4 flex-shrink-0 rounded hover:bg-synth-control/50',
            'transition-colors duration-150',
            isActive ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-300'
          )}
          title="Close tab"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-synth-accent rounded-full" />
      )}
    </div>
  );
}

export default function TabSystem({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onTabAdd,
  onTabReorder,
  maxTabs = 10,
  showAddButton = true,
  scrollable = true,
  className
}: TabSystemProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Update scroll indicators
  useEffect(() => {
    const updateScrollIndicators = () => {
      if (!tabsRef.current || !scrollable) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    updateScrollIndicators();
    
    if (tabsRef.current) {
      tabsRef.current.addEventListener('scroll', updateScrollIndicators);
      window.addEventListener('resize', updateScrollIndicators);
    }

    return () => {
      if (tabsRef.current) {
        tabsRef.current.removeEventListener('scroll', updateScrollIndicators);
      }
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [tabs, scrollable]);

  // Scroll to active tab when it changes
  useEffect(() => {
    if (!tabsRef.current || !scrollable) return;

    const activeTabElement = tabsRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (activeTabElement) {
      activeTabElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTabId, scrollable]);

  const scroll = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    
    const scrollAmount = 200;
    tabsRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleTabClose = (tabId: string) => {
    if (onTabClose) {
      onTabClose(tabId);
    }
  };

  const handleTabAdd = () => {
    if (onTabAdd && tabs.length < maxTabs) {
      onTabAdd();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);

    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTab(null);
    setDragOverTab(null);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTab(tabId);
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    
    const draggedTabId = e.dataTransfer.getData('text/plain');
    if (!draggedTabId || draggedTabId === targetTabId || !onTabReorder) return;

    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTabId);
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    
    onTabReorder(newTabs);
    setDragOverTab(null);
  };

  return (
    <div className={clsx(
      'flex flex-col bg-synth-bg',
      className
    )}>
      {/* Tab headers */}
      <div className="flex items-center bg-synth-panel/50 border-b border-white/10">
        {/* Left scroll button */}
        {scrollable && canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Tabs container */}
        <div 
          ref={tabsRef}
          className={clsx(
            'flex flex-1 overflow-x-auto scrollbar-none',
            scrollable ? 'scroll-smooth' : 'overflow-x-hidden'
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                data-tab-id={tab.id}
                draggable={onTabReorder ? true : false}
                onDragStart={(e) => handleDragStart(e, tab.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, tab.id)}
                onDrop={(e) => handleDrop(e, tab.id)}
                className={clsx(
                  'relative',
                  dragOverTab === tab.id && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-synth-accent',
                  draggedTab === tab.id && 'opacity-50'
                )}
              >
                <TabHeader
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onClick={() => onTabChange(tab.id)}
                  onClose={onTabClose ? () => handleTabClose(tab.id) : undefined}
                  onMiddleClick={onTabClose ? () => handleTabClose(tab.id) : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        {scrollable && canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Add tab button */}
        {showAddButton && onTabAdd && tabs.length < maxTabs && (
          <button
            onClick={handleTabAdd}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-synth-accent transition-colors"
            title="Add new tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 relative">
        {activeTab ? (
          <div 
            key={activeTab.id}
            className="absolute inset-0 animate-fade-in-scale"
          >
            {activeTab.content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No active tab</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined tab configurations for common studio sections
export const studioTabs = {
  synthesizer: {
    id: 'synthesizer',
    title: 'Synthesizer',
    icon: <Zap className="w-4 h-4" />,
    closable: false
  },
  mixer: {
    id: 'mixer',
    title: 'Mixer',
    icon: <Volume2 className="w-4 h-4" />,
    closable: false
  },
  sequencer: {
    id: 'sequencer',
    title: 'Sequencer',
    icon: <Clock className="w-4 h-4" />,
    closable: false
  },
  effects: {
    id: 'effects',
    title: 'Effects',
    icon: <Layers className="w-4 h-4" />,
    closable: false
  },
  recording: {
    id: 'recording',
    title: 'Recording',
    icon: <Mic className="w-4 h-4" />,
    closable: false
  },
  settings: {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    closable: true
  }
};

// Hook for managing tabs state
export function useTabs(initialTabs: Tab[] = []) {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(
    initialTabs.length > 0 ? initialTabs[0].id : ''
  );

  const addTab = (tab: Tab) => {
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const removeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, switch to another tab
      if (tabId === activeTabId && newTabs.length > 0) {
        const currentIndex = prev.findIndex(tab => tab.id === tabId);
        const nextIndex = Math.min(currentIndex, newTabs.length - 1);
        setActiveTabId(newTabs[nextIndex].id);
      }
      
      return newTabs;
    });
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  };

  const reorderTabs = (newTabs: Tab[]) => {
    setTabs(newTabs);
  };

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    removeTab,
    updateTab,
    reorderTabs
  };
}