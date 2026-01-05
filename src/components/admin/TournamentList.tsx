import { Tournament, Game } from "@/integrations/superbase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Frown, CalendarDays, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TournamentListProps {
  tournaments: (Tournament & { game?: Game })[]; // Extend Tournament with optional Game data
  onEditTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournament: Tournament) => void;
}

export function TournamentList({ tournaments, onEditTournament, onDeleteTournament }: TournamentListProps) {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-xl">Tous les tournois ({tournaments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Frown className="h-10 w-10 mb-3" />
            <p className="text-lg">Aucun tournoi disponible pour le moment.</p>
            <p className="text-sm">Ajoutez un nouveau tournoi ci-dessus.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-background border border-border gap-4"
              >
                <div className="flex-1 w-full md:w-auto text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                    <Gamepad2 className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-lg text-primary">{tournament.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 justify-center md:justify-start">
                    <span>Jeu: {tournament.game?.name || "N/A"}</span>
                    <span className="ml-2 flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" /> {format(new Date(tournament.start_date!), "PPP", { locale: fr })} - {format(new Date(tournament.end_time!), "PPP", { locale: fr })}
                    </span>
                    <span className="ml-2">Localisation: {tournament.localisation}</span>
                    <span className="ml-2">Prize Pool: {tournament.prize_pool?.toLocaleString()}€</span>
                    <span className="ml-2">Statut: {tournament.status || "N/A"}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditTournament(tournament)}
                    className="text-yellow-500 hover:bg-yellow-500/20"
                    title="Modifier le tournoi"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDeleteTournament(tournament)}
                    className="text-destructive hover:bg-destructive/20"
                    title="Supprimer le tournoi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
