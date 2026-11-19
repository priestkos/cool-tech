import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { InMemorySpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { otelIntegration } from "eve/instrumentation/otel";

const tracePath = path.join(process.cwd(), ".eve", "lab-spans.json");

class FileFlushingExporter implements SpanExporter {
  private readonly memory = new InMemorySpanExporter();

  export(spans: Parameters<SpanExporter["export"]>[0], resultCallback: Parameters<SpanExporter["export"]>[1]) {
    this.memory.export(spans, (result) => {
      try {
        const finished = this.memory.getFinishedSpans().map((span) => ({
          name: span.name,
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
          parentSpanId: span.parentSpanId,
          startTime: span.startTime,
          endTime: span.endTime,
          attributes: span.attributes,
          status: span.status,
        }));
        mkdirSync(path.dirname(tracePath), { recursive: true });
        writeFileSync(tracePath, JSON.stringify({ spans: finished }, null, 2), "utf8");
      } catch {
        // best-effort for the lab panel
      }
      resultCallback(result);
    });
  }

  shutdown(): Promise<void> {
    return this.memory.shutdown();
  }

  forceFlush(): Promise<void> {
    return this.memory.forceFlush();
  }
}

export default otelIntegration({
  spanProcessors: [new SimpleSpanProcessor(new FileFlushingExporter())],
});