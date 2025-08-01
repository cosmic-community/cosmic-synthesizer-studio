'use client';

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useResponsive } from '@/hooks/useResponsive';
import { Grid, List, Maximize2, Minimize2, Move, RotateCcw } from 'lucide-react';

interface GridItem {
  id: string;
  component: React.ReactNode;
  title: string;
  minWidth: number;
  minHeight: number;
  defaultWidth: number;
  defaultHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  resizable?: boolean;
  draggable?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
}

interface GridLayoutProps {
  items: Omit<GridItem, 'x' | 'y' | 'width' | 'height' | 'collapsed'>[];
  columns?: number;
  gap?: number;
  className?: string;
  onLayoutChange?: (layout: GridItem[]) => void;
  autoLayout?: boolean;
  responsive?: boolean;
}

export default function GridLayout({
  items,
  columns = 12,
  gap = 16,
  className,
  onLayoutChange,
  autoLayout = true,
  responsive = true
}: GridLayoutProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [layout, setLayout] = useState<GridItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isGridView, setIsGridView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive columns
  const getResponsiveColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return Math.min(2, columns);
    return columns;
  };

  // Initialize layout
  useEffect(() => {
    const responsiveColumns = responsive ? getResponsiveColumns() : columns;
    
    const initialLayout: GridItem[] = items.map((item, index) => {
      if (autoLayout) {
        // Auto-arrange items in grid
        const row = Math.floor(index / responsiveColumns);
        const col = index % responsiveColumns;
        const itemWidth = Math.max(item.minWidth, Math.floor(responsiveColumns / Math.min(items.length, responsiveColumns)));
        
        return {
          ...item,
          x: col * Math.floor(responsiveColumns / responsiveColumns),
          y: row,
          width: itemWidth,
          height: item.defaultHeight,
          collapsed: false
        };
      } else {
        // Use default positioning
        return {
          ...item,
          x: 0,
          y: index,
          width: item.defaultWidth,
          height: item.defaultHeight,
          collapsed: false
        };
      }
    });

    setLayout(initialLayout);
  }, [items, columns, autoLayout, responsive, isMobile, isTablet, isDesktop]);

  // Handle layout changes
  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  }, [layout, onLayoutChange]);

  // Toggle item collapse
  const toggleCollapse = (itemId: string) => {
    setLayout(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, collapsed: !item.collapsed }
        : item
    ));
  };

  // Reset layout to default
  const resetLayout = () => {
    const responsiveColumns = responsive ? getResponsiveColumns() : columns;
    
    const resetLayout: GridItem[] = items.map((item, index) => {
      const row = Math.floor(index / responsiveColumns);
      const col = index % responsiveColumns;
      const itemWidth = Math.max(item.minWidth, Math.floor(responsiveColumns / Math.min(items.length, responsiveColumns)));
      
      return {
        ...item,
        x: col * Math.floor(responsiveColumns / responsiveColumns),
        y: row,
        width: itemWidth,
        height: item.defaultHeight,
        collapsed: false
      };
    });

    setLayout(resetLayout);
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, itemId: string) => {
    const item = layout.find(l => l.id === itemId);
    if (!item?.draggable) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedItem(itemId);
  };

  // Handle drag
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggedItem || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;

    // Convert pixel coordinates to grid coordinates
    const cellWidth = (containerRect.width - gap * (columns - 1)) / columns;
    const cellHeight = 100; // Base cell height
    
    const gridX = Math.round(x / (cellWidth + gap));
    const gridY = Math.round(y / (cellHeight + gap));

    setLayout(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, x: Math.max(0, Math.min(gridX, columns - item.width)), y: Math.max(0, gridY) }
        : item
    ));
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Render grid item
  const renderGridItem = (item: GridItem) => {
    const isCollapsed = item.collapsed;
    const isDragging = draggedItem === item.id;

    return (
      <div
        key={item.id}
        className={clsx(
          'grid-item glass-panel rounded-xl overflow-hidden transition-all duration-200',
          isDragging && 'scale-105 shadow-2xl z-50',
          isCollapsed && 'h-auto'
        )}
        style={{
          gridColumn: `span ${item.width}`,
          gridRow: `span ${isCollapsed ? 1 : item.height}`,
          minHeight: isCollapsed ? '60px' : `${item.minHeight}px`
        }}
      >
        {/* Item Header */}
        <div className="grid-item-header p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.draggable && (
              <button
                onMouseDown={(e) => handleDragStart(e, item.id)}
                className="drag-handle p-1 rounded hover:bg-white/10 transition-colors cursor-move"
                title="Drag to move"
              >
                <Move className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          </div>
          
          <div className="flex items-center gap-1">
            {item.collapsible && (
              <button
                onClick={() => toggleCollapse(item.id)}
                className="collapse-btn p-1 rounded hover:bg-white/10 transition-colors"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Item Content */}
        {!isCollapsed && (
          <div className="grid-item-content p-4 h-full overflow-auto">
            {item.component}
          </div>
        )}
      </div>
    );
  };

  // Render list item (mobile view)
  const renderListItem = (item: GridItem) => {
    const isCollapsed = item.collapsed;

    return (
      <div
        key={item.id}
        className="list-item glass-panel rounded-xl overflow-hidden mb-4 transition-all duration-200"
      >
        {/* Item Header */}
        <div className="list-item-header p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          
          {item.collapsible && (
            <button
              onClick={() => toggleCollapse(item.id)}
              className="collapse-btn p-1 rounded hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Item Content */}
        {!isCollapsed && (
          <div className="list-item-content p-4">
            {item.component}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={clsx('grid-layout-container', className)}>
      {/* Layout Controls */}
      <div className="layout-controls mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGridView(true)}
            className={clsx(
              'layout-toggle p-2 rounded-lg transition-colors',
              isGridView 
                ? 'bg-synth-accent text-black' 
                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
            )}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsGridView(false)}
            className={clsx(
              'layout-toggle p-2 rounded-lg transition-colors',
              !isGridView 
                ? 'bg-synth-accent text-black' 
                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetLayout}
            className="reset-layout p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-colors"
            title="Reset layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="text-sm text-gray-400">
            {layout.length} items
          </div>
        </div>
      </div>

      {/* Layout Container */}
      <div
        ref={containerRef}
        className={clsx(
          'layout-container',
          isGridView ? 'grid-container' : 'list-container'
        )}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {isGridView ? (
          <div
            className="grid auto-rows-min"
            style={{
              gridTemplateColumns: `repeat(${getResponsiveColumns()}, 1fr)`,
              gap: `${gap}px`
            }}
          >
            {layout.map(renderGridItem)}
          </div>
        ) : (
          <div className="list">
            {layout.map(renderListItem)}
          </div>
        )}
      </div>

      {/* Empty State */}
      {layout.length === 0 && (
        <div className="empty-state text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No items to display</h3>
          <p className="text-gray-400">Add some components to see them arranged in the grid.</p>
        </div>
      )}
    </div>
  );
}