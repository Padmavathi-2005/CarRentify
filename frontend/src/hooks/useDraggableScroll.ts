import { useRef, useState, useCallback, useEffect } from 'react';

export const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
  }, []);

  const onMouseUp = useCallback(() => {
    if (!ref.current) return;
    setIsDragging(false);
    ref.current.style.cursor = 'grab';
    ref.current.style.removeProperty('user-select');
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    ref.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, scrollLeft, startX]);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.cursor = 'grab';
    }
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseUp,
    onMouseLeave: onMouseUp,
    onMouseMove,
  };
};
