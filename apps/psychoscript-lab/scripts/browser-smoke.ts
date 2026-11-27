import { chromium, type Page } from "playwright"

const PORT = process.env.PSYCHOSCRIPT_LAB_API_PORT ?? "4177"
const WEB = process.env.PSYCHOSCRIPT_LAB_WEB_PORT ?? "5188"
const apiBase = `http://127.0.0.1:${PORT}`
const webBase = `http://127.0.0.1:${WEB}`

async function waitForOk(url: string, attempts = 40) {
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

function externalRequests(page: Page) {
  const externals: string[] = []
  page.on("request", (req) => {
    const u = req.url()
    if (!u.startsWith(webBase) && !u.startsWith(apiBase) && !u.startsWith("data:")) {
      externals.push(u)
    }
  })
  return externals
}

async function smokeViewport(page: Page, name: string, width: number, height: number) {
  await page.setViewportSize({ width, height })
  await page.goto(webBase, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Run script", exact: true }).focus()
  await page.keyboard.press("Tab")
  const runPreset = page.getByRole("button", { name: /Run preset/ })
  await expectFocused(runPreset)
  await runPreset.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `/opt/cursor/artifacts/psychoscript-smoke-${name}.png`, fullPage: true })

  await page.getByRole("button", { name: "Pause long-running preset" }).click()
  await page.waitForTimeout(800)
  await page.getByRole("button", { name: "Resume (parent)" }).click()
  await page.waitForTimeout(600)

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
  })
  if (overflow) throw new Error(`horizontal overflow on ${name}`)
}

async function expectFocused(locator: ReturnType<Page["getByRole"]>) {
  const box = await locator.boundingBox()
  if (!box) throw new Error("missing focus target")
}

async function main() {
  const server = Bun.spawn(["bun", "server/index.ts"], {
    cwd: import.meta.dir + "/..",
    env: { ...process.env, PSYCHOSCRIPT_LAB_API_PORT: PORT },
    stdout: "ignore",
    stderr: "inherit",
  })
  const vite = Bun.spawn(
    ["bun", "run", "vite", "--port", WEB, "--host", "127.0.0.1", "--strictPort"],
    {
      cwd: import.meta.dir + "/..",
      env: { ...process.env, PSYCHOSCRIPT_LAB_API_PORT: PORT },
      stdout: "ignore",
      stderr: "inherit",
    },
  )

  try {
    await waitForOk(`${apiBase}/api/health`)
    await waitForOk(webBase)

    const browser = await chromium.launch()
    const page = await browser.newPage()
    const externals = externalRequests(page)
    const consoleErrors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text())
    })

    await smokeViewport(page, "desktop-1440", 1440, 900)
    await smokeViewport(page, "mobile-390", 390, 844)

    if (externals.length) throw new Error(`external requests: ${externals.join(", ")}`)
    if (consoleErrors.length) throw new Error(`console errors: ${consoleErrors.join(" | ")}`)

    await browser.close()
    console.log("browser smoke ok")
  } finally {
    vite.kill()
    server.kill()
  }
}

await main()