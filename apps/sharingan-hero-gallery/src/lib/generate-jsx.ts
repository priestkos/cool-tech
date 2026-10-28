export function generateHeroJsx(
  componentName: string,
  config: Record<string, unknown>,
  content: Record<string, unknown>,
): string {
  const configJson = JSON.stringify(config, null, 2).replace(/\n/g, "\n  ");
  const contentJson = JSON.stringify(content, null, 2).replace(/\n/g, "\n  ");
  return `<${componentName}\n  config={${configJson}}\n  content={${contentJson}}\n/>`;
}
