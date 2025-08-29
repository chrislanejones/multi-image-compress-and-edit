import * as React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ThemeProviderProps as NextThemeProviderProps } from "next-themes";

/**
 * Custom props to wrap and pass through to next-themes ThemeProvider.
 */
interface CustomThemeProviderProps extends Partial<NextThemeProviderProps> {
  children: React.ReactNode;
}

/**
 * Wrapper around next-themes ThemeProvider to work outside of Next.js
 */
export function ThemeProvider({
  children,
  ...props
}: CustomThemeProviderProps) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}

/**
 * Direct re-export of useTheme from next-themes
 */
export { useTheme } from "next-themes";
