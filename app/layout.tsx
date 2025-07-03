import React from 'react';
import { ImageProvider } from './context/ImageContext';
import { ThemeProvider } from './components/theme-provider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ImageProvider>
            {children}
          </ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
