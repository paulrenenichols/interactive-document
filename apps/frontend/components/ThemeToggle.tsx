'use client';

import { useThemeStore, type ThemeMode } from '@/lib/theme-store';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];
const LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const cycle = () => {
    const i = MODES.indexOf(mode);
    setMode(MODES[(i + 1) % MODES.length]);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${LABELS[mode]}. Click to cycle.`}
      aria-label={`Theme ${LABELS[mode]}. Click to cycle.`}
      className="fixed top-3 right-3 z-50 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow hover:bg-[var(--accent-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
    >
      {LABELS[mode]}
    </button>
  );
}
