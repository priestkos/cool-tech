/** Mirrors upstream Custom Highlight detection used for lab status text. */
export function supportsCustomHighlight(): boolean {
  return (
    typeof CSS !== "undefined" &&
    "highlights" in CSS &&
    typeof Highlight !== "undefined"
  )
}