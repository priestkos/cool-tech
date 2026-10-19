export async function streamTextChunks(
  text: string,
  chunkSize = 48,
  delayMs = 12,
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < text.length; i += chunkSize) {
        const slice = text.slice(i, i + chunkSize);
        controller.enqueue(encoder.encode(slice));
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      controller.close();
    },
  });
}
