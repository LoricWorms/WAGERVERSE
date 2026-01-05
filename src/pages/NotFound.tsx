import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center bg-background text-foreground text-center p-4">
      <Frown className="h-24 w-24 text-primary mb-6 animate-pulse" />
      <h1 className="mb-4 text-6xl font-bold tracking-tight">404</h1>
      <p className="mb-8 text-xl text-muted-foreground">Oups! La page que vous cherchez est introuvable.</p>
      <Button asChild size="lg">
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
};

export default NotFound;
