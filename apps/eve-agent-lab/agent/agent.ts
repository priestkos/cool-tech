import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { defineAgent } from "eve";
import { mockModel } from "eve/evals";
import type { LanguageModel } from "ai";
import { labMockResponder } from "./lib/mock-script.js";

type LabRuntime = {
  useMock?: boolean;
  model?: string;
  apiKey?: string;
};

function readRuntimeModel(): LanguageModel | string {
  const runtimePath = path.join(process.cwd(), ".eve", "lab-runtime.json");
  if (!existsSync(runtimePath)) {
    return mockModel(labMockResponder);
  }

  try {
    const runtime = JSON.parse(readFileSync(runtimePath, "utf8")) as LabRuntime;
    if (runtime.useMock === false && runtime.model && runtime.apiKey) {
      process.env.AI_GATEWAY_API_KEY = runtime.apiKey;
      return runtime.model;
    }
  } catch {
    // fall through to mock
  }

  return mockModel(labMockResponder);
}

export default defineAgent({
  model: readRuntimeModel(),
  build: {
    externalDependencies: ["@opentelemetry/sdk-trace-base", "@opentelemetry/api"],
  },
});