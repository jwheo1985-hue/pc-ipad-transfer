import { NextRequest } from "next/server";
import { authError, isAuthenticated } from "@/lib/auth";
import { env } from "@/lib/env";
import { supabase, StoredFile } from "@/lib/supabase";

async function findFile(id: string) {
  return supabase
    .from("files")
    .select("id, name, path, size, mime_type, created_at")
    .eq("id", id)
    .single<StoredFile>();
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return authError();
  }

  const { id } = await context.params;
  const { data, error } = await findFile(id);

  if (error || !data) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  const download = await supabase.storage.from(env.supabaseBucket).download(data.path);

  if (download.error) {
    return Response.json({ error: download.error.message }, { status: 500 });
  }

  return new Response(download.data, {
    headers: {
      "Content-Type": data.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(data.name)}"`
    }
  });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return authError();
  }

  const { id } = await context.params;
  const { data, error } = await findFile(id);

  if (error || !data) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  const storage = await supabase.storage.from(env.supabaseBucket).remove([data.path]);

  if (storage.error) {
    return Response.json({ error: storage.error.message }, { status: 500 });
  }

  const remove = await supabase.from("files").delete().eq("id", id);

  if (remove.error) {
    return Response.json({ error: remove.error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
