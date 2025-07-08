import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-provider";
import { ImageProvider } from "../context/image-context";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Toast wrapper component that responds to theme
function ThemedToaster() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        style: {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          color: isDark ? "#f3f4f6" : "#1f2937",
          border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
        },
        className: isDark ? "dark-toast" : "light-toast",
      }}
    />
  );
}

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
        <ThemedToaster />
        <TanStackRouterDevtools />
      </ImageProvider>
    </ThemeProvider>
  ),
});
