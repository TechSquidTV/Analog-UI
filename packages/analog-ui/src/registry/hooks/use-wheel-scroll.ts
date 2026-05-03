import { useEffect, type RefObject } from 'react';

export function useWheelScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: (e: WheelEvent, deltaDirection: 1 | -1) => void,
  options: AddEventListenerOptions = { passive: false }
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const deltaDirection = e.deltaY > 0 ? 1 : -1;
      callback(e, deltaDirection);
    };

    el.addEventListener('wheel', handleWheel, options);
    return () => el.removeEventListener('wheel', handleWheel);
  }, [ref, callback, options]);
}
