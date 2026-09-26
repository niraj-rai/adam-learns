import { Link } from '@tanstack/react-router'
import { ChevronDown, Menu, Monitor, Moon, Settings, Sun, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getSubjects } from '@/content/loader'
import { levelFor } from '@/lib/levels'
import { cn } from '@/lib/utils'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'
import { applyTheme, useSettings, type Theme } from '@/stores/settings'
import { Logo } from './Logo'

const LINK = 'rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground data-[status=active]:bg-chem-soft data-[status=active]:text-foreground'

/** A small click-to-open menu that closes on outside click or Escape. */
function Popover({ label, trigger, children, align = 'left' }: { label: string; trigger: ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="true" aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)} className={cn(LINK, 'inline-flex items-center gap-1', open && 'bg-muted text-foreground')}>
        {trigger}
      </button>
      {open && (
        <div className={cn('absolute top-full z-50 mt-2 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg', align === 'right' ? 'right-0' : 'left-0')}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

function SettingsPanel() {
  const { theme, setTheme, sound, toggleSound, boardView, setBoardView } = useSettings()
  const THEMES: { t: Theme; icon: ReactNode; label: string }[] = [
    { t: 'system', icon: <Monitor className="size-4" />, label: 'Auto' },
    { t: 'light', icon: <Sun className="size-4" />, label: 'Light' },
    { t: 'dark', icon: <Moon className="size-4" />, label: 'Dark' },
  ]
  return (
    <div className="space-y-3 p-1 text-sm">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Theme</p>
        <div className="grid grid-cols-3 gap-1">
          {THEMES.map((x) => (
            <button key={x.t} type="button" aria-pressed={theme === x.t} onClick={() => setTheme(x.t)} className={cn('flex flex-col items-center gap-0.5 rounded-lg border py-1.5 text-xs', theme === x.t ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
              {x.icon}{x.label}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={toggleSound} className="flex w-full items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted">
        <span className="flex items-center gap-2">{sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />} Sounds</span>
        <span className="text-xs font-semibold">{sound ? 'On' : 'Off'}</span>
      </button>
      <button type="button" onClick={() => setBoardView(boardView === 'ib' ? 'ib+cbse' : 'ib')} className="flex w-full items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted">
        <span><span className="font-semibold text-ib">IB</span> + <span className="font-semibold text-cbse">CBSE</span> mapping</span>
        <span className="text-xs font-semibold">{boardView === 'ib+cbse' ? 'Shown' : 'Hidden'}</span>
      </button>
    </div>
  )
}

export function TopBar() {
  const xp = useProgress((s) => s.xp)
  const activeDays = useProgress((s) => s.activeDays)
  const review = useProgress((s) => s.review)
  const theme = useSettings((s) => s.theme)
  const [open, setOpen] = useState(false)
  const level = levelFor(xp)
  const streak = currentStreak(activeDays)
  const due = dueReviewItems(review).length
  const subjects = getSubjects()

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const reviewBadge = due > 0 && <span className="ml-1 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">{due}</span>

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-heading text-lg font-bold" aria-label="AdamLearns home">
          <Logo className="size-9 shrink-0 drop-shadow-sm" />
          <span className="hidden sm:inline">AdamLearns</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Main">
          <Popover label="Subjects" trigger={<>Subjects <ChevronDown className="size-4" /></>}>
            {(close) => (
              <div className="flex flex-col">
                {subjects.map((s) => (
                  <Link key={s.id} to="/$subject" params={{ subject: s.id }} onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted data-[status=active]:bg-chem-soft">
                    <span className="text-lg" aria-hidden>{s.icon}</span>{s.title}
                  </Link>
                ))}
                <div className="my-1 border-t" />
                <Link to="/curriculum" onClick={close} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">🗺️ Curriculum map</Link>
              </div>
            )}
          </Popover>
          <Link to="/labs" className={LINK}>Labs</Link>
          <Link to="/review" className={LINK}>Review{reviewBadge}</Link>
          <Link to="/progress" className={LINK}>Progress</Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Link to="/progress" className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm" title={`${level.current.name}: ${xp} XP`}>
            <span aria-hidden>{level.current.emoji}</span>
            <span className="hidden font-semibold xl:inline">{level.current.name}</span>
            <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-muted md:block">
              <span className="block h-full rounded-full bg-chem" style={{ width: `${level.progress * 100}%` }} />
            </span>
            <span className="tabular-nums text-muted-foreground">{xp}<span className="hidden sm:inline"> XP</span></span>
          </Link>
          <span className={cn('rounded-full border px-2 py-1 text-sm tabular-nums', streak > 0 ? 'text-orange-600' : 'text-muted-foreground')} title={`${streak}-day streak`}>
            🔥 {streak}
          </span>
          <div className="hidden lg:block">
            <Popover label="Settings" align="right" trigger={<Settings className="size-5" />}>
              {() => <SettingsPanel />}
            </Popover>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>AdamLearns</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Main">
                <Link to="/" onClick={() => setOpen(false)} activeOptions={{ exact: true }} className={LINK}>🏠 Home</Link>
                <p className="mt-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Subjects</p>
                {subjects.map((s) => (
                  <Link key={s.id} to="/$subject" params={{ subject: s.id }} onClick={() => setOpen(false)} className={LINK}>{s.icon} {s.title}</Link>
                ))}
                <div className="my-2 border-t" />
                <Link to="/labs" onClick={() => setOpen(false)} className={LINK}>🧪 Labs</Link>
                <Link to="/review" onClick={() => setOpen(false)} className={LINK}>🔁 Review{reviewBadge}</Link>
                <Link to="/progress" onClick={() => setOpen(false)} className={LINK}>🏆 Progress</Link>
                <Link to="/curriculum" onClick={() => setOpen(false)} className={LINK}>🗺️ Curriculum map</Link>
                <div className="my-2 border-t" />
                <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">Settings</p>
                <SettingsPanel />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
