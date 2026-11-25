import { isValidElement, type ReactElement, type ReactNode } from 'react'

// shadcn's `asChild` on top of ui-sdk's `render`: the child becomes the rendered element and keeps
// its own content, so existing `<Trigger asChild><Link /></Trigger>` call sites work unchanged.
export function slot<C>(asChild: boolean | undefined, children: C): { children: C } | { render: ReactElement<Record<string, any>>; children: ReactNode } {
    if (!asChild || !isValidElement<{ children?: ReactNode }>(children)) return { children }
    return { render: children as ReactElement<Record<string, any>>, children: children.props.children }
}

// For wrappers that add their own nodes next to `children`, so ui-sdk's render-function children are off the table.
export type WithNodeChildren<P> = Omit<P, 'children'> & { children?: ReactNode }
