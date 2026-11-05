import { describe, expect, test } from "bun:test";
import {
  getEffectById,
  loadCatalog,
  resolveEffectModule,
  searchCatalog,
} from "./catalog";

describe("catalog", () => {
  test("loads all effect ids from pixelfx registry", async () => {
    const catalog = await loadCatalog();
    expect(catalog.length).toBe(244);
    for (const fx of catalog) {
      expect(fx.mod.meta.name.length).toBeGreaterThan(0);
      expect(resolveEffectModule(catalog, fx.id)).toBe(fx.mod);
    }
  });

  test("search matches name, tags, and category filter", async () => {
    const catalog = await loadCatalog();
    const frost = searchCatalog(catalog, "frost nova", null);
    expect(frost.some((fx) => fx.id === "ice/frost-nova")).toBe(true);

    const iceOnly = searchCatalog(catalog, "", "ice");
    expect(iceOnly.every((fx) => fx.categoryId === "ice")).toBe(true);
    expect(iceOnly.length).toBeGreaterThan(0);

    const tagged = searchCatalog(catalog, "lightning", null);
    expect(tagged.some((fx) => fx.tags.includes("lightning"))).toBe(true);
  });

  test("getEffectById resolves modules", async () => {
    const catalog = await loadCatalog();
    const hit = getEffectById(catalog, "fire/fireball");
    expect(hit?.name.toLowerCase()).toContain("fire");
  });
});
