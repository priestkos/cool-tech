import { useState } from "react"
import { GlossyButton } from "@/components/dissolve/glossy-button"
import { LikeButton } from "@/components/dissolve/like-button"
import { ScratchCard } from "@/components/dissolve/scratch-card"
import { SwipeToDelete } from "@/components/dissolve/swipe-to-delete"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { InboxItem } from "@/features/archive"

type Props = {
  inbox: InboxItem[]
  onDeleteInbox: (id: string) => void
  scratchRevealed: boolean
  onScratchReveal: () => void
}

export function GallerySection({
  inbox,
  onDeleteInbox,
  scratchRevealed,
  onScratchReveal,
}: Props) {
  const [liked, setLiked] = useState(false)
  const [glossyClicks, setGlossyClicks] = useState(0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-heading text-lg">Scratch card</CardTitle>
            <Badge variant="outline">official demo lead-in</Badge>
          </div>
          <CardDescription>Scratch the foil — past threshold the rest turns to dust.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <ScratchCard
            width={320}
            height={200}
            color="#D9B26F"
            label="Scratch for lab credit"
            threshold={0.55}
            onReveal={onScratchReveal}
            className="shadow-md"
          >
            <div className="text-center">
              <p className="text-4xl font-bold tracking-tight text-[var(--dissolve-foreground)]">
                DUST
              </p>
              <p className="text-muted-foreground mt-1 text-sm">dissolve-ui · MIT</p>
            </div>
          </ScratchCard>
          {scratchRevealed ? (
            <p className="text-success text-sm" role="status">
              Revealed — foil dissolved via the real engine.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Swipe to delete</CardTitle>
          <CardDescription>Rows dissolve, then height and margins animate closed before onDelete.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {inbox.map((item) => (
            <SwipeToDelete
              key={item.id}
              onDelete={() => onDeleteInbox(item.id)}
              className="max-w-lg"
              rowClassName="rounded-2xl bg-[var(--dissolve-surface)]"
            >
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-[var(--dissolve-foreground)]">{item.title}</p>
                <p className="text-[var(--dissolve-muted)] text-xs leading-relaxed">{item.preview}</p>
              </div>
            </SwipeToDelete>
          ))}
          {inbox.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inbox empty — use Toast Undo to restore.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Press targets</CardTitle>
          <CardDescription>GlossyButton press dissolve and LikeButton snap/grain behaviour.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <GlossyButton
            onPress={() => setGlossyClicks((n) => n + 1)}
            color="#2F2F33"
            size="md"
          >
            Glossy press ({glossyClicks})
          </GlossyButton>
          <Separator orientation="vertical" className="hidden h-10 sm:block" />
          <LikeButton
            liked={liked}
            onChange={setLiked}
            count={liked ? 128 : 127}
            className="items-center"
            size={28}
          />
        </CardContent>
      </Card>
    </div>
  )
}