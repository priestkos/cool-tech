import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const RECIPES = [
  {
    widget: "Combobox",
    primitives: ["anchored popup", "dismiss layer", "typeahead filter", "single selection"],
    note: "Agents wire these four behaviors before styling.",
  },
  {
    widget: "Multi-select list",
    primitives: ["multi selection toggles", "aria-multiselectable listbox", "live selection announcements"],
    note: "Selection state is separate from visual chips.",
  },
  {
    widget: "Sortable tasks",
    primitives: ["reorder reducer", "pointer drag", "polite live region + visible log"],
    note: "Announce the new index after each drop.",
  },
]

export function RecipePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent recipe</CardTitle>
        <CardDescription>
          Independent recreation — not the official @ui-sdk/* package graph.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {RECIPES.map((recipe) => (
          <div key={recipe.widget} className="rounded-md border border-border p-3">
            <p className="font-medium">{recipe.widget}</p>
            <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
              {recipe.primitives.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">{recipe.note}</p>
          </div>
        ))}
        <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
          Credit: Vercel UI SDK (Apache-2.0) inspired the behavior set — this demo
          does not install @ui-sdk/core or copy{" "}
          <a
            href="https://github.com/vercel-labs/ui"
            className="underline"
            rel="noreferrer"
          >
            vercel-labs/ui
          </a>
          . Eligible doc snapshot:{" "}
          <code className="text-[0.6rem]">26ac6b344133</code>. Deferred swap after
          ~2026-11-15 10:42 PM IST.
        </p>
      </CardContent>
    </Card>
  )
}
