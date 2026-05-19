import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { authError, isAuthenticated } from "@/lib/auth";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";

function safeName(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_");
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return authError();
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "File is required" }, { status: 400 });
  }

  const cleanName = safeName(file.name || "upload");
  const path = `${randomUUID()}-${cleanName}`;
  const bytes = await file.arrayBuffer();

  const upload = await supabase.storage.from(env.supabaseBucket).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (upload.error) {
    return Response.json({ error: upload.error.message }, { status: 500 });
  }

  const insert = await supabase.from("files").insert({
    name: file.name || cleanName,
    path,
    size: file.size,
    mime_type: file.type || null
  });

  if (insert.error) {
    await supabase.storage.from(env.supabaseBucket).remove([path]);
    return Response.json({ error: insert.error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
