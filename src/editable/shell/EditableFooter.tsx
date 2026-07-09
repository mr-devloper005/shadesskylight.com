'use client'

import Link from 'next/link'
import { ArrowUpRight, BookOpen, Compass, Facebook, Instagram, LogOut, Mail, PenLine, Youtube } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const EXPLORE_LINKS = [
  { label: 'Home', href: '/', icon: ArrowUpRight },
  { label: 'Stories', href: '/article', icon: BookOpen },
  { label: 'Directory', href: '/listing', icon: Compass },
  { label: 'Contribute', href: '/create', icon: PenLine },
]

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="relative overflow-hidden border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0f5a60]/40 to-transparent" />
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[var(--editable-border)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-11 w-11 object-contain" />
            </span>
            <span className="editable-display text-xl font-extrabold tracking-tight text-[#0f5a60]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-md text-[13.5px] leading-7 text-[var(--slot4-muted-text)]">
            {globalContent.footer?.description || SITE_CONFIG.description}
          </p>
          
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Explore</h3>
          <div className="mt-5 grid gap-2.5">
            {EXPLORE_LINKS.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]">
                  <Icon className="h-3.5 w-3.5 text-[var(--slot4-accent)] opacity-70 group-hover:opacity-100" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Company</h3>
          <div className="mt-5 grid gap-2.5">
            <Link href="/about" className="text-sm font-semibold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]">About us</Link>
            <Link href="/contact" className="text-sm font-semibold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]">Contact</Link>
            {session ? (
              <Link href="/create" className="text-sm font-semibold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]">Publish</Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]">Login</Link>
                <Link href="/signup" className="text-sm font-semibold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]">Sign up</Link>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--editable-border)] bg-white/70 p-6 shadow-sm backdrop-blur">
          <h3 className="editable-display text-base font-extrabold tracking-tight text-[var(--slot4-page-text)]">Stay in the loop</h3>
          <p className="mt-2 text-[13px] leading-6 text-[var(--slot4-muted-text)]">
            Get fresh reads and standout listings — no clutter, unsubscribe any time.
          </p>
          <form action="/contact" className="mt-4 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-3 py-1.5 shadow-sm focus-within:border-[var(--slot4-accent)]">
            <Mail className="h-4 w-4 text-[var(--slot4-muted-text)]" />
            <input name="email" type="email" placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-[var(--slot4-muted-text)]" />
            <button type="submit" className="rounded-full bg-[#0f5a60] px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90">Join</button>
          </form>
          {session ? (
            <button type="button" onClick={logout} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--editable-border)] px-3.5 py-1.5 text-xs font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          ) : null}
        </div>
      </div>
      <div className="border-t border-[var(--editable-border)] px-4 py-5 text-center text-[11px] font-medium tracking-[0.14em] text-[var(--slot4-muted-text)]">
        © {year} {SITE_CONFIG.name} · {globalContent.footer?.bottomNote || 'All rights reserved.'}
      </div>
    </footer>
  )
}
