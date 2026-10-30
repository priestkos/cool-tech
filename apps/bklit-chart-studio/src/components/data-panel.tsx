import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_DATASETS, type SampleId } from "@/lib/table/samples";

export function DataPanel({
  text,
  parseError,
  activeSample,
  onTextChange,
  onSelectSample,
}: {
  text: string;
  parseError: string | null;
  activeSample: SampleId;
  onTextChange: (value: string) => void;
  onSelectSample: (id: SampleId) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold">Dataset</h2>
        <p className="text-xs text-muted-foreground">
          Paste CSV or a JSON array (max 200 rows). All four charts read the same table.
        </p>
      </div>
      <Tabs
        value={activeSample}
        onValueChange={(value) => onSelectSample(value as SampleId)}
      >
        <TabsList className="w-full flex-wrap">
          {SAMPLE_DATASETS.map((sample) => (
            <TabsTrigger key={sample.id} value={sample.id} className="text-xs">
              {sample.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SAMPLE_DATASETS.map((sample) => (
          <TabsContent key={sample.id} value={sample.id} className="text-xs text-muted-foreground">
            {sample.description}
          </TabsContent>
        ))}
      </Tabs>
      <Textarea
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        className="min-h-[160px] font-mono text-xs"
        spellCheck={false}
        aria-invalid={parseError ? true : undefined}
      />
      {parseError ? (
        <p className="text-sm text-destructive" role="alert">
          {parseError}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Tip: break candlestick mapping intentionally, then fix it in the mapping panel.</p>
      )}
    </div>
  );
}
