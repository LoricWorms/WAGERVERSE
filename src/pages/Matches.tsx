import { useEffect, useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gamepad2, Calendar, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    enabled: !!user,
  });

  const placeBetMutation = useMutation({
    mutationFn: async ({ matchId, teamId, odds, amount }: { matchId: string; teamId: string; odds: number; amount: number }) => {
      // All logic is now moved to the backend function.
      // We just need to call the RPC and handle the result.
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

      // The RPC function returns a custom structure: { success: boolean, message: string }
      if (!data[0].success) {
        throw new Error(data[0].message);
      }

      return {
        message: data[0].message,
        potentialWin: amount * odds
      };
    },
    onSuccess: (result, { matchId, teamId }) => {
      // The message can be used directly for the toast
      toast.success(`${result.message}. Gain potentiel: ${result.potentialWin.toFixed(2)}€`);
      setBetAmounts({ ...betAmounts, [`${matchId}-${teamId}`]: "" });
      // Invalidate queries to refresh user's balance and other related stats
      queryClient.invalidateQueries({ queryKey: ["profileStats", user?.id] });
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Matchs en direct
              </span>
            </h1>
            <p className="text-muted-foreground">Placez vos paris sur les matchs à venir</p>
          </div>

          {matches.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun match à venir disponible</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {matches.map((match) => (
                <Card key={match.id} className="border-border hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="h-5 w-5 text-secondary" />
                        <span className="font-semibold text-secondary">{match.game?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(match.match_date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Team 1 */}
                      <div className="space-y-4 p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center overflow-hidden">
                          {match.team1.logo_url ? (
                          <img
                            src={match.team1.logo_url}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                        <span className="text-lg font-bold">
                          {match.team1.tag?.[0] ?? "?"}
                        </span>
                        )}
                        </div>
                          <div>
                            <h3 className="font-bold text-lg">{match.team1?.name} "{match.team1?.tag}"</h3>
                            <Badge variant="outline" className="border-primary/50 text-primary">
                              cote: x{getOdds(match, match.team1?.id)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Montant"
                            value={betAmounts[`${match.id}-${match.team1?.id}`] || ""}
                            onChange={(e) =>
                              setBetAmounts({
                                ...betAmounts,
                                [`${match.id}-${match.team1?.id}`]: e.target.value,
                              })
                            }
                            className="bg-muted border-border"
                            disabled={placeBetMutation.isPending}
                          />
                          <Button
                            onClick={() => handlePlaceBet(match.id, match.team1?.id, getOdds(match, match.team1?.id))}
                            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                            disabled={placeBetMutation.isPending}
                          >
                            {placeBetMutation.isPending ? "Placement..." : "Pariez maintenant"}
                          </Button>
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="space-y-4 p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center overflow-hidden">
                          {match.team2.logo_url ? (
                          <img
                            src={match.team2.logo_url}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                        <span className="text-lg font-bold">
                          {match.team2.tag?.[0] ?? "?"}
                        </span>
                        )}
                        </div>
                          <div>
                            <h3 className="font-bold text-lg">{match.team2?.name} "{match.team2?.tag}"</h3>
                            <Badge variant="outline" className="border-accent/50 text-accent">
                              cote: x{getOdds(match, match.team2?.id)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Montant"
                            value={betAmounts[`${match.id}-${match.team2?.id}`] || ""}
                            onChange={(e) =>
                              setBetAmounts({
                                ...betAmounts,
                                [`${match.id}-${match.team2?.id}`]: e.target.value,
                              })
                            }
                            className="bg-muted border-border"
                            disabled={placeBetMutation.isPending}
                          />
                          <Button
                            onClick={() => handlePlaceBet(match.id, match.team2?.id, getOdds(match, match.team2?.id))}
                            className="bg-accent hover:bg-accent/90 whitespace-nowrap"
                            disabled={placeBetMutation.isPending}
                          >
                            {placeBetMutation.isPending ? "Placement..." : "Pariez maintenant"}
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
    </div>
  );
}
