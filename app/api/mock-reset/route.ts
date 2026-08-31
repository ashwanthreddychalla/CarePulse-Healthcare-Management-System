/**
 * POST /api/mock-reset — resets all in-memory mock Appwrite data.
 * Called by Playwright tests before each test to ensure clean state.
 * Only works when USE_MOCK_APPWRITE=true.
 */
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.USE_MOCK_APPWRITE !== "true") {
    return NextResponse.json({ error: "Mock mode not active" }, { status: 400 });
  }

  // Dynamic import to access the mock store reset function
  const mock = await import("../../../testing/mock-appwrite");
  mock.__clearAllData();
  mock.__seedDemoData();

  return NextResponse.json({ ok: true, message: "Mock data reset and seeded" });
}
