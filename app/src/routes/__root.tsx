import { Link, Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'
import { getSubject } from '@/content/loader'
import { getLab } from '@/labs/registry'
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

/** Which subject's accent colour to use, based on the current page. */
function useSubjectTheme() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')
  const segs = path.slice(base.length).split('/').filter(Boolean)
  if (segs[0] === 'labs' && segs[1]) return getLab(segs[1])?.subject
  return segs[0] && getSubject(segs[0]) ? segs[0] : undefined
}

function RootLayout() {
  const subject = useSubjectTheme()
  return (
    <div className="min-h-svh" data-subject={subject}>
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
