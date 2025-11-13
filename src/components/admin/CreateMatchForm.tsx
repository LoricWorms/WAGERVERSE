import { useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Team, Game } from "@/integrations/superbase/types";

interface CreateMatchFormProps {
  teams: Team[];
  games: Game[];
  onMatchCreated: () => void;
}

export function CreateMatchForm({ teams, games, onMatchCreated }: CreateMatchFormProps) {
  const [matchForm, setMatchForm] = useState({
    team1_id: "",
    team2_id: "",
    game_id: "",
    match_date: "",
    status: "programmed",
    format: "BO3",
  });

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (matchForm.team1_id === matchForm.team2_id) {
      toast.error("Les équipes doivent être différentes");
      return;
    }

    const { data:match, error } = await supabase.from("matches").insert([matchForm]).select().single();

    if (error) {
      toast.error("Erreur lors de la création du match");
      console.error(error);
    } else {
      // Create default odds
      await supabase.from("match_odds").insert([
        { match_id: match.id, team_id: matchForm.team1_id, odds: 1.85 },
        { match_id: match.id, team_id: matchForm.team2_id, odds: 1.85 },
      ]);

      toast.success("Match créé avec succès");
      setMatchForm({
        team1_id: "",
        team2_id: "",
        game_id: "",
        match_date: "",
        status: "programmed",
        format: "BO3",
      });
      onMatchCreated();
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Créer un nouveau match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateMatch} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team1">Equipe 1</Label>
              <select
                id="team1"
                value={matchForm.team1_id}
                onChange={(e) => setMatchForm({ ...matchForm, team1_id: e.target.value })}
                required
                className="w-full p-2 rounded-lg bg-muted border border-border"
              >
                <option value="">Sélectionnez l'équipe 1</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team2">Equipe 2</Label>
              <select
                id="team2"
                value={matchForm.team2_id}
                onChange={(e) => setMatchForm({ ...matchForm, team2_id: e.target.value })}
                required
                className="w-full p-2 rounded-lg bg-muted border border-border"
              >
                <option value="">Sélectionnez l'équipe 2</option>
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
              <Label htmlFor="game">jeu</Label>
              <select
                id="game"
                value={matchForm.game_id}
                onChange={(e) => setMatchForm({ ...matchForm, game_id: e.target.value })}
                required
                className="w-full p-2 rounded-lg bg-muted border border-border"
              >
                <option value="">Sélectionnez le jeu</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="match_date">Date du match</Label>
              <Input
                id="match_date"
                type="datetime-local"
                value={matchForm.match_date}
                onChange={(e) => setMatchForm({ ...matchForm, match_date: e.target.value })}
                required
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Input
                id="format"
                value={matchForm.format}
                onChange={(e) => setMatchForm({ ...matchForm, format: e.target.value })}
                placeholder="BO3"
                className="bg-muted border-border"
              />
            </div>
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Créer le match
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
