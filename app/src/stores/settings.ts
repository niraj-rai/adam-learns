import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
/** Which board's mapping is emphasised. IB always leads; CBSE can be shown or hidden. */
export type BoardView = 'ib' | 'ib+cbse'

type SettingsState = {
  theme: Theme
  sound: boolean
  boardView: BoardView
  setTheme: (t: Theme) => void
  toggleSound: () => void
  setBoardView: (b: BoardView) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      sound: true,
      boardView: 'ib+cbse',
      setTheme: (theme) => set({ theme }),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      setBoardView: (boardView) => set({ boardView }),
    }),
    { name: 'schooling-settings' },
  ),
)

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}
