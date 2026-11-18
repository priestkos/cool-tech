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
    primitives: [
      "@ui-sdk/core popover preset",
      "bindLayer dismiss",
      "listbox typeahead filter",
      "createSelection single value",
    ],
    note: "Implemented via @ui-sdk/react/combobox in the SDK column.",
  },
  {
    widget: "Multi-select list",
    primitives: [
      "@ui-sdk/react Select multiple",
      "createSelection toggle + extend",
      "announce polite live region",
    ],
    note: "Value is T[]; list stays open while toggling.",
  },
  {
    widget: "Sortable tasks",
    primitives: ["movedTo", "reorderMessage", "pointer drag (lab chrome)"],
    note: "Full createReorder lives in primitives; this lab uses movedTo + messages.",
  },
]

export function RecipePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent recipe</CardTitle>
        <CardDescription>
          Maps widgets to the pinned @ui-sdk/core / @ui-sdk/react APIs (
          <code className="text-[0.65rem]">0.1.0-beta.2</code>).
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
          Upstream:{" "}
          <a
            href="https://github.com/vercel-labs/ui"
            className="underline"
            rel="noreferrer"
          >
            vercel-labs/ui
          </a>{" "}
          (Apache-2.0). Eligible git snapshot:{" "}
          <code className="text-[0.6rem]">
            220c1a0d7278872286a620a8e4ee4210ca46f9bd
          </code>
          .
        </p>
      </CardContent>
    </Card>
  )
}