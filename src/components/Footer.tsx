import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">WAGERVERSE</span>
            </Link>
            <p className="text-muted-foreground mt-4">
              La plateforme numéro 1 pour les paris sur l'e-sport.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/matches" className="text-muted-foreground hover:text-primary">Matchs</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
              <li><Link to="/auth?mode=login" className="text-muted-foreground hover:text-primary">Login</Link></li>
              <li><Link to="/auth?mode=signup" className="text-muted-foreground hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Légal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-muted-foreground hover:text-primary">Termes de service</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary">Politique de confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Social</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary">Twitter</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary">Discord</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary">Twitch</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 flex justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} WAGERVERSE. Tous droits réservés.
          </p>
          <p className="text-muted-foreground text-sm">
            Jeu responsable. Vous devez avoir 18 ans et plus pour parier.
          </p>
        </div>
      </div>
    </footer>
  );
};
