export type AppMode = "mock" | "live";

/** Live mode uses OpenUI Gateway (THESYS_API_KEY) per official docs. */
export function getAppMode(): AppMode {
  const key = process.env.THESYS_API_KEY?.trim();
  return key ? "live" : "mock";
}

export function hasLiveCredentials(): boolean {
  return getAppMode() === "live";
}
