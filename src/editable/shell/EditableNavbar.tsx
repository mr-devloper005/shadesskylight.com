'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Compass, Home, LogIn, Mail, Menu, PenLine, PlusCircle, Search, User, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const NAV_LINKS = [
  { label: 'Home', href: '/', icon: Home },

  { label: 'Contact', href: '/contact', icon: Mail },
  { label: 'Write', href: '/create', icon: PenLine },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const userName = session?.name || session?.email || 'Member'

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur transition-shadow ${
        scrolled ? 'shadow-[0_10px_28px_-16px_rgba(6,26,32,0.35)]' : ''
      } bg-[color:var(--editable-nav-bg,#0f5a60)] text-[var(--editable-nav-text,#fff)]`}
    >
      <nav className="mx-auto flex min-h-[60px] w-full max-w-[var(--editable-container)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[#0f5a60] shadow-sm ring-1 ring-white/40">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f5a60]/8">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="editable-display block max-w-[170px] truncate text-[15px] font-extrabold leading-none tracking-tight">{SITE_CONFIG.name}</span>
            <span className="mt-0.5 block max-w-[170px] truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[#0f5a60]/70">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-tight transition ${
                  active ? 'bg-white text-[#0f5a60] shadow-sm' : 'text-white/90 hover:bg-white/12 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="mx-auto hidden min-w-0 flex-1 justify-center md:flex">
          <label className="group flex w-full max-w-md items-center gap-2 rounded-full bg-white/12 px-4 py-2 ring-1 ring-white/15 transition focus-within:bg-white focus-within:ring-white">
            <Search className="h-4 w-4 shrink-0 opacity-80 group-focus-within:text-[#0f5a60]" />
            <input
              name="q"
              type="search"
              placeholder="Search stories, places, ideas…"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-current outline-none placeholder:text-current/60 focus:text-[#0b3d44]"
            />
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {session ? (
            <>
              <span className="hidden max-w-[140px] items-center gap-1.5 truncate rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-white/15 md:inline-flex">
                <User className="h-3.5 w-3.5" /> {userName}
              </span>
              
              <button
                type="button"
                onClick={logout}
                className="hidden items-center rounded-full px-3 py-1.5 text-xs font-bold text-white/90 transition hover:bg-white/12 sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white/90 transition hover:bg-white/12 sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#0f5a60] shadow-sm transition hover:opacity-90 sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Join
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full bg-white/12 p-2 ring-1 ring-white/20 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/15 bg-[color:var(--editable-nav-bg,#0f5a60)] px-4 py-5 lg:hidden">
          <form action="/search" className="mb-5 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[#0b3d44]">
            <Search className="h-4 w-4" />
            <input name="q" type="search" placeholder="Search" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#516176]" />
          </form>
          <div className="grid gap-1">
            {NAV_LINKS.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold ${
                    active ? 'bg-white text-[#0f5a60]' : 'text-white hover:bg-white/12'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              )
            })}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {session ? (
                <>
                  <Link href="/create" className="col-span-2 rounded-lg bg-white px-4 py-3 text-center text-sm font-bold text-[#0f5a60]">Create post</Link>
                  <button type="button" onClick={logout} className="col-span-2 rounded-lg border border-white/25 px-4 py-3 text-sm font-bold text-white">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-lg border border-white/25 px-4 py-3 text-center text-sm font-bold text-white">Login</Link>
                  <Link href="/signup" className="rounded-lg bg-white px-4 py-3 text-center text-sm font-bold text-[#0f5a60]">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
