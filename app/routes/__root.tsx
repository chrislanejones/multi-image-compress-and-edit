import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import '../globals.css'

export const Route = createRootRoute({
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="min-h-screen bg-background text-foreground">
          <main>
            <Outlet />
          </main>
        </div>
        <TanStackRouterDevtools />
      </body>
    </html>
  ),
})
