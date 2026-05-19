import { NextRequest } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!verifyPassword(password)) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  await setSessionCookie();

  return Response.json({ ok: true });
}
