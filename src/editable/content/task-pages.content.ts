import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'The Reading Room',
    headline: 'Ideas worth your time — essays, guides, and long-form journalism.',
    description: 'A calm, editorial home for stories that deserve depth. Filter by topic to explore what catches your eye.',
    filterLabel: 'Choose a topic',
    secondaryNote: 'Long reads, deep dives, sharp explainers.',
    chips: ['Editorial', 'Essays', 'Long-form', 'Guides'],
  },
  classified: {
    eyebrow: 'Notice board',
    headline: 'Fast-moving classifieds, offers, and time-sensitive posts.',
    description: 'Classified content should feel quick to scan, practical, and action-oriented with less editorial decoration.',
    filterLabel: 'Filter classified category',
    secondaryNote: 'Prioritize urgency, short summaries, and direct browsing.',
    chips: ['Fast scan', 'Offers', 'Action cues'],
  },
  sbm: {
    eyebrow: 'Saved resources',
    headline: 'Social bookmarks arranged like curated collections.',
    description: 'Bookmark pages should feel like shelves of useful resources, tools, references, and collections.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated resources need grouping and calm metadata.',
    chips: ['Collections', 'Resources', 'Reference flow'],
  },
  profile: {
    eyebrow: 'People and profiles',
    headline: 'Profiles with identity, trust, and reputation cues.',
    description: 'Profile pages should make people, brands, and entities feel discoverable rather than buried in a generic feed.',
    filterLabel: 'Filter profile category',
    secondaryNote: 'Make identity and credibility visible before the grid begins.',
    chips: ['Identity first', 'Trust cues', 'Creator/business cards'],
  },
  pdf: {
    eyebrow: 'Document library',
    headline: 'PDFs and documents presented as a useful library.',
    description: 'PDF pages should feel like downloadable guides, reports, files, and reference material instead of normal articles.',
    filterLabel: 'Filter document type',
    secondaryNote: 'Document surfaces need archive cues, file context, and clear browsing.',
    chips: ['Documents', 'Guides', 'Archive ready'],
  },
  listing: {
    eyebrow: 'The Directory',
    headline: 'Trusted businesses, curated for real people making real decisions.',
    description: 'Discover verified businesses with clear contact details, ratings, and everything you need to reach out with confidence.',
    filterLabel: 'Choose a category',
    secondaryNote: 'Verified · Rated · Reachable',
    chips: ['Verified', 'Local', 'Rated', 'Contact-ready'],
  },
  image: {
    eyebrow: 'Visual gallery',
    headline: 'Image posts with a gallery-first browsing experience.',
    description: 'Image pages should lead with visual impact, stronger cards, and a portfolio-like rhythm.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let images carry the page before long text does.',
    chips: ['Gallery', 'Visual-first', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
