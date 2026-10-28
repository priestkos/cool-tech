import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContentEditorProps = {
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  const headline = String(content.headline ?? "");
  const eyebrow = String(content.eyebrow ?? "");
  const primary = (content.primaryCta as { label?: string; href?: string } | undefined) ?? {};

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eyebrow">Eyebrow</Label>
        <Input
          id="eyebrow"
          value={eyebrow}
          onChange={(e) => onChange({ ...content, eyebrow: e.target.value || undefined })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={headline}
          onChange={(e) => onChange({ ...content, headline: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cta-label">Primary CTA label</Label>
        <Input
          id="cta-label"
          value={primary.label ?? ""}
          onChange={(e) =>
            onChange({
              ...content,
              primaryCta: { label: e.target.value, href: primary.href ?? "#start" },
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cta-href">Primary CTA href</Label>
        <Input
          id="cta-href"
          value={primary.href ?? ""}
          onChange={(e) =>
            onChange({
              ...content,
              primaryCta: { label: primary.label ?? "Get started", href: e.target.value },
            })
          }
        />
      </div>
    </div>
  );
}
