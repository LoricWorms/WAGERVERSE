import { supabase } from "@/integrations/superbase/client";
import { PAGE_SIZE } from "@/lib/constants";
import { Match, Team } from "@/integrations/superbase/types";

export interface MatchFormData {
  team1_id: string;
  team2_id: string;
  start_time: string; // ISO string
  odds_team1: number;
  odds_team2: number;
  game_id: string;
  status: string;
  format: string;
}

export async function createMatch(match: MatchFormData) {
  const { data, error } = await supabase.from("matches").insert([match]).select().single();
  if (error) {
    console.error("Error creating match:", error);
    throw new Error("Could not create match.");
  }
  return data;
}

export async function deleteMatch(id: string) {
  const { error } = await supabase.from("matches").delete().eq("id", id);
  if (error) {
    console.error("Error deleting match:", error);
    throw new Error("Could not delete match.");
  }
}

export async function fetchMatches({ page = 1, pageSize = PAGE_SIZE }: { page?: number, pageSize?: number }) {

  const from = (page - 1) * pageSize;

  const to = from + pageSize - 1;



  const { data, error, count } = await supabase

    .from("matches")

    .select(

      `

      id,

      match_date,

      status,

      format,

      team1_score,

      team2_score,

      team1:teams!matches_team1_id_fkey(id, name),

      team2:teams!matches_team2_id_fkey(id, name),

      game:games(id, name)

    `,

    { count: "exact" }

    )

    .order("match_date", { ascending: false })

    .range(from, to);

    

  if (error) {

    console.error("Error fetching matches:", error);

    throw new Error("Could not fetch matches.");

  }



  return { data: data || [], count: count || 0 };

}