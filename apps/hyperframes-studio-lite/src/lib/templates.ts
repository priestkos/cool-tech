export type TemplateId = 'title-card' | 'kinetic-quote' | 'product-launch'

export type StudioTemplate = {
  id: TemplateId
  label: string
  description: string
  html: string
}

const sharedHead = (compositionId: string, duration: number) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1280, height=720" />
  <meta data-composition-id="${compositionId}" data-width="1280" data-height="720" data-fps="30" data-duration="${duration}" />
  <script src="./gsap.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1280px; height: 720px; overflow: hidden; font-family: "Inter", system-ui, sans-serif; }
    #stage { position: relative; width: 1280px; height: 720px; overflow: hidden; }
    .clip { position: absolute; inset: 0; visibility: hidden; }
  </style>
</head>
<body>
<div id="stage">`

const sharedFoot = (compositionId: string, timelineJs: string) => `
</div>
<script>
  var tl = gsap.timeline({ paused: true });
  ${timelineJs}
  window.__timelines = window.__timelines || {};
  window.__timelines["${compositionId}"] = tl;
</script>
</body>
</html>`

export const TEMPLATES: StudioTemplate[] = [
  {
    id: 'title-card',
    label: 'Title card',
    description: 'Headline and subtitle fade and slide in on a soft gradient.',
    html:
      sharedHead('title-card', 5) +
      `
  <div class="clip" data-start="0" data-duration="5" data-track-index="0"
       style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%);"></div>
  <div class="clip" id="title-wrap" data-start="0.2" data-duration="4.5" data-track-index="1"
       style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;">
    <h1 id="main-title" style="font-size:72px;font-weight:700;color:#f8fafc;letter-spacing:-0.02em;opacity:0;transform:translateY(40px);">
      HyperFrames Studio
    </h1>
    <p id="sub-title" style="font-size:28px;color:#94a3b8;opacity:0;transform:translateY(24px);">
      HTML compositions, frame-accurate preview, real MP4 export
    </p>
  </div>
` +
      sharedFoot(
        'title-card',
        `
  tl.to("#main-title", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.3);
  tl.to("#sub-title", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.75);
  tl.to("#main-title", { opacity: 0, y: -20, duration: 0.6, ease: "power2.in" }, 3.8);
  tl.to("#sub-title", { opacity: 0, duration: 0.5, ease: "power2.in" }, 4.0);
`,
      ),
  },
  {
    id: 'kinetic-quote',
    label: 'Kinetic quote',
    description: 'Words pop in one by one on a dark stage.',
    html:
      sharedHead('kinetic-quote', 6) +
      `
  <div class="clip" data-start="0" data-duration="6" data-track-index="0" style="background:#09090b;"></div>
  <div class="clip" id="quote-stage" data-start="0" data-duration="6" data-track-index="1"
       style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px 18px;padding:80px;">
    <span class="word" style="font-size:52px;font-weight:600;color:#fafafa;opacity:0;transform:scale(0.6);">Code</span>
    <span class="word" style="font-size:52px;font-weight:600;color:#38bdf8;opacity:0;transform:scale(0.6);">once,</span>
    <span class="word" style="font-size:52px;font-weight:600;color:#fafafa;opacity:0;transform:scale(0.6);">render</span>
    <span class="word" style="font-size:52px;font-weight:600;color:#a78bfa;opacity:0;transform:scale(0.6);">every</span>
    <span class="word" style="font-size:52px;font-weight:600;color:#fafafa;opacity:0;transform:scale(0.6);">frame.</span>
  </div>
` +
      sharedFoot(
        'kinetic-quote',
        `
  var words = document.querySelectorAll(".word");
  words.forEach(function (el, i) {
    tl.to(el, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.4 + i * 0.45);
  });
  tl.to(words, { opacity: 0, y: -12, duration: 0.5, stagger: 0.05, ease: "power2.in" }, 4.8);
`,
      ),
  },
  {
    id: 'product-launch',
    label: 'Product launch',
    description: 'Neutral product name, three features, and a CTA.',
    html:
      sharedHead('product-launch', 6) +
      `
  <div class="clip" data-start="0" data-duration="6" data-track-index="0"
       style="background: radial-gradient(circle at 20% 20%, #1d4ed8 0%, #0f172a 55%, #020617 100%);"></div>
  <div class="clip" id="launch" data-start="0" data-duration="6" data-track-index="1"
       style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:96px;gap:20px;">
    <p id="badge" style="font-size:18px;text-transform:uppercase;letter-spacing:0.2em;color:#93c5fd;opacity:0;">Introducing</p>
    <h1 id="product" style="font-size:64px;font-weight:700;color:#fff;opacity:0;transform:translateX(-30px);">Nimbus Desk</h1>
    <ul id="features" style="list-style:none;display:flex;flex-direction:column;gap:10px;margin-top:8px;">
      <li class="feat" style="font-size:26px;color:#e2e8f0;opacity:0;transform:translateX(-20px);">• Focus mode that dims distractions</li>
      <li class="feat" style="font-size:26px;color:#e2e8f0;opacity:0;transform:translateX(-20px);">• Layouts that adapt to your screen</li>
      <li class="feat" style="font-size:26px;color:#e2e8f0;opacity:0;transform:translateX(-20px);">• Syncs notes across devices</li>
    </ul>
    <p id="cta" style="margin-top:24px;font-size:22px;font-weight:600;color:#fbbf24;opacity:0;">Learn more at example.com</p>
  </div>
` +
      sharedFoot(
        'product-launch',
        `
  tl.to("#badge", { opacity: 1, duration: 0.5 }, 0.2);
  tl.to("#product", { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, 0.5);
  document.querySelectorAll(".feat").forEach(function (el, i) {
    tl.to(el, { opacity: 1, x: 0, duration: 0.55, ease: "power2.out" }, 1.1 + i * 0.55);
  });
  tl.to("#cta", { opacity: 1, duration: 0.6, ease: "power2.out" }, 3.4);
  tl.to("#launch", { opacity: 0, duration: 0.6, ease: "power2.in" }, 5.2);
`,
      ),
  },
]

export function getTemplate(id: TemplateId): StudioTemplate {
  const t = TEMPLATES.find((x) => x.id === id)
  if (!t) throw new Error(`Unknown template: ${id}`)
  return t
}

export const DEFAULT_TEMPLATE_ID: TemplateId = 'title-card'
