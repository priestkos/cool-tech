'use client'

import * as React from 'react'
import { Checkbox as CheckboxPrimitive, CheckboxIndicator } from '@ui-sdk/react/checkbox'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/components/panelo/lib/utils'

// shadcn's Checkbox on ui-sdk's: inside a ui-sdk `CheckboxGroup`, pass `value` per row and `parent` on a
// select-all box, and the group keeps checked / indeterminate in sync.
function Checkbox({ className, ...props }: Omit<React.ComponentProps<typeof CheckboxPrimitive>, 'children'>) {
    return (
        <CheckboxPrimitive
            className={cn(
                'peer border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive grid size-4 shrink-0 place-content-center rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',
                className
            )}
            {...props}>
            <CheckboxIndicator className="grid place-content-center text-current">
                <Check className="size-3.5 in-data-indeterminate:hidden" aria-hidden />
                <Minus className="hidden size-3.5 in-data-indeterminate:block" aria-hidden />
            </CheckboxIndicator>
        </CheckboxPrimitive>
    )
}

export { Checkbox }
