import Link from 'next/link'
import { ArrowUpRight, Compass, Feather, HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const VALUES = [
  {
    icon: Feather,
    title: 'Craft over clutter',
    description: 'Every page is designed to breathe — hierarchy, whitespace, and typography chosen for reading, not decoration.',
  },
  {
    icon: HeartHandshake,
    title: 'People first',
    description: 'Real voices, honest recommendations, and community-built trust guide what appears on the platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Quiet integrity',
    description: 'No dark patterns, no forced signups. Content is here to be useful, and everything we build respects your time.',
  },
  {
    icon: Compass,
    title: 'Curated, not crowded',
    description: 'We select and shape what appears here so discovery feels meaningful rather than an endless scroll.',
  },
]

const STATS = [
  { label: 'Curated pieces', value: '1,200+' },
  { label: 'Contributors', value: '85+' },
  { label: 'Readers monthly', value: '40k' },
  { label: 'Years of craft', value: 'Since 2019' },
]

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-gradient-to-br from-[#eef4f2] via-white to-[#f5f0e8]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0f5a60]/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#c48f4a]/12 blur-3xl" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f5a60] backdrop-blur">
              <Sparkles className="h-3 w-3" /> {pagesContent.about.badge}
            </p>
            <h1 className="editable-display mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              We build a calmer corner of the internet — one story, one place at a time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.about.description}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/article" className="inline-flex items-center gap-2 rounded-full bg-[#0f5a60] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90">
                Read our stories <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[#0f5a60]">
                Get in touch
              </Link>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-b border-[var(--editable-border)] bg-white">
          <div className="mx-auto grid max-w-[var(--editable-container)] gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-5 text-center">
                <p className="editable-display text-3xl font-extrabold tracking-tight text-[#0f5a60]">{stat.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f5a60]">Our story</p>
              <h2 className="editable-display mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                Made by readers, for readers.
              </h2>
              <div className="mt-4 h-0.5 w-12 rounded-full bg-[#0f5a60]" />
            </div>
            <div className="space-y-5 text-[15px] leading-8 text-[var(--slot4-muted-text)]">
              <p>
                {SITE_CONFIG.name} began as a small side project — a place to gather the writing, ideas, and recommendations we kept sharing between friends. What we noticed was simple: the modern web is loud, but genuinely useful reading is rare.
              </p>
              {pagesContent.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p>
                Today we&apos;re a small team of writers, editors, and designers who believe good work still deserves a quiet room. Everything you find here has been chosen with care.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f5a60]">What we believe</p>
              <h2 className="editable-display mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                Principles we come back to.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[var(--slot4-muted-text)]">
                Four ideas quietly guide every choice — from the words we publish to the layout you&apos;re reading right now.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {VALUES.map((value) => {
                const Icon = value.icon
                return (
                  <div key={value.title} className="group relative overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f5a60]/10 text-[#0f5a60]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="editable-display mt-5 text-xl font-semibold tracking-[-0.01em]">{value.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Closing / CTA */}
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] border border-[var(--editable-border)] bg-gradient-to-br from-[#0f5a60] via-[#0f5a60] to-[#0b3d44] p-10 text-white shadow-lg sm:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/6 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                  <Users className="h-3 w-3" /> Join us
                </p>
                <h2 className="editable-display mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                  If any of this resonates — you&apos;ll fit right in.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/80">
                  Whether you&apos;re here to read, share your work, or simply say hello — the door is open. We build for the people who show up.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f5a60] shadow-sm transition hover:opacity-90">
                  Contribute <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15">
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
