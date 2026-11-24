import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UPSTREAM_PIN } from "@/constants"

export function AboutPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        About / credits
      </Button>
      {open && (
        <Card className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,22rem)] border-border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sprite Stack Studio</CardTitle>
            <CardDescription className="text-xs">
              Independent demo — not affiliated with Daniel White or danielwh2/sprite-stacking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              Vendored real MIT code at{" "}
              <a className="text-foreground underline" href={UPSTREAM_PIN.repo} target="_blank" rel="noreferrer">
                danielwh2/sprite-stacking
              </a>{" "}
              commit <code>{UPSTREAM_PIN.commit.slice(0, 12)}</code>.
            </p>
            <p>
              Launch context:{" "}
              <a className="text-foreground underline" href={UPSTREAM_PIN.launchPost} target="_blank" rel="noreferrer">
                @dwhitedesign on X
              </a>
            </p>
            <p className="border-t border-border pt-2 text-[10px] leading-relaxed">
              MIT License — Copyright (c) 2026 Daniel White. Permission is hereby granted, free of charge, to any
              person obtaining a copy of this software and associated documentation files… (see THIRD_PARTY_LICENSES).
            </p>
            <p className="text-[10px]">
              Sample gallery sheets are original demo pixel art for this app, not upstream files.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}