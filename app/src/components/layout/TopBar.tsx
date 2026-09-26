import { Link, useRouterState } from '@tanstack/react-router'
import { Check, ChevronDown, Menu, Monitor, Moon, Settings, Sun, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getSubjects } from '@/content/loader'
import { levelFor } from '@/lib/levels'
import { cn } from '@/lib/utils'
import { currentStreak, dueReviewItems, useProgress } from '@/stores/progress'
import { isOnboarded, useProfile } from '@/stores/profile'
import { applyTheme, useSettings, type Theme } from '@/stores/settings'
import { appSegments } from '@/lib/path'
import { Logo } from './Logo'

const LINK = 'rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground data-[status=active]:bg-chem-soft data-[status=active]:text-foreground'

/** A small click-to-open menu that closes on outside click or Escape. */
function Popover({ label, trigger, children, align = 'left', active }: { label: string; trigger: ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right'; active?: boolean }) {
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
      <button type="button" aria-haspopup="true" aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)} className={cn(LINK, 'inline-flex items-center gap-1', active && 'bg-chem-soft text-foreground', open && 'bg-muted text-foreground')}>
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

function SettingsPanel({ onNavigate }: { onNavigate?: () => void }) {
  const firstName = useProfile((s) => s.firstName)
  const hasPlan = useProfile((s) => Boolean(s.schedule))
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
      {firstName && (
        <Link to="/welcome" onClick={onNavigate} className="flex w-full items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted">
          <span>👤 Name &amp; grade</span>
          <span className="text-xs font-semibold">Edit</span>
        </Link>
      )}
      {firstName && (
        <Link to="/welcome" search={{ step: 'schedule' }} onClick={onNavigate} className="flex w-full items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted">
          <span>📅 Study plan</span>
          <span className="text-xs font-semibold">{hasPlan ? 'Edit' : 'Set up'}</span>
        </Link>
      )}
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
  const profile = useProfile()
  const onboarded = isOnboarded(profile)
  const path = useRouterState({ select: (s) => s.location.pathname })
  const current = subjects.find((s) => appSegments(path)[0] === s.id)

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
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-heading text-lg font-bold" aria-label="AdamLearns home">
          <Logo className="size-9 shrink-0 drop-shadow-sm" />
          <span className="hidden flex-col leading-none min-[360px]:flex">
            <span>AdamLearns</span>
            {onboarded && <span className="-mt-0.5 max-w-40 truncate pl-4 font-hand text-xl leading-5 font-bold text-brand">with {profile.firstName}</span>}
          </span>
        </Link>

        {onboarded && <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Main">
          <Link to="/" activeOptions={{ exact: true }} className={LINK}>Home</Link>
          <Popover label={current ? `Subjects: ${current.title}` : "Subjects"} active={Boolean(current)} trigger={current ? <><span aria-hidden>{current.icon}</span> {current.title} <ChevronDown className="size-4" /></> : <>Subjects <ChevronDown className="size-4" /></>}>
            {(close) => (
              <div className="flex flex-col">
                {subjects.map((s) => (
                  <Link key={s.id} to="/$subject" params={{ subject: s.id }} onClick={close} aria-current={current?.id === s.id ? 'page' : undefined} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted', current?.id === s.id && 'bg-brand-soft font-semibold')}>
                    <span className="text-lg" aria-hidden>{s.icon}</span>{s.title}
                    {current?.id === s.id && <Check className="ml-auto size-4 text-brand" />}
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
        </nav>}

        {onboarded && <div className="ml-auto flex shrink-0 items-center gap-1.5">
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
                <SheetTitle>AdamLearns{onboarded && <span className="ml-2 font-hand text-2xl font-bold text-brand">with {profile.firstName}</span>}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Main">
                <Link to="/" onClick={() => setOpen(false)} activeOptions={{ exact: true }} className={LINK}>🏠 Home</Link>
                <p className="mt-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Subjects</p>
                {subjects.map((s) => (
                  <Link key={s.id} to="/$subject" params={{ subject: s.id }} onClick={() => setOpen(false)} className={cn(LINK, current?.id === s.id && 'bg-chem-soft text-foreground')}>{s.icon} {s.title}</Link>
                ))}
                <div className="my-2 border-t" />
                <Link to="/labs" onClick={() => setOpen(false)} className={LINK}>🧪 Labs</Link>
                <Link to="/review" onClick={() => setOpen(false)} className={LINK}>🔁 Review{reviewBadge}</Link>
                <Link to="/progress" onClick={() => setOpen(false)} className={LINK}>🏆 Progress</Link>
                <Link to="/curriculum" onClick={() => setOpen(false)} className={LINK}>🗺️ Curriculum map</Link>
                <div className="my-2 border-t" />
                <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">Settings</p>
                <SettingsPanel onNavigate={() => setOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>}
      </div>
    </header>
  )
}
