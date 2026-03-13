'use client';

import { useThemeStore, type ThemeMode } from '@/lib/theme-store';

const MODES: { value: ThemeMode; label: string; aria: string }[] = [
  { value: 'light', label: 'Light', aria: 'Switch to light mode' },
  { value: 'dark', label: 'Dark', aria: 'Switch to dark mode' },
  { value: 'system', label: 'System', aria: 'Use system preference' },
];

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const currentIndex = MODES.findIndex((m) => m.value === mode);
  const next = MODES[(currentIndex + 1) % MODES.length];

  return (
    <button
      type="button"
      onClick={() => setMode(next.value)}
      title={next.aria}
      aria-label={next.aria}
      className="fixed top-3 right-3 z-50 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow hover:bg-[var(--accent-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
    >
      {next.label}
    </button>
  );
}
