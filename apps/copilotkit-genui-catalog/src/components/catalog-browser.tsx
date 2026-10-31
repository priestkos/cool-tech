import { useMemo, useState, type ChangeEvent } from "react";
import {
  GenerativeUISurface,
  MarkdownSurfaces,
} from "@copilotkit/react-core/v2/generative-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATALOG_GROUP_ORDER, groupForComponent } from "@/lib/catalog-groups";
import {
  getManifest,
  listCatalogComponentNames,
  manifestPropRows,
} from "@/lib/catalog-schema";
import {
  minimalPreviewTree,
  operationsToFenceLines,
  previewOperations,
  previewSurfaceId,
} from "@/lib/a2ui";

function CatalogPreview({ componentName }: { componentName: string }) {
  const surfaceId = previewSurfaceId(componentName);
  const { components, data } = minimalPreviewTree(componentName);
  const ops = previewOperations(componentName, components, data);
  const markdown = useMemo(
    () => operationsToFenceLines(ops, surfaceId),
    [ops, surfaceId],
  );
  const messageId = `preview-msg-${componentName}`;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="sr-only">
        <MarkdownSurfaces messageId={messageId} content={markdown} />
      </div>
      <GenerativeUISurface
        id={surfaceId}
        fallback={
          <p className="text-muted-foreground text-sm">Loading preview…</p>
        }
      />
    </div>
  );
}

export function CatalogBrowser() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");
  const [selected, setSelected] = useState<string>("Badge");

  const names = listCatalogComponentNames();
  const filtered = names.filter((name) => {
    const matchesQuery =
      !query.trim() ||
      name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesGroup =
      group === "all" || groupForComponent(name) === group;
    return matchesQuery && matchesGroup;
  });

  const active = filtered.includes(selected)
    ? selected
    : (filtered[0] ?? names[0] ?? "Badge");
  const manifest = getManifest(active);

  return (
    <Card className="h-full min-h-[520px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Standard catalog browser</CardTitle>
        <p className="text-muted-foreground text-sm">
          Search and filter {names.length} components from{" "}
          <code className="text-xs">standardUI.manifestComponents</code>.
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <Input
            placeholder="Search components…"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            aria-label="Search catalog components"
          />
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant={group === "all" ? "default" : "outline"}
              onClick={() => setGroup("all")}
            >
              All
            </Button>
            {CATALOG_GROUP_ORDER.map((g) => (
              <Button
                key={g}
                type="button"
                size="sm"
                variant={group === g ? "default" : "outline"}
                className="text-xs"
                onClick={() => setGroup(g)}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ScrollArea className="h-[420px] rounded-md border p-2">
          <ul className="space-y-1">
            {filtered.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => setSelected(name)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${
                    active === name ? "bg-muted font-medium" : ""
                  }`}
                >
                  <span>{name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {groupForComponent(name)}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">{active}</h3>
            {manifest ? (
              <p className="text-muted-foreground text-sm">{manifest.description}</p>
            ) : null}
          </div>
          <CatalogPreview componentName={active} />
          <div className="rounded-md border">
            <div className="border-b px-3 py-2 text-sm font-medium">Props schema</div>
            <ScrollArea className="h-40 p-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-1 pr-2">Name</th>
                    <th className="pb-1 pr-2">Type</th>
                    <th className="pb-1">Req</th>
                  </tr>
                </thead>
                <tbody>
                  {manifest
                    ? manifestPropRows(manifest).map((row) => (
                        <tr key={row.name} className="border-t border-border/60">
                          <td className="py-1 pr-2 font-mono">{row.name}</td>
                          <td className="py-1 pr-2">{row.type}</td>
                          <td className="py-1">{row.required ? "yes" : "no"}</td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
