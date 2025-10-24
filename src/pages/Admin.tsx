import { useState, useEffect } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Plus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  tag: string;
  founded_year: number;
  total_earning: number;
  logo_url: string;
}

interface Match {
  id: string;
  match_date: string;
  status: string;
  team1: { name: string };
  team2: { name: string };
  game: { name: string };
}

interface Game {
  id: string;
  name: string;
  category: string;
}

export default function Admin() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Team form
  const [teamForm, setTeamForm] = useState({
    name: "",
    tag: "",
    founded_year: new Date().getFullYear(),
    logo_url: "",
  });

  // Match form
  const [matchForm, setMatchForm] = useState({
    team1_id: "",
    team2_id: "",
    game_id: "",
    match_date: "",
    status: "programmé",
    format: "BO3",
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
        team1:teams!matches_team1_id_fkey(name),
        team2:teams!matches_team2_id_fkey(name),
        game:games(name)
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("teams").insert([teamForm]);

    if (error) {
      toast.error("Error creating team");
      console.error(error);
    } else {
      toast.success("Équipe créée avec succès");
      setTeamForm({ name: "", tag: "", founded_year: new Date().getFullYear(),logo_url: ""});
      fetchData();
    }
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

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (matchForm.team1_id === matchForm.team2_id) {
      toast.error("Les équipes doivent être différentes");
      return;
    }

    const { error } = await supabase.from("matches").insert([matchForm]);

    if (error) {
      toast.error("Erreur lors de la création du match");
      console.error(error);
    } else {
      // Create default odds
      await supabase.from("match_odds").insert([
        { match_id: matchForm.team1_id, team_id: matchForm.team1_id, odds: 1.85 },
        { match_id: matchForm.team1_id, team_id: matchForm.team2_id, odds: 1.85 },
      ]);

      toast.success("Match créé avec succès");
      setMatchForm({
        team1_id: "",
        team2_id: "",
        game_id: "",
        match_date: "",
        status: "scheduled",
        format: "BO3",
      });
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

            <TabsContent value="teams" className="space-y-6">
              {/* Create Team */}
              <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="mr-2 h-5 w-5" />
                      Créer une nouvelle équipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();

                        if (!teamForm.logo_url) {
                          toast.error("Veuillez uploader un logo pour l'équipe");
                          return;
                        }

                        const { error } = await supabase.from("teams").insert([teamForm]);

                        if (error) {
                          toast.error("Erreur lors de la création de l'équipe");
                          console.error(error);
                        } else {
                          toast.success("Équipe créée avec succès !");
                          setTeamForm({
                            name: "",
                            tag: "",
                            founded_year: new Date().getFullYear(),
                            logo_url: "",
                          });
                          fetchData();
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom de l'équipe</Label>
                          <Input
                            id="name"
                            value={teamForm.name}
                            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                            required
                            className="bg-muted border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tag">Tag</Label>
                          <Input
                            id="tag"
                            value={teamForm.tag}
                            onChange={(e) => setTeamForm({ ...teamForm, tag: e.target.value })}
                            required
                            className="bg-muted border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="founded_year">Année de fondation</Label>
                          <Input
                            id="founded_year"
                            type="number"
                            value={teamForm.founded_year}
                            onChange={(e) =>
                              setTeamForm({ ...teamForm, founded_year: parseInt(e.target.value) })
                            }
                            required
                            className="bg-muted border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="logo">Logo de l'équipe</Label>
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const fileExt = file.name.split(".").pop();
                              const fileName = `${teamForm.tag}_${Date.now()}.${fileExt}`;
                              const filePath = `team-logos/${fileName}`;

                              const { data, error } = await supabase.storage
                                .from("team-logos") 
                                .upload(filePath, file);

                              if (error) {
                                toast.error("Erreur lors de l'upload du logo");
                                console.error(error);
                              } else {
                                const { data: publicUrlData } = supabase.storage
                                    .from("team-logos")
                                    .getPublicUrl(filePath);

                                if (publicUrlData) {
                                    setTeamForm({ ...teamForm, logo_url: publicUrlData.publicUrl });
                                    toast.success("Logo uploadé avec succès");
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        Créer l'équipe
                      </Button>
                    </form>
                  </CardContent>
                </Card>

              {/* Teams List */}
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
                          <img
                            src={team.logo_url}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                        <span className="text-lg font-bold">
                          {team.tag?.[0] ?? "?"}
                        </span>
                        )}
                        </div>
                          <div>
                            <div className="font-semibold">{team.name} "{team.tag}" </div>
                            <div className="text-sm text-muted-foreground">
                              Fondée en: {team.founded_year}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeam(team.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              {/* Create Match */}
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
                            {new Date(match.match_date).toLocaleString()} • {match.status}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMatch(match.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
