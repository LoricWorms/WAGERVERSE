import { supabase } from "@/integrations/superbase/client";
import { Tournament } from "@/integrations/superbase/types";

// Type for tournament creation/update data
export type TournamentFormData = Omit<Tournament, "id" | "created_at" | "updated_at">;

export async function fetchTournaments({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from("tournaments")
    .select(
      `
      id,
      created_at,
      end_time,
      game_id,
      localisation,
      name,
      prize_pool,
      start_date,
      status,
      updated_at,
      game:games(name)
      `,
      { count: "exact" }
    )
    .order("start_date", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Error fetching tournaments:", error);
    throw error;
  }
  return { data, count };
}

export async function fetchTournamentById(id: string) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching tournament with ID ${id}:`, error);
    throw error;
  }
  return data;
}

export async function createTournament(tournament: TournamentFormData) {
  // Use tournament data directly, 'status' is now correct
  const { data, error } = await supabase
    .from("tournaments")
    .insert(tournament)
    .select()
    .single();

  if (error) {
    console.error("Error creating tournament:", error);
    throw error;
  }
  return data;
}

export async function updateTournament(id: string, tournament: Partial<TournamentFormData>) {
  // Use tournament data directly, 'status' is now correct
  const { data, error } = await supabase
    .from("tournaments")
    .update(tournament)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating tournament with ID ${id}:`, error);
    throw error;
  }
  return data;
}

export async function deleteTournament(id: string) {
  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting tournament with ID ${id}:`, error);
    throw error;
  }
  return true;
}
