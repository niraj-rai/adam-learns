/// <reference types="vite-plugin-pwa/client" />
/**
 * Progressive Web App helpers: service-worker registration (production only), update handling,
 * and the "install this app" state used by the Install app UI.
 */
import { useSyncExternalStore } from 'react'
import { useToasts } from '@/stores/toasts'

// ---------- install prompt ----------

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** How this browser installs web apps: its own prompt (Chrome/Edge/Android), or manual steps (Safari). */
export type InstallKind = 'prompt' | 'ios' | 'mac-safari'

let deferredPrompt: BeforeInstallPromptEvent | null = null
let justInstalled = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  // Chrome/Edge/Android fire this when the site can be installed; keep it for our own button.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    justInstalled = true
    emit()
  })
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', emit)
}

/** True when running as an installed app (home-screen / dock / desktop window). */
export function isStandalone() {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true || ['standalone', 'minimal-ui', 'fullscreen', 'window-controls-overlay'].some((m) => window.matchMedia?.(`(display-mode: ${m})`).matches)
}

function manualKind(): InstallKind | null {
  const ua = navigator.userAgent
  const touchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 // iPadOS reports itself as a Mac
  if (/iPad|iPhone|iPod/.test(ua) || touchMac) return 'ios'
  const safari = /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Firefox/.test(ua)
  if (/Macintosh/.test(ua) && safari) return 'mac-safari'
  return null
}

function getInstallKind(): InstallKind | null {
  if (justInstalled || isStandalone()) return null
  if (deferredPrompt) return 'prompt'
  return manualKind()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => void listeners.delete(cb)
}

/** How this device can install AdamLearns, or null when it's already installed or the browser can't. */
export function useInstallKind() {
  return useSyncExternalStore(subscribe, getInstallKind, () => null)
}

/** Show the browser's own install dialog (Chrome/Edge/Android). */
export async function promptInstall() {
  const e = deferredPrompt
  if (!e) return
  await e.prompt()
  const { outcome } = await e.userChoice
  deferredPrompt = null // a prompt can only be used once
  if (outcome === 'accepted') justInstalled = true
  emit()
}

const DISMISS_KEY = 'adamlearns-install-dismissed'
export function installCardDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}
export function dismissInstallCard() {
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // storage unavailable: the card just comes back next visit
  }
}

// ---------- service worker ----------

/**
 * Register the offline service worker (production builds only, so the dev server is never cached).
 * Updates: a new version waiting when the app has just been opened is applied straight away (a quick
 * reload). If one arrives mid-session, a toast offers to reload; otherwise it loads next time.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  const openedAt = Date.now()
  void import('virtual:pwa-register').then(({ registerSW }) => {
    let offered = false
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        if (Date.now() - openedAt < 15_000) {
          void updateSW(true)
          return
        }
        if (offered) return
        offered = true
        const title = '✨ New version of AdamLearns'
        useToasts.getState().push({ kind: 'reminder', title, body: 'Tap here to reload and update. Your progress is kept.' })
        // Toasts are buttons that close when tapped; tapping this one also applies the update.
        const onClick = (e: MouseEvent) => {
          const toast = (e.target as Element | null)?.closest?.('[aria-live] button')
          if (toast?.textContent?.includes(title)) void updateSW(true)
        }
        document.addEventListener('click', onClick, true)
        setTimeout(() => document.removeEventListener('click', onClick, true), 60_000)
      },
      onRegisteredSW(_url, reg) {
        // Installed apps can stay open for days: look for a new version every hour.
        if (reg) setInterval(() => { if (document.visibilityState === 'visible' && navigator.onLine) void reg.update() }, 60 * 60 * 1000)
      },
    })
  })
}
