import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/gamification/Toaster'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-6xl">🔭</p>
      <h1 className="mt-4 font-heading text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">This experiment went missing. Let’s head back to the lab.</p>
      <Button asChild className="mt-6">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  ),
})

function RootLayout() {
  return (
    <div className="min-h-svh">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        AdamLearns · IB MYP first, mapped to CBSE/NCERT · Progress is saved on this device
      </footer>
      <Toaster />
    </div>
  )
}
