import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
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
import { createTournament, TournamentFormData } from "@/services/tournamentService";
import { Game } from "@/integrations/superbase/types";
import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "@/services/gameService";

interface CreateTournamentFormProps {
  onTournamentCreated: () => void;
}

const createTournamentSchema = z.object({
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

export function CreateTournamentForm({ onTournamentCreated }: CreateTournamentFormProps) {
  const form = useForm<z.infer<typeof createTournamentSchema>>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: "",
      game_id: "",
      localisation: "",
      prize_pool: 0,
      start_date: new Date().toISOString().slice(0, 16),
      end_time: new Date().toISOString().slice(0, 16),
      status: "scheduled",
    },
  });

  const [isCreating, setIsCreating] = useState(false);

  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: fetchGames,
  });

  const handleCreateTournament = async (values: z.infer<typeof createTournamentSchema>) => {
    setIsCreating(true);
    try {
      await createTournament(values as TournamentFormData);
      toast.success("Tournoi créé avec succès !");
      form.reset();
      onTournamentCreated();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de la création du tournoi: ${errorMessage}`);
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
          Créer un nouveau tournoi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateTournament)} className="space-y-6">
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
                name="game_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jeu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating || isLoadingGames}>
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
                        disabled={isCreating}
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
                        disabled={isCreating}
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
                        disabled={isCreating}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
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
            <Button type="submit" className="w-full" disabled={!form.formState.isValid || isCreating}>
              {isCreating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
              ) : (
                "Créer le tournoi"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
