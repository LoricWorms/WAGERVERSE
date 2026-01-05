import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchTournaments } from "@/services/tournamentService";
import { Tournament, Game, TournamentStanding } from "@/integrations/superbase/types"; // Import TournamentStanding
import { Loader2, Trophy, Frown, Users } from "lucide-react";
import { fetchTournamentStandings } from "@/services/standingService"; // Import fetchTournamentStandings
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function Standings() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  const { data: tournamentsResult, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ["allTournaments"],
    queryFn: () => fetchTournaments({ page: 1, pageSize: 1000 }),
  });
  const tournaments = tournamentsResult?.data ?? [];

  const { data: standings, isLoading: isLoadingStandings } = useQuery<TournamentStanding[]>({
    queryKey: ["tournamentStandings", selectedTournamentId],
    queryFn: () => fetchTournamentStandings(selectedTournamentId!),
    enabled: !!selectedTournamentId,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Classements des Tournois
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">Découvrez les performances des équipes par tournoi</p>
        </div>

        <Card className="border-border bg-card/50 p-6 mb-8">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Sélectionner un Tournoi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Select onValueChange={setSelectedTournamentId} value={selectedTournamentId || ""}>
              <SelectTrigger className="w-full md:w-1/2 bg-background border-border">
                <SelectValue placeholder="Choisir un tournoi" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {isLoadingTournaments ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : tournaments.length === 0 ? (
                  <p className="p-4 text-muted-foreground">Aucun tournoi disponible</p>
                ) : (
                  tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name} ({tournament.game?.name || "N/A"})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedTournamentId ? (
          <Card className="border-border bg-card/50 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Classement du Tournoi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingStandings ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                  <p className="text-lg">Chargement du classement...</p>
                </div>
              ) : standings && standings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rang</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead className="text-center">Victoires</TableHead>
                      <TableHead className="text-center">Défaites</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((standing, index) => (
                      <TableRow key={standing.team_id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {standing.team_logo_url && (
                            <img src={standing.team_logo_url} alt={standing.team_name} className="h-6 w-6 rounded-full object-contain" />
                          )}
                          <span className="font-semibold">{standing.team_name}</span>
                        </TableCell>
                        <TableCell className="text-center">{standing.wins}</TableCell>
                        <TableCell className="text-center">{standing.losses}</TableCell>
                        <TableCell className="text-right font-bold text-primary">{standing.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Frown className="h-12 w-12 mb-3" />
                  <p className="text-lg">Aucun classement disponible pour ce tournoi.</p>
                  <p className="text-sm">Assurez-vous que des matchs sont terminés dans ce tournoi.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Trophy className="h-16 w-16 mb-4" />
            <p className="text-xl">Sélectionnez un tournoi pour voir son classement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
