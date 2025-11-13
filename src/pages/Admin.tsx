import { useState, useEffect } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit } from "lucide-react";
import { Team, Match, Game } from "@/integrations/superbase/types";
import { EditTeamForm } from "@/components/admin/EditTeamForm";
import { EditMatchForm } from "@/components/admin/EditMatchForm";
import { CreateTeamForm } from "@/components/admin/CreateTeamForm";
import { CreateMatchForm } from "@/components/admin/CreateMatchForm";

export default function Admin() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const navigate = useNavigate();

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
      fetchData();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch teams
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .order("name");
    setTeams(teamsData || []);

    // Fetch matches
    const { data: matchesData } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        status,
        format,
        team1:teams!matches_team1_id_fkey(id, name),
        team2:teams!matches_team2_id_fkey(id, name),
        game:games(id, name)
      `)
      .order("match_date", { ascending: false });
    setMatches(matchesData || []);

    // Fetch games
    const { data: gamesData } = await supabase
      .from("games")
      .select("*")
      .order("name");
    setGames(gamesData || []);

    setLoading(false);
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette équipe ?")) return;

    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting team");
    } else {
      toast.success("Équipe supprimée");
      fetchData();
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Etes-vous sûr de vouloir supprimer ce match ??")) return;

    const { error } = await supabase.from("matches").delete().eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression du match");
    } else {
      toast.success("Match supprimé");
      fetchData();
    }
  };

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
              {/* Création d'une nouvelle équipe */}
              <CreateTeamForm onTeamCreated={fetchData} />

              {/* Liste et édition des équipes */}
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

              {/* Formulaire de modification */}
              {editingTeam && (
                <EditTeamForm
                  team={editingTeam}
                  onSave={() => {
                    setEditingTeam(null);
                    fetchData();
                  }}
                  onCancel={() => setEditingTeam(null)}
                />
              )}
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              {/* Create Match */}
              <CreateMatchForm teams={teams} games={games} onMatchCreated={fetchData} />

              {/* Matches List */}
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
                          <div className="text-sm">
                            {match.team1?.name} vs {match.team2?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(match.match_date).toLocaleString()} • {statusTranslations[match.status] ?? match.status}
                          </div>
                        </div>
                        <div className="flex space-x-2">
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

              {/* Formulaire de modification de match */}
              {editingMatch && (
                <EditMatchForm
                  match={editingMatch}
                  teams={teams}
                  games={games}
                  onSave={() => {
                    setEditingMatch(null);
                    fetchData();
                  }}
                  onCancel={() => setEditingMatch(null)}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
