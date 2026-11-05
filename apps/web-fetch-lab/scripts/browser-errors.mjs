// Run manually with Node and Chromium while the lab's dev server is running.
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'

const profile = await mkdtemp(join(tmpdir(), 'web-fetch-browser-'))
const chrome = spawn(process.env.CHROMIUM || 'chromium', [
  '--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] })
let socket
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = ''
    const timer = setTimeout(() => reject(new Error('Chromium did not start')), 15000)
    chrome.on('error', reject)
    chrome.stderr.on('data', chunk => {
      output += chunk
      const match = output.match(/DevTools listening on (ws:\/\/\S+)/)
      if (match) { clearTimeout(timer); resolve(match[1]) }
    })
  })
  socket = new WebSocket(endpoint)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  let id = 0
  const pending = new Map()
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (!message.id) return
    const task = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) task.reject(new Error(message.error.message))
    else task.resolve(message.result)
  }
  const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const next = ++id
    pending.set(next, { resolve, reject })
    socket.send(JSON.stringify({ id: next, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
  const target = await call('Target.createTarget', { url: process.env.WEB_FETCH_LAB_URL || 'http://localhost:5173' })
  const { sessionId } = await call('Target.attachToTarget', { targetId: target.targetId, flatten: true })
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const waitFor = async expression => {
    for (let i = 0; i < 100; i++) {
      try {
        if (await evaluate(expression)) return
      } catch (error) {
        if (!/Cannot find default execution context|Execution context was destroyed/.test(error.message)) throw error
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw new Error(`Timed out waiting for ${expression}; page: ${await evaluate('document.body.innerText')}`)
  }
  await waitFor("document.querySelector('textarea') !== null")
  // Native setter ensures React sees a real input change.
  const setValue = (selector, value) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`)
  const click = text => evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`)
  await setValue('textarea', '')
  await click('Run agent')
  await waitFor("document.body.innerText.includes('Invalid request body')")
  assert.equal(await evaluate("document.querySelector('textarea') !== null"), true, 'the UI remains mounted')
  console.log('PASS: empty chat shows an error without unmounting the app')

  await click('Prompt injection test page')
  await click('Fetch')
  await waitFor("document.body.innerText.includes('title:')")
  await setValue('#allow', 'https://example.com')
  await click('Fetch')
  await waitFor("document.querySelector('[role=alert]')?.textContent.includes('Invalid request body')")
  assert.equal(await evaluate("document.body.innerText.includes('title:')"), false, 'failed fetch clears the stale result')
  await click('Run agent')
  await waitFor("document.querySelectorAll('[role=alert]').length === 2")
  assert.equal(await evaluate("document.querySelector('textarea') !== null"), true)
  console.log('PASS: real HTTP domain rejection in both panels clears stale results')

  await setValue('#allow', '')
  await click('Run agent')
  await waitFor("document.body.innerText.includes('Leak simulated')")
  assert.equal(await evaluate("document.querySelectorAll('[role=alert]').length"), 1, 'chat error clears on success')
  console.log('PASS: chat recovers after invalid input')

  await evaluate(`window.realFetch = window.fetch; window.fetch = (...args) => args[0] === '/api/chat' ? Promise.resolve(new Response(JSON.stringify({ error: 'SECRET_UPSTREAM_DETAIL' }), { status: 500 })) : window.realFetch(...args)`)
  await click('Run agent')
  await waitFor("document.body.innerText.includes('The server could not process the request')")
  assert.equal(await evaluate("document.body.innerText.includes('SECRET_UPSTREAM_DETAIL')"), false)
  assert.equal(await evaluate("document.body.innerText.includes('Leak simulated')"), false)
  await evaluate(`window.fetch = (...args) => args[0] === '/api/fetch' ? Promise.reject(new Error('SECRET_NETWORK_DETAIL')) : window.realFetch(...args)`)
  await click('Fetch')
  await waitFor("document.body.innerText.includes('Could not connect to the server')")
  assert.equal(await evaluate("document.body.innerText.includes('SECRET_NETWORK_DETAIL')"), false)
  console.log('PASS: safe feedback for server and network failures')

  await evaluate(`window.fetch = (...args) => args[0] === '/api/fetch' ? Promise.resolve(Response.json({ tool: { type: 'document' } })) : window.realFetch(...args)`)
  await click('Fetch')
  await waitFor("document.body.innerText.includes('The server returned an invalid response')")
  assert.equal(await evaluate("document.querySelector('textarea') !== null"), true)
  await evaluate(`window.fetch = (...args) => args[0] === '/api/chat' ? Promise.resolve(Response.json({ text: 'hello', steps: [null] })) : window.realFetch(...args)`)
  await click('Run agent')
  await waitFor("Array.from(document.querySelectorAll('[role=alert]')).filter(e => e.textContent.includes('The server returned an invalid response')).length === 2")
  assert.equal(await evaluate("document.querySelector('textarea') !== null"), true)
  console.log('PASS: malformed successful responses do not crash either panel')
  await evaluate(`window.fetch = (...args) => args[0] === '/api/chat' ? Promise.resolve(Response.json({ text: 'hello', steps: [{ toolCallId: '1', toolName: 'webFetch', input: { url: 'https://example.com' } }] })) : window.realFetch(...args)`)
  await click('Run agent')
  await waitFor("Array.from(document.querySelectorAll('[role=alert]')).filter(e => e.textContent.includes('The server returned an invalid response')).length === 2")
  assert.equal(await evaluate("document.body.innerText.includes('Agent: hello')"), false)
  console.log('PASS: missing tool output is rejected')
} finally {
  socket?.close()
  if (chrome.exitCode === null && chrome.signalCode === null) {
    const exited = new Promise(resolve => chrome.once('close', resolve))
    chrome.kill('SIGTERM')
    await exited
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
}
