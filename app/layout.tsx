import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ImageContextProvider } from './context/ImageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ImageHorse - Multi Image Editor',
  description: 'Upload, edit, and compress multiple images with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ImageContextProvider>{children}</ImageContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
