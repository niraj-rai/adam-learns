import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageError } from '@/components/layout/PageError'
import { TooltipProvider } from '@/components/ui/tooltip'
import { registerServiceWorker } from '@/lib/pwa'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultErrorComponent: PageError,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={150}>
      <RouterProvider router={router} />
    </TooltipProvider>
  </StrictMode>,
)

// offline support + installable app (production builds only)
registerServiceWorker()

// A tab left open across a deploy may ask for a file that the new version replaced. Reload once into
// the new version instead of showing an error (progress is in localStorage, so nothing is lost).
window.addEventListener('vite:preloadError', (event) => {
  if (!navigator.onLine) return // offline: a reload can't help; the page shows an offline message
  try {
    const last = Number(sessionStorage.getItem('adamlearns-reloaded-at') ?? 0)
    if (Date.now() - last < 60_000) return // already tried: let the error show rather than loop
    sessionStorage.setItem('adamlearns-reloaded-at', String(Date.now()))
    event.preventDefault()
    window.location.reload()
  } catch {
    // sessionStorage unavailable: fall through to the normal error
  }
})
