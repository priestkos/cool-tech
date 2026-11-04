import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { InkProvider } from "@/looseleaf/lib/ink/react"
import { sketchKit } from "@/kits/sketch-kit"
import { KitPage } from "@/kit-page"
import "@/looseleaf.css"

const fontLink = document.querySelector('link[data-ll-fonts]')
if (!fontLink) {
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = "/fonts/kevin-sans.css"
  link.setAttribute("data-ll-fonts", "")
  document.head.appendChild(link)
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InkProvider>
      <KitPage kit={sketchKit} kitLabel="Looseleaf" />
    </InkProvider>
  </StrictMode>,
)
