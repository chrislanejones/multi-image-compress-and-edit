import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import '../globals.css'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <nav className="p-4 border-b border-border">
          <div className="container mx-auto flex gap-4">
            <Link to="/" className="[&.active]:font-bold hover:text-primary">
              Home
            </Link>
            <Link to="/bulk-editor" className="[&.active]:font-bold hover:text-primary">
              Bulk Editor
            </Link>
          </div>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})
