/* Marketing trends: three seeded series for the trends chart (shared with dashboard-pages-12). */

export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Every panel on the page: one surface, one hairline, one radius. */
export const card = 'rounded-xl border border-border/70 bg-card shadow-xs'

/**
 * Seeded mean-reverting walk, normalised into the -10%..10% band so the three
 * series stay tangled instead of drifting apart. Deterministic, so SSR and the
 * client draw the same path.
 */
function walk(seed: number, points: number, span: number, end: number) {
    let h = seed
    let v = 0
    const out: number[] = []
    for (let i = 0; i < points; i++) {
        h = (Math.imul(h, 1664525) + 1013904223) >>> 0
        v = v * 0.965 + ((h / 0xffffffff) * 2 - 1) * 1.4
        out.push(v)
    }
    const peak = Math.max(...out.map(Math.abs)) || 1
    const scaled = out.map((n) => (n / peak) * span)
    // Ease the tail toward `end` so today's values land where the KPIs say.
    const tail = 12
    for (let i = points - tail; i < points; i++) {
        const t = (i - (points - tail) + 1) / tail
        scaled[i] = scaled[i] * (1 - t ** 2) + end * t ** 2
    }
    return scaled
}

/** One point per day, May 2 → Aug 5 (today). */
export const POINTS = 96
export const TREND_START = Date.UTC(2025, 4, 2)

export interface TrendSeries {
    key: string
    label: string
    /** Series colour rides on `currentColor`, so both themes work for free. */
    tone: string
    data: number[]
}

export const trendSeries: TrendSeries[] = [
    { key: 'traffic', label: 'Traffic', tone: 'text-chart-1', data: walk(7, POINTS, 8.2, 4.8) },
    { key: 'roi', label: 'ROI', tone: 'text-chart-2', data: walk(23, POINTS, 7.4, 2.4) },
    { key: 'conv', label: 'Conversions', tone: 'text-chart-3', data: walk(91, POINTS, 6.6, 8.6) },
]

/** Fixed axis domain — the chart labels 10% down to -10%. */
export const TREND_DOMAIN = 11
