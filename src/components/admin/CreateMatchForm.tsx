import { useState } from "react";
// import { supabase } from "@/integrations/superbase/client"; // No longer needed directly for match creation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // Replaced by FormField and shadcn Input
// import { Label } from "@/components/ui/label"; // Replaced by FormLabel
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Team, Game, Tournament } from "@/integrations/superbase/types"; // Import Team, Game, Tournament
import { createMatch, MatchFormData } from "@/services/matchService"; // Import service
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Keep shadcn Input
import {
  DEFAULT_ODDS,
  MATCH_FORMAT_MIN_LENGTH,
  ODDS_MIN_VALUE,
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/superbase/client"; // Keep for odds creation temporarily
import { fetchTournaments } from "@/services/tournamentService"; // Import fetchTournaments
import { useQuery } from "@tanstack/react-query";


interface CreateMatchFormProps {
  teams: Team[];
  games: Game[];
  onMatchCreated: () => void;
}

const createMatchSchema = z.object({
  team1_id: z.string().min(1, "Veuillez sélectionner l'équipe 1."),
  team2_id: z.string().min(1, "Veuillez sélectionner l'équipe 2."),
  game_id: z.string().min(1, "Veuillez sélectionner un jeu."),
  tournament_id: z.string().optional().nullable(), // Make tournament_id optional
  match_date: z.string()
    .min(1, "Veuillez sélectionner une date et heure pour le match.")
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Le format de la date et de l'heure doit être AAAA-MM-JJTHH:MM"),
  status: z.enum(["programmed", "ongoing", "done", "cancel"]).default("programmed"),
  format: z.string().min(MATCH_FORMAT_MIN_LENGTH, `Le format doit contenir au moins ${MATCH_FORMAT_MIN_LENGTH} caractères.`).default("BO3"),
  // Default odds for creation - these aren't directly inserted into 'matches' table
  // but are needed for the odds creation logic, so we include them in the schema for validation
  odds_team1: z.number().min(ODDS_MIN_VALUE, `La cote doit être supérieure à ${ODDS_MIN_VALUE.toFixed(2)}.`).default(DEFAULT_ODDS),
  odds_team2: z.number().min(ODDS_MIN_VALUE, `La cote doit être supérieure à ${ODDS_MIN_VALUE.toFixed(2)}.`).default(DEFAULT_ODDS),
}).refine(data => data.team1_id !== data.team2_id, {
  message: "Les équipes doivent être différentes.",
  path: ["team2_id"], // Error message will be associated with team2_id
});


export function CreateMatchForm({ teams, games, onMatchCreated }: CreateMatchFormProps) {
  const form = useForm<z.infer<typeof createMatchSchema>>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      team1_id: "",
      team2_id: "",
      game_id: "",
      tournament_id: undefined, // Default to undefined
      match_date: new Date().toISOString().slice(0, 16), // Current date/time for default
      status: "programmed",
      format: "BO3",
      odds_team1: DEFAULT_ODDS,
      odds_team2: DEFAULT_ODDS,
    },
  });

  const [isCreating, setIsCreating] = useState(false);

  const { data: tournamentsResult, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ["allTournaments"],
    queryFn: () => fetchTournaments({ page: 1, pageSize: 1000 }), // Fetch all tournaments for selection
  });
  const tournaments = tournamentsResult?.data ?? [];

  const handleCreateMatch = async (values: z.infer<typeof createMatchSchema>) => {
    setIsCreating(true);
    try {
      const { odds_team1, odds_team2, tournament_id, ...restMatchData } = values;

      const matchData = {
        ...restMatchData,
        tournament_id: tournament_id === "null" ? null : tournament_id, // Convert "null" string to actual null
      };

      const newMatch = await createMatch(matchData as MatchFormData);
      
      if (!newMatch || !newMatch.id) {
        throw new Error("Match creation failed or returned no ID.");
      }

      await supabase.from("match_odds").insert([
        { match_id: newMatch.id, team_id: matchData.team1_id, odds: odds_team1 },
        { match_id: newMatch.id, team_id: matchData.team2_id, odds: odds_team2 },
      ]);

      toast.success("Match créé avec succès !");
      form.reset();
      onMatchCreated();
    } catch (error: any) {
      toast.error(`Erreur lors de la création du match: ${error.message || error}`);
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Plus className="mr-2 h-5 w-5 text-primary" />
          Créer un nouveau match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateMatch)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="team1_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipe 1</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Sélectionnez l'équipe 1" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border">
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="team2_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipe 2</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Sélectionnez l'équipe 2" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border">
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="game_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jeu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Sélectionnez le jeu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border">
                        {games.map((game) => (
                          <SelectItem key={game.id} value={game.id}>
                            {game.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tournament_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournoi (Optionnel)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "null"} disabled={isCreating || isLoadingTournaments}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Sélectionnez un tournoi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="null">Aucun</SelectItem> {/* Option for no tournament */}
                        {tournaments.map((tournament) => (
                          <SelectItem key={tournament.id} value={tournament.id}>
                            {tournament.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="match_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Heure du match</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="bg-background border-border"
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="BO3"
                        className="bg-background border-border"
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="odds_team1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cote Équipe 1</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`${DEFAULT_ODDS.toFixed(2)}`}
                        className="bg-background border-border"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odds_team2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cote Équipe 2</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`${DEFAULT_ODDS.toFixed(2)}`}
                        className="bg-background border-border"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!form.formState.isValid || isCreating}>
              {isCreating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
              ) : (
                "Créer le match"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}