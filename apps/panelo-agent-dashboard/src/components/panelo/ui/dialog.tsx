'use client'

import * as React from 'react'
import {
    Dialog as DialogPrimitive,
    DialogBackdrop,
    DialogClose as DialogClosePrimitive,
    DialogContent as DialogContentPrimitive,
    DialogDescription as DialogDescriptionPrimitive,
    DialogTitle as DialogTitlePrimitive,
    DialogTrigger as DialogTriggerPrimitive,
} from '@ui-sdk/react/dialog'

import { cn } from '@/components/panelo/lib/utils'
import { slot } from '@/components/panelo/lib/slot'

// An agent's approval prompt (`data-agent-approval`) stays usable over a modal, so a person can approve
// the step that's waiting on this dialog without the press closing it.
function Dialog({ persistentElements = ['[data-agent-approval]'], ...props }: React.ComponentProps<typeof DialogPrimitive>) {
    return (
        <DialogPrimitive
            persistentElements={persistentElements}
            {...props}
        />
    )
}

// ui-sdk dialogs need no portal; kept so shadcn call sites still compile.
function DialogPortal({ children }: { children?: React.ReactNode }) {
    return <>{children}</>
}

function DialogTrigger({ asChild, children, ...props }: React.ComponentProps<typeof DialogTriggerPrimitive> & { asChild?: boolean }) {
    return (
        <DialogTriggerPrimitive
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function DialogClose({ asChild, children, ...props }: React.ComponentProps<typeof DialogClosePrimitive> & { asChild?: boolean }) {
    return (
        <DialogClosePrimitive
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogBackdrop>) {
    return (
        <DialogBackdrop
            className={cn('fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0', className)}
            {...props}
        />
    )
}

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogContentPrimitive>) {
    return (
        <>
            <DialogOverlay />
            <DialogContentPrimitive
                className={cn('bg-popover text-popover-foreground fixed inset-0 z-50 m-auto grid h-fit max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] gap-4 overflow-y-auto rounded-xl p-6 ring-1 ring-foreground/10 outline-none transition-[opacity,scale] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:max-w-lg', className)}
                {...props}>
                {children}
            </DialogContentPrimitive>
        </>
    )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
            {...props}
        />
    )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
            {...props}
        />
    )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogTitlePrimitive>) {
    return (
        <DialogTitlePrimitive
            className={cn('text-lg font-medium leading-none', className)}
            {...props}
        />
    )
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogDescriptionPrimitive>) {
    return (
        <DialogDescriptionPrimitive
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    )
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger }
