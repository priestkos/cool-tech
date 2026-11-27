import { chromium, type Page } from "playwright"

const WEB = process.env.TM_LAB_WEB_PORT ?? "5277"
const webBase = `http://127.0.0.1:${WEB}`

async function waitForOk(url: string, attempts = 80) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await Bun.sleep(250)
  }
  throw new Error(`timeout waiting for ${url}`)
}

function trackExternals(page: Page) {
  const externals: string[] = []
  page.on("request", (req) => {
    const u = req.url()
    if (!u.startsWith(webBase) && !u.startsWith("data:") && !u.startsWith("blob:")) {
      externals.push(u)
    }
  })
  return externals
}

async function smokeViewport(page: Page, name: string, width: number, height: number) {
  await page.setViewportSize({ width, height })
  await page.goto(webBase, { waitUntil: "networkidle", timeout: 120_000 })
  await page.getByRole("heading", { name: "Talking Marble Voice Lab" }).waitFor({ state: "visible" })

  await page.getByRole("button", { name: "thinking" }).click()
  await page.waitForTimeout(500)
  await page.getByRole("button", { name: "happy" }).click()
  await page.waitForTimeout(500)
  await page.getByRole("button", { name: "aurora" }).click()
  await page.waitForTimeout(500)
  await page.getByRole("button", { name: "speaking" }).click()
  await page.waitForTimeout(400)
  await page.getByRole("button", { name: "ember" }).click()
  await page.waitForTimeout(400)
  await page.getByRole("button", { name: "labGlow" }).click()
  await page.waitForTimeout(600)

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4,
  )
  if (overflow) throw new Error(`horizontal overflow on ${name}`)

  await page.screenshot({
    path: `/opt/cursor/artifacts/talking-marble-voice-lab-smoke-${name}.png`,
    fullPage: true,
  })
}

async function main() {
  const vite = Bun.spawn(
    ["bun", "run", "vite", "preview", "--port", WEB, "--host", "127.0.0.1", "--strictPort"],
    {
      cwd: `${import.meta.dir}/..`,
      stdout: "ignore",
      stderr: "inherit",
    },
  )

  try {
    await waitForOk(webBase)
    const browser = await chromium.launch()
    const context = await browser.newContext({
      recordVideo: { dir: "/opt/cursor/artifacts", size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    const externals = trackExternals(page)
    const consoleErrors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text())
    })

    await smokeViewport(page, "desktop-1440", 1440, 900)
    await smokeViewport(page, "mobile-390", 390, 844)

    if (externals.length) throw new Error(`external requests: ${externals.join(", ")}`)
    const fatalConsole = consoleErrors.filter((e) => !e.includes("favicon"))
    if (fatalConsole.length) throw new Error(`console errors: ${fatalConsole.join(" | ")}`)

    await context.close()
    const video = page.video()
    if (video) {
      await video.saveAs("/opt/cursor/artifacts/talking-marble-voice-lab-demo.mp4")
    }
    await browser.close()
    console.log("browser smoke ok")
  } finally {
    vite.kill()
  }
}

await main()