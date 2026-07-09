import { Clock, Mail, MessageSquareText, Send, Sparkles } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { SITE_CONFIG } from '@/lib/site-config'

const HIGHLIGHTS = [
  { icon: Clock, title: 'Fast replies', body: 'We usually respond within one working day.' },
  { icon: MessageSquareText, title: 'Real humans', body: 'Every message goes to a real person on the team — no bots, no scripted replies.' },
  { icon: Mail, title: 'One inbox', body: 'Whatever you send lands in the same inbox we read every morning.' },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-gradient-to-br from-[#eef4f2] via-white to-[#f5f0e8]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0f5a60]/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#c48f4a]/12 blur-3xl" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f5a60] backdrop-blur">
              <Sparkles className="h-3 w-3" /> {pagesContent.contact.eyebrow}
            </p>
            <h1 className="editable-display mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Say hello — we&apos;d love to hear from you.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">
              Questions, feedback, ideas, or just a quiet note — whatever it is, drop it in the form below and we&apos;ll get back to you soon.
            </p>
          </div>
        </section>

        {/* Form + highlights */}
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            {/* Highlights */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8">
                <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">A better way to reach us.</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">
                  No support-ticket runaround, no waiting on hold. Send us a note, and we&apos;ll pick it up personally.
                </p>
                <div className="mt-8 space-y-5">
                  {HIGHLIGHTS.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f5a60]/10 text-[#0f5a60]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="editable-display text-base font-semibold tracking-[-0.01em]">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{item.body}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
              </div>
            </aside>

            {/* Form */}
            <div className="relative overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-white p-8 shadow-sm sm:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#0f5a60]/6 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0f5a60]">
                  <Send className="h-3 w-3" /> {pagesContent.contact.formTitle}
                </div>
                <h2 className="editable-display mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                  Write us a message.
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">
                  Fill in a few quick details — nothing more than we need to reply well.
                </p>
                <div className="mt-8">
                  <EditableContactLeadForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
