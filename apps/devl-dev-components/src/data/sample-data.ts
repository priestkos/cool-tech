import type { FileNode } from '@/components/devl/file-tree'
import type { JsonValue } from '@/components/devl/json-explorer'

export const DEVL_SOURCE_COMMIT = '2328dbcb5a6d786e8df3da85a79363a32090b3b1'
export const DEVL_MERGE_DATE = '2026-10-25'

export const agentRunResponse: JsonValue = {
  run: {
    id: 'run_demo_7xk2',
    status: 'completed',
    model: 'composer-2.5',
    started_at: '2026-10-28T12:04:11Z',
    finished_at: '2026-10-28T12:06:02Z',
    cost_usd: 0.042,
    steps: [
      {
        index: 1,
        type: 'plan',
        summary: 'Map devl components and wire showcase cards',
        tokens: { input: 820, output: 412 },
      },
      {
        index: 2,
        type: 'tool_call',
        name: 'Read',
        args: { path: 'apps/devl-dev-components/PLAN.md' },
        result: { ok: true, lines: 33 },
      },
      {
        index: 3,
        type: 'tool_call',
        name: 'Shell',
        args: { command: 'bun run dev' },
        result: { ok: true, port: 5173 },
      },
    ],
    tools_used: ['Read', 'Shell', 'Grep'],
    user_goal: 'Demo four devl.dev shadcn-style components in one agent console page',
  },
}

export const fileTreeData: FileNode[] = [
  {
    id: 'apps',
    name: 'apps',
    children: [
      {
        id: 'devl-app',
        name: 'devl-dev-components',
        children: [
          { id: 'plan', name: 'PLAN.md' },
          { id: 'readme', name: 'README.md', status: 'modified' },
          {
            id: 'src',
            name: 'src',
            children: [
              {
                id: 'devl',
                name: 'components/devl',
                children: [
                  { id: 'json-explorer', name: 'json-explorer.tsx' },
                  { id: 'liquid-slider', name: 'liquid-slider.tsx', status: 'added' },
                ],
              },
              { id: 'run-output', name: 'run-output.json', status: 'modified' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tracking',
    name: 'tracking',
    children: [{ id: 'bookmarks', name: 'seen-bookmarks.json', status: 'untracked' }],
  },
]

export const jsonFileContents: Record<string, JsonValue> = {
  'run-output': {
    note: 'Loaded from File Tree selection',
    snapshot: agentRunResponse,
  },
}
