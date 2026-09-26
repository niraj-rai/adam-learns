import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { LEADS, type ReminderSettings } from '@/lib/reminders'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useSettings } from '@/stores/settings'

const hasNotifications = () => typeof window !== 'undefined' && 'Notification' in window

/** The browser's notification permission, or 'unsupported' when there is no Notification API. */
function useNotificationPermission() {
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>(() => (hasNotifications() ? Notification.permission : 'unsupported'))
  // only ever called from a click: browsers (rightly) ignore or block prompts that appear by themselves
  const request = async () => {
    if (!hasNotifications()) return
    try {
      setPerm(await Notification.requestPermission())
    } catch {
      setPerm(Notification.permission)
    }
  }
  return { perm, request }
}

/** An on/off switch row, like the ones in the settings menu. */
function Switch({ on, onChange, label, icon }: { on: boolean; onChange: (on: boolean) => void; label: string; icon: ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition hover:border-brand/50">
      <span className="flex min-w-0 items-center gap-2">{icon}{label}</span>
      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs', on ? 'bg-brand text-white' : 'bg-muted text-muted-foreground')}>{on ? 'On' : 'Off'}</span>
    </button>
  )
}

/** Reminder settings for the whole plan: master switch, how long before, sound, and notification permission. */
export function ReminderControls({ value, onChange, className }: { value: ReminderSettings; onChange: (r: ReminderSettings) => void; className?: string }) {
  const appSound = useSettings((s) => s.sound)
  const { perm, request } = useNotificationPermission()
  const [tested, setTested] = useState(false)
  const leadId = useId()
  const set = (patch: Partial<ReminderSettings>) => onChange({ ...value, ...patch })

  return (
    <div className={cn('space-y-3', className)}>
      <Switch on={value.on} onChange={(on) => set({ on })} label="Remind me before each session" icon={value.on ? <Bell className="size-4 shrink-0 text-brand" /> : <BellOff className="size-4 shrink-0" />} />
      {value.on && (
        <>
          <div>
            <p id={leadId} className="text-sm font-semibold">How long before?</p>
            <div className="mt-1 grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby={leadId}>
              {[...LEADS].reverse().map((m) => (
                <button key={m} type="button" role="radio" aria-checked={value.lead === m} onClick={() => set({ lead: m })} className={cn('rounded-xl border-2 px-2 py-2 text-sm font-semibold tabular-nums transition', value.lead === m ? 'border-brand bg-brand-soft' : 'hover:border-brand/50')}>
                  {m} min
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">
              <Switch on={value.sound} onChange={(sound) => set({ sound })} label="Sounds" icon={value.sound ? <Volume2 className="size-4 shrink-0" /> : <VolumeX className="size-4 shrink-0" />} />
            </div>
            <Button type="button" variant="outline" className="h-auto rounded-xl" disabled={!value.sound || !appSound} onClick={() => { sfx.chime(); setTested(true) }} aria-label="Play the reminder sound">▶ Test</Button>
          </div>
          {tested && <p className="text-xs text-muted-foreground" role="status">🔊 Playing the chime. Can't hear it? Turn up your device volume and check this browser tab isn't muted.</p>}
          {value.sound && !appSound && <p className="text-xs text-muted-foreground">Sounds are off in ⚙️ settings, so reminders will be silent until you turn them back on.</p>}
          <div className="text-sm">
            {perm === 'default' && <Button type="button" variant="outline" size="sm" onClick={request}><Bell /> Allow notifications</Button>}
            {perm === 'granted' && <p className="font-semibold text-success">✓ Notifications allowed</p>}
            {perm === 'denied' && <p className="text-muted-foreground">Notifications are blocked for this site. You can allow them in your browser's site settings.</p>}
            {perm === 'unsupported' && <p className="text-muted-foreground">This browser can't show notifications, so you'll get the sound and an on-screen reminder instead.</p>}
          </div>
        </>
      )}
      <p className="text-xs text-muted-foreground">ℹ️ Reminders work while AdamLearns is open in a browser tab. Allow notifications to get them even when the tab is in the background.</p>
    </div>
  )
}
