import React from 'react';
import { ImageProvider } from './context/ImageContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ImageProvider>
          {children}
        </ImageProvider>
      </body>
    </html>
  );
}
