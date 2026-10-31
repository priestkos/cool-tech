import {
  buildChatSurfaceReply,
  buildTargetSurfaceFence,
  type SampleComponent,
} from "./a2ui";

export interface SuggestionChip {
  id: string;
  label: string;
  prompt: string;
}

export const SUGGESTION_CHIPS: SuggestionChip[] = [
  {
    id: "form",
    label: "Signup form",
    prompt: "Show a signup form with validation",
  },
  {
    id: "table",
    label: "Data table",
    prompt: "Show a data table",
  },
  {
    id: "chart",
    label: "Chart",
    prompt: "Show a chart of quarterly revenue",
  },
  {
    id: "slider",
    label: "Pricing slider",
    prompt: "Show pricing with a live slider",
  },
  {
    id: "pin",
    label: "Pin to page",
    prompt: "Pin a highlight badge to the page",
  },
];

const SIGNUP_COMPONENTS: SampleComponent[] = [
  {
    id: "root",
    component: "Form",
    children: ["title", "email", "password", "submit"],
  },
  {
    id: "title",
    component: "Title",
    text: "Create your account",
    size: "lg",
  },
  {
    id: "email",
    component: "TextField",
    label: "Email",
    inputType: "email",
    value: { "@path": "/email" },
    required: true,
  },
  {
    id: "password",
    component: "TextField",
    label: "Password",
    inputType: "password",
    value: { "@path": "/password" },
    required: true,
  },
  {
    id: "submit",
    component: "Button",
    label: "Sign up",
    variant: "primary",
  },
];

const TABLE_COMPONENTS: SampleComponent[] = [
  { id: "root", component: "Table", children: ["head", "r1", "r2"] },
  {
    id: "head",
    component: "TableSection",
    variant: "head",
    children: ["h1", "h2", "h3"],
  },
  { id: "h1", component: "TableCell", children: ["ht1"] },
  { id: "ht1", component: "Text", text: "Plan", fontWeight: "medium" },
  { id: "h2", component: "TableCell", children: ["ht2"] },
  { id: "ht2", component: "Text", text: "Seats", fontWeight: "medium" },
  { id: "h3", component: "TableCell", children: ["ht3"] },
  { id: "ht3", component: "Text", text: "Price", fontWeight: "medium" },
  { id: "r1", component: "TableRow", children: ["c11", "c12", "c13"] },
  { id: "c11", component: "TableCell", children: ["t11"] },
  { id: "t11", component: "Text", text: "Starter" },
  { id: "c12", component: "TableCell", children: ["t12"] },
  { id: "t12", component: "Text", text: "5" },
  { id: "c13", component: "TableCell", children: ["t13"] },
  { id: "t13", component: "Text", text: "$29" },
  { id: "r2", component: "TableRow", children: ["c21", "c22", "c23"] },
  { id: "c21", component: "TableCell", children: ["t21"] },
  { id: "t21", component: "Text", text: "Team" },
  { id: "c22", component: "TableCell", children: ["t22"] },
  { id: "t22", component: "Text", text: "25" },
  { id: "c23", component: "TableCell", children: ["t23"] },
  { id: "t23", component: "Text", text: "$290" },
];

const CHART_COMPONENTS: SampleComponent[] = [
  {
    id: "root",
    component: "Chart",
    chartType: "bar",
    title: "Quarterly revenue",
    data: [
      { label: "Q1", value: 120 },
      { label: "Q2", value: 156 },
      { label: "Q3", value: 142 },
      { label: "Q4", value: 188 },
    ],
  },
];

const SLIDER_COMPONENTS: SampleComponent[] = [
  { id: "root", component: "Card", children: ["title", "slider", "price"] },
  {
    id: "title",
    component: "Title",
    text: "Team plan estimator",
    size: "md",
  },
  {
    id: "slider",
    component: "Slider",
    label: "Seats",
    min: 1,
    max: 50,
    value: { "@path": "/seats" },
  },
  {
    id: "price",
    component: "Text",
    text: { "@path": "/priceLabel" },
    fontWeight: "medium",
  },
];

const PIN_COMPONENTS: SampleComponent[] = [
  { id: "root", component: "Column", gap: 2, children: ["badge", "text"] },
  {
    id: "badge",
    component: "Badge",
    label: "Pinned highlight",
    color: "discovery",
  },
  {
    id: "text",
    component: "Caption",
    text: "This surface is filled from chat via target=pinned.",
  },
];

export const MOCK_REPLIES: Record<string, string> = {
  form: buildChatSurfaceReply(
    "Here is a signup form built from the standard catalog (scripted mock reply).",
    "chat-signup",
    SIGNUP_COMPONENTS,
    { email: "", password: "" },
  ),
  table: buildChatSurfaceReply(
    "Here is a pricing table (scripted mock reply).",
    "chat-table",
    TABLE_COMPONENTS,
  ),
  chart: buildChatSurfaceReply(
    "Quarterly revenue chart (scripted mock reply).",
    "chat-chart",
    CHART_COMPONENTS,
  ),
  slider: buildChatSurfaceReply(
    "Drag the slider — the price label is bound to app state (scripted mock reply).",
    "chat-pricing",
    SLIDER_COMPONENTS,
    { seats: 10, priceLabel: "$290 / month for 10 seats" },
  ),
  pin: `Pinned to the **Pinned** panel on the page (scripted mock reply).\n\n${buildTargetSurfaceFence("pinned", "pinned-highlight", PIN_COMPONENTS)}\n`,
};

export type MockIntentId = keyof typeof MOCK_REPLIES;

export function matchIntent(userText: string): MockIntentId | null {
  const text = userText.trim().toLowerCase();
  if (!text) return null;
  if (text.includes("signup") || text.includes("form")) return "form";
  if (text.includes("table")) return "table";
  if (text.includes("chart") || text.includes("revenue")) return "chart";
  if (text.includes("slider") || text.includes("pricing")) return "slider";
  if (text.includes("pin")) return "pin";
  for (const chip of SUGGESTION_CHIPS) {
    if (text === chip.prompt.toLowerCase()) {
      return chip.id as MockIntentId;
    }
  }
  return null;
}

export function replyForIntent(intent: MockIntentId): string {
  return MOCK_REPLIES[intent];
}

export function fallbackReply(): string {
  const options = SUGGESTION_CHIPS.map((c) => c.label).join(", ");
  return `I only have scripted demo replies in mock mode. Try: ${options}.`;
}

export function replyForUserMessage(userText: string): string {
  const intent = matchIntent(userText);
  if (intent) return replyForIntent(intent);
  return fallbackReply();
}

export function allMockReplyBodies(): string[] {
  return Object.values(MOCK_REPLIES);
}
