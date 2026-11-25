'use client'

import * as React from 'react'
import {
    MenuCheckboxItem,
    MenuContent,
    MenuItem,
    MenuItemIndicator,
    MenuRadioItem,
    MenuSeparator,
    MenuSubContent,
    MenuSubTrigger,
    MenuTrigger,
} from '@ui-sdk/react/menu'
import { Check, ChevronRight, Circle } from 'lucide-react'

import { cn } from '@/components/panelo/lib/utils'
import { slot, type WithNodeChildren } from '@/components/panelo/lib/slot'

const contentClass = 'bg-popover text-popover-foreground z-50 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 ring-foreground/10 outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0'
const itemClass = "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset=true]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

// ui-sdk popups need no portal; kept so shadcn call sites still compile.
function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
    return <>{children}</>
}

function DropdownMenuTrigger({ asChild, children, ...props }: React.ComponentProps<typeof MenuTrigger> & { asChild?: boolean }) {
    return (
        <MenuTrigger
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof MenuContent>) {
    return (
        <MenuContent
            sideOffset={sideOffset}
            className={cn(contentClass, className)}
            {...props}
        />
    )
}

function DropdownMenuItem({ className, inset, variant = 'default', asChild, children, ...props }: React.ComponentProps<typeof MenuItem> & { inset?: boolean; variant?: 'default' | 'destructive'; asChild?: boolean }) {
    return (
        <MenuItem
            data-inset={inset}
            data-variant={variant}
            destructive={variant === 'destructive'}
            className={cn(itemClass, 'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive', className)}
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function DropdownMenuCheckboxItem({ className, children, value, ...props }: Omit<WithNodeChildren<React.ComponentProps<typeof MenuCheckboxItem>>, 'value'> & { value?: string }) {
    const id = React.useId()
    return (
        <MenuCheckboxItem
            value={value ?? id}
            className={cn(itemClass, 'pl-8', className)}
            {...props}>
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <MenuItemIndicator>
                    <Check className="size-4" />
                </MenuItemIndicator>
            </span>
            {children}
        </MenuCheckboxItem>
    )
}

function DropdownMenuRadioItem({ className, children, ...props }: WithNodeChildren<React.ComponentProps<typeof MenuRadioItem>>) {
    return (
        <MenuRadioItem
            className={cn(itemClass, 'pl-8', className)}
            {...props}>
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <MenuItemIndicator>
                    <Circle className="size-2 fill-current" />
                </MenuItemIndicator>
            </span>
            {children}
        </MenuRadioItem>
    )
}

// A heading that isn't tied to a group, like Radix's Label: plain text, skipped by the keyboard.
function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<'div'> & { inset?: boolean }) {
    return (
        <div
            role="presentation"
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={cn('px-2 py-1.5 text-sm font-medium text-muted-foreground data-[inset=true]:pl-8', className)}
            {...props}
        />
    )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuSeparator>) {
    return (
        <MenuSeparator
            className={cn('bg-border -mx-1 my-1 h-px', className)}
            {...props}
        />
    )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
            {...props}
        />
    )
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: WithNodeChildren<React.ComponentProps<typeof MenuSubTrigger>> & { inset?: boolean }) {
    return (
        <MenuSubTrigger
            data-inset={inset}
            className={cn('focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground flex cursor-default items-center rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[inset=true]:pl-8', className)}
            {...props}>
            {children}
            <ChevronRight className="ml-auto size-4" />
        </MenuSubTrigger>
    )
}

function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof MenuSubContent>) {
    return (
        <MenuSubContent
            className={cn(contentClass, 'shadow-lg', className)}
            {...props}
        />
    )
}

export { Menu as DropdownMenu, MenuGroup as DropdownMenuGroup, MenuRadioGroup as DropdownMenuRadioGroup, MenuSub as DropdownMenuSub } from '@ui-sdk/react/menu'
export { DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSubTrigger, DropdownMenuSubContent }
