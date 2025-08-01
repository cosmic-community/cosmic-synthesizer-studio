export interface LayoutBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  columns: number;
  margin: number;
  gutter: number;
}

export interface LayoutConfig {
  breakpoints: LayoutBreakpoint[];
  maxWidth: number;
  defaultColumns: number;
}

// Default responsive breakpoints configuration
export const defaultLayoutConfig: LayoutConfig = {
  breakpoints: [
    {
      name: 'xs',
      minWidth: 0,
      maxWidth: 639,
      columns: 1,
      margin: 16,
      gutter: 16
    },
    {
      name: 'sm',
      minWidth: 640,
      maxWidth: 767,
      columns: 2,
      margin: 20,
      gutter: 20
    },
    {
      name: 'md',
      minWidth: 768,
      maxWidth: 1023,
      columns: 3,
      margin: 24,
      gutter: 24
    },
    {
      name: 'lg',
      minWidth: 1024,
      maxWidth: 1279,
      columns: 4,
      margin: 32,
      gutter: 32
    },
    {
      name: 'xl',
      minWidth: 1280,
      maxWidth: 1535,
      columns: 6,
      margin: 40,
      gutter: 40
    },
    {
      name: '2xl',
      minWidth: 1536,
      columns: 8,
      margin: 48,
      gutter: 48
    }
  ],
  maxWidth: 1728,
  defaultColumns: 4
};

// Get current breakpoint based on screen width
export function getCurrentBreakpoint(width: number, config: LayoutConfig = defaultLayoutConfig): LayoutBreakpoint {
  return config.breakpoints.find(bp => 
    width >= bp.minWidth && (bp.maxWidth === undefined || width <= bp.maxWidth)
  ) || config.breakpoints[config.breakpoints.length - 1];
}

// Calculate grid dimensions
export function calculateGridDimensions(containerWidth: number, config: LayoutConfig = defaultLayoutConfig) {
  const breakpoint = getCurrentBreakpoint(containerWidth, config);
  const availableWidth = containerWidth - (breakpoint.margin * 2);
  const columnWidth = (availableWidth - (breakpoint.gutter * (breakpoint.columns - 1))) / breakpoint.columns;
  
  return {
    breakpoint,
    columns: breakpoint.columns,
    columnWidth,
    gutterWidth: breakpoint.gutter,
    marginWidth: breakpoint.margin,
    availableWidth
  };
}

// Layout item positioning utilities
export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  static?: boolean; // Can't be moved or resized
}

// Auto-arrange items in grid
export function autoArrangeItems(
  items: Omit<LayoutItem, 'x' | 'y'>[],
  columns: number,
  rowHeight: number = 100
): LayoutItem[] {
  const arrangedItems: LayoutItem[] = [];
  const grid: boolean[][] = [];

  // Initialize grid
  for (let row = 0; row < 100; row++) {
    grid[row] = new Array(columns).fill(false);
  }

  items.forEach((item) => {
    let placed = false;
    
    for (let y = 0; y < 100 && !placed; y++) {
      for (let x = 0; x <= columns - item.width && !placed; x++) {
        // Check if position is available
        let canPlace = true;
        for (let dy = 0; dy < item.height && canPlace; dy++) {
          for (let dx = 0; dx < item.width && canPlace; dx++) {
            if (grid[y + dy] && grid[y + dy][x + dx]) {
              canPlace = false;
            }
          }
        }
        
        if (canPlace) {
          // Mark grid cells as occupied
          for (let dy = 0; dy < item.height; dy++) {
            for (let dx = 0; dx < item.width; dx++) {
              if (!grid[y + dy]) grid[y + dy] = new Array(columns).fill(false);
              grid[y + dy][x + dx] = true;
            }
          }
          
          arrangedItems.push({
            ...item,
            x,
            y
          });
          placed = true;
        }
      }
    }
  });

  return arrangedItems;
}

// Check if item placement is valid
export function isValidPlacement(
  item: LayoutItem,
  allItems: LayoutItem[],
  columns: number,
  maxRows: number = 100
): boolean {
  // Check bounds
  if (item.x < 0 || item.y < 0) return false;
  if (item.x + item.width > columns) return false;
  if (item.y + item.height > maxRows) return false;

  // Check collisions with other items
  for (const otherItem of allItems) {
    if (otherItem.id === item.id) continue;
    
    if (
      item.x < otherItem.x + otherItem.width &&
      item.x + item.width > otherItem.x &&
      item.y < otherItem.y + otherItem.height &&
      item.y + item.height > otherItem.y
    ) {
      return false; // Collision detected
    }
  }

  return true;
}

