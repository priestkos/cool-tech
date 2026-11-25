'use client'

import * as React from 'react'
import { Avatar as AvatarPrimitive, AvatarFallback as AvatarFallbackPrimitive, AvatarImage as AvatarImagePrimitive } from '@ui-sdk/react/avatar'

import { cn } from '@/components/panelo/lib/utils'

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive>) {
    return (
        <AvatarPrimitive
            className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten', className)}
            {...props}
        />
    )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarImagePrimitive>) {
    return (
        <AvatarImagePrimitive
            className={cn('aspect-square size-full', className)}
            {...props}
        />
    )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarFallbackPrimitive>) {
    return (
        <AvatarFallbackPrimitive
            className={cn('bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full', className)}
            {...props}
        />
    )
}

export { Avatar, AvatarImage, AvatarFallback }
