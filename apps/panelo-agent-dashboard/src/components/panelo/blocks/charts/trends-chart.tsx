'use client'

import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { cn } from '@/components/panelo/lib/utils'

import { card, focusRing, POINTS, TREND_DOMAIN, TREND_START, trendSeries } from './trends-data'

const W = 960
const H = 200
const DAY = 86_400_000
const ranges = [
    { value: '1M', label: 'Last month', days: 31 },
    { value: '2M', label: 'Last 2 months', days: 62 },
    { value: '3M', label: 'Last 3 months', days: POINTS },
]
const gridLines = [10, 5, 0, -5, -10]

// UTC on both sides of hydration, so the server and the client print the same date.
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
const dateOf = (point: number) => new Date(TREND_START + point * DAY)

const y = (v: number) => H / 2 - (v / TREND_DOMAIN) * (H / 2)
const signed = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`

/**
 * Three tangled percentage series over a fixed -10%..10% band. The legend is
 * the readout: it reports each series at the crosshair, which rests on today
 * and follows the pointer (arrow keys, Home and End nudge it). Month gridlines
 * fall on real 1sts, so the axis can't drift from the dates it prints.
 */
export function TrendsChart({ className }: { className?: string }) {
    const plot = useRef<HTMLDivElement>(null)
    const [range, setRange] = useState('3M')
    const [hover, setHover] = useState<number | null>(null)

    const days = ranges.find((r) => r.value === range)?.days ?? POINTS
    const first = POINTS - days
    const last = days - 1
    const clamp = (i: number) => Math.min(last, Math.max(0, i))
    const index = clamp(hover ?? last)
    const point = first + index
    const left = (i: number) => (i / last) * 100
    const ticks = Array.from({ length: days }, (_, i) => i).filter((i) => dateOf(first + i).getUTCDate() === 1)
    const date = dayFormat.format(dateOf(point))

    const track = (clientX: number) => {
        const box = plot.current?.getBoundingClientRect()
        if (box) setHover(clamp(Math.round(((clientX - box.left) / box.width) * last)))
    }

    const onKeyDown = (event: React.KeyboardEvent) => {
        const next = ({ ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last } as Record<string, number>)[event.key]
        if (next === undefined) return
        event.preventDefault()
        setHover(clamp(next))
    }

    return (
        <section aria-labelledby="trends-heading" className={cn(card, '@container flex flex-col p-4 sm:p-5', className)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 id="trends-heading" className="text-base font-semibold tracking-tight">
                        Trends
                    </h2>
                    <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                        Change vs. prior period · <time className="font-medium tabular-nums text-foreground">{date}</time>
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className={cn(
                            'flex h-8 shrink-0 items-center gap-1 rounded-lg border border-border/70 bg-card px-2.5 text-[13px] font-medium shadow-xs transition-colors duration-150 hover:bg-muted',
                            focusRing,
                        )}
                    >
                        <span className="sr-only">Range: </span>
                        {range}
                        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuRadioGroup value={range} onValueChange={(next) => setRange(String(next))}>
                            {ranges.map((r) => (
                                <DropdownMenuRadioItem key={r.value} value={r.value}>
                                    {r.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
                {trendSeries.map((s) => (
                    <li key={s.key} className="flex items-center gap-2">
                        <span className={cn('size-2 rounded-full bg-current', s.tone)} aria-hidden="true" />
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="w-12 font-semibold tabular-nums">{signed(s.data[point])}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex min-h-40 flex-1 gap-2 @3xl:min-h-52">
                <div
                    ref={plot}
                    // The crosshair is a value on the time axis, so the plot behaves as a
                    // slider: pointer drags it, arrow keys nudge it, screen readers read it.
                    role="slider"
                    tabIndex={0}
                    aria-label="Trends crosshair"
                    aria-orientation="horizontal"
                    aria-valuemin={0}
                    aria-valuemax={last}
                    aria-valuenow={index}
                    aria-valuetext={`${date}: ${trendSeries.map((s) => `${s.label} ${signed(s.data[point])}`).join(', ')}`}
                    onPointerDown={(event) => track(event.clientX)}
                    onPointerMove={(event) => track(event.clientX)}
                    onPointerLeave={() => setHover(null)}
                    onBlur={() => setHover(null)}
                    onKeyDown={onKeyDown}
                    // pan-y: a vertical swipe still scrolls the page, a horizontal one scrubs.
                    className={cn('relative min-w-0 flex-1 cursor-crosshair touch-pan-y rounded-sm', focusRing, 'focus-visible:ring-offset-4 focus-visible:ring-offset-card')}
                >
                    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
                        {gridLines.map((v) => (
                            <line
                                key={v}
                                x1={0}
                                x2={W}
                                y1={y(v)}
                                y2={y(v)}
                                className={v === 0 ? 'text-border' : 'text-border/70'}
                                stroke="currentColor"
                                strokeDasharray={v === 0 ? undefined : '2 4'}
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                        {ticks.map((i) => (
                            <line key={i} x1={(left(i) / 100) * W} x2={(left(i) / 100) * W} y1={0} y2={H} className="text-border/70" stroke="currentColor" vectorEffect="non-scaling-stroke" />
                        ))}
                        {trendSeries.map((s) => (
                            <path
                                key={s.key}
                                className={s.tone}
                                d={s.data
                                    .slice(first)
                                    .map((v, i) => `${i ? 'L' : 'M'}${((i / last) * W).toFixed(1)} ${y(v).toFixed(1)}`)
                                    .join(' ')}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.75}
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                        {hover !== null && (
                            <line
                                x1={(left(index) / 100) * W}
                                x2={(left(index) / 100) * W}
                                y1={0}
                                y2={H}
                                className="text-foreground/30"
                                stroke="currentColor"
                                strokeDasharray="3 3"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}
                    </svg>

                    {/* HTML markers stay circular under the plot's non-uniform scale. */}
                    {trendSeries.map((s) => (
                        <span
                            key={s.key}
                            aria-hidden="true"
                            className={cn('absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-current bg-card', s.tone)}
                            style={{ left: `${left(index)}%`, top: `${(y(s.data[point]) / H) * 100}%` }}
                        />
                    ))}
                </div>

                <div aria-hidden="true" className="relative w-8 shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {gridLines.map((v) => (
                        <span key={v} className="absolute end-0 -translate-y-1/2" style={{ top: `${(y(v) / H) * 100}%` }}>
                            {v}%
                        </span>
                    ))}
                </div>
            </div>

            <div aria-hidden="true" className="relative mr-10 mt-2 h-4 text-[11px] text-muted-foreground">
                {ticks.map((i) => (
                    <span key={i} className="absolute -translate-x-1/2" style={{ left: `${left(i)}%` }}>
                        {monthFormat.format(dateOf(first + i))}
                    </span>
                ))}
            </div>
        </section>
    )
}
