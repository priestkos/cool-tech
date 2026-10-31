import type { BrandKit } from './brands'
import type { DeckFormat } from './formats'
import { escapeHtml } from './escape'
import type { Slide } from './parse-brief'

export type FontFaceInput = {
  family: string
  file: string
  weight?: string
  dataUrl: string
}

export type BuildDeckOptions = {
  kit: BrandKit
  format: DeckFormat
  slides: Slide[]
  fontFaces: FontFaceInput[]
  customAccent?: string | null
  showMockBadge?: boolean
  exportMode?: boolean
  initialSlideIndex?: number
}

function navScript(initialIndex: number): string {
  return `(function(){
  var slides=[].slice.call(document.querySelectorAll('[data-slide]'));
  var idx=${initialIndex};
  function show(i){
    idx=(i+slides.length)%slides.length;
    slides.forEach(function(s,n){ s.style.display=n===idx?'flex':'none'; });
    var c=document.getElementById('slide-counter');
    if(c) c.textContent=(idx+1)+' / '+slides.length;
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='PageDown'){ show(idx+1); }
    if(e.key==='ArrowLeft'||e.key==='PageUp'){ show(idx-1); }
  });
  document.querySelectorAll('[data-next]').forEach(function(el){
    el.addEventListener('click',function(){ show(idx+1); });
  });
  document.querySelectorAll('[data-prev]').forEach(function(el){
    el.addEventListener('click',function(){ show(idx-1); });
  });
  show(idx);
})();`
}

function tokenCss(kit: BrandKit, customAccent?: string | null): string {
  const lines = Object.entries(kit.tokens).map(([k, v]) => `  ${k}: ${v};`)
  if (customAccent) {
    lines.push(`  --brand-accent-custom: ${customAccent};`)
  }
  const display = kit.fontStacks.display.map((f) => `"${f}"`).join(', ')
  const text = kit.fontStacks.text.map((f) => `"${f}"`).join(', ')
  const mono = kit.fontStacks.mono.map((f) => `"${f}"`).join(', ')
  lines.push(`  --brand-font-display: ${display}, system-ui, sans-serif;`)
  lines.push(`  --brand-font-text: ${text}, system-ui, sans-serif;`)
  lines.push(`  --brand-font-mono: ${mono}, ui-monospace, monospace;`)
  return `:root {\n${lines.join('\n')}\n}`
}

function fontFaceCss(fonts: FontFaceInput[]): string {
  return fonts
    .map(
      (f) => `@font-face {
  font-family: "${f.family}";
  src: url("${f.dataUrl}") format("truetype");
  font-weight: ${f.weight ?? '400'};
  font-style: normal;
  font-display: swap;
}`,
    )
    .join('\n')
}

