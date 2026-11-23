import { useState, type ReactNode } from "react"

import { ControlBoard, type BackdropMode } from "@/features/lab/ControlBoard"
import { DEFAULT_TUNING, type LabTuning } from "@/features/lab/tuning"

export default function App() {
  const [backdrop, setBackdrop] = useState<BackdropMode>("photo")
  const [tuning, setTuning] = useState<LabTuning>(DEFAULT_TUNING)

  return (
    <MotionBack scene={backdrop}>
      <ControlBoard
        backdrop={backdrop}
        onBackdropChange={setBackdrop}
        tuning={tuning}
        onTuningChange={setTuning}
      />
    </MotionBack>
  )
}

function MotionBack({ scene, children }: { scene: BackdropMode; children: ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center transition-opacity duration-500"
        style={{
          opacity: scene === "photo" ? 1 : 0,
          backgroundImage: "url(/backdrop-vivid.svg)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 motion-safe:animate-[aurora_18s_ease-in-out_infinite_alternate]"
        style={{
          opacity: scene === "gradient" ? 1 : 0,
          backgroundImage:
            "linear-gradient(125deg, #ff6b6b 0%, #feca57 22%, #48dbfb 48%, #5f27cd 72%, #ff9ff3 100%)",
          backgroundSize: "240% 240%",
        }}
        aria-hidden
      />
      <style>{`
        @keyframes aurora {
          0% { background-position: 0% 40%; }
          100% { background-position: 100% 60%; }
        }
      `}</style>
      {children}
    </div>
  )
}