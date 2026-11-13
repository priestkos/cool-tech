import {
  Button,
  Canvas,
  Column,
  Document,
  Email,
  Heading,
  Image,
  Page,
  Text,
} from "@hyper-elements/react"
import type { ReactElement } from "react"
import type { CardDraft, StudioRoot } from "../shared/card-draft.ts"

export const LOGO_SRC = "asset://card-logo"

function cardBody(draft: CardDraft): ReactElement {
  return (
    <Column
      style={{
        backgroundColor: "#ffffff",
        padding: 24,
        gap: 16,
        borderRadius: 8,
      }}
    >
      <Image
        src={{ src: LOGO_SRC, width: 240, height: 80 }}
        alt="Hyper Elements Studio logo"
        style={{ width: 120 }}
      />
      <Heading level={1} style={{ fontSize: 24 }}>
        {draft.heading}
      </Heading>
      <Text
        style={
          draft.plantLayoutError
            ? ({
                marginBottom: 16,
                color: "#374151",
                lineHeight: 1.5,
              } as Record<string, unknown>)
            : { color: "#374151", lineHeight: 1.5 }
        }
      >
        {draft.body}
      </Text>
      <Button
        href={draft.buttonHref}
        style={{
          backgroundColor: "#111827",
          color: "#ffffff",
          borderRadius: 6,
          padding: [12, 20],
        }}
      >
        {draft.buttonLabel}
      </Button>
    </Column>
  )
}

export function buildTree(root: StudioRoot, draft: CardDraft): ReactElement {
  const inner = cardBody(draft)
  switch (root) {
    case "email":
      return (
        <Email
          width={600}
          previewText={draft.heading}
          fonts={
            draft.plantEmailFix
              ? [
                  {
                    family: "Arimo",
                    src: "asset://arimo-regular",
                    format: "truetype" as const,
                  },
                ]
              : undefined
          }
          style={{
            backgroundColor: "#f4f4f5",
            fontFamily: draft.plantEmailFix ? "Arimo" : "Arimo, Arial, sans-serif",
            gap: 16,
          }}
        >
          {inner}
        </Email>
      )
    case "page":
      return (
        <Page
          width={720}
          title={draft.heading}
          style={{
            backgroundColor: "#f8fafc",
            fontFamily: "Arimo, Arial, sans-serif",
            gap: 24,
          }}
        >
          {inner}
        </Page>
      )
    case "document":
      return (
        <Document
          size="A4"
          title={draft.heading}
          style={{
            fontFamily: "Arimo, Arial, sans-serif",
            gap: 16,
            backgroundColor: "#ffffff",
          }}
        >
          {inner}
        </Document>
      )
    case "canvas":
      return (
        <Canvas
          width={800}
          height={440}
          style={{
            fontFamily: "Arimo, Arial, sans-serif",
            backgroundColor: "#eef2ff",
            padding: 32,
            gap: 16,
            justifyContent: "center",
          }}
        >
          {inner}
        </Canvas>
      )
    default: {
      const _never: never = root
      throw new Error(`Unknown root: ${_never}`)
    }
  }
}
