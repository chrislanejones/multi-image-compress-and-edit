import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ImageProvider } from '../context/ImageContext'
import '../globals.css'

export const Route = createRootRoute({
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ImageProvider>
          <div className="min-h-screen bg-background text-foreground">
            <main>
              <Outlet />
            </main>
          </div>
          <TanStackRouterDevtools />
        </ImageProvider>
      </body>
    </html>
  ),
})
