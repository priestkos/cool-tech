import { KITE_INTRO_SCREENSHOT_B64 } from "./screenshot-data"
import type { TranscriptEntry } from "@/cdp/types"

const documentRoot = {
  nodeId: 1,
  nodeType: 9,
  nodeName: "#document",
  localName: "",
  childNodeCount: 1,
  children: [
    {
      nodeId: 2,
      parentId: 1,
      nodeType: 10,
      nodeName: "html",
      localName: "html",
      childNodeCount: 2,
      children: [
        {
          nodeId: 3,
          parentId: 2,
          nodeType: 1,
          nodeName: "HEAD",
          localName: "head",
          childNodeCount: 1,
          children: [
            {
              nodeId: 4,
              parentId: 3,
              nodeType: 1,
              nodeName: "TITLE",
              localName: "title",
              nodeValue: "Kitesurf CDP Lab — Intro",
            },
          ],
        },
        {
          nodeId: 5,
          parentId: 2,
          nodeType: 1,
          nodeName: "BODY",
          localName: "body",
          childNodeCount: 3,
          children: [
            {
              nodeId: 6,
              parentId: 5,
              nodeType: 1,
              nodeName: "H1",
              localName: "h1",
              nodeValue: "Kitesurf CDP Lab",
              attributes: ["id", "hero-title"],
            },
            {
              nodeId: 7,
              parentId: 5,
              nodeType: 1,
              nodeName: "P",
              localName: "p",
              nodeValue: "Stateless browser fixtures — no upstream code.",
            },
            {
              nodeId: 8,
              parentId: 5,
              nodeType: 1,
              nodeName: "A",
              localName: "a",
              nodeValue: "Read CDP notes",
              attributes: ["href", "#notes", "id", "doc-link"],
            },
          ],
        },
      ],
    },
  ],
}

const kiteIntroLoad: TranscriptEntry[] = [
    {
      atMs: 0,
      direction: "request",
      payload: { id: 1, method: "Page.navigate", params: { url: "https://lab.local/kite-intro" } },
    },
    {
      atMs: 18,
      direction: "response",
      payload: { id: 1, result: { frameId: "lab-frame-1", loaderId: "lab-loader-1" } },
    },
    {
      atMs: 42,
      direction: "event",
      payload: {
        method: "Page.loadEventFired",
        params: { timestamp: 1731740000.12 },
      },
    },
    {
      atMs: 55,
      direction: "request",
      payload: { id: 2, method: "DOM.getDocument", params: { depth: -1, pierce: true } },
    },
    {
      atMs: 72,
      direction: "response",
      payload: { id: 2, result: { root: documentRoot } },
    },
    {
      atMs: 88,
      direction: "event",
      payload: {
        method: "Runtime.consoleAPICalled",
        params: {
          type: "log",
          args: [{ type: "string", value: "Lab page ready — fixture mode" }],
          timestamp: 1731740000.25,
        },
      },
    },
    {
      atMs: 104,
      direction: "event",
      payload: {
        method: "Runtime.consoleAPICalled",
        params: {
          type: "info",
          args: [{ type: "string", value: "DOM depth: 4" }],
          timestamp: 1731740000.31,
        },
      },
    },
    {
      atMs: 120,
      direction: "request",
      payload: { id: 3, method: "Page.captureScreenshot", params: { format: "png", fromSurface: true } },
    },
    {
      atMs: 168,
      direction: "response",
      payload: {
        id: 3,
        result: { data: KITE_INTRO_SCREENSHOT_B64 },
      },
    },
]

export const PAGE_LOAD_TRANSCRIPTS: Record<string, TranscriptEntry[]> = {
  "kite-intro": kiteIntroLoad,
  "agent-walk": kiteIntroLoad.map((e) =>
    e.direction === "request" &&
    "method" in e.payload &&
    e.payload.method === "Page.navigate"
      ? {
          ...e,
          payload: {
            ...e.payload,
            params: { url: "https://lab.local/agent-walk" },
          },
        }
      : e
  ),
}

export const AGENT_TASK_TRANSCRIPT: TranscriptEntry[] = [
  {
    atMs: 0,
    direction: "request",
    payload: { id: 10, method: "DOM.getDocument", params: { depth: 2 } },
  },
  {
    atMs: 14,
    direction: "response",
    payload: { id: 10, result: { root: documentRoot } },
  },
  {
    atMs: 28,
    direction: "request",
    payload: {
      id: 11,
      method: "DOM.performSearch",
      params: { query: "h1#hero-title" },
    },
  },
  {
    atMs: 44,
    direction: "response",
    payload: { id: 11, result: { searchId: "s1", resultCount: 1 } },
  },
  {
    atMs: 58,
    direction: "request",
    payload: {
      id: 12,
      method: "DOM.describeNode",
      params: { nodeId: 6 },
    },
  },
  {
    atMs: 74,
    direction: "response",
    payload: {
      id: 12,
      result: { node: { nodeId: 6, nodeValue: "Kitesurf CDP Lab" } },
    },
  },
  {
    atMs: 92,
    direction: "request",
    payload: {
      id: 13,
      method: "Runtime.callFunctionOn",
      params: { functionDeclaration: "() => document.querySelector('#doc-link')?.click()" },
    },
  },
  {
    atMs: 120,
    direction: "response",
    payload: { id: 13, result: { value: true } },
  },
  {
    atMs: 135,
    direction: "event",
    payload: {
      method: "Runtime.consoleAPICalled",
      params: {
        type: "log",
        args: [{ type: "string", value: "Agent: clicked #doc-link" }],
      },
    },
  },
  {
    atMs: 150,
    direction: "request",
    payload: { id: 14, method: "Runtime.evaluate", params: { expression: "document.body.innerText" } },
  },
  {
    atMs: 176,
    direction: "response",
    payload: {
      id: 14,
      result: {
        result: {
          type: "string",
          value: "Kitesurf CDP Lab\nStateless browser fixtures — no upstream code.\nRead CDP notes",
        },
      },
    },
  },
]