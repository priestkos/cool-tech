# Reanimate Motion Diff Lab — PLAN

**Goal:** One page that walks through Reanimate's record → spec → build → verify → repeat loop in the browser. A bundled reference animation plays next to an editable copy. Both are sampled every frame, the drift is drawn as curves, and a match score with a "Next pass" button nudges the copy toward the reference.

Source buzz: https://x.com/niazmorshed_/status/2116006291852423247 (Niaz Morshed, Oct 30 2026). Code: https://github.com/NiazMorshed2007/reanimate (MIT), site https://reanimate.niazmorshed.dev/. Unofficial community demo, not affiliated with Niaz Morshed or Reanimate. The real skill runs only inside Claude Code; nothing from it is installed or copied here.

## Single-user MVP
1. Stage: reference and copy side by side (2-3 bundled reference presets), "Play live" and a scrubber driven by a shared virtual clock.
2. Copy editor: duration, delay, easing (named presets + cubic-bezier handle editor), keyframes (offset + translateY / opacity / scale), "Copy CSS".
3. Sampler: paused WAAPI animations seeked at fixed fps, computed transform/opacity read into per-frame tracks.
4. Drift view: reference vs copy curves and difference curve per property; spec table for both.
5. Score: pass/fail rows modelled on Reanimate's motion-faithful criteria (timing ±80 ms, easing RMSE ≤ 0.05, travel within 10%) and a 0-100 score with its formula shown.
6. Loop: "Next pass" fixes the worst row by one bounded step, re-samples, and logs pass history with undo. It stops at 5 passes or all-pass and reports residuals.
7. Header: links, "Unofficial community demo" line, light/dark.

**Out of scope:** recording real websites or videos, pixel diffing, canvas/WebGL, springs, stagger across many elements, exporting to Framer Motion/GSAP, deploy.

## Tasks (vertical slices)
1. Check the 3-day rule for every package. Scaffold Vite React TS (skip install), bunfig.toml, pinned installs, shadcn init (minimalist).
2. Timing model: cubic-bezier solver, keyframe interpolation, reference presets; stage with live play and scrubber.
3. Sampler + tracks; drift curves; spec table.
4. Metrics, score, "Next pass" with history and undo.
5. Copy editor (bezier handles, keyframes), CSS export, header, light/dark.
6. Tests (bezier, interpolation, metrics, score, next pass, CSS export), README (loop mapping, honest notes, pins with dates, license table), screenshot and video, PR.

## Stack
- Web Animations API + our own timing math: real browser animations with seekable, deterministic sampling and no dependency.
- Vite + React + TS: least wiring for a client-only page.
- shadcn/ui minimalist preset: repo standard for the controls.

## Deferred
- Pixel diffing of rendered frames (canvas snapshots + a pixel compare): closer to Reanimate's pixel-faithful level but heavier.
- Springs and overshoot fitting, multi-element stagger: the real skill handles these; out of the first cut.
- Importing a user-recorded track.json: needs the real skill.
- Deploy preview: optional per AGENTS.md; later on the shared Pages project.
