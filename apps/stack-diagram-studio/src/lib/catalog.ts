import type { CatalogEntry } from "./types"

/** Local catalog (~40 entries). Aliases matched case-insensitively after normalization. */
export const CATALOG: CatalogEntry[] = [
  {
    id: "nextjs",
    label: "Next.js",
    monogram: "Nx",
    category: "client",
    aliases: ["next", "nextjs", "next.js"],
  },
  {
    id: "react",
    label: "React",
    monogram: "Re",
    category: "client",
    aliases: ["react", "reactjs", "react.js"],
  },
  {
    id: "sveltekit",
    label: "SvelteKit",
    monogram: "Sv",
    category: "client",
    aliases: ["sveltekit", "svelte", "svelte kit"],
  },
  {
    id: "vue",
    label: "Vue",
    monogram: "Vu",
    category: "client",
    aliases: ["vue", "vuejs", "nuxt", "nuxtjs"],
  },
  {
    id: "rails",
    label: "Rails",
    monogram: "Ra",
    category: "api",
    aliases: ["rails", "ruby on rails", "ror"],
  },
  {
    id: "vercel",
    label: "Vercel",
    monogram: "Vc",
    category: "hosting",
    aliases: ["vercel"],
  },
  {
    id: "netlify",
    label: "Netlify",
    monogram: "Nf",
    category: "hosting",
    aliases: ["netlify"],
  },
  {
    id: "cloudflare",
    label: "Cloudflare",
    monogram: "Cf",
    category: "hosting",
    aliases: ["cloudflare", "workers", "cf workers"],
  },
  {
    id: "neon",
    label: "Neon",
    monogram: "Ne",
    category: "hosting",
    aliases: ["neon", "neon postgres"],
  },
  {
    id: "supabase",
    label: "Supabase",
    monogram: "Sb",
    category: "hosting",
    aliases: ["supabase"],
  },
  {
    id: "hono",
    label: "Hono",
    monogram: "Ho",
    category: "api",
    aliases: ["hono"],
  },
  {
    id: "express",
    label: "Express",
    monogram: "Ex",
    category: "api",
    aliases: ["express", "expressjs"],
  },
  {
    id: "fastapi",
    label: "FastAPI",
    monogram: "Fa",
    category: "api",
    aliases: ["fastapi", "fast api"],
  },
  {
    id: "go",
    label: "Go API",
    monogram: "Go",
    category: "api",
    aliases: ["go", "golang", "go api"],
  },
  {
    id: "bun",
    label: "Bun",
    monogram: "Bn",
    category: "api",
    aliases: ["bun", "bunjs"],
  },
  {
    id: "postgres",
    label: "Postgres",
    monogram: "Pg",
    category: "database",
    aliases: ["postgres", "postgresql", "psql", "pg"],
  },
  {
    id: "mysql",
    label: "MySQL",
    monogram: "My",
    category: "database",
    aliases: ["mysql", "mariadb"],
  },
  {
    id: "sqlite",
    label: "SQLite",
    monogram: "Sq",
    category: "database",
    aliases: ["sqlite", "sql lite"],
  },
  {
    id: "mongodb",
    label: "MongoDB",
    monogram: "Mg",
    category: "database",
    aliases: ["mongodb", "mongo"],
  },
  {
    id: "redis",
    label: "Redis",
    monogram: "Rd",
    category: "queue",
    aliases: ["redis"],
  },
  {
    id: "kafka",
    label: "Kafka",
    monogram: "Kf",
    category: "queue",
    aliases: ["kafka", "apache kafka"],
  },
  {
    id: "sidekiq",
    label: "Sidekiq",
    monogram: "Sk",
    category: "queue",
    aliases: ["sidekiq"],
  },
  {
    id: "s3",
    label: "S3",
    monogram: "S3",
    category: "storage",
    aliases: ["s3", "aws s3", "object storage"],
  },
  {
    id: "r2",
    label: "R2",
    monogram: "R2",
    category: "storage",
    aliases: ["r2", "cloudflare r2"],
  },
  {
    id: "clerk",
    label: "Clerk",
    monogram: "Cl",
    category: "auth",
    aliases: ["clerk"],
  },
  {
    id: "auth0",
    label: "Auth0",
    monogram: "A0",
    category: "auth",
    aliases: ["auth0", "auth 0"],
  },
  {
    id: "stripe",
    label: "Stripe",
    monogram: "St",
    category: "payments",
    aliases: ["stripe"],
  },
  {
    id: "paypal",
    label: "PayPal",
    monogram: "Pp",
    category: "payments",
    aliases: ["paypal", "pay pal"],
  },
  {
    id: "datadog",
    label: "Datadog",
    monogram: "Dd",
    category: "observability",
    aliases: ["datadog", "data dog"],
  },
  {
    id: "sentry",
    label: "Sentry",
    monogram: "Se",
    category: "observability",
    aliases: ["sentry"],
  },
  {
    id: "openai",
    label: "OpenAI",
    monogram: "Ai",
    category: "other",
    aliases: ["openai", "open ai", "gpt"],
  },
  {
    id: "resend",
    label: "Resend",
    monogram: "Rs",
    category: "other",
    aliases: ["resend", "email"],
  },
  {
    id: "prisma",
    label: "Prisma",
    monogram: "Pr",
    category: "other",
    aliases: ["prisma", "orm"],
  },
  {
    id: "trpc",
    label: "tRPC",
    monogram: "Tr",
    category: "api",
    aliases: ["trpc", "t rpc"],
  },
  {
    id: "graphql",
    label: "GraphQL",
    monogram: "Gq",
    category: "api",
    aliases: ["graphql", "graph ql"],
  },
  {
    id: "docker",
    label: "Docker",
    monogram: "Dk",
    category: "hosting",
    aliases: ["docker", "containers"],
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    monogram: "K8",
    category: "hosting",
    aliases: ["kubernetes", "k8s", "kube"],
  },
  {
    id: "turso",
    label: "Turso",
    monogram: "Tu",
    category: "database",
    aliases: ["turso", "libsql"],
  },
  {
    id: "planetscale",
    label: "PlanetScale",
    monogram: "Pl",
    category: "database",
    aliases: ["planetscale", "planet scale"],
  },
  {
    id: "upstash",
    label: "Upstash",
    monogram: "Up",
    category: "queue",
    aliases: ["upstash"],
  },
]

const aliasIndex = (() => {
  const rows: { alias: string; entry: CatalogEntry }[] = []
  for (const entry of CATALOG) {
    for (const alias of entry.aliases) {
      rows.push({ alias: normalizeToken(alias), entry })
    }
  }
  rows.sort((a, b) => b.alias.length - a.alias.length)
  return rows
})()

export function normalizeToken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function lookupCatalog(text: string): CatalogEntry | null {
  const key = normalizeToken(text)
  if (!key) return null
  for (const row of aliasIndex) {
    if (key === row.alias) return row.entry
  }
  return null
}

export function findCatalogSpan(
  tokens: string[],
  start: number,
): { entry: CatalogEntry; length: number } | null {
  for (let len = Math.min(4, tokens.length - start); len >= 1; len--) {
    const phrase = tokens.slice(start, start + len).join(" ")
    const entry = lookupCatalog(phrase)
    if (entry) return { entry, length: len }
  }
  return null
}
