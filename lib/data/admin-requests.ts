import { createClient } from "@/lib/supabase/server";

/**
 * `from`/`to` (YYYY-MM-DD) narrow to requests created in that range — pass the same value for
 * both to get a single day.
 */
export async function getAllRequestsAdmin(from?: string, to?: string) {
  const supabase = await createClient();
  let query = supabase.from("requests").select("*").order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", `${from}T00:00:00`);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999`);

  const { data, error } = await query;
  if (error) console.error("getAllRequestsAdmin:", error.message);
  return data ?? [];
}

export async function getRequestDetailAdmin(id: string) {
  const supabase = await createClient();
  const { data: request, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !request) return null;

  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", request.customer_id)
    .single();

  return { ...request, customer };
}
