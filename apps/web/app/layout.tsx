import type { Metadata, Viewport } from 'next';
import './globals.css';
import ValentineEffects from '@/components/ui/ValentineEffects';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ff6b9d',
};

export const metadata: Metadata = {
  title: '7 Days, One Choice | Valentine Week 2026',
  description: 'A time-locked Valentine Week experience. February 7-14, 2026.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Valentine Week',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #120525 35%, #2d0a1f 70%, #1a0a2e 100%)', minHeight: '100vh' }}>
        <ValentineEffects>
          {children}
        </ValentineEffects>
      </body>
    </html>
  );
}
