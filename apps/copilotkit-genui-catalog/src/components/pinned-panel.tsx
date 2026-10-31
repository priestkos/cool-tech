import { GenerativeUISurface } from "@copilotkit/react-core/v2/generative-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PinnedPanel() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pinned surface</CardTitle>
        <p className="text-muted-foreground text-sm">
          <code className="text-xs">GenerativeUISurface id="pinned"</code> — updated by
          chat replies using{" "}
          <code className="text-xs">```a2ui target=pinned</code> fences.
        </p>
      </CardHeader>
      <CardContent>
        <GenerativeUISurface
          id="pinned"
          className="min-h-[120px] rounded-lg border border-dashed p-3"
          fallback={
            <p className="text-muted-foreground text-sm">
              Empty — use the “Pin to page” chip in mock chat.
            </p>
          }
        />
      </CardContent>
    </Card>
  );
}
