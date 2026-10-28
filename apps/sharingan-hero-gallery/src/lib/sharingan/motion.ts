export type MotionMode = "ready" | "reduced" | "final" | "off";

export function readMotionMode(): MotionMode {
	if (typeof window === "undefined") return "final";
	const forced = new URLSearchParams(window.location.search).get("motion");
	if (forced === "final" || forced === "off") return forced;
	const attribute = document.documentElement.getAttribute("data-motion");
	if (attribute === "final" || attribute === "off") return attribute;
	return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "reduced" : "ready";
}

/** Runs `listener` when the reduced-motion preference changes. */
export function onMotionPreferenceChange(listener: () => void): () => void {
	const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
	if (!query) return () => {};
	query.addEventListener("change", listener);
	return () => query.removeEventListener("change", listener);
}
