export type MockScenario =
  | "weather"
  | "framework-compare"
  | "signup-form"
  | "cloud-table"
  | "fallback";

export const SUGGESTED_PROMPTS = [
  "What's the weather in San Francisco?",
  "Compare React and Vue",
  "Show me a signup form",
  "Compare cloud providers in a table",
] as const;

const WEATHER_RESPONSE = `root = Card([header, intro, metrics, forecast, actionBtns])
header = CardHeader("San Francisco Weather", "Monday, Oct 19 · Partly cloudy")
intro = TextContent("Downtown is mild with a light ocean breeze. Great day for a walk along the Embarcadero.")
metrics = OverviewCardBlock([m1, m2, m3], "grid", true)
m1 = OverviewCardItem("temp", m1top, m1val)
m1top = IconText(m1icon, "neutral", "m", "Temperature", "Feels like 64°F", false, "vertical")
m1icon = Icon("thermometer", "weather")
m1val = MetricIndicatorInline("68°F", "now")
m2 = OverviewCardItem("wind", m2top, m2val)
m2top = IconText(m2icon, "neutral", "m", "Wind", "From the west", false, "vertical")
m2icon = Icon("wind", "weather")
m2val = MetricIndicatorInline("12 mph", "gusts to 18")
m3 = OverviewCardItem("humidity", m3top, m3val)
m3top = IconText(m3icon, "neutral", "m", "Humidity", "Comfortable", false, "vertical")
m3icon = Icon("droplets", "weather")
m3val = MetricIndicatorInline("62%", "stable")
forecast = ListBlock([f1, f2, f3], "bullet")
f1 = ListItem("Morning: coastal fog clearing by 10am", "Low 58°F", null, null, @ToAssistant("Will it be sunny this afternoon in San Francisco?"))
f2 = ListItem("Afternoon: sunny breaks, high near 70°F", "UV index moderate", null, null, @ToAssistant("What should I wear in SF today?"))
f3 = ListItem("Evening: cool and breezy after sunset", "Layer up", null, null, @ToAssistant("Show the 7-day forecast for San Francisco"))
actionBtns = Buttons([btn1, btn2], "row")
btn1 = Button("Hourly forecast", @ToAssistant("Show hourly weather for San Francisco"), "primary")
btn2 = Button("Week ahead", @ToAssistant("Show the 7-day forecast for San Francisco"), "secondary")`;

const FRAMEWORK_COMPARE_RESPONSE = `root = Card([header, tabs, followUps])
header = CardHeader("React vs Vue", "A quick side-by-side for UI apps")
tabs = Tabs([tabReact, tabVue])
tabReact = TabItem("react", "React", reactContent)
tabVue = TabItem("vue", "Vue", vueContent)
reactContent = [TextContent("React is a library from Meta focused on component trees and one-way data flow."), Callout("info", "Strength", "Huge ecosystem, JSX, and strong hiring market.")]
vueContent = [TextContent("Vue is a progressive framework with single-file components and gentle onboarding."), Callout("success", "Strength", "Excellent docs and approachable templates for smaller teams.")]
followUps = FollowUpBlock([fu1, fu2])
fu1 = FollowUpItem("When should I pick React?")
fu2 = FollowUpItem("Show a feature comparison table")`;

const SIGNUP_FORM_RESPONSE = `root = Card([header, form])
header = CardHeader("Create an account", "Demo signup form — nothing is submitted")
form = Form("signup", btns, [nameField, emailField, roleField])
nameField = FormControl("Full name", Input("name", "Ada Lovelace", "text", { required: true, minLength: 2 }))
emailField = FormControl("Work email", Input("email", "you@example.com", "email", { required: true, email: true }))
roleField = FormControl("Role", Select("role", roleOpts, "Select a role", { required: true }))
roleOpts = [SelectItem("eng", "Engineering"), SelectItem("design", "Design"), SelectItem("pm", "Product")]
btns = Buttons([Button("Create account", @ToAssistant("Submit the signup form"), "primary"), Button("Cancel", @ToAssistant("Cancel signup"), "secondary")])`;

const CLOUD_TABLE_RESPONSE = `root = Card([header, tbl, followUps])
header = CardHeader("Cloud providers", "Snapshot for small teams — illustrative demo data")
tbl = Table([colProvider, colServerless, colFreeTier, colNotes])
colProvider = Col("Provider", ["AWS", "Google Cloud", "Azure"], "string")
colServerless = Col("Serverless", ["Lambda", "Cloud Functions", "Azure Functions"], "string")
colFreeTier = Col("Free tier", ["12-month trial", "Always-free credits", "12-month trial"], "string")
colNotes = Col("Best for", ["Broadest service catalog", "Data + ML tooling", "Microsoft stack shops"], "string")
followUps = FollowUpBlock([fu1, fu2])
fu1 = FollowUpItem("Which is cheapest for a hobby API?")
fu2 = FollowUpItem("Compare pricing models")`;

const FALLBACK_RESPONSE = `root = Card([header, body, followUps])
header = CardHeader("OpenUI Agent UI", "Generative UI instead of plain text")
body = TextContent("Ask about weather, frameworks, forms, or tables — or tap a suggested prompt. Replies render as OpenUI Lang components using the official @openuidev/react-lang Renderer.")
followUps = FollowUpBlock([fu1, fu2, fu3, fu4])
fu1 = FollowUpItem("What's the weather in San Francisco?")
fu2 = FollowUpItem("Compare React and Vue")
fu3 = FollowUpItem("Show me a signup form")
fu4 = FollowUpItem("Compare cloud providers in a table")`;

const SCENARIO_RESPONSES: Record<MockScenario, string> = {
  weather: WEATHER_RESPONSE,
  "framework-compare": FRAMEWORK_COMPARE_RESPONSE,
  "signup-form": SIGNUP_FORM_RESPONSE,
  "cloud-table": CLOUD_TABLE_RESPONSE,
  fallback: FALLBACK_RESPONSE,
};

export function detectMockScenario(message: string): MockScenario {
  const text = message.toLowerCase();

  if (text.includes("weather") || text.includes("forecast")) {
    return "weather";
  }
  if (
    (text.includes("react") && text.includes("vue")) ||
    text.includes("framework") ||
    text.includes("compare react")
  ) {
    return "framework-compare";
  }
  if (text.includes("form") || text.includes("signup") || text.includes("sign up")) {
    return "signup-form";
  }
  if (
    text.includes("cloud") ||
    text.includes("aws") ||
    text.includes("azure") ||
    (text.includes("table") && text.includes("provider"))
  ) {
    return "cloud-table";
  }

  return "fallback";
}

export function resolveMockResponse(message: string): string {
  const scenario = detectMockScenario(message);
  return SCENARIO_RESPONSES[scenario];
}