function barChartSvg(bars: Array<{ label: string; value: number }>, kit: BrandKit): string {
  const max = Math.max(...bars.map((b) => b.value), 1)
  const colors = [
    kit.tokens['--brand-color-signal'] ?? '#ff5a36',
    kit.tokens['--brand-color-moss'] ?? '#2f6b4f',
    kit.tokens['--brand-color-sky'] ?? '#8bb8e8',
    kit.tokens['--brand-color-graphite'] ?? '#4a4f57',
  ]
  const barW = 120
  const gap = 48
  const height = 320
  const baseY = 360
  const startX = 120
  const rects = bars
    .map((b, i) => {
      const h = Math.round((b.value / max) * height)
      const x = startX + i * (barW + gap)
      const y = baseY - h
      const fill = colors[i % colors.length] ?? colors[0]
      return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="8" fill="${fill}"/><text x="${x + barW / 2}" y="${baseY + 36}" text-anchor="middle" font-family="var(--brand-font-text)" font-size="22" fill="var(--brand-color-ink)">${escapeHtml(b.label)}</text><text x="${x + barW / 2}" y="${y - 12}" text-anchor="middle" font-family="var(--brand-font-mono)" font-size="20" fill="var(--brand-color-graphite)">${escapeHtml(String(b.value))}</text>`
    })
    .join('')
  return `<svg viewBox="0 0 880 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${rects}</svg>`
}

function slideHtml(slide: Slide, kit: BrandKit, index: number): string {
  const pad = '8%'
  const mark = kit.markSvg.replace('<svg', '<svg class="mark"')
  switch (slide.kind) {
    case 'title':
      return `<section data-slide="${index}" class="slide slide-title" style="padding:${pad}">
  <div class="mark-wrap">${mark}</div>
  <h1>${escapeHtml(slide.title)}</h1>
  <p class="subtitle">${escapeHtml(slide.subtitle)}</p>
  <span class="signal-bar"></span>
</section>`
    case 'bullets':
      return `<section data-slide="${index}" class="slide slide-bullets" style="padding:${pad}">
  <h2>${escapeHtml(slide.heading)}</h2>
  <ul>${slide.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
</section>`
    case 'stat':
      return `<section data-slide="${index}" class="slide slide-stat" style="padding:${pad}">
  <p class="stat-label">${escapeHtml(slide.label)}</p>
  <p class="stat-value">${escapeHtml(slide.value)}</p>
</section>`
    case 'chart':
      return `<section data-slide="${index}" class="slide slide-chart" style="padding:${pad}">
  <h2>${escapeHtml(slide.heading)}</h2>
  ${barChartSvg(slide.bars, kit)}
</section>`
    case 'closing':
      return `<section data-slide="${index}" class="slide slide-closing" style="padding:${pad}">
  <p class="closing">${escapeHtml(slide.line)}</p>
  <p class="voice">${escapeHtml(kit.voice)}</p>
  <div class="nav-hint"><button type="button" data-prev>←</button><button type="button" data-next">→</button></div>
</section>`
    default: {
      const _never: never = slide
      return _never
    }
  }
}

const baseStyles = `
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; background: var(--brand-color-paper); color: var(--brand-color-ink); }
body { font-family: var(--brand-font-text); font-weight: var(--brand-weight-text); }
.slide { width: 100%; height: 100%; display: none; flex-direction: column; justify-content: center; background: var(--brand-color-paper); position: relative; }
.slide-title h1 { font-family: var(--brand-font-display); font-weight: var(--brand-weight-display); letter-spacing: var(--brand-tracking-display); font-size: clamp(2.5rem, 5vw, 4.5rem); max-width: 16ch; line-height: 1.05; }
.subtitle { margin-top: 1.5rem; font-size: 1.35rem; color: var(--brand-color-graphite); max-width: 40ch; }
.signal-bar { display: block; width: 96px; height: 8px; background: var(--brand-color-signal); border-radius: var(--brand-radius-sm); margin-top: 2rem; }
.mark-wrap { position: absolute; top: 8%; right: 8%; width: 72px; }
.slide-bullets h2, .slide-chart h2 { font-family: var(--brand-font-display); font-weight: var(--brand-weight-strong); font-size: 2rem; margin-bottom: 1.5rem; }
.slide-bullets ul { list-style: none; padding: 0; display: grid; gap: 1rem; max-width: 48ch; }
.slide-bullets li { padding-left: 1.25rem; position: relative; font-size: 1.25rem; line-height: 1.4; }
.slide-bullets li::before { content: ""; position: absolute; left: 0; top: 0.55em; width: 8px; height: 8px; border-radius: var(--brand-radius-sm); background: var(--brand-color-signal); }
.stat-label { font-size: 1.25rem; color: var(--brand-color-graphite); max-width: 32ch; }
.stat-value { font-family: var(--brand-font-mono); font-size: clamp(4rem, 12vw, 7rem); color: var(--brand-color-signal); margin-top: 1rem; }
.slide-closing .closing { font-size: 2rem; font-family: var(--brand-font-display); max-width: 24ch; line-height: 1.2; }
.slide-closing .voice { margin-top: 2rem; font-size: 1rem; color: var(--brand-color-graphite); max-width: 36ch; }
.nav-hint { margin-top: auto; display: flex; gap: 0.5rem; }
.nav-hint button { font: inherit; padding: 0.35rem 0.75rem; border: 2px solid var(--brand-color-mist); background: var(--brand-color-white); border-radius: var(--brand-radius-md); cursor: pointer; }
.mock-badge { position: fixed; top: 12px; left: 12px; z-index: 9; font-size: 12px; font-family: var(--brand-font-mono); background: var(--brand-color-ink); color: var(--brand-color-paper); padding: 6px 10px; border-radius: var(--brand-radius-md); }
.disclaimer { position: fixed; bottom: 12px; left: 12px; right: 12px; font-size: 11px; color: var(--brand-color-graphite); }
`

export function buildDeckHtml(options: BuildDeckOptions): string {
  const {
    kit,
    format,
    slides,
    fontFaces,
    customAccent,
    showMockBadge = true,
    exportMode = false,
    initialSlideIndex = 0,
  } = options

  const slideSections = slides.map((s, i) => slideHtml(s, kit, i)).join('\n')
  const badge = showMockBadge
    ? '<div class="mock-badge">Mock mode · scripted templates · no AI</div>'
    : ''
  const disclaimer = exportMode
    ? '<p class="disclaimer">Unofficial demo inspired by LangChain Design Agent. Not affiliated; no AI runs in this file.</p>'
    : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=${format.width}, height=${format.height}"/>
<title>${escapeHtml(kit.name)} deck</title>
<style>
${fontFaceCss(fontFaces)}
${tokenCss(kit, customAccent)}
${baseStyles}
</style>
</head>
<body>
${badge}
<div id="slide-counter" style="position:fixed;top:12px;right:12px;font-family:var(--brand-font-mono);font-size:12px;"></div>
${slideSections}
${disclaimer}
<script>${navScript(initialSlideIndex)}</script>
</body>
</html>`

  return html
}

/** Returns true if the HTML contains suspicious external references. */
export function deckHasExternalUrls(html: string): boolean {
  const stripped = html
    .replace(/\sxmlns(:\w+)?="[^"]*"/gi, '')
    .replace(/https?:\/\/www\.w3\.org[^"'\s]*/gi, '')
  return /https?:\/\//i.test(stripped)
}

export function deckUsesBrandTokens(html: string): boolean {
  return html.includes('--brand-color-ink') && html.includes('--brand-font-display')
}

export function extractUserTextEscaped(raw: string, html: string): boolean {
  if (raw.includes('<') || raw.includes('>')) {
    return html.includes(escapeHtml(raw)) && !html.includes(raw)
  }
  return true
}
