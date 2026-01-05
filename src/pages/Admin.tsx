import { useState, useEffect } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Team, Match, Game } from "@/integrations/superbase/types";
import { EditTeamForm } from "@/components/admin/EditTeamForm";
import { EditMatchForm } from "@/components/admin/EditMatchForm";
import { CreateTeamForm } from "@/components/admin/CreateTeamForm";
import { CreateMatchForm } from "@/components/admin/CreateMatchForm";
import { EditOddsForm } from "@/components/admin/EditOddsForm";
import { TeamList } from "@/components/admin/TeamList";
import { MatchList } from "@/components/admin/MatchList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PAGE_SIZE } from "@/lib/constants";
import { Loader2, ShieldAlert } from "lucide-react";


// Import service functions
import { fetchTeams, deleteTeam } from "@/services/teamService";
import { fetchMatches, deleteMatch } from "@/services/matchService";
import { fetchGames } from "@/services/gameService";
import { checkAdmin as checkAdminService } from "@/services/userService";

type ItemToDelete = {
  id: string;
  type: 'team' | 'match';
  name: string; // For display in the dialog
};

export default function Admin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingOddsForMatch, setEditingOddsForMatch] = useState<Match | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const [teamPage, setTeamPage] = useState(1);
  const [matchPage, setMatchPage] = useState(1);
  const [authLoading, setAuthLoading] = useState(true);


  const { data: teamsResult, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams", teamPage],
    queryFn: () => fetchTeams({ page: teamPage }),
    enabled: isAdmin,
  });

  const { data: matchesResult, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches", matchPage],
    queryFn: () => fetchMatches({ page: matchPage }),
    enabled: isAdmin,
  });

  // This query fetches all teams for the dropdown in CreateMatchForm.
  const { data: allTeamsQueryResult } = useQuery({
    queryKey: ["allTeams"],
    queryFn: () => fetchTeams({ page: 1, pageSize: 1000 }), // Use a large pageSize to get all teams
    enabled: isAdmin,
  });


  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: fetchGames,
    enabled: isAdmin,
  });

  const teams = teamsResult?.data ?? [];
  const teamCount = teamsResult?.count ?? 0;
  const teamTotalPages = Math.ceil(teamCount / PAGE_SIZE);

  const matches = matchesResult?.data ?? [];
  const matchCount = matchesResult?.count ?? 0;
  const matchTotalPages = Math.ceil(matchCount / PAGE_SIZE);

  const allTeams = allTeamsQueryResult?.data ?? [];

  useEffect(() => {
    const authenticateUser = async () => {
      setAuthLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }
        const adminStatus = await checkAdminService(session.user.id);
        if (!adminStatus) {
          toast.error("Accès refusé - Admin seulement");
          navigate("/");
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Erreur d'authentification. Veuillez réessayer.");
        navigate("/auth");
      } finally {
        setAuthLoading(false);
      }
    };
    authenticateUser();
  }, [navigate]);

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => await deleteTeam(id),
    onSuccess: () => {
      toast.success("Équipe supprimée");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDeleteTeam = (team: Team) => {
    setItemToDelete({ id: team.id, type: 'team', name: team.name });
  };

  const deleteMatchMutation = useMutation({
    mutationFn: async (id: string) => await deleteMatch(id),
    onSuccess: () => {
      toast.success("Match supprimé");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDeleteMatch = (match: Match) => {
    setItemToDelete({ id: match.id, type: 'match', name: `Match ${match.team1.name} vs ${match.team2.name}` });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'team') {
      deleteTeamMutation.mutate(itemToDelete.id);
    } else if (itemToDelete.type === 'match') {
      deleteMatchMutation.mutate(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  const loadingData = isLoadingTeams || isLoadingMatches || isLoadingGames;

  const statusTranslations: { [key: string]: string } = {
    programmed: "Programmé",
    ongoing: "En cours",
    done: "Terminé",
    cancel: "Annulé",
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-lg">Vérification des autorisations admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
        <p className="text-muted-foreground text-lg text-center">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Panneau d'Administration
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">Gérez les équipes, les matchs et les cotes de la plateforme</p>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams">Gestion des équipes</TabsTrigger>
            <TabsTrigger value="matches">Gestion des Matches</TabsTrigger>
          </TabsList>

          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-lg">Chargement des données d'administration...</p>
            </div>
          ) : (
            <>
              <TabsContent value="teams" className="space-y-6">
                <CreateTeamForm onTeamCreated={() => queryClient.invalidateQueries({ queryKey: ["teams", teamPage] })} />
                <TeamList teams={teams} onEditTeam={setEditingTeam} onDeleteTeam={handleDeleteTeam} />
                {teamTotalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setTeamPage(p => Math.max(1, p - 1)); }} />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">Page {teamPage} sur {teamTotalPages}</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setTeamPage(p => Math.min(teamTotalPages, p + 1)); }} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
                {editingTeam && (
                  <EditTeamForm
                    team={editingTeam}
                    onSave={() => {
                      setEditingTeam(null);
                      queryClient.invalidateQueries({ queryKey: ["teams", teamPage] });
                    }}
                    onCancel={() => setEditingTeam(null)}
                  />
                )}
              </TabsContent>

              <TabsContent value="matches" className="space-y-6">
                <CreateMatchForm teams={allTeams} games={games} onMatchCreated={() => queryClient.invalidateQueries({ queryKey: ["matches", matchPage] })} />
                <MatchList
                  matches={matches}
                  statusTranslations={statusTranslations}
                  onEditOdds={setEditingOddsForMatch}
                  onEditMatch={setEditingMatch}
                  onDeleteMatch={handleDeleteMatch}
                />
                {matchTotalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setMatchPage(p => Math.max(1, p - 1)); }} />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">Page {matchPage} sur {matchTotalPages}</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setMatchPage(p => Math.min(matchTotalPages, p + 1)); }} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
                {editingMatch && (
                  <EditMatchForm
                    match={editingMatch}
                    teams={allTeams}
                    games={games}
                    onSave={() => {
                      setEditingMatch(null);
                      queryClient.invalidateQueries({ queryKey: ["matches", matchPage] });
                    }}
                    onCancel={() => setEditingMatch(null)}
                  />
                )}
                {editingOddsForMatch && (
                  <EditOddsForm
                    match={editingOddsForMatch}
                    onSave={() => {
                      setEditingOddsForMatch(null);
                      queryClient.invalidateQueries({ queryKey: ["matches", "odds"] });
                    }}
                    onCancel={() => setEditingOddsForMatch(null)}
                  />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible et supprimera définitivement <span className="font-semibold text-foreground">"{itemToDelete?.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}