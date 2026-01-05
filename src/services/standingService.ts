import { supabase } from "@/integrations/superbase/client";
import { TournamentStanding } from "@/integrations/superbase/types";

export async function fetchTournamentStandings(tournamentId: string): Promise<TournamentStanding[]> {
  const { data, error } = await supabase
    .rpc('get_tournament_standings', { p_tournament_id: tournamentId });

  if (error) {
    console.error("Error fetching tournament standings:", error);
    throw error;
  }

  // Supabase RPC functions always return an array, even for single results
  // Ensure the return type matches the expected structure
  return data || [];
}
