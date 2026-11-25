'use client'

import * as React from 'react'
import { Toggle as TogglePrimitive, ToggleGroup as ToggleGroupPrimitive } from '@ui-sdk/react/toggle'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/panelo/lib/utils'
import { toggleVariants } from '@/components/panelo/ui/toggle'

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
    size: 'default',
    variant: 'default',
})

type ToggleGroupProps = Omit<React.ComponentProps<typeof ToggleGroupPrimitive>, 'value' | 'defaultValue' | 'onValueChange' | 'children'> &
    VariantProps<typeof toggleVariants> & {
        type?: 'single' | 'multiple'
        value?: string | string[]
        defaultValue?: string | string[]
        onValueChange?: (value: any) => void
        children?: React.ReactNode
    }

const list = (v: string | string[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : v ? [v] : [])

// shadcn's `type="single"` takes and reports one string; ui-sdk always uses an array of pressed toggles.
function ToggleGroup({ className, variant, size, children, type = 'single', value, defaultValue, onValueChange, ...props }: ToggleGroupProps) {
    return (
        <ToggleGroupPrimitive
            data-variant={variant}
            data-size={size}
            multiple={type === 'multiple'}
            value={list(value)}
            defaultValue={list(defaultValue)}
            onValueChange={onValueChange && ((next: string[]) => onValueChange(type === 'multiple' ? next : (next[0] ?? '')))}
            className={cn('group/toggle-group flex w-fit items-center rounded-lg', className)}
            {...props}>
            <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
        </ToggleGroupPrimitive>
    )
}

function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive> & VariantProps<typeof toggleVariants>) {
    const context = React.useContext(ToggleGroupContext)
    return (
        <TogglePrimitive
            data-variant={context.variant || variant}
            data-size={context.size || size}
            className={cn(
                toggleVariants({
                    variant: context.variant || variant,
                    size: context.size || size,
                }),
                'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-lg last:rounded-r-lg focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
                className
            )}
            {...props}>
            {children}
        </TogglePrimitive>
    )
}

export { ToggleGroup, ToggleGroupItem }
