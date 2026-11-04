export const STACK_PRESETS = [
  {
    id: "next-vercel",
    label: "Next.js on Vercel",
    sentence:
      "Next.js on Vercel, Hono API, Postgres on Neon, Clerk auth, Stripe",
  },
  {
    id: "rails",
    label: "Rails stack",
    sentence: "Rails, Postgres, Redis, Sidekiq",
  },
  {
    id: "svelte-supabase",
    label: "SvelteKit + Supabase",
    sentence: "SvelteKit, Supabase, Postgres, Clerk",
  },
  {
    id: "go-kafka",
    label: "Go + Kafka + S3",
    sentence: "Go API, Kafka, S3, Postgres",
  },
  {
    id: "bun-sqlite",
    label: "Bun + Hono + SQLite",
    sentence: "Bun, Hono, SQLite",
  },
] as const

export const DEFAULT_SENTENCE = STACK_PRESETS[0]!.sentence
