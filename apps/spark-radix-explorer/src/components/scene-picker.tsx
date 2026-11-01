import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SCENE_CATALOG, type SceneSource } from "@/lib/samples"

interface ScenePickerProps {
  activeSceneId: string
  activeCredit: string
  onSelectCatalogScene: (id: string) => void
  onOpenFile: () => void
}

export function ScenePicker({
  activeSceneId,
  activeCredit,
  onSelectCatalogScene,
  onOpenFile,
}: ScenePickerProps) {
  const catalogIds = SCENE_CATALOG.map((s) => s.id)
  const selectValue = catalogIds.includes(activeSceneId) ? activeSceneId : "custom"

  return (
    <Card className="pointer-events-auto border-border/60 bg-background/90 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Scene</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (value && value !== "custom") onSelectCatalogScene(value)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pick a sample" />
          </SelectTrigger>
          <SelectContent>
            {SCENE_CATALOG.map((scene) => (
              <SelectItem key={scene.id} value={scene.id}>
                {scene.label}
              </SelectItem>
            ))}
            <SelectItem value="custom" disabled>
              Custom file (drop or browse)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] leading-snug text-muted-foreground">{activeCredit}</p>
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={onOpenFile}>
          <Upload className="size-4" />
          Open .ply / .spz
        </Button>
      </CardContent>
    </Card>
  )
}

export function creditForScene(scene: SceneSource): string {
  if (scene.kind === "file") {
    return `Loaded from your file: ${scene.file.name}`
  }
  return scene.credit
}
