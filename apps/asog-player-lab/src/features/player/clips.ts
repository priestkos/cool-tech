export type ClipId = "rubloff-1s" | "rubloff-6s"

export const CLIPS: Record<
  ClipId,
  { label: string; path: string; expectedBytes: number; readmeSplatsHint: string }
> = {
  "rubloff-1s": {
    label: "Rubloff 1 s",
    path: "/clips/rubloff-1s.asog",
    expectedBytes: 3_203_324,
    readmeSplatsHint: "~105k pruned",
  },
  "rubloff-6s": {
    label: "Rubloff 6 s (default)",
    path: "/clips/rubloff-6s.asog",
    expectedBytes: 12_408_570,
    readmeSplatsHint: "~400k",
  },
}

export const DEFAULT_CLIP: ClipId = "rubloff-6s"