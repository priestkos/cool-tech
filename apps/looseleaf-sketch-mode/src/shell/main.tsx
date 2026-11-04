import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/index.css"
import { AppShellWithDefaults } from "@/shell/app-shell"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppShellWithDefaults />
  </StrictMode>,
)
