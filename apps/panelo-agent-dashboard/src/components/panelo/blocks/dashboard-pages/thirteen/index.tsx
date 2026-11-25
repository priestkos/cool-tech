'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Inbox, MapPin, PanelLeft, Plus } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/panelo/ui/toggle-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/panelo/ui/popover'
import { Sheet, SheetContent, SheetTitle } from '@/components/panelo/ui/sheet'
import { useMedia } from '@/components/panelo/hooks/use-media'
import { cn } from '@/components/panelo/lib/utils'

import { Board, type BoardRow, WeekBoard, type WeekRow } from './board'
import { alerts, AREAS, type Area, caregivers, clockFull, focusRing, NOW, PINNED, type Status, TODAY, type Visit, visits as seed } from './data'
import { NewVisitDialog } from './new-visit'
import { Sidebar } from './sidebar'

/* -------------------------------------------------------------------------- */
/*  Home-care schedule (dashboard-pages/thirteen): who is where, now. Day and  */
/*  week boards, by caregiver or by client, filtered by service area and       */
/*  search; a visit opens its card in place, and new visits check for clashes. */
/* -------------------------------------------------------------------------- */

/** Warm neutrals from the theme: mixing toward --foreground means dark mode flips itself. */
const theme = {
    '--page': 'color-mix(in oklab, color-mix(in oklab, var(--background) 96%, var(--foreground)) 97.5%, var(--tone-yellow-solid))',
    '--board': 'color-mix(in oklab, color-mix(in oklab, var(--card) 96.5%, var(--foreground)) 98%, var(--tone-yellow-solid))',
    '--rail': 'color-mix(in oklab, var(--card) 98.2%, var(--foreground))',
    '--well': 'color-mix(in oklab, color-mix(in oklab, var(--card) 92.5%, var(--foreground)) 97.5%, var(--tone-yellow-solid))',
    '--line': 'color-mix(in oklab, var(--card) 91.5%, var(--foreground))',
    '--line-strong': 'color-mix(in oklab, var(--card) 84%, var(--foreground))',
} as CSSProperties

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const BASE = Date.UTC(2026, 9, TODAY.date)
const dateOf = (offset: number) => {
    const d = new Date(BASE + offset * 86_400_000)
    return { weekday: WEEKDAYS[(d.getUTCDay() + 6) % 7], month: MONTHS[d.getUTCMonth()], date: d.getUTCDate(), index: (d.getUTCDay() + 6) % 7 }
}
const hash = (text: string) => {
    let h = 2166136261
    for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
    return (h >>> 0) / 4294967296
}
const first = (name: string) => {
    const [a, b] = name.split(' ')
    return b ? `${a} ${b[0]}.` : a
}

const segment = 'flex rounded-[10px] bg-(--board) p-[3px] ring-1 ring-(--line)'
const segmentItem = 'h-7 cursor-pointer rounded-[7px] px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-card aria-pressed:font-medium aria-pressed:text-foreground aria-pressed:shadow-xs aria-pressed:ring-1 aria-pressed:ring-(--line)'
const control = 'flex h-[34px] items-center justify-center gap-1.5 rounded-[10px] bg-card text-[13px] font-medium ring-1 ring-(--line) transition-colors hover:bg-(--board)'

