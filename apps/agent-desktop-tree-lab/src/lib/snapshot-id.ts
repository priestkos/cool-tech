/** Deterministic 8-char snapshot ids from a monotonic counter (seeded replays). */
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"

export function snapshotIdFromCounter(counter: number): string {
  if (counter <= 0) return "s00000001"
  let n = counter
  let body = ""
  for (let i = 0; i < 7; i++) {
    body = ALPHABET[n % 36] + body
    n = Math.floor(n / 36)
  }
  return `s${body.padStart(7, "0")}`
}
