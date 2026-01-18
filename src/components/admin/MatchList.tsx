import { Match } from "@/integrations/superbase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Percent, Frown, Gamepad2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MatchListProps {
  matches: Match[];
  statusTranslations: { [key: string]: string };
  onEditOdds: (match: Match) => void;
  onEditMatch: (match: Match) => void;
  onDeleteMatch: (match: Match) => void;
}

export function MatchList({
  matches,
  statusTranslations,
  onEditOdds,
  onEditMatch,
  onDeleteMatch,
}: MatchListProps) {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-xl">Tous les matches ({matches.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Frown className="h-10 w-10 mb-3" />
            <p className="text-lg">Aucun match disponible pour le moment.</p>
            <p className="text-sm">Ajoutez un nouveau match ci-dessus.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-background border border-border gap-4"
              >
                <div className="flex-1 w-full md:w-auto text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                    <Gamepad2 className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-lg text-primary">{match.game?.name}</span>
                    <Badge variant="secondary">{statusTranslations[match.status] ?? match.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 justify-center md:justify-start">
                    <span className="font-medium text-foreground">{match.team1?.name}</span>
                    {match.status === "done" && match.team1_score !== null && (
                      <Badge variant="outline" className="text-xs">{match.team1_score}</Badge>
                    )}
                    <span className="font-bold">vs</span>
                    <span className="font-medium text-foreground">{match.team2?.name}</span>
                    {match.status === "done" && match.team2_score !== null && (
                      <Badge variant="outline" className="text-xs">{match.team2_score}</Badge>
                    )}
                    <span className="ml-2 flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" /> {format(new Date(match.match_date), "PPP p", { locale: fr })}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditOdds(match)}
                    className="text-primary hover:bg-primary/20"
                    title="Modifier les cotes"
                  >
                    <Percent className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditMatch(match)}
                    className="text-yellow-500 hover:bg-yellow-500/20"
                    title="Modifier le match"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDeleteMatch(match)}
                    className="text-destructive hover:bg-destructive/20"
                    title="Supprimer le match"
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
