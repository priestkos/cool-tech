const BKlit_CHARTS = {
  "area-chart": "area-chart",
  "candlestick-chart": "candlestick-chart",
  "funnel-chart": "funnel-chart",
  "radar-chart": "radar-chart",
} as const;

export type BklitChartSlug = keyof typeof BKlit_CHARTS;

export function bklitInstallCommand(slug: BklitChartSlug): string {
  const name = BKlit_CHARTS[slug];
  return `npx shadcn@latest add @bklit/${name}`;
}

export const HOSTED_REGISTRY_CAVEAT =
  "Installs from Bklit's hosted registry, which serves the latest main, not the pinned commit this demo was built from (f028db2).";

export const REPRODUCE_BUILD_SNIPPET = `# Reproduce this demo's chart versions (not needed to run the app)
git clone https://github.com/bklit/bklit-ui.git /tmp/bklit-ui
cd /tmp/bklit-ui && git checkout f028db249b9b95a895e071d9d2911cce5b7de40b
cd packages/ui && npx shadcn@4.22.1 build registry.json --output /tmp/bklit-r
# serve /tmp/bklit-r at http://127.0.0.1:3100/r/ then:
npx shadcn@4.22.1 add @bklit/area-chart @bklit/candlestick-chart @bklit/funnel-chart @bklit/radar-chart --yes --overwrite`;
