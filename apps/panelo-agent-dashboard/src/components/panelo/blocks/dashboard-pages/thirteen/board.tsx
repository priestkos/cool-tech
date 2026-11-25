'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CalendarDays, Check, CircleCheck, ChevronRight, Info, MessageCircle, Send } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/panelo/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/panelo/ui/popover'
import { cn } from '@/components/panelo/lib/utils'

import { type Caregiver, clock, clockFull, DAY_END, DAY_START, focusRing, hourLabel, initials, STATUS, type Status, type Visit } from './data'

/* -------------------------------------------------------------------------- */
/*  The dispatch board. A row is a caregiver (or a client); its visits sit on   */
/*  a 7 AM → 7 PM track by time, linked by dotted drive times. The black line   */
/*  is now. Rows scroll sideways under a sticky name column on small screens.  */
/* -------------------------------------------------------------------------- */

const SPAN = DAY_END - DAY_START
const pct = (minutes: number) => `${((minutes - DAY_START) / SPAN) * 100}%`
const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => DAY_START / 60 + i)

export type BoardRow = {
    key: string
    title: string
    subtitle: ReactNode
    avatar?: string
    /** A called-out caregiver: the row greys out and the track shows why. */
    notice?: string
    visits: Visit[]
}

/** Swatch and block styles per status; the legend and the blocks share them. */
const BLOCK: Record<Status, string> = {
    completed: 'bg-(--well) text-foreground/85 [--time:var(--color-muted-foreground)]',
    confirmed: 'bg-card text-foreground ring-1 ring-inset ring-(--line-strong) [--time:var(--color-muted-foreground)]',
    'in-progress': 'bg-foreground text-background [--time:color-mix(in_oklab,var(--color-background)_70%,transparent)]',
    missed: 'border border-dashed border-destructive/55 bg-destructive/[0.07] text-destructive [--time:var(--color-destructive)]',
    'at-risk': 'bg-tone-orange-bg text-tone-orange-fg ring-1 ring-inset ring-tone-orange-border [--time:var(--color-tone-orange-fg)]',
}
const SWATCH: Record<Status, string> = {
    confirmed: 'bg-card ring-1 ring-inset ring-(--line-strong)',
    'in-progress': 'bg-foreground',
    completed: 'bg-(--well)',
    missed: 'bg-destructive/[0.07] ring-1 ring-inset ring-destructive/60',
    'at-risk': 'bg-tone-orange-bg ring-1 ring-inset ring-tone-orange-border',
}

type BoardProps = {
    title: string
    columnLabel: string
    rows: BoardRow[]
    summary: { title: string; detail: string; banner: string; ok: boolean }
    now: number | null
    caregiverOf: (id: string) => Caregiver | undefined
    labelOf: (visit: Visit) => string
    selected: string | null
    onSelect: (id: string | null) => void
    flash: string | null
    footer: ReactNode
}

