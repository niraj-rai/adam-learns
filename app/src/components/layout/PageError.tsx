import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

/** Shown when a page fails to load: usually because it hasn't been saved for offline use yet. */
export function PageError({ error }: { error: unknown }) {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine
  const loadFailed = /dynamically imported module|Importing a module script failed|Failed to fetch|error loading/i.test(String((error as Error)?.message ?? error))
  return (
    <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <p className="text-5xl">{offline || loadFailed ? '📡' : '🧯'}</p>
      <h1 className="font-heading text-2xl font-bold">{offline || loadFailed ? 'This page isn’t saved on this device yet' : 'Something went wrong'}</h1>
      <p className="text-muted-foreground">
        {offline || loadFailed
          ? 'You seem to be offline. Pages you have opened before still work. Connect to the internet to open this one, or next time use “Save everything for offline” in ⚙️ Settings.'
          : 'Sorry! Reloading usually fixes it. Your progress is safe on this device.'}
      </p>
      <div className="flex justify-center gap-2">
        <Button onClick={() => window.location.reload()}>Try again</Button>
        <Button variant="outline" asChild><Link to="/">Home</Link></Button>
      </div>
    </div>
  )
}
