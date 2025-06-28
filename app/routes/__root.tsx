import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import '../globals.css'

export const Route = createRootRoute({
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="min-h-screen bg-background text-foreground">
          <nav className="p-4 border-b border-border">
            <div className="container mx-auto flex gap-4">
              <Link to="/" className="[&.active]:font-bold hover:text-primary">
                Home
              </Link>
              <Link to="/gallery" className="[&.active]:font-bold hover:text-primary">
                Gallery
              </Link>
            </div>
          </nav>
          <main>
            <Outlet />
          </main>
        </div>
        <TanStackRouterDevtools />
      </body>
    </html>
  ),
})
