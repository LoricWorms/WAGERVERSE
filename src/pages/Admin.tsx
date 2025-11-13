import { useState, useEffect } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Percent } from "lucide-react";
import { Team, Match, Game } from "@/integrations/superbase/types";
import { EditTeamForm } from "@/components/admin/EditTeamForm";
import { EditMatchForm } from "@/components/admin/EditMatchForm";
import { CreateTeamForm } from "@/components/admin/CreateTeamForm";
import { CreateMatchForm } from "@/components/admin/CreateMatchForm";
import { EditOddsForm } from "@/components/admin/EditOddsForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchTeams = async () => {
  const { data, error } = await supabase.from("teams").select("*").order("name");
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchMatches = async () => {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      match_date,
      status,
      format,
      team1_score,
      team2_score,
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name),
      game:games(id, name)
    `
    )
    .order("match_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchGames = async () => {
  const { data, error } = await supabase.from("games").select("*").order("name");
  if (error) throw new Error(error.message);
  return data || [];
};

export default function Admin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingOddsForMatch, setEditingOddsForMatch] = useState<Match | null>(null);

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    enabled: isAdmin,
  });
  const { data: matches = [], isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    enabled: isAdmin,
  });
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: fetchGames,
    enabled: isAdmin,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        checkAdmin(session.user.id);
      }
    });
  }, [navigate]);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!data) {
      toast.error("Accès refusé - Admin seulement");
      navigate("/");
    } else {
      setIsAdmin(true);
    }
  };

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Équipe supprimée");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteTeam = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette équipe ?")) {
      deleteTeamMutation.mutate(id);
    }
  };

  const deleteMatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Match supprimé");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteMatch = (id: string) => {
    if (confirm("Etes-vous sûr de vouloir supprimer ce match ??")) {
      deleteMatchMutation.mutate(id);
    }
  };

  const loading = isLoadingTeams || isLoadingMatches || isLoadingGames;

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const statusTranslations: { [key: string]: string } = {
    programmed: "Programmé",
    ongoing: "En cours",
    done: "Terminé",
    cancel: "Annulé",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard Admin
            </span>
          </h1>

          <Tabs defaultValue="teams" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teams">Gestion des équipes</TabsTrigger>
              <TabsTrigger value="matches">Gestion des Matches</TabsTrigger>
            </TabsList>

            {/* Gestion des équipes */}
            <TabsContent value="teams" className="space-y-6">
              <CreateTeamForm onTeamCreated={() => queryClient.invalidateQueries({ queryKey: ["teams"] })} />

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
                            onClick={() => setEditingTeam(team)}
                            className="hover:bg-secondary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTeam(team.id)}
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

              {editingTeam && (
                <EditTeamForm
                  team={editingTeam}
                  onSave={() => {
                    setEditingTeam(null);
                    queryClient.invalidateQueries({ queryKey: ["teams"] });
                  }}
                  onCancel={() => setEditingTeam(null)}
                />
              )}
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <CreateMatchForm teams={teams} games={games} onMatchCreated={() => queryClient.invalidateQueries({ queryKey: ["matches"] })} />

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Tous les matches ({matches.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border"
                      >
                        <div>
                          <div className="font-semibold text-secondary">{match.game?.name}</div>
                          <div className="text-sm flex items-center gap-2">
                            {match.team1?.name}
                            {match.status === "done" && match.team1_score !== null ? <Badge variant="secondary">{match.team1_score}</Badge> : ""}
                            <span>vs</span>
                            {match.team2?.name}
                            {match.status === "done" && match.team2_score !== null ? <Badge variant="secondary">{match.team2_score}</Badge> : ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(match.match_date).toLocaleString()} • {statusTranslations[match.status] ?? match.status}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingOddsForMatch(match)}
                            className="hover:bg-secondary/10 hover:text-primary"
                          >
                            <Percent className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingMatch(match)}
                            className="hover:bg-secondary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMatch(match.id)}
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

              {editingMatch && (
                <EditMatchForm
                  match={editingMatch}
                  teams={teams}
                  games={games}
                  onSave={() => {
                    setEditingMatch(null);
                    queryClient.invalidateQueries({ queryKey: ["matches"] });
                  }}
                  onCancel={() => setEditingMatch(null)}
                />
              )}

              {editingOddsForMatch && (
                <EditOddsForm
                  match={editingOddsForMatch}
                  onSave={() => {
                    setEditingOddsForMatch(null);
                    queryClient.invalidateQueries({ queryKey: ["matches", "odds"] }); // Assuming odds might need their own key
                  }}
                  onCancel={() => setEditingOddsForMatch(null)}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
