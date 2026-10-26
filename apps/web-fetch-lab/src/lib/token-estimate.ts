export function estimateTokensFromChars(charCount: number): number {
  return Math.ceil(charCount / 4)
}

export function tokenSavingsPercent(rawChars: number, markdownChars: number): number {
  if (rawChars <= 0) {
    return 0
  }
  const saved = rawChars - markdownChars
  return Math.round((saved / rawChars) * 100)
}
