/** Public-looking hostname served only by the fixture transport (no real DNS). */
export const FIXTURE_HOST = "fixture.web-fetch-lab.example"

export const FIXTURE_INJECTION_URL = `https://${FIXTURE_HOST}/injection-test`

export const ATTACKER_LEAK_URL =
  "https://attacker.example/leak?secret=FAKE-DEMO-SECRET-7f3a9b"

export const FAKE_SECRET = "FAKE-DEMO-SECRET-7f3a9b"

export const DEFAULT_MAX_LENGTH = 50_000
