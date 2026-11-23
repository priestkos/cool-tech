import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react"
import type { ClipId } from "./clips"
import { useAsogPlayer } from "./useAsogPlayer"

type AsogLab = ReturnType<typeof useAsogPlayer>

const AsogPlayerContext = createContext<AsogLab | null>(null)

export function AsogPlayerProvider({
  clipId,
  canvasRef,
  children,
}: {
  clipId: ClipId
  canvasRef: RefObject<HTMLCanvasElement | null>
  children: ReactNode
}) {
  const lab = useAsogPlayer(clipId, canvasRef)
  return <AsogPlayerContext.Provider value={lab}>{children}</AsogPlayerContext.Provider>
}

export function useAsogPlayerContext() {
  const ctx = useContext(AsogPlayerContext)
  if (!ctx) throw new Error("useAsogPlayerContext outside provider")
  return ctx
}

export function useAsogCanvasRef() {
  return useRef<HTMLCanvasElement>(null)
}