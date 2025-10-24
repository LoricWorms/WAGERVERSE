import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Wallet, LogOut, Settings, Trophy } from "lucide-react";
import { supabase } from "@/integrations/superbase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdmin(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdmin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();
    
    if (data) {
      setBalance(data.balance);
    }
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              WAGERVERSE
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="outline" asChild className="border-accent/50 hover:bg-accent/10">
                    <Link to="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="border-primary/50 hover:bg-primary/10">
                  <Link to="/matches">Matchs</Link>
                </Button>
                <Button variant="outline" asChild className="border-secondary/50 hover:bg-secondary/10">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <div className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg border border-border">
                  <Wallet className="h-4 w-4 text-success" />
                  <span className="font-mono text-success">{balance.toFixed(2)}€</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="border-primary/50 hover:bg-primary/10">
                  <Link to="/auth?mode=login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Link to="/auth?mode=signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
