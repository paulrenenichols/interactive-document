import type { Metadata } from 'next';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
