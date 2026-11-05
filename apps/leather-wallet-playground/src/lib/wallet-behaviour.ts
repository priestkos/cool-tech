/** Built-in motion constants from the vendored wallet (ac36e64). Not configurable props. */
export const WALLET_BEHAVIOUR = {
  pin: "ac36e649d58095dd7e4769541f60962da3dcd718",
  cardReveal: 9,
  peekReveal: 4,
  pullReveal: 52,
  enterDelay: 0.12,
  enterStagger: 0.08,
  pullSpring: { visualDuration: 0.4, bounce: 0.25 },
  settleSpring: { visualDuration: 0.25, bounce: 0 },
  introInView: "once at 50% visible (useInView amount: 0.5)",
  dismiss: "Escape or pointer down outside the active card",
  reducedMotion:
    "Motion useReducedMotion() — cards jump, peek disabled; toggle OS “reduce motion” or DevTools emulate prefers-reduced-motion (no in-app toggle; MotionConfig does not override useReducedMotion).",
} as const

export const WALLET_PIN_IST = "2026-11-02 20:45:09 IST"