export function Board({ title, columnLabel, rows, summary, now, caregiverOf, labelOf, selected, onSelect, flash, footer }: BoardProps) {
    const scroller = useRef<HTMLDivElement>(null)

    // A new or flashed visit scrolls into view inside the board, not the page.
    useEffect(() => {
        if (!flash) return
        scroller.current?.querySelector<HTMLElement>(`[data-visit="${flash}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }, [flash])

    return (
        <section aria-label={title} className="rounded-[14px] bg-(--board) p-1 ring-1 ring-(--line)">
            <header className="flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-2.5 py-2">
                <h2 className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {title}
                </h2>
                <Legend />
            </header>

            <div ref={scroller} className="overflow-x-auto rounded-[10px] bg-card ring-1 ring-(--line) [scrollbar-width:thin]">
                <div role="table" aria-label={`${title}, visits by time`} className="min-w-[1040px] md:min-w-[1110px]">
                    {/* Time axis */}
                    <div role="row" className="grid h-[30px] grid-cols-(--board-cols) border-b border-(--line)">
                        <div role="columnheader" className="sticky start-0 z-40 flex min-w-0 items-center border-e border-(--line) bg-(--rail) px-3.5 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
                            <span className="truncate">{columnLabel}</span>
                        </div>
                        <div role="columnheader" className="relative font-mono text-[10.5px] tracking-[0.04em] text-muted-foreground uppercase">
                            <span className="sr-only">Time of day</span>
                            {HOURS.map((h) => (
                                <span key={h} aria-hidden className="absolute top-1/2 -translate-y-1/2 ps-1.5" style={{ left: pct(h * 60) }}>
                                    {hourLabel(h)}
                                </span>
                            ))}
                            {now !== null ? (
                                <span className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-[5px] bg-foreground px-1.5 py-0.5 text-[10.5px] font-semibold tracking-normal text-background tabular-nums" style={{ left: pct(now) }}>
                                    <span className="sr-only">Now, </span>
                                    {clock(now)}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Coverage */}
                    <div role="row" className="grid h-16 grid-cols-(--board-cols) border-b border-(--line)">
                        <div role="cell" className="sticky start-0 z-40 flex items-center gap-2.5 border-e border-(--line) bg-(--rail) px-3.5">
                            <span className={cn('grid size-8 shrink-0 place-items-center rounded-[8px]', summary.ok ? 'bg-tone-green-bg text-tone-green-fg' : 'bg-tone-orange-bg text-tone-orange-fg')}>
                                <CircleCheck className="size-4" aria-hidden />
                            </span>
                            <span className="min-w-0">
                                <span className={cn('block text-[13.5px] leading-[18px] font-medium', summary.ok ? 'text-tone-green-fg' : 'text-tone-orange-fg')}>{summary.title}</span>
                                <span className="block font-mono text-[11px] leading-4 text-muted-foreground">{summary.detail}</span>
                            </span>
                        </div>
                        <div role="cell" className="relative">
                            <Track now={now} />
                            <Banner icon={<Check className="size-3.5 shrink-0" aria-hidden />}>{summary.banner}</Banner>
                        </div>
                    </div>

                    {rows.map((row) => (
                        <div key={row.key} role="row" className="grid h-14 grid-cols-(--board-cols) border-b border-(--line) last:border-b-0">
                            <div role="rowheader" className="sticky start-0 z-40 flex min-w-0 items-center gap-2.5 border-e border-(--line) bg-(--rail) px-3.5">
                                <Avatar className={cn('size-[30px] shrink-0', row.notice && 'opacity-60 grayscale')}>
                                    {row.avatar ? <AvatarImage src={row.avatar} alt="" /> : null}
                                    <AvatarFallback className="text-[11px]">{initials(row.title)}</AvatarFallback>
                                </Avatar>
                                <span className="min-w-0">
                                    <span className={cn('block truncate text-[13.5px] leading-[18px] font-medium', row.notice && 'text-muted-foreground')}>{row.title}</span>
                                    <span className="block truncate font-mono text-[11px] leading-4 text-muted-foreground">{row.subtitle}</span>
                                </span>
                            </div>
                            <div role="cell" className="relative">
                                <Track now={now} />
                                {row.notice ? (
                                    <Banner icon={<Info className="size-3.5 shrink-0" aria-hidden />}>{row.notice}</Banner>
                                ) : (
                                    row.visits.map((visit, i) => (
                                        <Block
                                            key={visit.id}
                                            visit={visit}
                                            previous={row.visits[i - 1]}
                                            label={labelOf(visit)}
                                            caregiver={caregiverOf(visit.caregiver)}
                                            open={selected === visit.id}
                                            flash={flash === visit.id}
                                            onOpenChange={(open) => onSelect(open ? visit.id : null)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="flex min-h-[30px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
                {footer}
                <span>Dotted links are travel time between visits</span>
            </footer>
        </section>
    )
}

/** Hour lines and the now line, behind a row's visits. */
function Track({ now }: { now: number | null }) {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0">
            {HOURS.slice(1).map((h) => (
                <span key={h} className="absolute inset-y-0 w-px bg-[linear-gradient(to_bottom,var(--line)_55%,transparent_0)] bg-size-[1px_5px]" style={{ left: pct(h * 60) }} />
            ))}
            {now !== null ? <span className="absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-foreground" style={{ left: pct(now) }} /> : null}
        </div>
    )
}

function Banner({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <p className="absolute inset-x-2 inset-y-2.5 z-10 flex items-center gap-2 truncate rounded-[8px] border border-dashed border-(--line-strong) bg-card/80 px-3 text-[12.5px] text-muted-foreground">
            {icon}
            <span className="truncate">{children}</span>
        </p>
    )
}

function Legend() {
    return (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
            {(['confirmed', 'in-progress', 'completed', 'missed', 'at-risk'] as const).map((s) => (
                <li key={s} className="flex items-center gap-1.5">
                    <span aria-hidden className={cn('size-2.5 rounded-[2px]', SWATCH[s])} />
                    {STATUS[s].label}
                </li>
            ))}
        </ul>
    )
}

/* ---------------------------------- Visit ---------------------------------- */

type BlockProps = { visit: Visit; previous?: Visit; label: string; caregiver?: Caregiver; open: boolean; flash: boolean; onOpenChange: (open: boolean) => void }

function Block({ visit, previous, label, caregiver, open, flash, onOpenChange }: BlockProps) {
    const minutes = visit.end - visit.start
    // Under ~75 minutes the range doesn't fit, so the block keeps the start time only.
    const short = minutes < 75
    const time = short ? clock(visit.start) : `${clock(visit.start)} - ${clock(visit.end)}`

    return (
        <>
            {visit.drive && previous ? (
                <span aria-hidden className="absolute top-1/2 flex -translate-y-1/2 items-center justify-center px-1" style={{ left: pct(previous.end), width: `calc(${pct(visit.start)} - ${pct(previous.end)})` }}>
                    <span className="absolute inset-x-1.5 top-1/2 border-t-[1.5px] border-dotted border-(--line-strong)" />
                    <span className="relative bg-card px-1 font-mono text-[10.5px] text-muted-foreground">{visit.drive}m</span>
                </span>
            ) : null}
            {/* On a phone the card slides up as a sheet instead of hanging off the edge. */}
            <Popover open={open} onOpenChange={onOpenChange} presentation="auto">
                <PopoverTrigger
                    data-visit={visit.id}
                    aria-label={`${visit.clientFull}, ${clockFull(visit.start)} to ${clockFull(visit.end)}, ${STATUS[visit.status].label}`}
                    className={cn(
                        'absolute top-[9px] bottom-[9px] z-10 flex min-w-0 cursor-pointer flex-col justify-center overflow-hidden rounded-[7px] px-2 text-start transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-sm',
                        BLOCK[visit.status],
                        open && 'z-30 ring-2 ring-foreground ring-offset-0 ring-inset',
                        flash && 'ring-2 ring-tone-green-solid ring-inset',
                        focusRing
                    )}
                    style={{ left: `calc(${pct(visit.start)} + 2px)`, width: `calc(${pct(visit.end)} - ${pct(visit.start)} - 4px)` } as CSSProperties}>
                    <span className="truncate text-[12.5px] leading-4 font-medium">{label}</span>
                    <span className="truncate font-mono text-[11px] leading-4 text-(--time)">{time}</span>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="center" sideOffset={8} className="w-[338px] max-w-[calc(100vw-24px)] rounded-[14px] p-3.5 shadow-xl">
                    <VisitCard visit={visit} caregiver={caregiver} />
                </PopoverContent>
            </Popover>
        </>
    )
}

const PILL: Record<Status, string> = {
    completed: 'bg-tone-green-solid',
    confirmed: 'bg-muted-foreground/50',
    'in-progress': 'bg-tone-blue-solid',
    missed: 'bg-destructive',
    'at-risk': 'bg-tone-orange-solid',
}

function VisitCard({ visit, caregiver }: { visit: Visit; caregiver?: Caregiver }) {
    const [composing, setComposing] = useState(false)
    const [draft, setDraft] = useState('')
    const [sent, setSent] = useState<string | null>(null)
    const first = caregiver?.name.split(' ')[0] ?? 'the caregiver'

    const evvOk = visit.evv?.startsWith('Verified') || visit.evv?.startsWith('Clocked in')
    const rows: [string, ReactNode][] = [
        ['Time', `${clockFull(visit.start)} to ${clockFull(visit.end)}`],
        [
            'Caregiver',
            <span key="c" className="flex items-center gap-1.5">
                <Avatar className="size-5">
                    {caregiver?.avatar ? <AvatarImage src={caregiver.avatar} alt="" /> : null}
                    <AvatarFallback className="text-[9px]">{initials(caregiver?.name ?? '?')}</AvatarFallback>
                </Avatar>
                {caregiver?.name}
            </span>,
        ],
        [
            'EVV',
            <span key="e" className="flex items-center gap-1.5">
                {evvOk ? <Check className="size-3.5 text-tone-green-fg" aria-hidden /> : null}
                {visit.evv ?? 'Not yet due'}
            </span>,
        ],
    ]
    if (visit.note) {
        rows.push([
            'Note',
            <span key="n" className="flex items-center gap-1.5">
                <span aria-hidden className="size-1.5 rounded-full bg-tone-orange-solid" />
                {visit.note}
            </span>,
        ])
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-start gap-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-[9px] bg-(--well) text-[13px] font-semibold text-foreground/70">{initials(visit.clientFull)}</span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] leading-5 font-semibold">{visit.clientFull}</p>
                    <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">
                        {visit.service} · {visit.area}
                    </p>
                </div>
                <span className="mt-0.5 flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium ring-1 ring-(--line)">
                    <span aria-hidden className={cn('size-1.5 rounded-full', PILL[visit.status])} />
                    {STATUS[visit.status].label}
                </span>
            </div>

            <dl className="mt-3 rounded-[10px] bg-(--board) px-3 ring-1 ring-(--line)">
                {rows.map(([term, value]) => (
                    <div key={term} className="flex min-h-[34px] items-center justify-between gap-3 border-b border-(--line) py-1.5 text-[12.5px] last:border-b-0">
                        <dt className="shrink-0 text-muted-foreground">{term}</dt>
                        <dd className="min-w-0 text-end font-medium">{value}</dd>
                    </div>
                ))}
            </dl>

            {composing ? (
                <form
                    className="mt-3 flex flex-col gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (!draft.trim()) return
                        setSent(draft.trim())
                        setDraft('')
                        setComposing(false)
                    }}>
                    <label htmlFor={`msg-${visit.id}`} className="sr-only">
                        Message to {caregiver?.name}
                    </label>
                    <textarea
                        id={`msg-${visit.id}`}
                        autoFocus
                        rows={2}
                        value={draft}
                        onChange={(e) => setDraft(e.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit()
                        }}
                        placeholder={`Message ${first} about ${visit.client}`}
                        className="w-full resize-none rounded-[9px] bg-(--board) px-3 py-2 text-base ring-1 ring-(--line) outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring md:text-[13px]"
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setComposing(false)} className={cn('h-8 rounded-[8px] px-3 text-[12.5px] text-muted-foreground hover:text-foreground', focusRing)}>
                            Cancel
                        </button>
                        <button type="submit" disabled={!draft.trim()} className={cn('flex h-8 items-center gap-1.5 rounded-[8px] bg-foreground px-3 text-[12.5px] font-medium text-background disabled:opacity-40', focusRing)}>
                            <Send className="size-3.5" aria-hidden />
                            Send
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mt-3 flex gap-2">
                    <a href={`#visit-${visit.id}`} className={cn('flex h-9 flex-1 items-center justify-center gap-1 rounded-[9px] bg-foreground text-[13px] font-medium text-background hover:bg-foreground/90', focusRing)}>
                        Open visit
                        <ChevronRight className="size-4" aria-hidden />
                    </a>
                    <button type="button" onClick={() => setComposing(true)} className={cn('flex h-9 items-center gap-1.5 rounded-[9px] bg-card px-3 text-[13px] font-medium ring-1 ring-(--line) hover:bg-(--board)', focusRing)}>
                        <MessageCircle className="size-4" aria-hidden />
                        Message
                    </button>
                </div>
            )}
            {sent ? (
                <p role="status" className="mt-2 truncate text-[12px] text-muted-foreground">
                    Sent to {first} · “{sent}”
                </p>
            ) : null}
        </div>
    )
}

