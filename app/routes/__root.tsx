import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ImageContextProvider } from '../context/ImageContext'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ImageContextProvider>
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
        <Toaster />
        <TanStackRouterDevtools />
      </ImageContextProvider>
    </ThemeProvider>
  ),
})
