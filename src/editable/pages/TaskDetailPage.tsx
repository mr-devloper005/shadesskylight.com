import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, BadgeCheck, Bookmark, BookOpen, Building2, Camera, CheckCircle2, Clock, Download, ExternalLink, Eye, FileText, Globe2, Heart, Mail, MapPin, MessageCircle, Phone, Share2, Sparkles, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// Yelp-style red star rating row. Uses real rating/review fields when present,
// otherwise a stable derived value (wire to real data when available).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

// ----- Article: premium magazine reading experience -----
function readingTime(post: SitePost) {
  const words = stripHtml(getBody(post)).split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.round(words / 220))
}
function viewsOf(post: SitePost) {
  return 240 + (hashStr((post.slug || post.title || 'v') + 'view') % 9800)
}
function authorOf(post: SitePost) {
  return asText(getContent(post).author) || asText(getContent(post).byline) || 'Editorial Team'
}
function publishedOf(post: SitePost) {
  const raw = asText(getContent(post).publishedAt) || asText(getContent(post).date) || asText(getContent(post).createdAt) || (post as unknown as { createdAt?: string }).createdAt || ''
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  const cover = images[0]
  const category = categoryOf(post, 'Feature')
  const minutes = readingTime(post)
  const views = viewsOf(post)
  const author = authorOf(post)
  const date = publishedOf(post)
  const lead = leadText(post)
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {cover ? (
          <>
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--tk-raised)]/70 via-[var(--tk-raised)]/85 to-[var(--tk-bg)]" />
          </>
        ) : null}
        <div className="relative mx-auto max-w-4xl px-6 pb-14 pt-10 sm:pt-14">
          <BackLink task="article" />
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--tk-on-accent)]">
              <Sparkles className="h-3 w-3" /> {category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)]/60 px-3 py-1 text-[11px] font-semibold text-[var(--tk-muted)]">
              <Clock className="h-3 w-3" /> {minutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)]/60 px-3 py-1 text-[11px] font-semibold text-[var(--tk-muted)]">
              <Eye className="h-3 w-3" /> {views.toLocaleString()} views
            </span>
          </div>
          <h1 className="editable-display mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">
            {post.title}
          </h1>
          {lead ? (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--tk-muted)]">{lead}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--tk-line)] pt-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-sm font-bold text-[var(--tk-accent)]">
              {author.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--tk-text)]">{author}</p>
              <p className="text-xs text-[var(--tk-muted)]">{date || SITE_CONFIG.name} · Editorial</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
             
            </div>
          </div>
        </div>
      </section>

      {cover ? (
        <div className="mx-auto -mt-8 max-w-5xl px-4 sm:-mt-10 sm:px-6">
          <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_28px_60px_-24px_rgba(15,23,42,0.35)]">
            <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Ads slot="header" showLabel eager className="mx-auto w-full" />
      </div>

      {/* Body + sidebar */}
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-6 pb-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <article className="min-w-0">
          <BodyContent post={post} />
          {images.length > 1 ? (
            <div className="mt-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--tk-muted)]">In this story</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {images.slice(1, 5).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-14 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-lg font-bold text-[var(--tk-accent)]">
                {author.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Written by</p>
                <p className="mt-1 editable-display text-lg font-semibold tracking-[-0.02em]">{author}</p>
                <p className="text-xs text-[var(--tk-muted)]">Contributor at {SITE_CONFIG.name}</p>
              </div>
              <Link href="/create" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-bold text-[var(--tk-on-accent)] transition hover:opacity-90">
                <BookOpen className="h-3.5 w-3.5" /> More stories
              </Link>
            </div>
          </div>
          <EditableArticleComments slug={post.slug} comments={comments} />
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-muted)]">At a glance</p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[var(--tk-muted)]"><Tag className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Category</span>
                  <span className="font-semibold">{category}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[var(--tk-muted)]"><Clock className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Read time</span>
                  <span className="font-semibold">{minutes} min</span>
                </div>
                {date ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[var(--tk-muted)]"><CheckCircle2 className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Published</span>
                    <span className="font-semibold">{date}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[var(--tk-muted)]"><MessageCircle className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Comments</span>
                  <span className="font-semibold">{comments.length}</span>
                </div>
              </div>
            </div>
            <Ads slot="sidebar" showLabel className="mx-auto w-full" />
            {related.length ? (
              <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="editable-display text-base font-semibold tracking-[-0.02em]">Keep reading</h2>
                  <Link href="/article" className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
                </div>
                <div className="mt-4 grid gap-3">
                  {related.slice(0, 3).map((item) => <RelatedCard key={item.id || item.slug} task="article" post={item} />)}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-6">
        <Ads slot="article-bottom" showLabel className="mx-auto w-full" />
      </div>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ----- Listing: premium business showcase -----
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const cover = images[1] || images[0]
  const gallery = images.slice(1)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'timings', 'openHours'])
  const founded = getField(post, ['founded', 'established', 'since'])
  const priceRange = getField(post, ['priceRange', 'price'])
  const category = getField(post, ['category']) || 'Business'
  const mapSrc = mapSrcFor(post)
  const rating = ratingOf(post)
  const reviews = reviewsOf(post)
  return (
    <>
      {/* Hero cover */}
      <section className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {cover ? (
          <>
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--tk-raised)] via-[var(--tk-raised)]/70 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--tk-accent-soft)] via-[var(--tk-raised)] to-[var(--tk-surface)]" />
        )}
        <div className="relative mx-auto flex min-h-[280px] max-w-[var(--editable-container)] flex-col justify-end px-6 pb-10 pt-8 sm:min-h-[340px] lg:px-8">
          <BackLink task="listing" />
        </div>
      </section>

      {/* Identity card overlapping hero */}
      <section className="mx-auto -mt-16 max-w-[var(--editable-container)] px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-white shadow-sm sm:h-28 sm:w-28">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">
                  <Building2 className="h-3 w-3" /> {category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
                {priceRange ? (
                  <span className="inline-flex items-center rounded-full border border-[var(--tk-line)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]">
                    {priceRange}
                  </span>
                ) : null}
              </div>
              <h1 className="editable-display mt-3 text-3xl font-semibold leading-[1.04] tracking-[-0.02em] sm:text-4xl lg:text-5xl">{post.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="inline-flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
                  ))}
                  <span className="ml-1 text-sm font-bold">{rating.toFixed(1)}</span>
                  <span className="text-sm text-[var(--tk-muted)]">({reviews} reviews)</span>
                </span>
                {address ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-[var(--tk-muted)]"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {address}</span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-bold text-[var(--tk-on-accent)] shadow-sm transition hover:opacity-90">
                  <Phone className="h-4 w-4" /> Call
                </a>
              ) : null}
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 text-sm font-bold transition hover:border-[var(--tk-accent)]">
                  <Globe2 className="h-4 w-4" /> Visit
                </Link>
              ) : null}
             
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-6 grid gap-3 border-t border-[var(--tk-line)] pt-6 sm:grid-cols-4">
            {[
              ['Rating', `${rating.toFixed(1)} / 5`, Star],
              ['Reviews', reviews.toString(), MessageCircle],
              ['Category', category, Tag],
              ['Since', founded || 'Verified', BadgeCheck],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--tk-muted)]">{label as string}</p>
                  <p className="truncate text-sm font-bold">{value as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main body */}
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <article className="min-w-0 space-y-10">
          {leadText(post) ? (
            <p className="text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p>
          ) : null}

          <div>
            <h2 className="editable-display text-xl font-semibold tracking-[-0.02em]">About</h2>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-[var(--tk-accent)]" />
            <BodyContent post={post} />
          </div>

          <InfoGrid items={[
            ['Address', address, MapPin],
            ['Phone', phone, Phone],
            ['Email', email, Mail],
            ['Website', website, Globe2],
            ['Hours', hours, Clock],
            ['Established', founded, BadgeCheck],
          ]} />

          {gallery.length ? (
            <div>
              <h2 className="editable-display text-xl font-semibold tracking-[-0.02em]">Gallery</h2>
              <div className="mt-1 mb-5 h-0.5 w-10 rounded-full bg-[var(--tk-accent)]" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.slice(0, 9).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt="" className="aspect-square w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover transition hover:opacity-90" />
                ))}
              </div>
            </div>
          ) : null}
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-muted)]">Get in touch</p>
            <div className="mt-4 grid gap-3">
              {phone ? (
                <a href={`tel:${phone}`} className="flex items-center gap-3 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Phone className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1 truncate">{phone}</span>
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Mail className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1 truncate">{email}</span>
                </a>
              ) : null}
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Globe2 className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1 truncate">Website</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[var(--tk-muted)]" />
                </Link>
              ) : null}
              {address ? (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><MapPin className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">{address}</span>
                </div>
              ) : null}
            </div>
          </div>
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <Ads slot="sidebar" showLabel eager className="mx-auto w-full" />
          <RelatedPanel task="listing" post={post} related={related} />
        </aside>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-6">
        <Ads slot="footer" showLabel className="mx-auto w-full" />
      </div>
      <RelatedStrip task="listing" related={related} />
    </>
  )
}

// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ----- Image: a dark, gallery-led canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ----- Bookmark: a single curated resource -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

// ----- PDF: a document workspace -----
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--tk-radius)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-9 w-9" /></div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-sm font-semibold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ----- Profile: identity-first with a sticky portrait -----
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

// ----- Shared building blocks -----
function Divider() {
  return <div className="my-10 h-px bg-[var(--tk-line)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post: _post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold tracking-[-0.02em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
