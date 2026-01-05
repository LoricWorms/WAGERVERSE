import { useEffect, useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gamepad2, Calendar, Trophy, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Match {
  id: string;
  match_date: string;
  status: string;
  format: string;
  team1: { id: string; name: string; logo_url: string; tag: string };
  team2: { id: string; name: string; logo_url: string; tag: string };
  game: { name: string };
  odds: { team_id: string; odds: number }[];
}

const fetchMatches = async () => {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      match_date,
      status,
      format,
      team1:teams!matches_team1_id_fkey(id, name, logo_url, tag),
      team2:teams!matches_team2_id_fkey(id, name, logo_url, tag),
      game:games(name),
      odds:match_odds(team_id, odds)
    `
    )
    .eq("status", "programmed")
    .order("match_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export default function Matches() {
  const [betAmounts, setBetAmounts] = useState<{ [key: string]: string }>({});
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const { data: matches = [], isLoading, isError } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    enabled: !!user,
  });

  const placeBetMutation = useMutation({
    mutationFn: async ({ matchId, teamId, odds, amount }: { matchId: string; teamId: string; odds: number; amount: number }) => {
      const { data, error } = await supabase.rpc('place_bet_atomic', {
        p_user_id: user!.id,
        p_match_id: matchId,
        p_team_id: teamId,
        p_bet_amount: amount,
        p_odds: odds,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Ensure data is an array and contains a result
      if (!Array.isArray(data) || data.length === 0 || !data[0] || !data[0].success) {
        throw new Error(data && data[0] && data[0].message ? data[0].message : "Échec de la mise à jour des cotes.");
      }

      return {
        message: data[0].message,
        potentialWin: amount * odds
      };
    },
    onSuccess: (result, { matchId, teamId }) => {
      toast.success(`${result.message}. Gain potentiel: ${result.potentialWin.toFixed(2)}€`);
      setBetAmounts({ ...betAmounts, [`${matchId}-${teamId}`]: "" });
      queryClient.invalidateQueries({ queryKey: ["profileStats", user?.id] });
      // Potentially refetch matches to update available odds/status if necessary
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handlePlaceBet = (matchId: string, teamId: string, odds: number) => {
    const amount = parseFloat(betAmounts[`${matchId}-${teamId}`] || "0");
    if (!amount || amount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }
    placeBetMutation.mutate({ matchId, teamId, odds, amount });
  };

  const getOdds = (match: Match, teamId: string) => {
    const odd = match.odds?.find((o) => o.team_id === teamId);
    return odd?.odds || 1.5;
  };

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Matchs E-Sport
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">Pariez sur vos jeux et équipes préférés</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-lg">Chargement des matchs en cours...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Trophy className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive text-lg">Erreur lors du chargement des matchs.</p>
          </div>
        ) : matches.length === 0 ? (
          <Card className="border-border bg-card/50">
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">Aucun match à venir disponible pour le moment.</p>
              <Button asChild className="mt-6">
                <Link to="/dashboard">Explorer le Dashboard <ChevronRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card key={match.id} className="border-border bg-card/50 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4" />
                      <span>{match.game?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(match.match_date), "PPP p", { locale: fr })}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                        {match.team1.logo_url ? (
                          <img src={match.team1.logo_url} alt={match.team1.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">{match.team1.tag?.[0] ?? "?"}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-center">{match.team1?.name}</h3>
                      <Badge variant="secondary" className="text-sm">
                        Cote: x{getOdds(match, match.team1?.id).toFixed(2)}
                      </Badge>
                      <div className="flex w-full mt-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Mise (€)"
                          value={betAmounts[`${match.id}-${match.team1?.id}`] || ""}
                          onChange={(e) => setBetAmounts({ ...betAmounts, [`${match.id}-${match.team1?.id}`]: e.target.value })}
                          className="bg-background border-border flex-grow"
                          disabled={placeBetMutation.isPending}
                        />
                        <Button
                          onClick={() => handlePlaceBet(match.id, match.team1?.id, getOdds(match, match.team1?.id))}
                          className="whitespace-nowrap"
                          disabled={placeBetMutation.isPending}
                        >
                          {placeBetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Parier"}
                        </Button>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-2xl font-bold">
                      VS
                      <span className="text-xs font-normal">({match.format})</span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                        {match.team2.logo_url ? (
                          <img src={match.team2.logo_url} alt={match.team2.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">{match.team2.tag?.[0] ?? "?"}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-center">{match.team2?.name}</h3>
                      <Badge variant="secondary" className="text-sm">
                        Cote: x{getOdds(match, match.team2?.id).toFixed(2)}
                      </Badge>
                      <div className="flex w-full mt-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Mise (€)"
                          value={betAmounts[`${match.id}-${match.team2?.id}`] || ""}
                          onChange={(e) => setBetAmounts({ ...betAmounts, [`${match.id}-${match.team2?.id}`]: e.target.value })}
                          className="bg-background border-border flex-grow"
                          disabled={placeBetMutation.isPending}
                        />
                        <Button
                          onClick={() => handlePlaceBet(match.id, match.team2?.id, getOdds(match, match.team2?.id))}
                          className="whitespace-nowrap"
                          disabled={placeBetMutation.isPending}
                        >
                          {placeBetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Parier"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
