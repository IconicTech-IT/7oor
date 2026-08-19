import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Cookie-free client for public, anonymous-readable data (products, categories,
 * availability). Required inside unstable_cache() callbacks, which forbid Request-time
 * APIs like cookies() — the regular lib/supabase/server.ts client reads cookies to carry
 * the caller's session, which would both break the cache and leak no useful RLS context
 * anyway for data every visitor already sees identically. Never use this for anything
 * user-scoped or auth-gated.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
