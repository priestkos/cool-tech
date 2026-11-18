import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComparisonPanel } from "@/features/lab/ComparisonPanel"
import { EditorPanel } from "@/features/lab/EditorPanel"
import { GalleryPanel } from "@/features/lab/GalleryPanel"
import { PhysicalPanel } from "@/features/lab/PhysicalPanel"
import { SceneCanvas } from "@/features/lab/SceneCanvas"
import { useSceneLab } from "@/features/lab/useSceneLab"

export default function App() {
  const lab = useSceneLab()

  return (
    <div className="mx-auto flex min-h-svh max-w-[1680px] flex-col gap-3 p-3 md:gap-4 md:p-4 lg:h-svh lg:max-h-svh lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full flex-col gap-2 lg:max-h-full lg:max-w-md lg:shrink-0 lg:overflow-y-auto">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">ThreeRT Scene Lab</h1>
          <p className="text-xs text-muted-foreground">
            Scenes built with{" "}
            <code className="text-[10px]">@threert/scene@0.1.1</code> · three.js
            raster preview ·{" "}
            <a
              href="https://threert.dev"
              className="text-primary underline underline-offset-2"
              rel="noopener noreferrer"
              target="_blank"
            >
              ThreeRT
            </a>
          </p>
        </header>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="physical">Units</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="mt-2">
            <EditorPanel
              doc={lab.doc}
              jsonText={lab.jsonText}
              parseErrors={lab.parseErrors}
              onJsonChange={lab.setJsonText}
              onApplyJson={lab.applyJson}
              onSunPatch={lab.patchSun}
              onPreviewPatch={lab.patchPreview}
            />
          </TabsContent>
          <TabsContent value="physical" className="mt-2">
            <PhysicalPanel doc={lab.doc} built={lab.built} />
          </TabsContent>
          <TabsContent value="gallery" className="mt-2">
            <GalleryPanel
              samples={lab.samples}
              activeSlug={lab.activeSlug}
              onSelect={lab.loadSample}
            />
          </TabsContent>
          <TabsContent value="compare" className="mt-2">
            <ComparisonPanel />
          </TabsContent>
        </Tabs>
      </aside>

      <main className="flex min-h-[360px] flex-1 flex-col gap-2 lg:min-h-0">
        <SceneCanvas doc={lab.doc} built={lab.built} />
      </main>
    </div>
  )
}