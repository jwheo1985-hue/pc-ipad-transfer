import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export type Memo = {
  id: string;
  body: string;
  created_at: string;
};

export type StoredFile = {
  id: string;
  name: string;
  path: string;
  size: number;
  mime_type: string | null;
  created_at: string;
};

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false
  }
});
