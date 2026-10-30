import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  bklitInstallCommand,
  HOSTED_REGISTRY_CAVEAT,
  type BklitChartSlug,
} from "@/lib/install-command";

export function CopyInstallButton({ slug }: { slug: BklitChartSlug }) {
  const command = bklitInstallCommand(slug);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      toast.success("Install command copied", {
        description: HOSTED_REGISTRY_CAVEAT,
      });
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={copyCommand}>
        <Copy className="size-3.5" />
        Copy install command
      </Button>
      <p className="max-w-xs text-[11px] leading-snug text-muted-foreground">{HOSTED_REGISTRY_CAVEAT}</p>
    </div>
  );
}
