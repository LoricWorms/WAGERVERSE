import { Team } from "@/integrations/superbase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface TeamListProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
}

export function TeamList({ teams, onEditTeam, onDeleteTeam }: TeamListProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Toutes les équipes ({teams.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center overflow-hidden">
                  {team.logo_url ? (
                    <img src={team.logo_url} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-lg font-bold">{team.tag?.[0] ?? "?"}</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{team.name} "{team.tag}"</div>
                  <div className="text-sm text-muted-foreground">
                    Fondée en: {team.founded_year}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditTeam(team)}
                  className="hover:bg-secondary/10 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTeam(team.id)}
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
