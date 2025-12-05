import { supabase } from "@/integrations/superbase/client";
import { PAGE_SIZE } from "@/lib/constants";
import { Team } from "@/integrations/superbase/types"; // Import Team type

export interface TeamFormData {
  name: string;
  tag: string;
  founded_year: number;
  logo_url: string;
}

export async function createTeam(team: TeamFormData) {
  const { data, error } = await supabase.from("teams").insert([team]).select();
  if (error) {
    console.error("Error creating team:", error);
    throw new Error("Could not create team.");
  }
  return data;
}

export async function fetchTeams({ page = 1, pageSize = PAGE_SIZE }: { page?: number, pageSize?: number }) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("teams")
    .select("*", { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) {
    console.error("Error fetching teams:", error);
    throw new Error("Could not fetch teams.");
  }
  
  return { data: data || [], count: count || 0 };
}

export async function deleteTeam(id: string) {
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) {
    console.error("Error deleting team:", error);
    throw new Error("Could not delete team.");
  }
}