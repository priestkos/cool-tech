// Demo data for the Overview dashboard page (dashboard-pages/three).
// All values are deterministic so the pixel chart renders identically on the
// server and client (no hydration mismatch, no Math.random).

export type Period = 'weekly' | 'monthly' | 'yearly'

export interface SeriesPoint {
    /** Short axis label, e.g. "JAN". */
    label: string
    /** Tooltip header, e.g. "Jun 2025". */
    fullLabel: string
    /** New users for the period, in thousands (rendered as the light series). */
    newUser: number
    /** Existing users for the period, in thousands (rendered as the dark series). */
    existingUser: number
}

export const periods: Period[] = ['weekly', 'monthly', 'yearly']

export const monthlySeries: SeriesPoint[] = [
    { label: 'JAN', fullLabel: 'Jan 2025', newUser: 8, existingUser: 4 },
    { label: 'FEB', fullLabel: 'Feb 2025', newUser: 20, existingUser: 13 },
    { label: 'MAR', fullLabel: 'Mar 2025', newUser: 14, existingUser: 7 },
    { label: 'APR', fullLabel: 'Apr 2025', newUser: 55, existingUser: 9 },
    { label: 'MAY', fullLabel: 'May 2025', newUser: 30, existingUser: 17 },
    { label: 'JUN', fullLabel: 'Jun 2025', newUser: 38, existingUser: 18 },
    { label: 'JUL', fullLabel: 'Jul 2025', newUser: 24, existingUser: 16 },
    { label: 'AUG', fullLabel: 'Aug 2025', newUser: 12, existingUser: 6 },
    { label: 'SEP', fullLabel: 'Sep 2025', newUser: 22, existingUser: 11 },
    { label: 'OCT', fullLabel: 'Oct 2025', newUser: 48, existingUser: 17 },
    { label: 'NOV', fullLabel: 'Nov 2025', newUser: 16, existingUser: 8 },
    { label: 'DEC', fullLabel: 'Dec 2025', newUser: 20, existingUser: 13 },
]

export const weeklySeries: SeriesPoint[] = [
    { label: 'W1', fullLabel: 'Week 1', newUser: 12, existingUser: 6 },
    { label: 'W2', fullLabel: 'Week 2', newUser: 26, existingUser: 14 },
    { label: 'W3', fullLabel: 'Week 3', newUser: 44, existingUser: 11 },
    { label: 'W4', fullLabel: 'Week 4', newUser: 31, existingUser: 18 },
    { label: 'W5', fullLabel: 'Week 5', newUser: 19, existingUser: 9 },
    { label: 'W6', fullLabel: 'Week 6', newUser: 52, existingUser: 16 },
    { label: 'W7', fullLabel: 'Week 7', newUser: 28, existingUser: 13 },
    { label: 'W8', fullLabel: 'Week 8', newUser: 36, existingUser: 17 },
]

export const yearlySeries: SeriesPoint[] = [
    { label: '2019', fullLabel: 'Year 2019', newUser: 22, existingUser: 12 },
    { label: '2020', fullLabel: 'Year 2020', newUser: 34, existingUser: 19 },
    { label: '2021', fullLabel: 'Year 2021', newUser: 48, existingUser: 24 },
    { label: '2022', fullLabel: 'Year 2022', newUser: 41, existingUser: 28 },
    { label: '2023', fullLabel: 'Year 2023', newUser: 56, existingUser: 33 },
    { label: '2024', fullLabel: 'Year 2024', newUser: 50, existingUser: 37 },
    { label: '2025', fullLabel: 'Year 2025', newUser: 38, existingUser: 18 },
]

export const seriesByPeriod: Record<Period, SeriesPoint[]> = {
    weekly: weeklySeries,
    monthly: monthlySeries,
    yearly: yearlySeries,
}

/** Default highlighted point per period (Jun for monthly, to match the design). */
export const defaultIndexByPeriod: Record<Period, number> = {
    weekly: 5,
    monthly: 5,
    yearly: 6,
}

// --- Pixel-chart geometry -------------------------------------------------

/** Number of square rows in the plot. */
export const ROWS = 30
/** Thousands represented by a single row (ROWS * UNIT = axis max). */
export const UNIT = 2
/** Axis maximum, in thousands. */
export const AXIS_MAX = ROWS * UNIT // 60 (k)
/** Y-axis tick values, top to bottom. */
export const yTicks = [60, 50, 40, 30, 20, 10, 0]

export interface PixelColumn {
    groupIndex: number
    /** Dark (existing user) square count, from the bottom. */
    dark: number
    /** Light (new user) square count, stacked above the dark squares. */
    light: number
}

/**
 * Expand a series into per-column pixel heights. Each point becomes
 * `colsPerGroup` columns whose heights follow a soft bell so every group reads
 * as a little mountain with valleys between groups — matching the reference.
 */
export function buildColumns(series: SeriesPoint[], colsPerGroup: number): PixelColumn[] {
    const columns: PixelColumn[] = []
    const center = (colsPerGroup - 1) / 2

    series.forEach((point, groupIndex) => {
        for (let j = 0; j < colsPerGroup; j++) {
            const t = 1 - Math.abs(j - center) / (center + 0.6)
            const weight = 0.35 + 0.65 * t
            const dark = Math.round((point.existingUser * weight) / UNIT)
            let light = Math.round((point.newUser * weight) / UNIT)
            // Never overflow the plot height.
            light = Math.min(light, ROWS - dark)
            columns.push({ groupIndex, dark: Math.max(0, dark), light: Math.max(0, light) })
        }
    })

    return columns
}

/** Columns rendered per group, tuned so total width stays ~constant per period. */
export function colsPerGroupFor(length: number): number {
    return Math.max(3, Math.round(72 / length))
}
