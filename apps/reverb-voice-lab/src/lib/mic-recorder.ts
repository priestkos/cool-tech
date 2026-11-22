export async function recordMicrophoneClip(
  maxSeconds: number,
  onTick?: (elapsed: number) => void,
): Promise<ArrayBuffer> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm"

  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: Blob[] = []

  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const started = performance.now()

    const tick = window.setInterval(() => {
      onTick?.((performance.now() - started) / 1000)
    }, 100)

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunks.push(ev.data)
    }

    recorder.onerror = () => {
      clearInterval(tick)
      for (const track of stream.getTracks()) track.stop()
      reject(new Error("Recording failed."))
    }

    recorder.onstop = async () => {
      clearInterval(tick)
      for (const track of stream.getTracks()) track.stop()
      const blob = new Blob(chunks, { type: mimeType })
      resolve(await blob.arrayBuffer())
    }

    recorder.start(200)
    window.setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop()
    }, maxSeconds * 1000)
  })
}