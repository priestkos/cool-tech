import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATALOG_PIN_SHA } from "./catalog"
import type { CatalogAsset, CatalogKit } from "./types"
import { thumbnailForMode } from "./catalog"
import type { NetworkMode } from "./types"

type Props = {
  kits: CatalogKit[]
  types: string[]
  assets: CatalogAsset[]
  query: string
  kitFilter: string
  typeFilter: string
  selectedId: string | null
  networkMode: NetworkMode
  onQuery: (q: string) => void
  onKit: (id: string) => void
  onType: (id: string) => void
  onSelect: (asset: CatalogAsset) => void
}

export function KitBrowser({
  kits,
  types,
  assets,
  query,
  kitFilter,
  typeFilter,
  selectedId,
  networkMode,
  onQuery,
  onKit,
  onType,
  onSelect,
}: Props) {
  return (
    <Card className="flex h-full flex-col gap-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Kit browser</CardTitle>
        <p className="text-xs text-muted-foreground">
          Catalog snapshot{" "}
          <code className="text-[10px]">{CATALOG_PIN_SHA.slice(0, 7)}</code> ·{" "}
          {assets.length} results
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden pb-4">
        <div className="grid gap-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search models…"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <Label htmlFor="kit-filter">Kit</Label>
            <Select
              value={kitFilter}
              onValueChange={(v) => v && onKit(v)}
            >
              <SelectTrigger id="kit-filter" className="w-full">
                <SelectValue placeholder="All kits" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All kits</SelectItem>
                  {kits.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="type-filter">Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(v) => v && onType(v)}
            >
              <SelectTrigger id="type-filter" className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All types</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ul className="flex-1 space-y-2 overflow-y-auto pr-1" role="listbox">
          {assets.slice(0, 120).map((asset) => {
            const thumb = thumbnailForMode(asset, networkMode)
            const selected = asset.id === selectedId
            return (
              <li key={asset.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`flex w-full items-start gap-2 rounded-md border p-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60"
                  }`}
                  onClick={() => onSelect(asset)}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted text-[10px] text-muted-foreground">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span aria-hidden>{asset.type.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-tight">{asset.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary">{asset.type}</Badge>
                      <Badge variant="outline">{asset.triangles} tris</Badge>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}