'use client'

import { useMemo, useState } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { Info, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/panelo/ui/button'
import { Card } from '@/components/panelo/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/panelo/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/panelo/ui/tooltip'
import { cn } from '@/components/panelo/lib/utils'

import { AXIS_MAX, ROWS, buildColumns, colsPerGroupFor, defaultIndexByPeriod, periods, seriesByPeriod, yTicks, type Period } from './sales-data'

function LegendDot({ tone }: { tone: 'light' | 'dark' }) {
    return <span className={cn('size-2 rounded-full', tone === 'dark' ? 'bg-foreground' : 'bg-muted-foreground/50')} aria-hidden />
}

export function SalesChart() {
    const [period, setPeriod] = useState<Period>('monthly')
    const [activeIndex, setActiveIndex] = useState<number>(defaultIndexByPeriod.monthly)

    const series = seriesByPeriod[period]
    const colsPerGroup = colsPerGroupFor(series.length)
    const columns = useMemo(() => buildColumns(series, colsPerGroup), [series, colsPerGroup])

    const active = series[activeIndex] ?? series[0]
    const activeLabel = active?.label
    // Horizontal centre of the active group, as a percentage of the plot width.
    const activeX = ((activeIndex + 0.5) / series.length) * 100
    // Vertical position of the marker (New User value) from the top.
    const markerTop = (1 - Math.min(active.newUser, AXIS_MAX) / AXIS_MAX) * 100
    // Flip the tooltip to the left for the trailing groups so it never clips.
    const tooltipLeft = activeIndex >= series.length - 3

    function changePeriod(next: Period) {
        setPeriod(next)
        setActiveIndex(defaultIndexByPeriod[next])
    }

    return (
        <Card className="gap-0 rounded-2xl border-border/70 p-4 shadow-xs sm:p-6">
            {/* Header: total, legend, period toggle */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">Total Revenue :</span>
                    <span className="font-mono text-2xl font-bold tracking-wide text-foreground">$20,320</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-[0.12em]">
                        <span className="flex items-center gap-2 text-foreground">
                            <LegendDot tone="light" /> New User
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <LegendDot tone="dark" /> Existing User
                        </span>
                    </div>

                    <ToggleGroup
                        type="single"
                        aria-label="Chart period"
                        value={period}
                        onValueChange={(value) => {
                            if (value) changePeriod(value as Period)
                        }}
                        className="gap-1 rounded-full bg-muted p-1">
                        {periods.map((item) => (
                            <ToggleGroupItem
                                key={item}
                                value={item}
                                aria-label={`${item} view`}
                                className="h-auto rounded-full border-0 bg-transparent px-5 py-2 text-sm font-medium capitalize text-muted-foreground transition-all duration-200 hover:text-foreground data-pressed:bg-background data-pressed:font-semibold data-pressed:text-foreground data-pressed:shadow">
                                {item}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </div>

            {/* Plot */}
            <div className="mt-6 flex gap-3">
                {/* Y axis */}
                <div className="relative w-9 shrink-0 text-right font-mono text-[11px] text-muted-foreground sm:w-11">
                    <div className="relative h-[260px] sm:h-[340px] lg:h-[420px]">
                        {yTicks.map((tick) => (
                            <div
                                key={tick}
                                className="absolute right-0 flex -translate-y-1/2 items-center gap-1"
                                style={{ top: `${(1 - tick / AXIS_MAX) * 100}%` }}>
                                <span>{tick}k</span>
                                <span
                                    aria-hidden
                                    className="block w-1.5 border-b border-dotted border-muted-foreground/40"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mosaic + overlays */}
                <div className="min-w-0 flex-1 overflow-x-auto">
                    <div className="min-w-[520px]">
                        <div className="relative h-[260px] sm:h-[340px] lg:h-[420px]">
                            {/* Pixel grid */}
                            <div className="flex h-full gap-[2px]">
                                {columns.map((col, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-1 flex-col-reverse gap-[2px]">
                                        {Array.from({ length: ROWS }).map((_, row) => {
                                            const isDark = row < col.dark
                                            const isLight = !isDark && row < col.dark + col.light
                                            return (
                                                <div
                                                    key={row}
                                                    className={cn('flex-1 rounded-[1px] transition-colors duration-300', isDark ? 'bg-foreground' : isLight ? 'bg-foreground/15' : 'bg-foreground/[0.05]')}
                                                />
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Active guide line + marker (glide between groups) */}
                            <div className="pointer-events-none absolute inset-0">
                                <div
                                    className="absolute top-0 h-full border-l border-dashed border-foreground/40 transition-all duration-300 ease-out"
                                    style={{ left: `${activeX}%` }}
                                />
                                <div
                                    className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground transition-all duration-300 ease-out"
                                    style={{ left: `${activeX}%`, top: `${markerTop}%` }}
                                />

                                {/* Floating data tooltip */}
                                <div
                                    className={cn(
                                        'absolute w-44 -translate-y-1/2 rounded-xl border border-border/70 bg-popover/95 p-3 text-popover-foreground shadow-lg backdrop-blur transition-all duration-300 ease-out',
                                        tooltipLeft ? '-translate-x-[calc(100%+12px)]' : 'translate-x-3'
                                    )}
                                    style={{ left: `${activeX}%`, top: `${Math.max(markerTop, 14)}%` }}>
                                    <p className="text-sm font-semibold">{active.fullLabel}</p>
                                    <div className="mt-2 space-y-1.5 text-sm">
                                        <div className="flex items-center gap-2">
                                            <LegendDot tone="light" />
                                            <span className="text-muted-foreground">New User</span>
                                            <span className="ml-auto font-semibold">{active.newUser}k</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LegendDot tone="dark" />
                                            <span className="text-muted-foreground">Existing User</span>
                                            <span className="ml-auto font-semibold">{active.existingUser}k</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover hit-zones (one per group) */}
                            <div className="absolute inset-0 flex">
                                {series.map((point, index) => (
                                    <BareButton
                                        key={point.label}
                                        type="button"
                                        aria-label={`${point.fullLabel}: ${point.newUser}k new users, ${point.existingUser}k existing users`}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onFocus={() => setActiveIndex(index)}
                                        className="h-full flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* X axis */}
                        <div className="relative mt-3 h-5 font-mono text-xs">
                            {series.map((point, index) => (
                                <span
                                    key={point.label}
                                    className={cn('-translate-x-1/2 absolute top-0 transition-colors duration-200', activeLabel === point.label ? 'font-bold text-foreground' : 'text-muted-foreground')}
                                    style={{ left: `${((index + 0.5) / series.length) * 100}%` }}>
                                    {point.label}
                                </span>
                            ))}
                            {series.slice(1).map((point, index) => (
                                <span
                                    key={`dot-${point.label}`}
                                    aria-hidden
                                    className="-translate-x-1/2 absolute top-0 text-muted-foreground/50"
                                    style={{ left: `${((index + 1) / series.length) * 100}%` }}>
                                    ·
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export function SalesTrendPanel() {
    return (
        <section
            aria-label="Sales trend"
            className="rounded-2xl bg-muted pt-2 sm:pt-3 p-1 sm:p-2 backdrop-blur-[2px]">
            <div className="flex items-center justify-between px-2 py-2 sm:px-3">
                <div className="flex items-center gap-2">
                    <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sales Trend</h2>
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    aria-label="About the sales trend"
                                    className="rounded-full text-muted-foreground/60 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <Info className="size-3.5" aria-hidden />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Monthly revenue split by new vs. existing users.</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Sales trend options"
                            className="size-8 rounded-full bg-card">
                            <MoreHorizontal className="size-4" aria-hidden />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Export CSV</DropdownMenuItem>
                        <DropdownMenuItem>Refresh data</DropdownMenuItem>
                        <DropdownMenuItem>View full report</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <SalesChart />
        </section>
    )
}
