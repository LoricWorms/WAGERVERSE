import { Team } from "@/integrations/superbase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Frown } from "lucide-react";

interface TeamListProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
}

export function TeamList({ teams, onEditTeam, onDeleteTeam }: TeamListProps) {
  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-xl">Toutes les équipes ({teams.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Frown className="h-10 w-10 mb-3" />
            <p className="text-lg">Aucune équipe disponible pour le moment.</p>
            <p className="text-sm">Ajoutez une nouvelle équipe ci-dessus.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-background border border-border gap-4"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xl font-bold text-muted-foreground">{team.tag?.[0] ?? "?"}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-foreground">{team.name} <span className="text-muted-foreground">"{team.tag}"</span></div>
                    <div className="text-sm text-muted-foreground">
                      Fondée en: {team.founded_year}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditTeam(team)}
                    className="text-yellow-500 hover:bg-yellow-500/20"
                    title="Modifier l'équipe"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDeleteTeam(team)}
                    className="text-destructive hover:bg-destructive/20"
                    title="Supprimer l'équipe"
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
