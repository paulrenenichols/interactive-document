import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from './providers';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CSSBaseline } from '@/lib/material-ui-shim';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

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
      <body className={`${plusJakarta.className} antialiased`}>
        {/* Set theme from localStorage before React hydrates to avoid flash and ensure class is applied */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme-preference');if(s){var p=JSON.parse(s);var m=p.state&&p.state.mode;var dark=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',!!dark);}})();`,
          }}
        />
        <Providers>
          <CSSBaseline />
          <ThemeToggle />
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
