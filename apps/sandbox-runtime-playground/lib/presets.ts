import type { PresetDefinition } from "./types.ts"

export const PRESETS: PresetDefinition[] = [
  {
    id: "read-ssh",
    label: "Read ~/.ssh",
    shellCommand:
      'if [ -d "$HOME/.ssh" ]; then ls "$HOME/.ssh" 2>&1 | head -c 200 || true; else echo "NO_SSH_DIR"; fi',
    kind: "read",
  },
  {
    id: "curl-allowed",
    label: "curl allowed domain",
    shellCommand: "curl -fsSL --max-time 8 https://github.com 2>&1 | head -c 120",
    kind: "network",
  },
  {
    id: "curl-blocked",
    label: "curl blocked domain",
    shellCommand: "curl -fsSL --max-time 8 https://example.com 2>&1 | head -c 120",
    kind: "network",
  },
  {
    id: "write-tmp",
    label: "Write to /tmp",
    shellCommand:
      'echo sandbox-test > /tmp/srt-playground-write-test.txt && echo WROTE_OK',
    kind: "write",
  },
  {
    id: "write-outside",
    label: "Write outside allowed folders",
    shellCommand:
      'echo sandbox-test > ./srt-playground-outside-write.txt && echo WROTE_OK',
    kind: "write",
  },
]

export function presetById(id: string): PresetDefinition | undefined {
  return PRESETS.find((p) => p.id === id)
}
