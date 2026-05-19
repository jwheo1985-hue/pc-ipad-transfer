function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  appPassword: requireEnv("APP_PASSWORD"),
  sessionSecret: requireEnv("SESSION_SECRET"),
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseBucket: process.env.SUPABASE_BUCKET || "transfer-files"
};
