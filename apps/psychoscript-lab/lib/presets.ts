import type { PresetId } from "./types.ts"

export type Preset = {
  id: PresetId
  title: string
  description: string
  code: string
}

export const PRESETS: Preset[] = [
  {
    id: "chain",
    title: "Tool chain",
    description: "Weather → search → todo in one script.",
    code: `const w = await weather.get("Paris");
const hits = await search.query(w.summary);
const item = await todo.add("Pack for " + w.city);
const list = await todo.list();
return { weather: w, hitCount: hits.length, added: item, todos: list };`,
  },
  {
    id: "loop",
    title: "Multi-city loop",
    description: "Loop over several tool calls.",
    code: `const cities = ["Oslo", "Lima", "Tokyo"];
const out = [];
for (const city of cities) {
  const w = await weather.get(city);
  const q = await search.query(w.city + " forecast");
  out.push({ city, temp: w.tempC, results: q.length });
}
return out;`,
  },
  {
    id: "host-error",
    title: "Host.fail",
    description: "Unknown city triggers suggestions.",
    code: `return await weather.get("Atlantis");`,
  },
  {
    id: "long-pause",
    title: "Long-running (pause)",
    description: "Waits on slow idempotent mock tool — pause while in flight.",
    code: `const a = await weather.get("Berlin");
const polled = await weather.poll("Berlin");
return { before: a, afterPoll: polled };`,
  },
  {
    id: "suspend-blocked",
    title: "Non-idempotent suspend",
    description: "Suspend while a non-idempotent call runs (SuspendError).",
    code: `return await tools.slowWrite("draft");`,
  },
]

export function presetById(id: PresetId): Preset {
  const p = PRESETS.find((x) => x.id === id)
  if (!p) throw new RangeError(`unknown preset ${id}`)
  return p
}