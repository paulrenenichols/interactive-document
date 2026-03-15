'use client';

import { useLayoutEffect, useEffect } from 'react';
import { useThemeStore, getEffectiveTheme } from '@/lib/theme-store';

function applyTheme(mode: 'light' | 'dark' | 'system') {
  const effective = getEffectiveTheme(mode);
  const root = document.documentElement;
  root.classList.toggle('dark', effective === 'dark');
}

/** Applies theme store to document: adds/removes `dark` class on <html>. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  // Apply synchronously so the class is on <html> before paint
  useLayoutEffect(() => {
    applyTheme(mode);
  }, [mode]);

  // React to system preference when mode is 'system'
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applyTheme('system');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mode]);

  return <>{children}</>;
}
