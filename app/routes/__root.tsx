import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-providerl";
import { ImageProvider } from "../context/image-context";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState, useContext, createContext } from "react";
import { ThemeProviderProps } from "../types/types";
import { useViewStore, useImageStore } from "../stores";

// ---- Theme Context ----

const ThemeContext = createContext<{
  theme: string;
  setTheme: (t: string) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const LocalThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ---- Themed Toaster ----

function ThemedToaster() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

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

// ---- Root Route ----

const RootComponent = () => {
  const { globalZoomIn, globalZoomOut } = useViewStore();
  const { getSelectedImage } = useImageStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle zoom shortcuts when there's a selected image
      const selectedImage = getSelectedImage();
      if (!selectedImage) return;

      if (event.altKey && (event.key === '-' || event.key === '_')) {
        event.preventDefault();
        globalZoomOut();
      } else if (event.altKey && (event.key === '=' || event.key === '+')) {
        event.preventDefault();
        globalZoomIn();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [globalZoomIn, globalZoomOut, getSelectedImage]);

  return (
    <LocalThemeProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
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
    </LocalThemeProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
