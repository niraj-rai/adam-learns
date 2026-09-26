import { Link, Navigate, Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'
import { getSubject } from '@/content/loader'
import { getLab } from '@/labs/registry'
import { Toaster } from '@/components/gamification/Toaster'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { isOnboarded, useProfile } from '@/stores/profile'

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

function usePathSegments() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')
  return path.slice(base.length).split('/').filter(Boolean)
}

/** Pages a new learner can open before onboarding. */
const OPEN_PAGES = new Set(['welcome', 'terms', 'privacy'])

/** Which subject's accent colour to use, based on the current page. */
function useSubjectTheme() {
  const segs = usePathSegments()
  if (segs[0] === 'labs' && segs[1]) return getLab(segs[1])?.subject
  return segs[0] && getSubject(segs[0]) ? segs[0] : undefined
}

function RootLayout() {
  const subject = useSubjectTheme()
  const page = usePathSegments()[0] ?? ''
  const onboarded = useProfile(isOnboarded)
  if (!onboarded && !OPEN_PAGES.has(page)) return <Navigate to="/welcome" replace />
  return (
    <div className="min-h-svh" data-subject={subject}>
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24">
        <Outlet />
      </main>
      <footer className="border-t px-4 py-8 text-center text-xs text-muted-foreground">
        <p className="font-medium text-foreground/80">© {new Date().getFullYear()} AdamLearns · Free to learn, no sign-up · Your progress stays on this device</p>
        <nav className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label="Footer">
          <Link to="/terms" className="underline-offset-2 hover:underline">Terms of use</Link>
          <Link to="/privacy" className="underline-offset-2 hover:underline">Privacy policy</Link>
          <Link to="/curriculum" className="underline-offset-2 hover:underline">Curriculum map</Link>
        </nav>
        <p className="mx-auto mt-3 max-w-2xl">💡 Tip: use the same device and browser each time to keep your progress, streak and badges. Moving devices? Export and import it on the <Link to="/progress" className="underline underline-offset-2">Progress</Link> page.</p>
        <p className="mx-auto mt-2 max-w-2xl">A free, supplementary learning aid, not official course material. IB MYP first, mapped to CBSE/NCERT; not affiliated with IB, CBSE or NCERT. Content may contain mistakes: if in doubt, check your course book or ask your teacher.</p>
      </footer>
      <Toaster />
    </div>
  )
}
