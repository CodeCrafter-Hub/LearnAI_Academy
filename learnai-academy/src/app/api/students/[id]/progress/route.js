import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({"ok": true, "route": "students/[id]/progress", "method": "GET"});
}
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({"ok": true, "route": "students/[id]/progress", "method": "POST", body});
}
