'use client'

import * as React from 'react'
import {
    Drawer,
    DrawerBackdrop,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
    DrawerTrigger,
} from '@ui-sdk/react/drawer'

import { cn } from '@/components/panelo/lib/utils'
import { slot } from '@/components/panelo/lib/slot'

// shadcn's Sheet on ui-sdk's drawer: focus trap, Escape, swipe-to-close and scroll lock come built in.
// Unlike shadcn, `side` goes on the root, because the drawer positions and slides itself from there.
function Sheet({ side = 'right', persistentElements = ['[data-agent-approval]'], ...props }: React.ComponentProps<typeof Drawer>) {
    return (
        <Drawer
            side={side}
            persistentElements={persistentElements}
            {...props}
        />
    )
}

function SheetTrigger({ asChild, children, ...props }: React.ComponentProps<typeof DrawerTrigger> & { asChild?: boolean }) {
    return (
        <DrawerTrigger
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function SheetClose({ asChild, children, ...props }: React.ComponentProps<typeof DrawerClose> & { asChild?: boolean }) {
    return (
        <DrawerClose
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function SheetContent({ className, overlayClassName, ...props }: React.ComponentProps<typeof DrawerContent> & { overlayClassName?: string }) {
    return (
        <>
            <DrawerBackdrop className={cn('fixed inset-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs', overlayClassName)} />
            <DrawerContent
                className={cn('bg-popover text-popover-foreground bg-clip-padding flex h-full flex-col shadow-lg outline-none', className)}
                {...props}
            />
        </>
    )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-header"
            className={cn('flex flex-col gap-1.5 p-4', className)}
            {...props}
        />
    )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-footer"
            className={cn('mt-auto flex flex-col gap-2 p-4', className)}
            {...props}
        />
    )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DrawerTitle>) {
    return (
        <DrawerTitle
            className={cn('text-foreground font-medium', className)}
            {...props}
        />
    )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DrawerDescription>) {
    return (
        <DrawerDescription
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
