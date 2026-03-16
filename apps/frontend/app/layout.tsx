import type { Metadata } from 'next';
import { Providers } from './providers';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CSSBaseline, Container, Stack } from '@/lib/material-ui-shim';
import './globals.css';

export const metadata: Metadata = {
  title: 'Interactive Presentation',
  description: 'Create and view presentations with interactive charts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Set theme from localStorage before React hydrates to avoid flash and ensure class is applied */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme-preference');if(s){var p=JSON.parse(s);var m=p.state&&p.state.mode;var dark=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',!!dark);}})();`,
          }}
        />
        <Providers>
          <CSSBaseline />
          <div className="min-h-screen">
            <Container maxWidth="lg">
              <Stack
                spacing={2}
                sx={{
                  py: 2,
                }}
              >
                <ThemeToggle />
                {children}
              </Stack>
            </Container>
          </div>
        </Providers>
      </body>
    </html>
  );
}
