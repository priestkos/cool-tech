import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyInstallButton } from "@/components/copy-install-button";
import type { BklitChartSlug } from "@/lib/install-command";

export function ChartStudioCard({
  title,
  description,
  slug,
  emptyMessage,
  children,
}: {
  title: string;
  description: string;
  slug: BklitChartSlug;
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="gap-2 border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <CopyInstallButton slug={slug} />
        </div>
      </CardHeader>
      <CardContent className="flex min-h-[280px] flex-1 items-center justify-center p-3">
        {emptyMessage ? (
          <p className="text-center text-sm text-muted-foreground">
            Needs columns: <span className="font-medium text-foreground">{emptyMessage}</span>
          </p>
        ) : (
          <div className="h-[280px] w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
