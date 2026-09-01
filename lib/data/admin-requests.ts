import { createClient } from "@/lib/supabase/server";

/** `date` (YYYY-MM-DD) narrows to requests created that single calendar day, when provided. */
export async function getAllRequestsAdmin(date?: string) {
  const supabase = await createClient();
  let query = supabase.from("requests").select("*").order("created_at", { ascending: false });

  if (date) {
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59.999`;
    query = query.gte("created_at", start).lte("created_at", end);
  }

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
