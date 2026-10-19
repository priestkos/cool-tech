import { getAppMode } from "@/lib/server-mode";

export async function GET() {
  return Response.json({ mode: getAppMode() });
}
