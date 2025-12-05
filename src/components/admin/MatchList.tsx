import { Match } from "@/services/matchService"; // Updated import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Percent } from "lucide-react";

interface MatchListProps {
  matches: Match[];
  statusTranslations: { [key: string]: string };
  onEditOdds: (match: Match) => void;
  onEditMatch: (match: Match) => void;
  onDeleteMatch: (match: Match) => void; // Changed from (id: string) to (match: Match)
}

export function MatchList({
  matches,
  statusTranslations,
  onEditOdds,
  onEditMatch,
  onDeleteMatch,
}: MatchListProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Tous les matches ({matches.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border"
            >
              <div>
                <div className="font-semibold text-secondary">{match.game?.name}</div>
                <div className="text-sm flex items-center gap-2">
                  {match.team1?.name}
                  {match.status === "done" && match.team1_score !== null ? (
                    <Badge variant="secondary">{match.team1_score}</Badge>
                  ) : (
                    ""
                  )}
                  <span>vs</span>
                  {match.team2?.name}
                  {match.status === "done" && match.team2_score !== null ? (
                    <Badge variant="secondary">{match.team2_score}</Badge>
                  ) : (
                    ""
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(match.match_date).toLocaleString()} •{" "}
                  {statusTranslations[match.status] ?? match.status}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditOdds(match)}
                  className="hover:bg-secondary/10 hover:text-primary"
                >
                  <Percent className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditMatch(match)}
                  className="hover:bg-secondary/10 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteMatch(match)} // Pass the whole match object
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
