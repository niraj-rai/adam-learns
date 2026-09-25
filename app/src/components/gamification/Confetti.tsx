import { motion } from 'motion/react'
import { useMemo } from 'react'

const COLORS = ['#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#22c55e']

/** Lightweight CSS confetti burst; skipped when the user prefers reduced motion. */
export function Confetti({ count = 60 }: { count?: number }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        drift: Math.random() * 30 - 15,
      })),
    [count],
  )
  if (reduce) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block rounded-sm"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 0.6, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', x: `${p.drift}vw`, rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: 2.4 + Math.random(), delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
