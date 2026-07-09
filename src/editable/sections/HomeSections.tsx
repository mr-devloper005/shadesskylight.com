import Link from 'next/link'
import {
  ArrowRight, BookOpen, BriefcaseBusiness, CircleHelp, Clock3, FileText,
  FlaskConical, Heart, List, MessageSquare, Search, Sparkles, Star,
  Utensils, Wand2,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

const categories = [
  ['Science & Technology', FlaskConical],
  ['Current Topics', Sparkles],
  ['Entertainment & Lifestyle', Wand2],
  ['Health & Beauty', Heart],
  ['Food & Cooking', Utensils],
  ['Education', BookOpen],
  ['Finance & Business', BriefcaseBusiness],
  ['Others', CircleHelp],
] as const

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function initials(value: string) {
  return (value || SITE_CONFIG.name).trim().slice(0, 1).toUpperCase()
}

function stat(seed: string, mod: number, base = 0) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return base + (h % mod)
}


function CategoryPanel() {
  return (
    <aside className="space-y-8">
      <Link href="/create" className="flex items-center justify-center gap-2 rounded-md bg-[#185d63] px-4 py-3 text-sm font-extrabold text-white shadow-sm">
        <MessageSquare className="h-4 w-4" /> Become a Blogger
      </Link>
      <div className="border border-[var(--editable-border)] bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-3 border-b border-[var(--editable-border)] pb-3 text-base font-extrabold">
          <List className="h-5 w-5" /> Category
        </h2>
        <div className="mt-3 grid gap-1">
          {categories.map(([label, Icon]) => (
            <Link key={label} href={`/search?category=${encodeURIComponent(label)}`} className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-[#101820] transition hover:bg-[#eef4f2] hover:text-[#185d63]">
              <Icon className="h-4 w-4 text-black" /> {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

function DiscussionCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const key = post.slug || post.id || post.title
  const content = post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const author = post.authorName || (typeof content.author === 'string' ? content.author : '') || getEditableCategory(post) || SITE_CONFIG.name
  return (
    <Link href={href} className={`group block rounded-xl border border-[var(--editable-border)] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${index % 6 === 0 ? 'discussion-float' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#185d63] text-lg font-black text-white">{initials(author)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-extrabold text-[#071a2d]">{author}</span>
            <span className="text-[#a1aab4]">·</span>
            <span className="text-[#516176]">{getEditableCategory(post)}</span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#516176]"><Clock3 className="h-3.5 w-3.5" /> Updated recently</p>
        </div>
      </div>
      <h2 className="mt-4 text-xl font-extrabold leading-snug text-[#061a2d] group-hover:text-[#185d63]">{post.title}</h2>
      <p className="mt-3 line-clamp-2 text-base leading-7 text-[#34415a]">{getEditableExcerpt(post, 190) || 'Explore this update and related details from the community archive.'}</p>
      <div className="mt-4 flex items-center border-t border-[#edf0f1] pt-3 text-xs font-semibold text-[#071a2d]">
        <span>Last Updated by : <strong>{author}</strong></span>
      </div>
    </Link>
  )
}

function TopDiscussions({ posts, primaryTask, primaryRoute }: { posts: SitePost[]; primaryTask: TaskKey; primaryRoute: string }) {
  return (
    <aside className="space-y-8">
      <div className="border border-[var(--editable-border)] bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-3 border-b border-[var(--editable-border)] pb-3 text-base font-extrabold"><List className="h-5 w-5" /> Top Discussions</h2>
        <div className="mt-3 max-h-[260px] space-y-1 overflow-y-auto pr-1">
          {posts.slice(0, 9).map((post) => (
            <Link key={post.id || post.slug} href={postHref(primaryTask, post, primaryRoute)} className="flex gap-3 px-2 py-2 text-xs font-bold leading-snug text-[#1d2735] hover:bg-[#eef4f2]">
              <Star className="mt-0.5 h-4 w-4 shrink-0 fill-[#f2b705] text-[#f2b705]" /> {post.title}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const featured = pool.slice(0, 10)
  const title = pagesContent.home.hero.title?.join(' ') || `Latest discussions on ${SITE_CONFIG.name}`

  return (
    <section className="border-b border-[var(--editable-border)] bg-[#eef4f2]">
      <div className={`${container} py-6`}>
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
          <div className="hidden lg:block" />
          <div className="min-w-0">
            <div className="rounded-xl border border-[var(--editable-border)] bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#185d63]">{pagesContent.home.hero.badge || 'Latest Questions'}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-[#071a2d] sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#516176]">{pagesContent.home.hero.description}</p>
              <form action="/search" className="mt-5 flex overflow-hidden rounded-md border border-[var(--editable-border)] bg-white shadow-sm">
                <label className="flex flex-1 items-center gap-3 px-4">
                  <Search className="h-5 w-5 text-black" />
                  <input name="q" placeholder="What would you like to search?" className="min-w-0 flex-1 py-4 text-sm outline-none placeholder:text-[#8c96a3]" />
                </label>
                <button className="m-2 rounded bg-[#185d63] px-8 text-sm font-bold text-white">Ask Question</button>
              </form>
            </div>
            {featured.length ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-[var(--editable-border)] bg-white p-3 shadow-sm">
                <div className="discussion-slider flex w-max gap-3">
                  {[...featured, ...featured].map((post, index) => (
                    <Link key={`${post.id || post.slug}-${index}`} href={postHref(primaryTask, post, primaryRoute)} className="w-[260px] shrink-0 rounded-lg border border-[#edf0f1] bg-[#f9fbfb] p-3 transition hover:bg-[#eef4f2]">
                      <div className="flex items-center gap-3">
                        <img src={getEditablePostImage(post)} alt="" className="h-12 w-12 rounded-md object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-[#071a2d]">{post.title}</p>
                          <p className="mt-1 text-xs font-semibold text-[#185d63]">{getEditableCategory(post)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  return (
    <section className={`${container} py-6`}>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
        <CategoryPanel />
        <main className="min-w-0">
          <div className="mb-4 flex rounded-md border border-[var(--editable-border)] bg-white p-1 shadow-sm">
            {['Latest Questions'].map((item, index) => (
              <Link key={item} href={primaryRoute} className={`px-3 py-3 text-sm font-extrabold ${index === 0 ? 'border-b-2 border-[#185d63] text-[#185d63]' : 'text-[#334155]'}`}>{item}</Link>
            ))}
          </div>
          <div className="space-y-3">
            {pool.slice(0, 14).map((post, index) => (
              <DiscussionCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            ))}
          </div>
        </main>
        <TopDiscussions posts={pool} primaryTask={primaryTask} primaryRoute={primaryRoute} />
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(14, 20)
  if (!pool.length) return null
  return (
    <section className="bg-white">
      <div className={`${container} py-8`}>
        <div className="grid gap-4 md:grid-cols-3">
          {pool.map((post, index) => (
            <Link key={post.id || post.slug} href={postHref(primaryTask, post, primaryRoute)} className={`${index === 0 ? 'md:col-span-2 md:grid-cols-[220px_1fr]' : ''} group grid gap-4 rounded-xl border border-[var(--editable-border)] bg-[#f8fbfa] p-4 transition hover:-translate-y-1 hover:shadow-md`}>
              <img src={getEditablePostImage(post)} alt="" className="aspect-[16/10] w-full rounded-lg object-cover" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#185d63]">{getEditableCategory(post)}</p>
                <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-[#071a2d] group-hover:text-[#185d63]">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#516176]">{getEditableExcerpt(post, 120)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections = timeSections.length ? timeSections : [{ key: 'recent', posts: posts.slice(20, 28), href: primaryRoute }]
  return (
    <>
      {sections.filter((section) => section.posts.length).slice(0, 2).map((section) => (
        <section key={section.key} className="bg-[#f6f8f7]">
          <div className={`${container} py-8`}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#185d63]">More to explore</p>
                <h2 className="mt-2 text-2xl font-black text-[#071a2d]">Editorial picks from the archive</h2>
              </div>
              <Link href={section.href || primaryRoute} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-sm font-bold">See all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.posts.slice(0, 8).map((post) => (
                <Link key={post.id || post.slug} href={postHref(primaryTask, post, primaryRoute)} className="group rounded-xl border border-[var(--editable-border)] bg-white p-4 shadow-sm transition hover:-translate-y-1">
                  <p className="text-xs font-black text-[#185d63]">{getEditableCategory(post)}</p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-black text-[#071a2d] group-hover:text-[#185d63]">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#516176]">{getEditableExcerpt(post, 100)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section className="bg-[#185d63]">
      <div className={`${container} flex flex-col items-center gap-4 py-10 text-center text-white`}>
        <FileText className="h-8 w-8" />
        <h2 className="text-3xl font-black">Share a useful article or business listing</h2>
        <p className="max-w-2xl text-white/80">Publish questions, guides, services, and practical updates for readers and customers.</p>
        <Link href="/create" className="rounded-md bg-white px-6 py-3 text-sm font-black text-[#185d63]">Create now</Link>
      </div>
    </section>
  )
}
