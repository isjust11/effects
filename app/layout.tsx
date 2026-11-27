import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventLab Effects',
  description: 'Shared invite effects playground — petals, hearts, confetti, music, auto-scroll.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,560;0,700;1,560&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
