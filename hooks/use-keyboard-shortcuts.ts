'use client';

import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Command on Mac
  shift?: boolean;
  alt?: boolean;
};

export function useKeyboardShortcuts(
  shortcuts: {
    combo: KeyCombo;
    handler: (e: KeyboardEvent) => void;
  }[]
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(({ combo, handler }) => {
        const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase();
        const ctrlMatch = !!combo.ctrl === e.ctrlKey;
        const metaMatch = !!combo.meta === e.metaKey;
        const shiftMatch = !!combo.shift === e.shiftKey;
        const altMatch = !!combo.alt === e.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          // Only prevent default if it's not an input, or if it's a special command
          const target = e.target as HTMLElement;
          const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
          
          // Allow Esc to work in inputs (to blur)
          if (combo.key === 'Escape') {
             handler(e);
             return;
          }

          if (!isInput || (e.metaKey || e.ctrlKey)) {
             handler(e);
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
