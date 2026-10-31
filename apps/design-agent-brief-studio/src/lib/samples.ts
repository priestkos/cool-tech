export const SAMPLE_BRIEFS = [
  {
    id: 'launch',
    label: 'Product launch',
    text: `Q4 roadmap review for the analytics workspace

We are shipping three updates in November: faster query cache, shared dashboards, and CSV export limits raised to 50 MB.

- Cache warm-up drops p95 load time from 820 ms to 410 ms in staging
- Shared dashboards support 12 editors per board without conflicts
- Export jobs finish in under 90 s for typical accounts

Adoption target: 38% of active teams enable shared dashboards by January.`,
  },
  {
    id: 'onboarding',
    label: 'Onboarding metrics',
    text: `New user onboarding, week 42

Completion rate climbed after we shortened the setup wizard from 7 steps to 4.

- Sign-up to first project: median 6.2 min (was 11.4 min)
- Tutorial completion: 64% (was 51%)
- Support tickets tagged "getting started": down 22%

Goal for Q1: hold completion above 60% while adding SSO.`,
  },
  {
    id: 'research',
    label: 'Research readout',
    text: `Design systems survey, n=240

Teams want tokens and linting, not more Figma libraries.

- 71% reuse color tokens across web and slides
- 58% run automated contrast checks in CI
- 44% still export PNG decks for exec reviews

Recommendation: ship HTML decks with brand lint in the loop.`,
  },
] as const
