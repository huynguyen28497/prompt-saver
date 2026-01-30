import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

export const sql = postgres(connectionString, {
  max: 10,
});

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    context TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    ai_tool TEXT,
    use_case TEXT,
    rating INTEGER,
    from_image BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
`;

const MIGRATE_PROMPTS_SQL = `
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'user_id'
    ) THEN
      DROP TABLE IF EXISTS prompts;
      CREATE TABLE prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        title TEXT NOT NULL,
        context TEXT,
        description TEXT,
        tags TEXT[] DEFAULT '{}',
        ai_tool TEXT,
        use_case TEXT,
        rating INTEGER,
        from_image BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX idx_prompts_user_id ON prompts(user_id);
    END IF;
  END $$;
`;

export async function initDb() {
  await sql.unsafe(INIT_SQL);
  try {
    await sql.unsafe(MIGRATE_PROMPTS_SQL);
  } catch {
    // Ignore migration errors (e.g. fresh install)
  }
}
