import { useState } from "react";
// import { supabase } from "@/integrations/superbase/client"; // No longer needed directly for match creation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // Replaced by FormField and shadcn Input
// import { Label } from "@/components/ui/label"; // Replaced by FormLabel
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Team } from "@/services/teamService"; // Import Team from service
import { Game } from "@/services/gameService"; // Import Game from service
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


interface CreateMatchFormProps {
  teams: Team[];
  games: Game[];
  onMatchCreated: () => void;
}

const createMatchSchema = z.object({
  team1_id: z.string().min(1, "Veuillez sélectionner l'équipe 1."),
  team2_id: z.string().min(1, "Veuillez sélectionner l'équipe 2."),
  game_id: z.string().min(1, "Veuillez sélectionner un jeu."),
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
  // const [matchForm, setMatchForm] = useState(...) -> Replaced by useForm
  const form = useForm<z.infer<typeof createMatchSchema>>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      team1_id: "",
      team2_id: "",
      game_id: "",
      match_date: new Date().toISOString().slice(0, 16), // Current date/time for default
      status: "programmed",
      format: "BO3",
      odds_team1: DEFAULT_ODDS,
      odds_team2: DEFAULT_ODDS,
    },
  });

  const handleCreateMatch = async (values: z.infer<typeof createMatchSchema>) => {
    try {
      // Destructure values for match creation and odds creation
      const { odds_team1, odds_team2, ...matchData } = values;

      const newMatch = await createMatch(matchData as MatchFormData); // Use service
      
      if (!newMatch || !newMatch.id) {
        throw new Error("Match creation failed or returned no ID.");
      }

      // Create default odds - This part should also ideally be in a service (e.g., oddsService)
      // For now, keeping it here with error handling.
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
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Créer un nouveau match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateMatch)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="team1_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="team1">Equipe 1</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full p-2 rounded-lg bg-muted border border-border">
                          <SelectValue placeholder="Sélectionnez l'équipe 1" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="team2">Equipe 2</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full p-2 rounded-lg bg-muted border border-border">
                          <SelectValue placeholder="Sélectionnez l'équipe 2" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="game">Jeu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full p-2 rounded-lg bg-muted border border-border">
                          <SelectValue placeholder="Sélectionnez le jeu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                name="match_date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="match_date">Date du match</FormLabel>
                    <FormControl>
                      <Input
                        id="match_date"
                        type="datetime-local"
                        className="bg-muted border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="format">Format</FormLabel>
                    <FormControl>
                      <Input
                        id="format"
                        placeholder="BO3"
                        className="bg-muted border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="odds_team1"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="odds_team1">Cote Équipe 1</FormLabel>
                    <FormControl>
                      <Input
                        id="odds_team1"
                        type="number"
                        step="0.01"
                        placeholder={`${DEFAULT_ODDS.toFixed(2)}`}
                        className="bg-muted border-border"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="odds_team2">Cote Équipe 2</FormLabel>
                    <FormControl>
                      <Input
                        id="odds_team2"
                        type="number"
                        step="0.01"
                        placeholder={`${DEFAULT_ODDS.toFixed(2)}`}
                        className="bg-muted border-border"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!form.formState.isValid}>
              Créer le match
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
