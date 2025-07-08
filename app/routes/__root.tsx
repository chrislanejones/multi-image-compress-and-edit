import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-provider";
import { ImageProvider } from "../context/image-context";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ImageProvider>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <main>
            <Outlet />
          </main>
        </div>
        <Toaster position="top-right" richColors closeButton expand />
        <TanStackRouterDevtools />
      </ImageProvider>
    </ThemeProvider>
  ),
});
