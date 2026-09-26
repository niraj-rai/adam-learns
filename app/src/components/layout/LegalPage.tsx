import type { ReactNode } from 'react'

/** Simple, readable layout for the Terms and Privacy pages. */
export function LegalPage({ emoji, title, updated, children }: { emoji: string; title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-5xl" aria-hidden>{emoji}</p>
      <h1 className="mt-3 font-heading text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {updated}</p>
      <div className="mt-6 space-y-6 text-[15px] leading-relaxed [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1">{children}</div>
    </article>
  )
}
