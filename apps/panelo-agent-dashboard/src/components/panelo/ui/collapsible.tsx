'use client'

import * as React from 'react'
import { CollapsibleTrigger as CollapsibleTriggerPrimitive } from '@ui-sdk/react/collapsible'

import { slot } from '@/components/panelo/lib/slot'

function CollapsibleTrigger({ asChild, children, ...props }: React.ComponentProps<typeof CollapsibleTriggerPrimitive> & { asChild?: boolean }) {
    return (
        <CollapsibleTriggerPrimitive
            {...props}
            {...slot(asChild, children)}
        />
    )
}

export { Collapsible, CollapsiblePanel as CollapsibleContent } from '@ui-sdk/react/collapsible'
export { CollapsibleTrigger }
