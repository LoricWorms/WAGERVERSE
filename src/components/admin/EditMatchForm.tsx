import { useState, useEffect } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Match, Team, Game, Tournament } from "@/integrations/superbase/types"; // Import Tournament
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { MATCH_FORMAT_MIN_LENGTH } from "@/lib/constants";
import { fetchTournaments } from "@/services/tournamentService"; // Import fetchTournaments
import { useQuery } from "@tanstack/react-query";



interface EditMatchFormProps {
  match: Match;
  teams: Team[];
  games: Game[];
  onSave: () => void;
  onCancel: () => void;
}

const editMatchSchema = z.object({
  team1_id: z.string().min(1, "Veuillez sélectionner l'équipe 1."),
  team2_id: z.string().min(1, "Veuillez sélectionner l'équipe 2."),
  game_id: z.string().min(1, "Veuillez sélectionner un jeu."),
  tournament_id: z.string().optional().nullable(), // Make tournament_id optional
  match_date: z.string()
    .min(1, "Veuillez sélectionner une date et heure pour le match.")
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Le format de la date et de l'heure doit être AAAA-MM-JJTHH:MM"),
  status: z.enum(["programmed", "ongoing", "done", "cancel"], { message: "Statut invalide" }).default("programmed"),
  format: z.string().min(MATCH_FORMAT_MIN_LENGTH, `Le format doit contenir au moins ${MATCH_FORMAT_MIN_LENGTH} caractères.`),
}).refine(data => data.team1_id !== data.team2_id, {
  message: "Les équipes doivent être différentes.",
  path: ["team2_id"],
});

export function EditMatchForm({ match, teams, games, onSave, onCancel }: EditMatchFormProps) {
  const form = useForm<z.infer<typeof editMatchSchema>>({
    resolver: zodResolver(editMatchSchema),
    defaultValues: {
      team1_id: match.team1?.id || "",
      team2_id: match.team2?.id || "",
      game_id: match.game?.id || "",
      tournament_id: match.tournament_id || undefined, // Add tournament_id
      match_date: match.match_date ? match.match_date.substring(0, 16) : new Date().toISOString().substring(0, 16),
      status: match.status || "programmed",
      format: match.format || "BO3",
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const { data: tournamentsResult, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ["allTournaments"],
    queryFn: () => fetchTournaments({ page: 1, pageSize: 1000 }), // Fetch all tournaments for selection
  });
  const tournaments = tournamentsResult?.data ?? [];


  // Update form defaults if the 'match' prop changes (e.g., when editing a different match)
  useEffect(() => {
    form.reset({
      team1_id: match.team1?.id || "",
      team2_id: match.team2?.id || "",
      game_id: match.game?.id || "",
      tournament_id: match.tournament_id || undefined, // Add tournament_id here too
      match_date: match.match_date ? match.match_date.substring(0, 16) : new Date().toISOString().substring(0, 16),
      status: match.status || "programmed",
      format: match.format || "BO3",
    });
  }, [match, form]); // Add tournaments to dependency array


  const handleSave = async (values: z.infer<typeof editMatchSchema>) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("matches")
        .update({
          team1_id: values.team1_id,
          team2_id: values.team2_id,
          game_id: values.game_id,
          tournament_id: values.tournament_id === "null" ? null : values.tournament_id, // Convert "null" string to actual null
          match_date: values.match_date,
          status: values.status,
          format: values.format,
        })
        .eq("id", match.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Match mis à jour avec succès !");
      onSave();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de la mise à jour du match: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-4 border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-xl">Modifier le match</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="team1_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipe 1</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
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
                    <Select onValueChange={field.onChange} value={field.value || "null"} disabled={isSaving || isLoadingTournaments}>
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
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Sélectionnez le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="programmed">Programmé</SelectItem>
                        <SelectItem value="ongoing">En cours</SelectItem>
                        <SelectItem value="done">Terminé</SelectItem>
                        <SelectItem value="cancel">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="flex space-x-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving || !form.formState.isValid}>
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}