import type { PlaygroundConfig } from "./config"
import { WALLET_BEHAVIOUR } from "./wallet-behaviour"

function jsxText(value: string) {
  return `{${JSON.stringify(value)}}`
}

export function generateWalletSnippet(config: PlaygroundConfig) {
  const cards = config.cards
    .map(
      (card) => `        <WalletCard className="${card.colorClass}">
          <WalletCardHeader>
            <WalletCardTitle>${jsxText(card.title)}</WalletCardTitle>
            <WalletCardDescription>${jsxText(card.description)}</WalletCardDescription>
          </WalletCardHeader>
          <WalletCardContent className="font-mono text-sm">
            ${jsxText(card.content)}
          </WalletCardContent>
        </WalletCard>`,
    )
    .join("\n")

  const jsx = `import {
  Wallet,
  WalletCard,
  WalletCardContent,
  WalletCardDescription,
  WalletCardHeader,
  WalletCards,
  WalletCardTitle,
  WalletLabel,
  WalletPocket,
} from "@/components/wallet"

export function DemoWallet() {
  return (
    <Wallet className="max-w-full" style={{ width: ${config.widthPx} }}>
      <WalletCards>
${cards}
      </WalletCards>
      <WalletPocket>
        <WalletLabel>${jsxText(config.pocketLabel)}</WalletLabel>
      </WalletPocket>
    </Wallet>
  )
}`

  const install = `npx shadcn@latest add @ncdai/wallet`

  const note = `# Installs the live registry HEAD (unpinned). This demo was built against ${WALLET_BEHAVIOUR.pin}.`

  return { jsx, install, note, full: `${install}\n\n# ${note}\n\n${jsx}` }
}
