import React from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-provider";
import { ImageProvider } from "../context/image-context"; // Add this import
import { Toaster } from "sonner";
import "../globals.css";

export const Route = createRootRoute({
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ImageProvider>
            {" "}
            {/* Add this wrapper */}
            <div className="min-h-screen bg-background text-foreground">
              <main>
                <Outlet />
              </main>
            </div>
            <Toaster position="top-right" richColors closeButton expand />
          </ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  ),
});
