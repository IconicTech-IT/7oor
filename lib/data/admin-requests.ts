import { createClient } from "@/lib/supabase/server";

export async function getAllRequestsAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });
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
