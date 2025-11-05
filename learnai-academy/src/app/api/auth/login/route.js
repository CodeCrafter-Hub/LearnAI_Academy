import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({"ok": true, "route": "auth/login", "method": "GET"});
}
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({"ok": true, "route": "auth/login", "method": "POST", body});
}
