import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Wallet, LogOut, Settings, Trophy, Menu } from "lucide-react";
import { supabase } from "@/integrations/superbase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle"; // Import ModeToggle

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdmin(session.user.id);
      }
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdmin(session.user.id);
      } else {
        setBalance(0);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("balance").eq("id", userId).single();
    if (data) setBalance(data.balance);
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").single();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const UserMenu = () => (
    <>
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-primary" />
        <span className="font-semibold text-lg">{balance.toFixed(2)}€</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <img
              src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.id}`}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin">
                <Settings className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link to="/auth?mode=login">Connexion</Link>
      </Button>
      <Button asChild>
        <Link to="/auth?mode=signup">Inscription</Link>
      </Button>
    </div>
  );

  const NavLinks = ({ className }: { className?: string }) => (
    <div className={className}>
      <Button variant="link" asChild>
        <Link to="/matches">Matchs</Link>
      </Button>
      <Button variant="link" asChild>
        <Link to="#">Classements</Link>
      </Button>
      <Button variant="link" asChild>
        <Link to="#">À propos</Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">WAGERVERSE</span>
          </Link>
          <NavLinks className="hidden md:flex items-center gap-2" />
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle /> {/* Place ModeToggle for desktop */}
          <div className="hidden md:flex">{user ? <UserMenu /> : <AuthButtons />}</div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild><Link to="/matches">Matchs</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="#">Classements</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="#">À propos</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                     {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin">Admin Panel</Link>
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">Déconnexion</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild><Link to="/auth?mode=login">Connexion</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/auth?mode=signup">Inscription</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                {/* Place ModeToggle for mobile */}
                <DropdownMenuItem className="flex justify-between items-center">
                  <span>Thème</span>
                  <ModeToggle />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
