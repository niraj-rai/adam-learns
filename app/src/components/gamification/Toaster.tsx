import { cn } from '@/lib/utils'
import { useToasts } from '@/stores/toasts'

/** Toasts use a CSS entrance animation: this is on every page, so it avoids loading the motion library up front. */
export function Toaster() {
  const { toasts, dismiss } = useToasts()
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-72 flex-col gap-2 print:hidden" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto rounded-xl border px-4 py-3 text-left shadow-lg duration-300 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 motion-reduce:animate-none',
            t.kind === 'badge' ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950' : t.kind === 'reminder' ? 'border-2 border-brand bg-brand-soft' : 'bg-card',
          )}
        >
          <p className="font-heading font-semibold">{t.title}</p>
          {t.body && <p className="text-sm text-muted-foreground">{t.body}</p>}
        </button>
      ))}
    </div>
  )
}
