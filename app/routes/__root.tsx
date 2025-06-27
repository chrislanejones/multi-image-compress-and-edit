import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { ImageContextProvider } from '../context/ImageContext'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
      <ToastProvider>
        <ImageContextProvider>
          <div className="min-h-screen bg-background">
            <Outlet />
          </div>
          <TanStackRouterDevtools />
        </ImageContextProvider>
      </ToastProvider>
    </ThemeProvider>
  ),
})
