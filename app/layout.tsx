import React from "react";
import { ThemeProvider } from "./components/theme-provider";
import { ImageProvider } from "./context/image-context"; // Add this import
import "./globals.css";

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
          <ImageProvider>{children}</ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
