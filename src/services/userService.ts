import { supabase } from "@/integrations/superbase/client";

export async function checkAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .single();

  if (error) {
    console.error("Error checking admin role:", error);
    // Optionally re-throw or handle specific errors
    return false;
  }
  return data !== null;
}

// TODO: Add other user-related service functions if needed.