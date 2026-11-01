export type MomentKind = 'hero-ui' | 'component' | 'stat'

export type MomentDefinition = {
  id: string
  title: string
  span: '2x1' | '1x1'
  kind: MomentKind
  /** Copy outside the picture (page type). */
  headline: string
  support?: string
  /** Real strings inside the faux UI (3–7). */
  realStrings: readonly string[]
  /** Poster frame for reduced motion / thumbnails. */
  poster: 'before' | 'after'
}

export const MOMENTS: MomentDefinition[] = [
  {
    id: 'wavelet',
    title: 'Wavelet',
    span: '2x1',
    kind: 'hero-ui',
    headline: 'Press play',
    support: 'One tap turns a paused track into motion.',
    realStrings: ['Wavelet', 'Midnight Drive', 'Maya Chen', 'Paused', 'Playing'],
    poster: 'after',
  },
  {
    id: 'dayline',
    title: 'Dayline',
    span: '1x1',
    kind: 'component',
    headline: 'Accept invite',
    support: 'The event settles into your week.',
    realStrings: ['Dayline', 'Design review', 'Thu 2:00', 'Accept', 'Accepted'],
    poster: 'after',
  },
  {
    id: 'tallypay',
    title: 'Tallypay',
    span: '1x1',
    kind: 'component',
    headline: 'Pay & receipt',
    support: 'Amount counts up; receipt straddles the edge.',
    realStrings: ['Tallypay', 'Harbor Café', '$14.50', 'Pay', 'Paid'],
    poster: 'after',
  },
  {
    id: 'natter',
    title: 'Natter',
    span: '1x1',
    kind: 'component',
    headline: 'Reply lands',
    support: 'Delivered tick and one reaction.',
    realStrings: ['Natter', 'Sam Rivera', 'On my way', 'Delivered', '👍'],
    poster: 'after',
  },
  {
    id: 'stat',
    title: 'Checkout speed',
    span: '1x1',
    kind: 'stat',
    headline: 'Measured calm',
    support: 'Fictional metric for the grid.',
    realStrings: ['Up to', '2.1 s', 'median checkout'],
    poster: 'after',
  },
]

export function countRealStrings(moment: MomentDefinition): number {
  return moment.realStrings.length
}

export function validateMomentRegistry(moments: MomentDefinition[]): string[] {
  const errors: string[] = []
  for (const m of moments) {
    const n = countRealStrings(m)
    if (n < 3 || n > 7) errors.push(`${m.id}: real string count ${n}`)
    if (m.poster !== 'before' && m.poster !== 'after') {
      errors.push(`${m.id}: invalid poster`)
    }
  }
  return errors
}
