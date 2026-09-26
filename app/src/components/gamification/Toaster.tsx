import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useToasts } from '@/stores/toasts'

export function Toaster() {
  const { toasts, dismiss } = useToasts()
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-72 flex-col gap-2 print:hidden" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            type="button"
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={cn(
              'pointer-events-auto rounded-xl border px-4 py-3 text-left shadow-lg',
              t.kind === 'badge' ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950' : t.kind === 'reminder' ? 'border-2 border-brand bg-brand-soft' : 'bg-card',
            )}
          >
            <p className="font-heading font-semibold">{t.title}</p>
            {t.body && <p className="text-sm text-muted-foreground">{t.body}</p>}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
