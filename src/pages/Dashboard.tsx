import { useEffect, useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  };
  team: { name: string };
}

export default function Dashboard() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState({
    balance: 0,
    totalBet: 0,
    totalWon: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchDashboardData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);

    // Fetch profile stats
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, total_bet, total_won")
      .eq("id", userId)
      .single();

    if (profile) {
      setStats({
        balance: profile.balance,
        totalBet: profile.total_bet || 0,
        totalWon: profile.total_won || 0,
      });
    }

    // Fetch bets
    const { data: betsData } = await supabase
      .from("bets")
      .select(`
        id,
        amount,
        odds,
        potential_win,
        status,
        result,
        created_at,
        match:matches(
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name),
          game:games(name)
        ),
        team:teams(name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (betsData) {
      setBets(betsData);
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string, result: string | null) => {
    if (status === "pending") {
      return <Badge variant="outline" className="border-warning/50 text-warning">Pending</Badge>;
    }
    if (result === "won") {
      return <Badge variant="outline" className="border-success/50 text-success">Won</Badge>;
    }
    if (result === "lost") {
      return <Badge variant="outline" className="border-destructive/50 text-destructive">Lost</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const profitLoss = stats.totalWon - stats.totalBet;
  const isProfitable = profitLoss >= 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <p className="text-muted-foreground">Track your betting performance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${stats.balance.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Total Bet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">${stats.totalBet.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Total Won
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${stats.totalWon.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className={`border-border ${isProfitable ? 'bg-success/5' : 'bg-destructive/5'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Profit/Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                  {isProfitable ? '+' : ''}${profitLoss.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bets History */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
            </CardHeader>
            <CardContent>
              {bets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bets placed yet</p>
              ) : (
                <div className="space-y-4">
                  {bets.map((bet) => (
                    <div key={bet.id} className="p-4 rounded-lg bg-muted border border-border flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-secondary">{bet.match?.game?.name}</span>
                          {getStatusBadge(bet.status, bet.result)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bet.match?.team1?.name} vs {bet.match?.team2?.name}
                        </p>
                        <p className="text-sm">
                          Bet on <span className="text-primary font-semibold">{bet.team?.name}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">${bet.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Odds: {bet.odds}x</div>
                        <div className="text-sm text-accent">Win: ${bet.potential_win.toFixed(2)}</div>
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
