import { ChatApp } from "@/components/chat-app";
import { getAppMode } from "@/lib/server-mode";

export default function Home() {
  const mode = getAppMode();
  return (
    <main className="flex h-dvh flex-col">
      <ChatApp initialMode={mode} />
    </main>
  );
}
