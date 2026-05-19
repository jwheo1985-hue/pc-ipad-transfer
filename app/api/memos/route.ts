import { NextRequest } from "next/server";
import { authError, isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return authError();
  }

  const body = await request.json().catch(() => null);
  const memo = typeof body?.body === "string" ? body.body.trim() : "";

  if (!memo) {
    return Response.json({ error: "Memo cannot be empty" }, { status: 400 });
  }

  const { error } = await supabase.from("memos").insert({ body: memo });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
