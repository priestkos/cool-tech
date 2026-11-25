'use client'

import * as React from 'react'
import { Tabs as TabsPrimitive, TabsList as TabsListPrimitive, TabsPanel, TabsTab } from '@ui-sdk/react/tabs'

import { cn } from '@/components/panelo/lib/utils'

type TabsProps = Omit<React.ComponentProps<typeof TabsPrimitive>, 'onValueChange'> & { onValueChange?: (value: string) => void }

// shadcn's `onValueChange` reports a string; ui-sdk can report `null` for "nothing selected", which these tabs never allow.
function Tabs({ className, onValueChange, ...props }: TabsProps) {
    return (
        <TabsPrimitive
            className={cn('flex flex-col gap-2', className)}
            onValueChange={onValueChange && ((value: string | null) => value !== null && onValueChange(value))}
            {...props}
        />
    )
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsListPrimitive>) {
    return (
        <TabsListPrimitive
            className={cn('bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]', className)}
            {...props}
        />
    )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTab>) {
    return (
        <TabsTab
            className={cn(
                "data-selected:bg-background dark:data-selected:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:data-selected:border-input dark:data-selected:bg-input/30 text-foreground/60 hover:text-foreground data-selected:text-foreground dark:text-muted-foreground dark:hover:text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-1 text-sm font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:shadow-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className
            )}
            {...props}
        />
    )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPanel>) {
    return (
        <TabsPanel
            className={cn('flex-1 outline-none', className)}
            {...props}
        />
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
