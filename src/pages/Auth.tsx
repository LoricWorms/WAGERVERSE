import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/superbase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, ArrowRight } from "lucide-react";
import { STARTING_BALANCE } from "@/lib/constants";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") !== "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/matches");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bon retour !");
        navigate("/matches");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        toast.success("Compte créé ! Bienvenue sur WAGERVERSE");
        navigate("/matches");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {isLogin ? "Bon retour parmi nous" : "Créez votre compte"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {isLogin ? "Entrez vos identifiants pour accéder à votre compte" : `Rejoignez la communauté et recevez ${STARTING_BALANCE}€ de bonus`}
            </p>
          </div>
          <form onSubmit={handleAuth} className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  placeholder="TheStrategist"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Mot de passe oublié?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : isLogin ? "Connexion" : "Créer le compte"}
            </Button>
            <Button variant="outline" className="w-full" type="button" disabled={loading}>
              Se connecter avec Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
            <Link to={isLogin ? "/auth?mode=signup" : "/auth?mode=login"} className="underline">
              {isLogin ? "S'inscrire" : "Se connecter"}
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[50rem] h-[50rem] rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[50rem] h-[50rem] rounded-full bg-background/10 blur-3xl -z-10" />

        <Link to="/" className="flex items-center gap-2 mb-8">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">WAGERVERSE</span>
        </Link>
        <h2 className="text-4xl font-bold tracking-tight mb-4">
            Rejoignez l'arène dès maintenant.
        </h2>
        <p className="text-muted-foreground max-w-md text-lg">
            Des milliers de fans vous attendent. Pariez, analysez et remportez la victoire. Votre prochaine grande victoire est à portée de clic.
        </p>
        <Button variant="ghost" className="mt-8" asChild>
            <Link to="/">Retour à l'accueil <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
