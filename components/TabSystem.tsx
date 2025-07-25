'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface Tab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  closable?: boolean;
  dirty?: boolean;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabAdd?: () => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  showAddButton?: boolean;
  maxTabs?: number;
  scrollable?: boolean;
  className?: string;
}

export function useTabs(initialTabs: Tab[]) {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(
    initialTabs.length > 0 ? initialTabs[0].id : ''
  );

  const addTab = useCallback((tab: Tab) => {
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const removeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && filtered.length > 0) {
        setActiveTabId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeTabId]);

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [removed] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, removed);
      return newTabs;
    });
  }, []);

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

export default function TabSystem({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onTabAdd,
  onTabReorder,
  showAddButton = false,
  maxTabs = 10,
  scrollable = false,
  className
}: TabSystemProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Check scroll state
  const checkScrollState = useCallback(() => {
    const container = tabsContainerRef.current;
    if (!container || !scrollable) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  }, [scrollable]);

  useEffect(() => {
    checkScrollState();
    
    const container = tabsContainerRef.current;
    if (container && scrollable) {
      container.addEventListener('scroll', checkScrollState);
      window.addEventListener('resize', checkScrollState);
      
      return () => {
        container.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, [checkScrollState, scrollable]);

  // Scroll tabs
  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  // Handle tab close
  const handleTabClose = useCallback((tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onTabClose?.(tabId);
  }, [onTabClose]);

  // Handle tab drag and drop
  const handleDragStart = useCallback((event: React.DragEvent, tabId: string, index: number) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ tabId, index }));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent, targetIndex: number) => {
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'));
      const { index: fromIndex } = data;
      
      if (fromIndex !== targetIndex && onTabReorder) {
        onTabReorder(fromIndex, targetIndex);
      }
    } catch (error) {
      console.error('Error handling tab drop:', error);
    }
  }, [onTabReorder]);

  return (
    <div className={clsx('flex flex-col h-full bg-synth-panel rounded-lg overflow-hidden', className)}>
      {/* Tab Header */}
      <div className="flex items-center bg-synth-control border-b border-gray-600">
        {/* Scroll Left Button */}
        {scrollable && canScrollLeft && (
          <button
            onClick={() => scrollTabs('left')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Tabs Container */}
        <div
          ref={tabsContainerRef}
          className={clsx(
            'flex flex-1 min-w-0',
            scrollable ? 'overflow-x-auto scrollbar-hide' : 'overflow-hidden'
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={clsx(
                  'relative flex items-center gap-2 px-4 py-3 cursor-pointer transition-all duration-200',
                  'border-r border-gray-600 min-w-0 whitespace-nowrap',
                  'hover:bg-gray-600',
                  tab.id === activeTabId
                    ? 'bg-synth-panel text-synth-accent border-b-2 border-synth-accent'
                    : 'text-gray-300'
                )}
                onClick={() => onTabChange(tab.id)}
                draggable={onTabReorder !== undefined}
                onDragStart={(e) => handleDragStart(e, tab.id, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Tab Icon */}
                {tab.icon && (
                  <span className="flex-shrink-0">
                    {tab.icon}
                  </span>
                )}

                {/* Tab Title */}
                <span className="truncate">
                  {tab.title}
                  {tab.dirty && <span className="ml-1 text-synth-warning">•</span>}
                </span>

                {/* Close Button */}
                {tab.closable && onTabClose && (
                  <button
                    onClick={(e) => handleTabClose(tab.id, e)}
                    className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    aria-label={`Close ${tab.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Active Tab Indicator */}
                {tab.id === activeTabId && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-synth-accent" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Right Button */}
        {scrollable && canScrollRight && (
          <button
            onClick={() => scrollTabs('right')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Add Tab Button */}
        {showAddButton && onTabAdd && tabs.length < maxTabs && (
          <button
            onClick={onTabAdd}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors border-l border-gray-600"
            aria-label="Add new tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab ? (
          <div className="h-full overflow-y-auto">
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