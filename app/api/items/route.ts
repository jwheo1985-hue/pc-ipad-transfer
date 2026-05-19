import { authError, isAuthenticated } from "@/lib/auth";
import { Memo, StoredFile, supabase } from "@/lib/supabase";

export async function GET() {
  if (!(await isAuthenticated())) {
    return authError();
  }

  const [memosResult, filesResult] = await Promise.all([
    supabase.from("memos").select("id, body, created_at").order("created_at", { ascending: false }),
    supabase
      .from("files")
      .select("id, name, path, size, mime_type, created_at")
      .order("created_at", { ascending: false })
  ]);

  if (memosResult.error) {
    return Response.json({ error: memosResult.error.message }, { status: 500 });
  }

  if (filesResult.error) {
    return Response.json({ error: filesResult.error.message }, { status: 500 });
  }

  return Response.json({
    memos: (memosResult.data || []) as Memo[],
    files: (filesResult.data || []) as StoredFile[]
  });
}
