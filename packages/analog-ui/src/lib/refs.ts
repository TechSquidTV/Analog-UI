import * as React from 'react';

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as React.MutableRefObject<T | null>).current = value;
}

export function useMergedRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return React.useMemo(
    () => (value: T | null) => {
      for (const ref of refs) {
        setRef(ref, value);
      }
    },
    refs,
  );
}
