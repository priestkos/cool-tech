import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/index.css"
import { plainKit } from "@/kits/plain-kit"
import { KitPage } from "@/kit-page"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <KitPage kit={plainKit} kitLabel="Plain shadcn/ui" />
  </StrictMode>,
)
