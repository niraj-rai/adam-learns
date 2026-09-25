import { useEffect, useRef } from 'react'

/** Size a canvas for crisp drawing on high-DPI screens; returns a 2D context in logical pixels. */
export function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/** Calls `tick(dt, time)` every animation frame while `running` is true. dt is in seconds and capped. */
export function useAnimationFrame(tick: (dt: number, time: number) => void, running = true) {
  const tickRef = useRef(tick)
  tickRef.current = tick

  useEffect(() => {
    if (!running) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      tickRef.current(dt, now / 1000)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [running])
}

export const randn = () => {
  // Box–Muller
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Read a CSS custom property (theme colour) so canvas drawings follow light/dark mode. */
export function cssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}
