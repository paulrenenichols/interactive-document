import * as React from 'react';

/**
 * Optional global reset and M3 base styles from theme tokens.
 * Renders a style tag that sets box-sizing, body background/text from theme, and minimal resets.
 */
export const CSSBaseline: React.FC = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
    }
  `}</style>
);

CSSBaseline.displayName = 'CSSBaseline';
