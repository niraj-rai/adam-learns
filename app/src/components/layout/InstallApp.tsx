import { Share, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { dismissInstallCard, installCardDismissed, promptInstall, useInstallKind, type InstallKind } from '@/lib/pwa'

function Steps({ kind }: { kind: InstallKind }) {
  if (kind === 'ios')
    return (
      <p className="text-xs text-muted-foreground">
        Tap <b>Share</b> <Share className="inline size-3.5 -translate-y-px" aria-label="Share icon" /> then <b>Add to Home Screen</b>.
        <br />
        The installed app keeps its own progress: <b>Export</b> it on the Progress page here first, then <b>Import</b> it in the app.
      </p>
    )
  if (kind === 'mac-safari')
    return (
      <p className="text-xs text-muted-foreground">
        In the menu bar choose <b>File → Add to Dock</b>.
      </p>
    )
  return null
}

/** "Install app" row for the settings menu. Hidden when already installed or the browser can't install. */
export function InstallAppButton() {
  const kind = useInstallKind()
  const [showSteps, setShowSteps] = useState(false)
  if (!kind) return null
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        aria-expanded={kind === 'prompt' ? undefined : showSteps}
        onClick={() => (kind === 'prompt' ? void promptInstall() : setShowSteps((v) => !v))}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
      >
        <span>📲 Install app</span>
        <span className="text-xs font-semibold">{kind === 'prompt' ? 'Install' : 'How?'}</span>
      </button>
      {showSteps && (
        <div className="px-3 pb-2">
          <Steps kind={kind} />
        </div>
      )}
    </div>
  )
}

/** Dismissible home-page card inviting the learner to install AdamLearns. */
export function InstallAppCard() {
  const kind = useInstallKind()
  const [dismissed, setDismissed] = useState(installCardDismissed)
  if (!kind || dismissed) return null
  return (
    <section className="relative flex items-center gap-4 rounded-2xl border bg-card p-4 pr-10">
      <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" className="size-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="font-heading font-semibold">Install AdamLearns on this device</p>
        <p className="text-sm text-muted-foreground">Open it from your home screen like an app, and keep learning offline.</p>
        {kind !== 'prompt' && (
          <div className="mt-1">
            <Steps kind={kind} />
          </div>
        )}
      </div>
      {kind === 'prompt' && (
        <Button size="sm" onClick={() => void promptInstall()} className="shrink-0">
          Install
        </Button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          dismissInstallCard()
          setDismissed(true)
        }}
        className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </section>
  )
}
