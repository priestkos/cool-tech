'use client'

import { useId, useState } from 'react'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/panelo/ui/dialog'
import { Input } from '@/components/panelo/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/panelo/ui/select'
import { cn } from '@/components/panelo/lib/utils'

import { type Caregiver, clock, clockFull, DAY_END, DAY_START, focusRing, type Visit } from './data'

const SERVICES = ['Personal care', 'Companionship', 'Medication reminder', 'Meal prep', 'Bathing', 'Mobility support', 'Respite care']
const STARTS = Array.from({ length: (DAY_END - DAY_START) / 30 }, (_, i) => DAY_START + i * 30)
const LENGTHS = [60, 90, 120, 180]

type NewVisitProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    caregivers: Caregiver[]
    visits: Visit[]
    onCreate: (visit: Omit<Visit, 'id' | 'status' | 'area'>) => void
}

export function NewVisitDialog({ open, onOpenChange, caregivers, visits, onCreate }: NewVisitProps) {
    const id = useId()
    const [client, setClient] = useState('')
    const [service, setService] = useState(SERVICES[0])
    const [caregiver, setCaregiver] = useState(caregivers[0]?.id ?? '')
    const [start, setStart] = useState(String(15 * 60))
    const [length, setLength] = useState('90')
    const [tried, setTried] = useState(false)

    const from = Number(start)
    const to = Math.min(DAY_END, from + Number(length))
    const name = client.trim()
    // The visit can't sit on top of one the caregiver already has.
    const clash = visits.find((v) => v.caregiver === caregiver && v.start < to && from < v.end)
    const error = !name ? 'Enter the client’s name.' : clash ? `Overlaps ${clash.client} (${clock(clash.start)} – ${clock(clash.end)}). Pick another time or caregiver.` : ''

    const reset = () => {
        setClient('')
        setTried(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next)
                if (!next) reset()
            }}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>New visit</DialogTitle>
                    <DialogDescription>Adds a confirmed visit to today’s board.</DialogDescription>
                </DialogHeader>

                <form
                    id={`${id}-form`}
                    noValidate
                    className="grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        setTried(true)
                        if (error) return
                        const short = name.split(' ')
                        onCreate({
                            caregiver,
                            client: short.length > 1 ? `${short[0]} ${short[short.length - 1][0]}.` : name,
                            clientFull: name,
                            service,
                            start: from,
                            end: to,
                            evv: 'Scheduled',
                        })
                        onOpenChange(false)
                        reset()
                    }}>
                    <Field label="Client" htmlFor={`${id}-client`}>
                        <Input id={`${id}-client`} autoFocus placeholder="eg. Margaret Ellison" value={client} onValueChange={setClient} aria-invalid={tried && !name ? true : undefined} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Service">
                            <Select value={service} onValueChange={(v) => v && setService(String(v))}>
                                <SelectTrigger aria-label="Service" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SERVICES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Caregiver">
                            <Select value={caregiver} onValueChange={(v) => v && setCaregiver(String(v))}>
                                <SelectTrigger aria-label="Caregiver" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {caregivers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Starts">
                            <Select value={start} onValueChange={(v) => v && setStart(String(v))}>
                                <SelectTrigger aria-label="Start time" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STARTS.map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            {clockFull(m)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Length">
                            <Select value={length} onValueChange={(v) => v && setLength(String(v))}>
                                <SelectTrigger aria-label="Length" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LENGTHS.map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            {m % 60 ? `${m / 60} hours` : m === 60 ? '1 hour' : `${m / 60} hours`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                    <p className={cn('text-[12.5px]', tried && error ? 'text-destructive' : 'text-muted-foreground')} role={tried && error ? 'alert' : undefined}>
                        {tried && error ? error : `${clockFull(from)} to ${clockFull(to)}${clash ? ' · overlaps an existing visit' : ''}`}
                    </p>
                </form>

                <DialogFooter>
                    <DialogClose className={cn('h-9 rounded-[9px] px-3.5 text-[13px] font-medium ring-1 ring-(--line) hover:bg-(--board)', focusRing)}>Cancel</DialogClose>
                    <button type="submit" form={`${id}-form`} className={cn('h-9 rounded-[9px] bg-foreground px-3.5 text-[13px] font-medium text-background hover:bg-foreground/90', focusRing)}>
                        Add visit
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-1.5">
            {htmlFor ? (
                <label htmlFor={htmlFor} className="text-[12.5px] font-medium">
                    {label}
                </label>
            ) : (
                <span className="text-[12.5px] font-medium">{label}</span>
            )}
            {children}
        </div>
    )
}
