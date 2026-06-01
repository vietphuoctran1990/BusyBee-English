
import React, { useEffect, useRef, useState } from 'react';

interface VirtualGridProps<T> {
  items: T[];
  rowHeight: number;
  /** Pixel buffer above and below the viewport for smoother scroll. */
  overscan?: number;
  /** Number of items per row at each breakpoint, smallest first. */
  columnsByWidth?: Array<{ minWidth: number; cols: number }>;
  className?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

const DEFAULT_BREAKPOINTS = [
  { minWidth: 0,    cols: 2 }, // mobile
  { minWidth: 640,  cols: 2 }, // sm
  { minWidth: 768,  cols: 3 }, // md
  { minWidth: 1024, cols: 4 }, // lg
  { minWidth: 1280, cols: 5 }, // xl
  { minWidth: 1536, cols: 6 }, // 2xl
];

function getCols(breakpoints: Array<{ minWidth: number; cols: number }>): number {
  if (typeof window === 'undefined') return 2;
  const w = window.innerWidth;
  let cols = breakpoints[0].cols;
  for (const b of breakpoints) if (w >= b.minWidth) cols = b.cols;
  return cols;
}

export function VirtualGrid<T>({
  items,
  rowHeight,
  overscan = 400,
  columnsByWidth = DEFAULT_BREAKPOINTS,
  className,
  renderItem,
}: VirtualGridProps<T>) {
  const [cols, setCols] = useState(() => getCols(columnsByWidth));
  const [range, setRange] = useState<{ start: number; end: number }>({ start: 0, end: 30 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setCols(getCols(columnsByWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [columnsByWidth]);

  useEffect(() => {
    const compute = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top;
      const viewportH = window.innerHeight;
      // First visible row index
      const firstRow = Math.max(0, Math.floor((-top - overscan) / rowHeight));
      const lastRow = Math.ceil(((-top + viewportH + overscan)) / rowHeight);
      const start = firstRow * cols;
      const end = Math.min(items.length, lastRow * cols);
      setRange(prev => prev.start === start && prev.end === end ? prev : { start, end });
    };
    // Throttle scroll/resize work to one computation per animation frame.
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => { rafId = null; compute(); });
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [cols, items.length, overscan, rowHeight]);

  const totalRows = Math.ceil(items.length / cols);
  const totalHeight = totalRows * rowHeight;
  const startRow = Math.floor(range.start / cols);
  const offsetY = startRow * rowHeight;

  const visible = items.slice(range.start, range.end);

  // Tailwind grid template column class fallback
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  };

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', height: totalHeight }}>
      <div
        className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8"
        style={{ ...gridStyle, position: 'absolute', top: offsetY, left: 0, right: 0 }}
      >
        {visible.map((item, i) => (
          <div key={range.start + i}>{renderItem(item, range.start + i)}</div>
        ))}
      </div>
    </div>
  );
}

export default VirtualGrid;
