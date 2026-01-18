import { supabase } from "@/integrations/superbase/client";
import { Game } from "@/integrations/superbase/types";

export async function fetchGames(): Promise<Game[]> {
  const { data, error } = await supabase.from("games").select("*").order("name");
  if (error) {
    console.error("Error fetching games:", error);
    throw new Error("Could not fetch games.");
  }
  return data || [];
}