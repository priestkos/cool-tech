export type SampleId = "sql-injection" | "null-deref" | "xss-sink"

export type SampleFile = {
  path: string
  before: string
  after: string
}

export type SampleDefinition = {
  id: SampleId
  title: string
  language: string
  description: string
  files: SampleFile[]
}

export const SAMPLES: SampleDefinition[] = [
  {
    id: "sql-injection",
    title: "SQL injection (Python)",
    language: "Python",
    description:
      "User input is concatenated into a SQL query string instead of using parameters.",
    files: [
      {
        path: "app/db/users.py",
        before: `from sqlite3 import Connection


def fetch_user(db: Connection, user_id: int) -> tuple | None:
    cursor = db.execute(
        "SELECT id, email FROM users WHERE id = ?",
        (user_id,),
    )
    return cursor.fetchone()
`,
        after: `from sqlite3 import Connection


def fetch_user(db: Connection, request) -> tuple | None:
    user_id = request.args.get("id", "")
    query = "SELECT id, email FROM users WHERE id = " + user_id
    cursor = db.execute(query)
    return cursor.fetchone()
`,
      },
    ],
  },
  {
    id: "null-deref",
    title: "Null dereference (TypeScript)",
    language: "TypeScript",
    description:
      "A lookup that can return undefined is used without a guard.",
    files: [
      {
        path: "src/profile.ts",
        before: `export function displayName(names: Map<string, string>, key: string): string {
  const value = names.get(key);
  if (value === undefined) {
    return "Unknown";
  }
  return value.toUpperCase();
}
`,
        after: `export function displayName(names: Map<string, string>, key: string): string {
  const value = names.get(key);
  return value.toUpperCase();
}
`,
      },
    ],
  },
  {
    id: "xss-sink",
    title: "XSS sink (React)",
    language: "TypeScript / React",
    description: "Untrusted text is injected through a DOM HTML sink.",
    files: [
      {
        path: "src/WelcomeBanner.tsx",
        before: `type Props = { headline: string };

export function WelcomeBanner({ headline }: Props) {
  return <h1 className="banner">{headline}</h1>;
}
`,
        after: `type Props = { headline: string };

export function WelcomeBanner({ headline }: Props) {
  return (
    <h1
      className="banner"
      dangerouslySetInnerHTML={{ __html: headline }}
    />
  );
}
`,
      },
    ],
  },
]

export function getSample(id: string): SampleDefinition | undefined {
  return SAMPLES.find((s) => s.id === id)
}

export function buildUnifiedDiff(sample: SampleDefinition): string {
  const parts: string[] = []
  for (const file of sample.files) {
    parts.push(diffSingleFile(file.path, file.before, file.after))
  }
  return parts.join("\n")
}

function diffSingleFile(path: string, before: string, after: string): string {
  const beforeLines = before.replace(/\n$/, "").split("\n")
  const afterLines = after.replace(/\n$/, "").split("\n")
  const header = [`diff --git a/${path} b/${path}`, `--- a/${path}`, `+++ b/${path}`]
  const body: string[] = []
  const max = Math.max(beforeLines.length, afterLines.length)
  let i = 0
  while (i < max) {
    const b = beforeLines[i]
    const a = afterLines[i]
    if (b === a) {
      body.push(` ${b ?? ""}`)
      i += 1
      continue
    }
    const oldStart = i + 1
    const chunkOld: string[] = []
    const chunkNew: string[] = []
    while (i < max && beforeLines[i] !== afterLines[i]) {
      if (beforeLines[i] !== undefined) chunkOld.push(`-${beforeLines[i]}`)
      if (afterLines[i] !== undefined) chunkNew.push(`+${afterLines[i]}`)
      i += 1
    }
    const oldCount = chunkOld.length + chunkNew.filter((l) => l.startsWith(" ")).length
    const newCount = chunkNew.length
    body.push(`@@ -${oldStart},${oldCount} +${oldStart},${newCount} @@`)
    body.push(...chunkOld, ...chunkNew)
  }
  return [...header, ...body].join("\n")
}
