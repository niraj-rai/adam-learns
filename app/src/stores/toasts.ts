import { create } from 'zustand'

export type Toast = { id: number; kind: 'xp' | 'badge' | 'info' | 'reminder'; title: string; body?: string }

type ToastState = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { ...t, id }].slice(-4) }))
    setTimeout(() => get().dismiss(id), t.kind === 'reminder' ? 60_000 : t.kind === 'badge' ? 5000 : 2500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
