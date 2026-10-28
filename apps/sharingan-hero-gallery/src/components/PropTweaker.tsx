import type { SchemaControl } from "@/lib/schema-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PropTweakerProps = {
  controls: SchemaControl[];
  config: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export function PropTweaker({ controls, config, onChange }: PropTweakerProps) {
  const visible = controls.filter((c) => c.kind !== "skip");

  return (
    <div className="space-y-4">
      {visible.map((control) => {
        const value = config[control.key];

        if (control.kind === "boolean") {
          return (
            <div key={control.key} className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor={control.key}>{control.label}</Label>
                {control.hint ? <p className="text-muted-foreground text-xs">{control.hint}</p> : null}
              </div>
              <Switch
                id={control.key}
                checked={Boolean(value)}
                onCheckedChange={(checked) => onChange({ ...config, [control.key]: checked })}
              />
            </div>
          );
        }

        if (control.kind === "enum" && control.options) {
          return (
            <div key={control.key} className="space-y-2">
              <Label>{control.label}</Label>
              {control.hint ? <p className="text-muted-foreground text-xs">{control.hint}</p> : null}
              <Select
                value={String(value)}
                onValueChange={(v) => onChange({ ...config, [control.key]: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {control.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (control.kind === "number") {
          const num = typeof value === "number" ? value : Number(value ?? control.min ?? 0);
          return (
            <div key={control.key} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{control.label}</Label>
                <Input
                  className="h-8 w-24"
                  type="number"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={num}
                  onChange={(e) => onChange({ ...config, [control.key]: Number(e.target.value) })}
                />
              </div>
              {control.hint ? <p className="text-muted-foreground text-xs">{control.hint}</p> : null}
              <Slider
                min={control.min}
                max={control.max}
                step={control.step}
                value={[num]}
                onValueChange={(values) => {
                  const v = Array.isArray(values) ? values[0] : values;
                  onChange({ ...config, [control.key]: v });
                }}
              />
            </div>
          );
        }

        if (control.kind === "color-array") {
          const colors = Array.isArray(value) ? (value as string[]) : [];
          return (
            <div key={control.key} className="space-y-2">
              <Label>{control.label}</Label>
              {control.hint ? <p className="text-muted-foreground text-xs">{control.hint}</p> : null}
              <div className="space-y-2">
                {colors.map((color, index) => (
                  <div key={`${control.key}-${index}`} className="flex items-center gap-2">
                    <Input
                      type="color"
                      className="h-9 w-14 p-1"
                      value={cssColorToHex(color) ?? "#6366f1"}
                      onChange={(e) => {
                        const next = [...colors];
                        next[index] = e.target.value;
                        onChange({ ...config, [control.key]: next });
                      }}
                    />
                    <Input
                      value={color}
                      onChange={(e) => {
                        const next = [...colors];
                        next[index] = e.target.value;
                        onChange({ ...config, [control.key]: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (control.kind === "color" || control.kind === "string") {
          const str = String(value ?? "");
          const showPicker = control.kind === "color" && cssColorToHex(str) !== null;
          return (
            <div key={control.key} className="space-y-2">
              <Label htmlFor={control.key}>{control.label}</Label>
              {control.hint ? <p className="text-muted-foreground text-xs">{control.hint}</p> : null}
              <div className="flex items-center gap-2">
                {showPicker ? (
                  <Input
                    type="color"
                    className="h-9 w-14 p-1"
                    value={cssColorToHex(str) ?? "#6366f1"}
                    onChange={(e) => onChange({ ...config, [control.key]: e.target.value })}
                  />
                ) : null}
                <Input
                  id={control.key}
                  value={str}
                  onChange={(e) => onChange({ ...config, [control.key]: e.target.value })}
                />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function cssColorToHex(input: string): string | null {
  if (/^#[0-9a-fA-F]{6}$/.test(input)) return input;
  if (/^#[0-9a-fA-F]{3}$/.test(input)) {
    return `#${input[1]}${input[1]}${input[2]}${input[2]}${input[3]}${input[3]}`;
  }
  if (/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.test(input)) {
    const m = input.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)!;
    const hex = (n: string) => Number(n).toString(16).padStart(2, "0");
    return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
  }
  return null;
}
