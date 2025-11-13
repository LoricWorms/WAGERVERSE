import { useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Match, Team, Game } from "@/integrations/superbase/types";

interface EditMatchFormProps {
  match: Match;
  teams: Team[];
  games: Game[];
  onSave: () => void;
  onCancel: () => void;
}

export function EditMatchForm({ match, teams, games, onSave, onCancel }: EditMatchFormProps) {
  const [editingMatch, setEditingMatch] = useState<Match>(match);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch.team1 || !editingMatch.team2 || !editingMatch.game) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    const { error } = await supabase
      .from("matches")
      .update({
        team1_id: editingMatch.team1.id,
        team2_id: editingMatch.team2.id,
        game_id: editingMatch.game.id,
        match_date: editingMatch.match_date,
        status: editingMatch.status,
        format: editingMatch.format,
      })
      .eq("id", editingMatch.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour du match");
      console.error(error);
    } else {
      toast.success("Match mis à jour avec succès !");
      onSave();
    }
  };

  return (
    <Card className="mt-4 border-border">
      <CardHeader>
        <CardTitle>Modifier le match</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-team1">Equipe 1</Label>
              <select
                id="edit-team1"
                value={editingMatch.team1?.id || ""}
                onChange={(e) =>
                  setEditingMatch(
                    editingMatch
                      ? {
                          ...editingMatch,
                          team1: { ...editingMatch.team1, id: e.target.value },
                        }
                      : null
                  )
                }
                required
                className="w-full p-2 rounded-lg bg-muted border border-border"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team2">Equipe 2</Label>
              <select
                id="edit-team2"
                value={editingMatch.team2?.id || ""}
                onChange={(e) =>
                  setEditingMatch(
                    editingMatch
                      ? {
                          ...editingMatch,
                          team2: { ...editingMatch.team2, id: e.target.value },
                        }
                      : null
                  )
                }
                required
                className="w-full p-2 rounded-lg bg-muted border border-border"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-game">Jeu</Label>
              <select
                id="edit-game"
                value={editingMatch.game?.id || ""}
                onChange={(e) =>
                  setEditingMatch(
                    editingMatch
                      ? {
                          ...editingMatch,
                          game: { ...editingMatch.game, id: e.target.value },
                        }
                      : null
                  )
                }
                required
                className="w-full p-2 rounded-lg bg-muted border border-border"
              >
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-match_date">Date du match</Label>
              <Input
                id="edit-match_date"
                type="datetime-local"
                value={editingMatch.match_date.substring(0, 16)}
                onChange={(e) =>
                  setEditingMatch(
                    editingMatch
                      ? { ...editingMatch, match_date: e.target.value }
                      : null
                  )
                }
                required
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Statut</Label>
              <select
                id="edit-status"
                value={editingMatch.status}
                onChange={(e) => {
                  setEditingMatch(
                    editingMatch ? { ...editingMatch, status: e.target.value } : null
                  );
                }}
                required
                className="w-full p-2 rounded-lg bg-muted border border-border"
              >
                <option value="programmed">programmé</option>
                <option value="ongoing">En cours</option>
                <option value="done">Terminé</option>
                <option value="cancel">Annulé</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-format">Format</Label>
              <Input
                id="edit-format"
                value={editingMatch.format}
                onChange={(e) =>
                  setEditingMatch(
                    editingMatch ? { ...editingMatch, format: e.target.value } : null
                  )
                }
                placeholder="BO3"
                className="bg-muted border-border"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Enregistrer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
