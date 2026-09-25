import { Link } from '@tanstack/react-router'
import { Menu, Monitor, Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getSubjects } from '@/content/loader'
import { Logo } from './Logo'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { levelFor } from '@/lib/levels'
import { cn } from '@/lib/utils'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'
import { applyTheme, useSettings, type Theme } from '@/stores/settings'

const NAV = [
  { to: '/', label: 'Home' },
  ...getSubjects().map((s) => ({ to: '/$subject' as const, params: { subject: s.id }, label: s.title })),
  { to: '/labs', label: 'Labs' },
  { to: '/review', label: 'Review' },
  { to: '/progress', label: 'Progress' },
  { to: '/curriculum', label: 'Curriculum' },
]

export function TopBar() {
  const xp = useProgress((s) => s.xp)
  const activeDays = useProgress((s) => s.activeDays)
  const review = useProgress((s) => s.review)
  const { theme, setTheme, sound, toggleSound, boardView, setBoardView } = useSettings()
  const [open, setOpen] = useState(false)
  const level = levelFor(xp)
  const streak = currentStreak(activeDays)
  const due = dueReviewItems(review).length

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const nextTheme: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  const links = (onClick?: () => void) =>
    NAV.map((n) => (
      <Link
        key={n.label}
        to={n.to}
        params={'params' in n ? n.params : undefined}
        onClick={onClick}
        activeOptions={{ exact: n.to === '/' }}
        className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground data-[status=active]:bg-chem-soft data-[status=active]:text-foreground"
      >
        {n.label}
        {n.label === 'Review' && due > 0 && <span className="ml-1 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">{due}</span>}
      </Link>
    ))

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <Logo className="size-9 shrink-0 drop-shadow-sm" />
          <span className="hidden sm:inline">AdamLearns</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">{links()}</nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link to="/progress" className="flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm" title={`${xp} XP`}>
            <span aria-hidden>{level.current.emoji}</span>
            <span className="hidden font-semibold md:inline">{level.current.name}</span>
            <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-chem" style={{ width: `${level.progress * 100}%` }} />
            </span>
            <span className="tabular-nums text-muted-foreground">{xp} XP</span>
          </Link>
          <span className={cn('rounded-full border px-2.5 py-1 text-sm tabular-nums', streak > 0 ? 'text-orange-600' : 'text-muted-foreground')} title={`${streak}-day streak`}>
            🔥 {streak}
          </span>
          <Button variant="ghost" size="icon" onClick={toggleSound} aria-label={sound ? 'Mute sounds' : 'Turn sounds on'}>
            {sound ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(nextTheme[theme])} aria-label={`Theme: ${theme}. Click to change.`}>
            <ThemeIcon />
          </Button>
          <button
            type="button"
            onClick={() => setBoardView(boardView === 'ib' ? 'ib+cbse' : 'ib')}
            className="hidden rounded-full border px-2.5 py-1 text-xs font-semibold sm:block"
            title="Show or hide CBSE mapping"
          >
            <span className="text-ib">IB</span>
            {boardView === 'ib+cbse' ? <span className="text-cbse"> + CBSE</span> : <span className="text-muted-foreground line-through"> CBSE</span>}
          </button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>AdamLearns</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">{links(() => setOpen(false))}</nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
