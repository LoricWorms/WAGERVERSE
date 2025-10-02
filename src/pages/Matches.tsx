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

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [betAmounts, setBetAmounts] = useState<{ [key: string]: string }>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchMatches();
      }
    });
  }, [navigate]);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        status,
        format,
        team1:teams!matches_team1_id_fkey(id, name, logo_url, tag),
        team2:teams!matches_team2_id_fkey(id, name, logo_url, tag),
        game:games(name),
        odds:match_odds(team_id, odds)
      `)
      .eq("status", "scheduled")
      .order("match_date", { ascending: true });

    if (error) {
      toast.error("Error loading matches");
      console.error(error);
    } else {
      setMatches(data || []);
    }
    setLoading(false);
  };

  const placeBet = async (matchId: string, teamId: string, odds: number) => {
    const amount = parseFloat(betAmounts[`${matchId}-${teamId}`] || "0");
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, total_bet")
      .eq("id", user.id)
      .single();

    if (!profile || profile.balance < amount) {
      toast.error("Insufficient balance");
      return;
    }

    // Place bet
    const { error: betError } = await supabase
      .from("bets")
      .insert({
        user_id: user.id,
        match_id: matchId,
        team_id: teamId,
        amount: amount,
        odds: odds,
        potential_win: amount * odds,
        status: "pending"
      });

    if (betError) {
      toast.error("Error placing bet");
      console.error(betError);
      return;
    }

    // Update balance
    await supabase
      .from("profiles")
      .update({ 
        balance: profile.balance - amount,
        total_bet: (profile.total_bet || 0) + amount
      })
      .eq("id", user.id);

    toast.success(`Bet placed! Potential win: $${(amount * odds).toFixed(2)}`);
    setBetAmounts({ ...betAmounts, [`${matchId}-${teamId}`]: "" });
    
    // Refresh to update balance in navbar
    window.location.reload();
  };

  const getOdds = (match: Match, teamId: string) => {
    const odd = match.odds.find(o => o.team_id === teamId);
    return odd?.odds || 1.5;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading matches...</p>
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
                Live Matches
              </span>
            </h1>
            <p className="text-muted-foreground">Place your bets on upcoming matches</p>
          </div>

          {matches.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming matches available</p>
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
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xl font-bold">
                            {match.team1?.tag || match.team1?.name?.substring(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{match.team1?.name}</h3>
                            <Badge variant="outline" className="border-primary/50 text-primary">
                              Odds: {getOdds(match, match.team1?.id)}x
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={betAmounts[`${match.id}-${match.team1?.id}`] || ""}
                            onChange={(e) =>
                              setBetAmounts({
                                ...betAmounts,
                                [`${match.id}-${match.team1?.id}`]: e.target.value,
                              })
                            }
                            className="bg-muted border-border"
                          />
                          <Button
                            onClick={() => placeBet(match.id, match.team1?.id, getOdds(match, match.team1?.id))}
                            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                          >
                            Bet Now
                          </Button>
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="space-y-4 p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xl font-bold">
                            {match.team2?.tag || match.team2?.name?.substring(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{match.team2?.name}</h3>
                            <Badge variant="outline" className="border-accent/50 text-accent">
                              Odds: {getOdds(match, match.team2?.id)}x
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={betAmounts[`${match.id}-${match.team2?.id}`] || ""}
                            onChange={(e) =>
                              setBetAmounts({
                                ...betAmounts,
                                [`${match.id}-${match.team2?.id}`]: e.target.value,
                              })
                            }
                            className="bg-muted border-border"
                          />
                          <Button
                            onClick={() => placeBet(match.id, match.team2?.id, getOdds(match, match.team2?.id))}
                            className="bg-accent hover:bg-accent/90 whitespace-nowrap"
                          >
                            Bet Now
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
