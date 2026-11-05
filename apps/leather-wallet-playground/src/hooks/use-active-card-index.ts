import { useEffect, useState, type RefObject } from "react"

/** Observes pulled-out card via data-active on wallet cards. */
export function useActiveCardIndex(containerRef: RefObject<HTMLElement | null>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    function scan() {
      const el = containerRef.current
      if (!el) return
      const cards = el.querySelectorAll('[data-slot="wallet-card"]')
      let found: number | null = null
      cards.forEach((node, index) => {
        if (node.getAttribute("data-active") !== null) found = index
      })
      setActiveIndex(found)
    }

    scan()
    const observer = new MutationObserver(scan)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-active", "aria-expanded"],
      subtree: true,
    })
    return () => observer.disconnect()
  }, [containerRef])

  return activeIndex
}
