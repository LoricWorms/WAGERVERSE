import { useEffect, useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Trophy, Loader2, Frown, History, CircleDollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
      return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">en attente</Badge>;
    }
    if (result === "won") {
      return <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">Gagné</Badge>;
    }
    if (result === "lost") {
      return <Badge variant="outline" className="border-red-500/50 text-red-500">Perdu</Badge>;
    }
    return <Badge variant="outline">Inconnu</Badge>;
  };

  const loading = isLoadingStats || isLoadingBets;
  const profitLoss = (stats?.total_won || 0) - (stats?.total_bet || 0);
  const isProfitable = profitLoss >= 0;

  if (loading || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-lg">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Votre Tableau de Bord
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">Suivez vos performances de paris en temps réel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
                Solde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{(stats?.balance || 0).toFixed(2)}€</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-400" />
                Total Parié
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{(stats?.total_bet || 0).toFixed(2)}€</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-emerald-400" />
                Total Gagné
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{(stats?.total_won || 0).toFixed(2)}€</div>
            </CardContent>
          </Card>

          <Card className={`border-border ${isProfitable ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Bénéfice/Perte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                {isProfitable ? '+' : ''}{profitLoss.toFixed(2)}€
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bets History */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" /> Historique des paris
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Frown className="h-10 w-10 mb-3" />
                <p className="text-lg">Aucun pari placé pour le moment.</p>
                <p className="text-sm">Rendez-vous sur la page Matchs pour commencer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bets.map((bet) => (
                  <div key={bet.id} className="p-4 rounded-lg bg-background border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-lg text-primary">{bet.match?.game?.name}</span>
                        {getStatusBadge(bet.status, bet.result)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bet.match?.team1?.name} {bet.match?.status === "done" && bet.match?.team1_score !== null ? `(${bet.match.team1_score})` : ""}
                        <span className="mx-2 font-bold text-foreground">vs</span>
                        {bet.match?.team2?.name} {bet.match?.status === "done" && bet.match?.team2_score !== null ? `(${bet.match.team2_score})` : ""}
                      </p>
                      <p className="text-sm mt-1">
                        Parié sur <span className="text-accent font-semibold">{bet.team?.name}</span> le {format(new Date(bet.created_at), "PPP", { locale: fr })}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="font-mono text-xl font-bold text-emerald-400">{bet.amount.toFixed(2)}€</div>
                      <div className="text-sm text-muted-foreground">Cote: x{bet.odds.toFixed(2)}</div>
                      <div className="text-sm text-primary">Potentiel: {bet.potential_win.toFixed(2)}€</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
