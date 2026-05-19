import { NextRequest } from "next/server";
import { authError, isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return authError();
  }

  const { id } = await context.params;
  const { error } = await supabase.from("memos").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
