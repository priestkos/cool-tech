import { describe, expect, test } from "bun:test"
import { buildSyntheticTrack } from "./keyframes"
import { applyNextPass } from "./next-pass"
import { getPreset } from "../reference/presets"
import { computeCheckRows } from "./metrics"

describe("next pass", () => {
  test("reduces the worst failing row on synthetic tracks", () => {
    const preset = getPreset("card-entrance")
    const refTracks = buildSyntheticTrack(preset.reference, 60, 1200)
    let copy = preset.initialCopy
    let copyTracks = buildSyntheticTrack(copy, 60, 1200)
    const beforeRows = computeCheckRows(preset.reference, copy, refTracks, copyTracks)
    const worstBefore = Math.max(
      ...beforeRows.filter((r) => !r.pass).map((r) => r.failure),
      0,
    )
    const result = applyNextPass(copy, preset.reference, refTracks, copyTracks, 0)
    copyTracks = buildSyntheticTrack(result.spec, 60, 1200)
    const afterRows = computeCheckRows(preset.reference, result.spec, refTracks, copyTracks)
    const worstAfter = Math.max(
      ...afterRows.filter((r) => !r.pass).map((r) => r.failure),
      0,
    )
    expect(worstAfter).toBeLessThan(worstBefore)
  })

  test("blocks after max passes", () => {
    const preset = getPreset("toast-slide")
    const refTracks = buildSyntheticTrack(preset.reference, 60, 1000)
    const copyTracks = buildSyntheticTrack(preset.initialCopy, 60, 1000)
    const blocked = applyNextPass(
      preset.initialCopy,
      preset.reference,
      refTracks,
      copyTracks,
      5,
    )
    expect(blocked.blocked).toBe(true)
  })
})
