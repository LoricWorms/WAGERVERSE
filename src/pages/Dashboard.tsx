import { useEffect, useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";

interface Bet {
  id: string;
  amount: number;
  odds: number;
  potential_win: number;
  status: string;
  result: string | null;
  created_at: string;
  match: {
    team1: { name: string };
    team2: { name: string };
    game: { name: string };
    status: string;
    team1_score?: number;
    team2_score?: number;
  };
  team: { name: string };
}

const fetchProfileStats = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("balance, total_bet, total_won")
    .eq("id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const fetchBets = async (userId: string) => {
  const { data, error } = await supabase
    .from("bets")
    .select(
      `
      id,
      amount,
      odds,
      potential_win,
      status,
      result,
      created_at,
      match:matches(
        status,
        team1_score,
        team2_score,
        team1:teams!matches_team1_id_fkey(name),
        team2:teams!matches_team2_id_fkey(name),
        game:games(name)
      ),
      team:teams(name)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });
  }, [navigate]);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["profileStats", session?.user.id],
    queryFn: () => fetchProfileStats(session!.user.id),
    enabled: !!session,
  });

  const { data: bets = [], isLoading: isLoadingBets } = useQuery<Bet[]>({
    queryKey: ["bets", session?.user.id],
    queryFn: () => fetchBets(session!.user.id),
    enabled: !!session,
  });

  const getStatusBadge = (status: string, result: string | null) => {
    if (status === "pending") {
      return <Badge variant="outline" className="border-warning/50 text-warning">en attente</Badge>;
    }
    if (result === "won") {
      return <Badge variant="outline" className="border-success/50 text-success">Gagné</Badge>;
    }
    if (result === "lost") {
      return <Badge variant="outline" className="border-destructive/50 text-destructive">Perdu</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const loading = isLoadingStats || isLoadingBets;
  const profitLoss = (stats?.total_won || 0) - (stats?.total_bet || 0);
  const isProfitable = profitLoss >= 0;

  if (loading || !session) {
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
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground">Suivez vos performances de paris</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Solde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${(stats?.balance || 0).toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Pari total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{(stats?.total_bet || 0).toFixed(2)}€</div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Total gagné
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{(stats?.total_won || 0).toFixed(2)}€</div>
              </CardContent>
            </Card>

            <Card className={`border-border ${isProfitable ? 'bg-success/5' : 'bg-destructive/5'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Bénéfice/Perte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                  {isProfitable ? '+' : ''}{profitLoss.toFixed(2)}€
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bets History */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Historique des paris</CardTitle>
            </CardHeader>
            <CardContent>
              {bets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun pari placé pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {bets.map((bet) => (
                    <div key={bet.id} className="p-4 rounded-lg bg-muted border border-border flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-secondary">{bet.match?.game?.name}</span>
                          {getStatusBadge(bet.status, bet.result)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          {bet.match?.team1?.name}
                          {bet.match?.status === "done" && bet.match?.team1_score !== null ? <Badge variant="secondary">{bet.match.team1_score}</Badge> : ""}
                          <span>vs</span>
                          {bet.match?.team2?.name}
                          {bet.match?.status === "done" && bet.match?.team2_score !== null ? <Badge variant="secondary">{bet.match.team2_score}</Badge> : ""}
                        </p>
                        <p className="text-sm">
                          Parié sur <span className="text-primary font-semibold">{bet.team?.name}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{bet.amount.toFixed(2)}€</div>
                        <div className="text-sm text-muted-foreground">Cote: x{bet.odds}</div>
                        <div className="text-sm text-accent">A gagner: {bet.potential_win.toFixed(2)}€</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
