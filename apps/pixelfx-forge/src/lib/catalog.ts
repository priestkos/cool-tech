import type { EffectModule } from "pixelfx";

export interface CatalogEffect {
  id: string;
  categoryId: string;
  name: string;
  desc: string;
  tags: string[];
  mod: EffectModule;
  hasAct: boolean;
}

let catalogCache: CatalogEffect[] | null = null;

export async function loadCatalog(): Promise<CatalogEffect[]> {
  if (catalogCache) return catalogCache;
  const { effects } = await import("pixelfx/fx/index");
  catalogCache = Object.entries(effects).map(([id, mod]) => {
    const meta = mod.meta ?? ({} as EffectModule["meta"]);
    return {
      id,
      categoryId: id.split("/")[0] ?? "misc",
      name: meta.name ?? id,
      desc: meta.desc ?? "",
      tags: meta.tags ?? [],
      mod,
      hasAct: Boolean(mod.act),
    };
  });
  return catalogCache;
}

export function searchCatalog(
  items: CatalogEffect[],
  query: string,
  categoryId: string | null,
): CatalogEffect[] {
  const q = query.trim().toLowerCase();
  return items.filter((fx) => {
    if (categoryId && categoryId !== "all" && fx.categoryId !== categoryId) {
      return false;
    }
    if (!q) return true;
    const haystack = `${fx.name} ${fx.desc} ${fx.tags.join(" ")} ${fx.id}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function getEffectById(
  items: CatalogEffect[],
  id: string,
): CatalogEffect | undefined {
  return items.find((fx) => fx.id === id);
}

export function resolveEffectModule(
  items: CatalogEffect[],
  id: string,
): EffectModule | undefined {
  return getEffectById(items, id)?.mod;
}
