import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { updateTournament, TournamentFormData } from "@/services/tournamentService";
import { Tournament, Game } from "@/integrations/superbase/types";
import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "@/services/gameService";

interface EditTournamentFormProps {
  tournament: Tournament;
  onSave: () => void;
  onCancel: () => void;
}

const editTournamentSchema = z.object({
  name: z.string().min(1, "Le nom du tournoi est requis."),
  game_id: z.string().min(1, "Veuillez sélectionner un jeu."),
  localisation: z.string().min(1, "La localisation est requise."),
  prize_pool: z.number().min(0, "Le prix du tournoi doit être positif."),
  start_date: z.string().min(1, "La date de début est requise."),
  end_time: z.string().min(1, "La date de fin est requise."),
  status: z.enum(["scheduled", "ongoing", "completed", "cancelled"]).default("scheduled"),
}).refine(data => data.start_date <= data.end_time, {
    message: "La date de fin ne peut pas être antérieure à la date de début.",
    path: ["end_time"],
});

export function EditTournamentForm({ tournament, onSave, onCancel }: EditTournamentFormProps) {
  const form = useForm<z.infer<typeof editTournamentSchema>>({
    resolver: zodResolver(editTournamentSchema),
    defaultValues: {
      name: tournament.name || "",
      game_id: tournament.game_id || "",
      localisation: tournament.localisation || "",
      prize_pool: tournament.prize_pool || 0,
      start_date: tournament.start_date ? tournament.start_date.substring(0, 16) : new Date().toISOString().substring(0, 16),
      end_time: tournament.end_time ? tournament.end_time.substring(0, 16) : new Date().toISOString().substring(0, 16),
      status: tournament.status || "scheduled",
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: fetchGames,
  });

  // Update form defaults if the 'tournament' prop changes (e.g., when editing a different tournament)
  useEffect(() => {
    form.reset({
      name: tournament.name || "",
      game_id: tournament.game_id || "",
      localisation: tournament.localisation || "",
      prize_pool: tournament.prize_pool || 0,
      start_date: tournament.start_date ? tournament.start_date.substring(0, 16) : new Date().toISOString().substring(0, 16),
      end_time: tournament.end_time ? tournament.end_time.substring(0, 16) : new Date().toISOString().substring(0, 16),
      status: tournament.status || "scheduled",
    });
  }, [tournament, form]);

  const handleSave = async (values: z.infer<typeof editTournamentSchema>) => {
    setIsSaving(true);
    try {
      await updateTournament(tournament.id, values as TournamentFormData);
      toast.success("Tournoi mis à jour avec succès !");
      onSave();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de la mise à jour du tournoi: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-4 border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-xl">Modifier le tournoi</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du tournoi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom du tournoi"
                      className="bg-background border-border"
                      {...field}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="game_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jeu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSaving || isLoadingGames}>
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
                name="localisation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Localisation"
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
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="prize_pool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix du tournoi (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        className="bg-background border-border"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
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
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
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
                      <SelectItem value="scheduled">Programmé</SelectItem>
                      <SelectItem value="ongoing">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
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