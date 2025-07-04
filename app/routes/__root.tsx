import React from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-provider";
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
          <div className="min-h-screen bg-background text-foreground">
            <main>
              <Outlet />
            </main>
          </div>
          {/* Toast notifications */}
          <Toaster position="top-right" richColors closeButton expand />
        </ThemeProvider>
      </body>
    </html>
  ),
});