/* ---------------------------------- Week ----------------------------------- */

export type WeekRow = { key: string; title: string; subtitle: ReactNode; avatar?: string; days: { hours: number; visits: number }[] }

export function WeekBoard({ title, days, today, rows, onOpenDay, footer }: { title: string; days: { label: string; offset: number }[]; today: number; rows: WeekRow[]; onOpenDay: (offset: number) => void; footer: ReactNode }) {
    return (
        <section aria-label={title} className="rounded-[14px] bg-(--board) p-1 ring-1 ring-(--line)">
            <header className="flex min-h-10 items-center px-2.5 py-2">
                <h2 className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {title}
                </h2>
            </header>
            <div className="overflow-x-auto rounded-[10px] bg-card ring-1 ring-(--line) [scrollbar-width:thin]">
                <table className="w-full min-w-[860px] border-collapse text-[13px]">
                    <caption className="sr-only">{title}: hours and visits per caregiver per day</caption>
                    <thead>
                        <tr className="h-[30px] border-b border-(--line) font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
                            <th scope="col" className="sticky start-0 z-10 w-[208px] border-e border-(--line) bg-(--rail) px-3.5 text-start font-normal">
                                Caregiver · hours
                            </th>
                            {days.map((d) => (
                                <th key={d.offset} scope="col" className={cn('px-2 text-start font-normal', d.offset === today && 'text-foreground')}>
                                    {d.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.key} className="h-14 border-b border-(--line) last:border-b-0">
                                <th scope="row" className="sticky start-0 z-10 border-e border-(--line) bg-(--rail) px-3.5 text-start font-normal">
                                    <span className="flex items-center gap-2.5">
                                        <Avatar className="size-[30px] shrink-0">
                                            {row.avatar ? <AvatarImage src={row.avatar} alt="" /> : null}
                                            <AvatarFallback className="text-[11px]">{initials(row.title)}</AvatarFallback>
                                        </Avatar>
                                        <span className="min-w-0">
                                            <span className="block truncate text-[13.5px] leading-[18px] font-medium">{row.title}</span>
                                            <span className="block truncate font-mono text-[11px] leading-4 text-muted-foreground">{row.subtitle}</span>
                                        </span>
                                    </span>
                                </th>
                                {row.days.map((day, i) => (
                                    <td key={i} className={cn('px-1.5', days[i].offset === today && 'bg-(--rail)')}>
                                        {day.visits ? (
                                            <button
                                                type="button"
                                                onClick={() => onOpenDay(days[i].offset)}
                                                aria-label={`${row.title}, ${days[i].label}: ${day.hours} hours, ${day.visits} visits. Open the day.`}
                                                className={cn('flex h-10 w-full cursor-pointer flex-col justify-center gap-1 rounded-[7px] px-2 text-start hover:bg-(--well)', focusRing)}>
                                                <span className="flex items-baseline justify-between gap-2">
                                                    <span className="font-mono text-[12px] font-medium tabular-nums">{day.hours.toFixed(1)} h</span>
                                                    <span className="text-[11px] text-muted-foreground tabular-nums">{day.visits}</span>
                                                </span>
                                                <span aria-hidden className="h-1 overflow-hidden rounded-full bg-(--well)">
                                                    <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${Math.min(100, (day.hours / 9) * 100)}%` }} />
                                                </span>
                                            </button>
                                        ) : (
                                            <span className="block px-2 font-mono text-[11px] text-muted-foreground/70">Off</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <footer className="flex min-h-[30px] items-center justify-between px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
                {footer}
                <span>Select a day to open it</span>
            </footer>
        </section>
    )
}
