import { chromium, type Page } from "playwright"

const WEB = process.env.MIRAGE_LAB_WEB_PORT ?? "5193"
const webBase = `http://127.0.0.1:${WEB}`

async function waitForOk(url: string, attempts = 60) {
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
  await page.getByLabel("Shell command").waitFor({ state: "visible" })

  await page.getByRole("button", { name: "grep -rl invoice across mounts" }).click()
  await page.waitForTimeout(700)

  await page.getByRole("button", { name: 'echo "$USER" > /scratch/me.txt' }).click()
  await page.waitForTimeout(700)

  await page.getByLabel("Profile").click()
  await page.getByRole("option", { name: "analyst" }).click()
  await page.getByRole("button", { name: "[analyst] try rm (denied)" }).click()
  await page.waitForTimeout(600)

  await page.getByLabel("Profile").click()
  await page.getByRole("option", { name: "admin" }).click()
  await page.getByRole("tab", { name: "Command log" }).click()
  await page.waitForTimeout(300)

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4,
  )
  if (overflow) throw new Error(`horizontal overflow on ${name}`)

  await page.screenshot({
    path: `/opt/cursor/artifacts/mirage-terminal-smoke-${name}.png`,
    fullPage: true,
  })
}

async function main() {
  const vite = Bun.spawn(
    [
      "bun",
      "run",
      "vite",
      "preview",
      "--port",
      WEB,
      "--host",
      "127.0.0.1",
      "--strictPort",
    ],
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
    if (consoleErrors.length) throw new Error(`console errors: ${consoleErrors.join(" | ")}`)

    await context.close()
    const video = page.video()
    if (video) {
      await video.saveAs("/opt/cursor/artifacts/mirage-terminal-lab-demo.mp4")
    }
    await browser.close()
    console.log("browser smoke ok")
  } finally {
    vite.kill()
  }
}

await main()