export default function SchedulePage() {
    const [offset, setOffset] = useState(0)
    const [view, setView] = useState<'day' | 'week'>('day')
    const [mode, setMode] = useState<'caregivers' | 'clients'>('caregivers')
    const [area, setArea] = useState<Area | null>(null)
    const [query, setQuery] = useState('')
    const [showAll, setShowAll] = useState(false)
    const [selected, setSelected] = useState<string | null>(null)
    const [flash, setFlash] = useState<string | null>(null)
    const [added, setAdded] = useState<Visit[]>([])
    const [creating, setCreating] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [sheet, setSheet] = useState(false)
    const search = useRef<HTMLInputElement>(null)
    const wide = useMedia('(min-width: 1024px)')

    const all = useMemo(() => [...seed, ...added], [added])

    /** The day's visits. Today is the live board; other days replay the route: done before, booked after. */
    const dayVisits = useMemo(
        () =>
            (day: number): Visit[] => {
                if (day === 0) return all
                const weekend = dateOf(day).index >= 5
                return seed
                    .filter((v) => !weekend || hash(`${v.id}:${day}`) > 0.42)
                    .map((v) => ({ ...v, caregiver: v.from ?? v.caregiver, status: (day < 0 ? 'completed' : 'confirmed') as Status, evv: day < 0 ? 'Verified at the door' : 'Scheduled', note: undefined }))
            },
        [all]
    )

    const today = dayVisits(offset)
    const q = query.trim().toLowerCase()
    const inScope = (v: Visit) => (!area || v.area === area) && (!q || `${v.clientFull} ${caregivers.find((c) => c.id === v.caregiver)?.name}`.toLowerCase().includes(q))
    const scoped = today.filter(inScope)
    const caregiverOf = (id: string) => caregivers.find((c) => c.id === id)

    const date = dateOf(offset)
    const onShift = new Set(today.map((v) => v.caregiver)).size
    const areaCounts = Object.fromEntries(AREAS.map((a) => [a, today.filter((v) => v.area === a).length])) as Record<Area, number>

    // ⌘K / Ctrl+K focuses search, opening the drawer first on small screens.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
            event.preventDefault()
            if (!wide) setSheet(true)
            else setCollapsed(false)
            // Wait a frame so a drawer or a collapsed sidebar is there to receive focus.
            requestAnimationFrame(() => requestAnimationFrame(() => search.current?.focus()))
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [wide])

    // Desktop opens on the visit the coordinator was reviewing; a phone opens on the board itself.
    useEffect(() => {
        if (window.matchMedia('(min-width: 1024px)').matches) setSelected('marisol-1')
    }, [])

    useEffect(() => {
        if (!flash) return
        const timer = window.setTimeout(() => setFlash(null), 1800)
        return () => window.clearTimeout(timer)
    }, [flash])

    /* ------------------------------- Day rows ------------------------------ */

    const hoursOf = (list: Visit[]) => list.reduce((sum, v) => sum + (v.end - v.start), 0) / 60
    const dayRows: BoardRow[] =
        mode === 'caregivers'
            ? caregivers.flatMap((c): BoardRow[] => {
                  const mine = scoped.filter((v) => v.caregiver === c.id).sort((a, b) => a.start - b.start)
                  const out = offset === 0 && c.calledOut && (!area || c.area === area) && (!q || c.name.toLowerCase().includes(q))
                  if (!mine.length && !out) return []
                  return [
                      {
                          key: c.id,
                          title: c.name,
                          avatar: c.avatar,
                          notice: out ? c.calledOut : undefined,
                          subtitle: out ? <span className="text-destructive uppercase">{c.role} · Called out</span> : `${c.role} · ${hoursOf(today.filter((v) => v.caregiver === c.id)).toFixed(1)} h`,
                          visits: mine,
                      },
                  ]
              })
            : Object.values(
                  scoped.reduce<Record<string, Visit[]>>((groups, v) => {
                      ;(groups[v.clientFull] ??= []).push(v)
                      return groups
                  }, {})
              )
                  .sort((a, b) => Math.min(...a.map((v) => v.start)) - Math.min(...b.map((v) => v.start)))
                  .map((list) => ({ key: list[0].clientFull, title: list[0].clientFull, subtitle: `${list[0].area} · ${list[0].service}`, visits: list.sort((a, b) => a.start - b.start) }))

    // The called-out row stays last; "Show all" reveals the rest of the shift.
    const ordered = [...dayRows.filter((r) => !r.notice), ...dayRows.filter((r) => r.notice)]
    const pinned = ordered.filter((r) => !r.notice).slice(0, PINNED - ordered.filter((r) => r.notice).length)
    const rows = showAll || q || area ? ordered : [...pinned, ...ordered.filter((r) => r.notice)]
    const noun = mode === 'caregivers' ? 'caregivers' : 'clients'

    const summary =
        offset === 0
            ? { ok: true, title: 'All covered', detail: `${today.length} of ${today.length} visits`, banner: 'Nothing needs cover · Desmond’s 3 visits went to Marisol, Emil and Bronagh at 8:52 AM' }
            : offset < 0
              ? { ok: true, title: 'Day closed', detail: `${today.length} of ${today.length} visits`, banner: `All ${today.length} visits completed and verified` }
              : { ok: true, title: 'All assigned', detail: `${today.length} of ${today.length} visits`, banner: 'Every visit has a caregiver · no open shifts' }

    /* ------------------------------- Week rows ----------------------------- */

    const weekStart = offset - date.index
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = dateOf(weekStart + i)
        return { offset: weekStart + i, label: `${d.weekday.slice(0, 3)} ${d.date}` }
    })
    const weekRows: WeekRow[] = useMemo(() => {
        const perDay = weekDays.map((d) => dayVisits(d.offset).filter(inScope))
        const keys = mode === 'caregivers' ? caregivers.map((c) => c.id) : [...new Set(perDay.flat().map((v) => v.clientFull))]
        return keys
            .map((key): WeekRow => {
                const c = caregiverOf(key)
                const days = perDay.map((list) => {
                    const mine = list.filter((v) => (mode === 'caregivers' ? v.caregiver === key : v.clientFull === key))
                    return { hours: hoursOf(mine), visits: mine.length }
                })
                const total = days.reduce((s, d) => s + d.hours, 0)
                return { key, title: c?.name ?? key, avatar: c?.avatar, subtitle: `${c ? `${c.role} · ` : ''}${total.toFixed(1)} h this week`, days }
            })
            .filter((r) => r.days.some((d) => d.visits))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, weekStart, area, q, dayVisits])

    const weekTotals = useMemo(() => {
        const list = weekDays.flatMap((d) => dayVisits(d.offset))
        return { visits: list.length, caregivers: new Set(list.map((v) => v.caregiver)).size }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekStart, dayVisits])

    const step = (direction: number) => {
        setSelected(null)
        setOffset((o) => o + direction * (view === 'week' ? 7 : 1))
    }

    const sidebar = (
        <Sidebar
            query={query}
            onQuery={setQuery}
            searchRef={search}
            area={area}
            onArea={(next) => {
                setArea(next)
                setSelected(null)
                setSheet(false)
            }}
            areaCounts={areaCounts}
        />
    )

    return (
        <div style={theme} className="flex h-svh min-h-[640px] bg-(--page) p-2 text-foreground sm:p-3 [--board-cols:168px_minmax(0,1fr)] md:[--board-cols:208px_minmax(0,1fr)]">
            {/* Docked sidebar: collapses to nothing on desktop; below lg it lives in a drawer. */}
            <aside inert={collapsed || undefined} className={cn('hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-out lg:block', collapsed ? 'w-0' : 'w-[238px]')}>
                <div className="h-full w-[238px] py-1 ps-2 pe-3.5">{sidebar}</div>
            </aside>
            {!wide ? (
                <Sheet side="left" open={sheet} onOpenChange={setSheet}>
                    <SheetContent className="w-[280px] bg-(--page) p-3" style={theme}>
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        {sidebar}
                    </SheetContent>
                </Sheet>
            ) : null}

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-card shadow-xs ring-1 ring-(--line)">
                <div className="flex h-[54px] shrink-0 items-center gap-3 border-b border-(--line) ps-3.5 pe-3">
                    <button
                        type="button"
                        aria-label={wide ? (collapsed ? 'Show sidebar' : 'Hide sidebar') : 'Open navigation'}
                        aria-expanded={wide ? !collapsed : sheet}
                        onClick={() => (wide ? setCollapsed((v) => !v) : setSheet(true))}
                        className={cn('grid size-7 place-items-center rounded-[7px] text-muted-foreground hover:bg-(--board) hover:text-foreground', focusRing)}>
                        <PanelLeft className="size-4" aria-hidden />
                    </button>
                    <span aria-hidden className="h-4 w-px bg-(--line)" />
                    <nav aria-label="Breadcrumb" className="min-w-0">
                        <ol className="flex items-center gap-2 text-[13.5px]">
                            <li className="hidden text-muted-foreground sm:block">
                                <a href="#operations" className="rounded-sm hover:text-foreground">
                                    Operations
                                </a>
                            </li>
                            <li aria-hidden className="hidden text-muted-foreground/60 sm:block">
                                <ChevronRight className="size-3.5" />
                            </li>
                            <li aria-current="page" className="font-medium">
                                Schedule
                            </li>
                        </ol>
                    </nav>
                    <div className="ms-auto flex items-center gap-2">
                        <span className="hidden h-[30px] items-center gap-2 rounded-full bg-(--board) px-3 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase ring-1 ring-(--line) sm:flex">
                            <span aria-hidden className="relative size-1.5 rounded-full bg-tone-green-solid">
                                <span className="absolute inset-0 animate-ping rounded-full bg-tone-green-solid/60 motion-reduce:hidden" />
                            </span>
                            {TODAY.short}, {TODAY.month} {TODAY.date} · {clockFull(NOW)}
                        </span>
                        <a href="#inbox" aria-label="Inbox" className={cn(control, 'size-[34px]', focusRing)}>
                            <Inbox className="size-4" aria-hidden />
                        </a>
                        <Popover>
                            <PopoverTrigger aria-label={`Alerts, ${alerts.length} new`} className={cn(control, 'relative size-[34px] cursor-pointer', focusRing)}>
                                <Bell className="size-4" aria-hidden />
                                <span aria-hidden className="absolute end-[7px] top-[7px] size-[7px] rounded-full bg-destructive ring-2 ring-card" />
                            </PopoverTrigger>
                            <PopoverContent align="end" sideOffset={8} className="w-80 rounded-[14px] p-1.5">
                                <p className="px-2.5 pt-1.5 pb-2 font-mono text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">Alerts · today</p>
                                <ul className="flex flex-col">
                                    {alerts.map((a) => (
                                        <li key={a.id} className="flex gap-2.5 rounded-[9px] px-2.5 py-2 hover:bg-(--board)">
                                            <span aria-hidden className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', a.tone === 'danger' ? 'bg-destructive' : a.tone === 'warning' ? 'bg-tone-orange-solid' : 'bg-muted-foreground/50')} />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-baseline justify-between gap-2">
                                                    <span className="truncate text-[13px] font-medium">{a.title}</span>
                                                    <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">{a.time}</span>
                                                </span>
                                                <span className="block text-[12.5px] text-muted-foreground">{a.body}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-[22px] pb-6 sm:px-6">
                    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                        <div className="min-w-0">
                            <h1 className="text-[26px] leading-8 font-medium tracking-[-0.02em]">Schedule</h1>
                            <p className="mt-0.5 text-[13.5px] text-muted-foreground">
                                {view === 'week' ? `Week of ${dateOf(weekStart).month} ${dateOf(weekStart).date} · ${weekTotals.visits} visits · ${weekTotals.caregivers} caregivers` : `${date.weekday}, ${date.month} ${date.date} · ${today.length} visits · ${onShift} caregivers on shift`}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <button type="button" aria-label={view === 'week' ? 'Previous week' : 'Previous day'} onClick={() => step(-1)} className={cn(control, 'size-[34px] cursor-pointer', focusRing)}>
                                    <ChevronLeft className="size-4" aria-hidden />
                                </button>
                                <button type="button" aria-disabled={offset === 0} onClick={() => offset !== 0 && (setOffset(0), setSelected(null))} className={cn(control, 'cursor-pointer px-3 aria-disabled:cursor-default', focusRing)}>
                                    Today
                                </button>
                                <button type="button" aria-label={view === 'week' ? 'Next week' : 'Next day'} onClick={() => step(1)} className={cn(control, 'size-[34px] cursor-pointer', focusRing)}>
                                    <ChevronRight className="size-4" aria-hidden />
                                </button>
                            </div>
                            <ToggleGroup
                                type="single"
                                aria-label="Schedule range"
                                value={view}
                                onValueChange={(v) => {
                                    if (v === 'day' || v === 'week') {
                                        setView(v)
                                        setSelected(null)
                                    }
                                }}
                                className={segment}>
                                <ToggleGroupItem value="day" aria-label="Day view" className={segmentItem}>
                                    Day
                                </ToggleGroupItem>
                                <ToggleGroupItem value="week" aria-label="Week view" className={segmentItem}>
                                    Week
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <div role="group" aria-label="Group by" className={segment}>
                                {(['caregivers', 'clients'] as const).map((m) => (
                                    <button key={m} type="button" aria-pressed={mode === m} onClick={() => (setMode(m), setSelected(null), setShowAll(false))} className={cn(segmentItem, focusRing)}>
                                        {m === 'caregivers' ? 'Caregivers' : 'Clients'}
                                    </button>
                                ))}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    aria-label="Service area filter"
                                    className={cn(control, 'cursor-pointer gap-2 px-3 aria-expanded:bg-(--board)', focusRing)}>
                                    <MapPin className="size-4 text-muted-foreground" aria-hidden />
                                    {area ?? 'All service areas'}
                                    <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuRadioGroup value={area ?? 'all'} onValueChange={(v) => (setArea(v === 'all' ? null : (String(v) as Area)), setSelected(null))}>
                                        <DropdownMenuRadioItem value="all">All service areas</DropdownMenuRadioItem>
                                        <DropdownMenuSeparator />
                                        {AREAS.map((a) => (
                                            <DropdownMenuRadioItem key={a} value={a}>
                                                <span className="flex-1">{a}</span>
                                                <span className="font-mono text-[11px] text-muted-foreground">{areaCounts[a]}</span>
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <button type="button" onClick={() => setCreating(true)} className={cn('flex h-[34px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-foreground px-3.5 text-[13px] font-medium text-background hover:bg-foreground/90', focusRing)}>
                                <Plus className="size-4" aria-hidden />
                                New visit
                            </button>
                        </div>
                    </div>

                    <div className="mt-[18px]">
                        {view === 'day' ? (
                            <Board
                                title={`${date.weekday.slice(0, 3)}, ${date.month} ${date.date} · by ${mode === 'caregivers' ? 'caregiver' : 'client'}`}
                                columnLabel={mode === 'caregivers' ? 'Caregiver · hours today' : 'Client · service'}
                                rows={rows}
                                summary={summary}
                                now={offset === 0 ? NOW : null}
                                caregiverOf={caregiverOf}
                                labelOf={(v) => (mode === 'caregivers' ? v.client : first(caregiverOf(v.caregiver)?.name ?? ''))}
                                selected={selected}
                                onSelect={setSelected}
                                flash={flash}
                                footer={
                                    rows.length ? (
                                        <span className="flex items-center gap-2">
                                            Showing {rows.length} of {ordered.length} {noun}
                                            {ordered.length > rows.length || showAll ? (
                                                <button type="button" onClick={() => setShowAll((v) => !v)} className={cn('rounded-sm text-foreground uppercase underline-offset-2 hover:underline', focusRing)}>
                                                    · {showAll ? 'Show fewer' : 'Show all'}
                                                </button>
                                            ) : null}
                                        </span>
                                    ) : (
                                        <span>No {noun} match{q ? ` “${query.trim()}”` : ''}{area ? ` in ${area}` : ''}</span>
                                    )
                                }
                            />
                        ) : (
                            <WeekBoard
                                title={`Week of ${dateOf(weekStart).month} ${dateOf(weekStart).date} · by ${mode === 'caregivers' ? 'caregiver' : 'client'}`}
                                days={weekDays}
                                today={0}
                                rows={weekRows}
                                onOpenDay={(day) => {
                                    setOffset(day)
                                    setView('day')
                                    setSelected(null)
                                }}
                                footer={<span>{weekRows.length} {noun} this week</span>}
                            />
                        )}
                    </div>
                </div>
            </main>

            <NewVisitDialog
                open={creating}
                onOpenChange={setCreating}
                caregivers={caregivers.filter((c) => !c.calledOut)}
                visits={dayVisits(0)}
                onCreate={(draft) => {
                    const id = `new-${added.length + 1}`
                    const area = caregiverOf(draft.caregiver)?.area ?? AREAS[0]
                    setAdded((list) => [...list, { ...draft, id, area, status: 'confirmed' }])
                    setOffset(0)
                    setView('day')
                    setShowAll(true)
                    setSelected(null)
                    setFlash(id)
                }}
            />
        </div>
    )
}