// Find next available position for an item
export function findNextAvailablePosition(
  item: Omit<LayoutItem, 'x' | 'y'>,
  allItems: LayoutItem[],
  columns: number,
  preferredX?: number,
  preferredY?: number
): { x: number; y: number } | null {
  const startX = preferredX ?? 0;
  const startY = preferredY ?? 0;

  for (let y = startY; y < 100; y++) {
    for (let x = startX; x <= columns - item.width; x++) {
      const testItem: LayoutItem = { ...item, x, y, id: item.id };
      
      if (isValidPlacement(testItem, allItems, columns)) {
        return { x, y };
      }
    }
  }

  return null;
}

// Compact layout by moving items up
export function compactLayout(items: LayoutItem[], columns: number): LayoutItem[] {
  const sortedItems = [...items].sort((a, b) => a.y - b.y);
  const compactedItems: LayoutItem[] = [];

  for (const item of sortedItems) {
    let newY = 0;
    let placed = false;

    while (!placed && newY < 100) {
      const testItem: LayoutItem = { ...item, y: newY };
      
      if (isValidPlacement(testItem, compactedItems, columns)) {
        compactedItems.push(testItem);
        placed = true;
      } else {
        newY++;
      }
    }

    if (!placed) {
      // Fallback: place at original position
      compactedItems.push(item);
    }
  }

  return compactedItems;
}

// Responsive layout utilities
export function getResponsiveLayout(
  items: LayoutItem[],
  screenWidth: number,
  config: LayoutConfig = defaultLayoutConfig
): LayoutItem[] {
  const { columns } = calculateGridDimensions(screenWidth, config);
  
  // Scale items to fit new column count
  const scaledItems = items.map(item => ({
    ...item,
    width: Math.min(item.width, columns),
    x: Math.min(item.x, columns - 1)
  }));

  // Re-arrange if items don't fit
  return compactLayout(scaledItems, columns);
}

// Animation utilities for layout changes
export interface LayoutAnimation {
  duration: number;
  easing: string;
  stagger: number;
}

export const defaultLayoutAnimation: LayoutAnimation = {
  duration: 300,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  stagger: 50
};

// Calculate animation delays for staggered effects
export function calculateAnimationDelay(
  itemIndex: number,
  totalItems: number,
  animation: LayoutAnimation = defaultLayoutAnimation
): number {
  return itemIndex * animation.stagger;
}

// Generate CSS transforms for item positioning
export function generateItemTransform(
  item: LayoutItem,
  columnWidth: number,
  rowHeight: number,
  gutterWidth: number
): string {
  const x = item.x * (columnWidth + gutterWidth);
  const y = item.y * rowHeight;
  
  return `translate3d(${x}px, ${y}px, 0)`;
}

// Generate CSS dimensions for items
export function generateItemDimensions(
  item: LayoutItem,
  columnWidth: number,
  rowHeight: number,
  gutterWidth: number
): { width: string; height: string } {
  const width = item.width * columnWidth + (item.width - 1) * gutterWidth;
  const height = item.height * rowHeight;
  
  return {
    width: `${width}px`,
    height: `${height}px`
  };
}

// Layout persistence utilities
export function saveLayoutToStorage(layoutId: string, items: LayoutItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const layoutData = {
      id: layoutId,
      items,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`layout_${layoutId}`, JSON.stringify(layoutData));
  } catch (error) {
    console.warn('Failed to save layout to storage:', error);
  }
}

export function loadLayoutFromStorage(layoutId: string): LayoutItem[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(`layout_${layoutId}`);
    if (!stored) return null;
    
    const layoutData = JSON.parse(stored);
    return layoutData.items || null;
  } catch (error) {
    console.warn('Failed to load layout from storage:', error);
    return null;
  }
}

export function clearLayoutFromStorage(layoutId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`layout_${layoutId}`);
  } catch (error) {
    console.warn('Failed to clear layout from storage:', error);
  }
}

// Accessibility utilities
export function generateAriaLabels(item: LayoutItem, columns: number): {
  'aria-label': string;
  'aria-describedby': string;
} {
  return {
    'aria-label': `Layout item ${item.id} at column ${item.x + 1}, row ${item.y + 1}`,
    'aria-describedby': `item-${item.id}-description`
  };
}

export function announceLayoutChange(changes: string[]): void {
  if (typeof window === 'undefined') return;
  
  // Create or update screen reader announcement
  let announcer = document.getElementById('layout-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'layout-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  announcer.textContent = changes.join('. ');
}