import { useState, useEffect } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Match, MatchOdds } from "@/integrations/superbase/types";

interface EditOddsFormProps {
  match: Match;
  onSave: () => void;
  onCancel: () => void;
}

export function EditOddsForm({ match, onSave, onCancel }: EditOddsFormProps) {
  const [odds, setOdds] = useState<MatchOdds[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOdds = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("match_odds")
        .select("*")
        .eq("match_id", match.id);

      if (error) {
        toast.error("Erreur lors de la récupération des cotes");
        console.error(error);
      } else {
        setOdds(data || []);
      }
      setLoading(false);
    };

    fetchOdds();
  }, [match.id]);

  const handleOddsChange = (teamId: string, newOdds: string) => {
    const updatedOdds = odds.map((odd) =>
      odd.team_id === teamId ? { ...odd, odds: parseFloat(newOdds) } : odd
    );
    setOdds(updatedOdds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates = odds.map((odd) =>
      supabase
        .from("match_odds")
        .update({ odds: odd.odds })
        .eq("match_id", match.id)
        .eq("team_id", odd.team_id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((result) => result.error);

    if (hasError) {
      toast.error("Erreur lors de la mise à jour des cotes");
    } else {
      toast.success("Cotes mises à jour avec succès !");
      onSave();
    }
  };

  if (loading) {
    return (
      <Card className="mt-4 border-border">
        <CardHeader>
          <CardTitle>Modifier les cotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chargement des cotes...</p>
        </CardContent>
      </Card>
    );
  }

  const team1Odd = odds.find((o) => o.team_id === match.team1?.id)?.odds ?? 0;
  const team2Odd = odds.find((o) => o.team_id === match.team2?.id)?.odds ?? 0;

  return (
    <Card className="mt-4 border-border">
      <CardHeader>
        <CardTitle>
          Modifier les cotes pour {match.team1?.name} vs {match.team2?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odds-team1">{match.team1?.name}</Label>
              <Input
                id="odds-team1"
                type="number"
                step="0.01"
                value={team1Odd}
                onChange={(e) => handleOddsChange(match.team1!.id, e.target.value)}
                required
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odds-team2">{match.team2?.name}</Label>
              <Input
                id="odds-team2"
                type="number"
                step="0.01"
                value={team2Odd}
                onChange={(e) => handleOddsChange(match.team2!.id, e.target.value)}
                required
                className="bg-muted border-border"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Enregistrer les cotes
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
