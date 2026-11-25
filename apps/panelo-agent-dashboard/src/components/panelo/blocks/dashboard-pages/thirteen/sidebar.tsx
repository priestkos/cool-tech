'use client'

import React, { type Ref } from 'react'
import { ArrowUpDown, CircleHelp, Plus, Search, Settings } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/panelo/ui/avatar'
import { Button } from '@/components/panelo/ui/button'
import { Input } from '@/components/panelo/ui/input'
import { cn } from '@/components/panelo/lib/utils'

import { AREAS, type Area, focusRing, initials, nav, org, user } from './data'

type SidebarProps = {
    query: string
    onQuery: (value: string) => void
    searchRef?: Ref<HTMLInputElement>
    area: Area | null
    onArea: (area: Area | null) => void
    areaCounts: Record<Area, number>
}

const item = 'flex h-8 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-[14px] text-foreground/75 transition-colors duration-150 hover:bg-(--rail) hover:text-foreground'
const label = 'px-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/80'
const surface = 'bg-card shadow-xs ring-1 ring-(--line)'

export function Sidebar({ query, onQuery, searchRef, area, onArea, areaCounts }: SidebarProps) {
    return (
        <nav aria-label="Main" className="flex h-full flex-col">
            <button type="button" className={cn('flex h-[54px] w-full items-center gap-2.5 rounded-[12px] px-2.5 text-start', surface, focusRing)}>
                <span className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-foreground text-background">
                    <VisitlyMark className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] leading-[18px] font-semibold">{org.name}</span>
                    <span className="block truncate text-[12px] leading-4 text-muted-foreground">{org.agency}</span>
                </span>
                <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="sr-only">Switch agency</span>
            </button>

            <label className={cn('mt-2.5 flex h-9 items-center gap-2 rounded-[10px] px-2.5 focus-within:ring-2 focus-within:ring-ring', surface)}>
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <Input
                    ref={searchRef as React.Ref<HTMLInputElement>}
                    type="search"
                    value={query}
                    onValueChange={onQuery}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' && query) {
                            e.preventDefault()
                            onQuery('')
                        }
                    }}
                    placeholder="Search"
                    aria-label="Search caregivers and clients"
                    aria-keyshortcuts="Meta+K Control+K"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 md:text-[13.5px] [&::-webkit-search-cancel-button]:hidden"
                />
                <kbd className="rounded-[5px] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-(--line)">⌘K</kbd>
            </label>

            <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)] [scrollbar-width:none]">
                {nav.map((group) => (
                    <div key={group.label}>
                        <p className={label}>{group.label}</p>
                        <ul className="mt-2 flex flex-col gap-1.5">
                            {group.items.map((entry) => (
                                <li key={entry.label}>
                                    <a
                                        href={`#${entry.label.toLowerCase()}`}
                                        aria-current={entry.active ? 'page' : undefined}
                                        className={cn(item, focusRing, entry.active && cn(surface, 'font-medium text-foreground hover:bg-card'))}>
                                        <entry.icon className="size-4 shrink-0 opacity-80" aria-hidden />
                                        <span className="flex-1">{entry.label}</span>
                                        {entry.badge ? (
                                            <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-destructive px-1 text-[11px] font-semibold text-white tabular-nums">
                                                {entry.badge}
                                                <span className="sr-only"> new</span>
                                            </span>
                                        ) : null}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <div className="flex items-center justify-between pe-1">
                        <p className={label}>Service areas</p>
                        <button type="button" aria-label="Add service area" className={cn('grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-(--rail) hover:text-foreground', focusRing)}>
                            <Plus className="size-3.5" aria-hidden />
                        </button>
                    </div>
                    <ul className="mt-1.5 flex flex-col gap-0.5">
                        {AREAS.map((name) => {
                            const on = area === name
                            return (
                                <li key={name}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        aria-label={`Service area ${name}`}
                                        aria-pressed={on}
                                        onClick={() => onArea(on ? null : name)}
                                        className={cn(item, 'h-[30px] justify-start text-[13.5px] font-normal', focusRing, on && cn(surface, 'text-foreground hover:bg-card'))}>
                                        <span aria-hidden className={cn('size-2 shrink-0 rounded-[2px]', on ? 'bg-foreground' : 'bg-muted-foreground/30')} />
                                        <span className="flex-1 text-start">{name}</span>
                                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{areaCounts[name]}</span>
                                    </Button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>

            <ul className="flex flex-col gap-1">
                <li>
                    <a href="#help" className={cn(item, focusRing)}>
                        <CircleHelp className="size-4 opacity-80" aria-hidden />
                        Help and support
                    </a>
                </li>
                <li>
                    <a href="#settings" className={cn(item, focusRing)}>
                        <Settings className="size-4 opacity-80" aria-hidden />
                        Settings
                    </a>
                </li>
            </ul>
            <button type="button" className={cn('mt-3 flex h-[54px] w-full items-center gap-2.5 rounded-[12px] px-2.5 text-start', surface, focusRing)}>
                <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt="" />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] leading-[18px] font-semibold">{user.name}</span>
                    <span className="block truncate text-[12px] leading-4 text-muted-foreground">{user.role}</span>
                </span>
                <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="sr-only">Account menu</span>
            </button>
        </nav>
    )
}

/** The demo brand: a V with a dot, like a pin dropped on a visit. */
function VisitlyMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
            <path d="M2.5 3.5 7 13l3.2-6.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12.4" cy="3.9" r="1.7" fill="currentColor" />
        </svg>
    )
}
