'use client';

import { useEffect } from 'react';
import { useThemeStore, getEffectiveTheme } from '../lib/theme-store';

/** Applies theme store to document: adds/removes `dark` class on <html>. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const effective = getEffectiveTheme(mode);
    const root = document.documentElement;
    if (effective === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const effective = getEffectiveTheme('system');
      document.documentElement.classList.toggle('dark', effective === 'dark');
    };
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mode]);

  return <>{children}</>;
}
