import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Shield, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(var(--primary)/0.3),transparent_50%),radial-gradient(circle_at_70%_50%,_hsl(var(--accent)/0.3),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Paris en direct • Cotes en temps réel • Paiements instantanés</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                WAGERVERSE
              </span>
              <br />
              <span className="text-foreground">Paris E-Sport</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              La plateforme idéale pour les passionnés d'e-sport. Pariez sur vos équipes préférées, suivez les matchs en direct et remportez gros avec des cotes compétitives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
                <Link to="/matches">Commencez à parier</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-12">
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">$1M+</div>
                <div className="text-sm text-muted-foreground">Gain totaux</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">50K+</div>
                <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pourquoi parier avec WAGERVERSE
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Meilleures cotes</h3>
              <p className="text-muted-foreground">
                Des cotes compétitives sur tous les grands tournois d'e-sport. Maximisez vos gains potentiels.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border hover:border-secondary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Paiements instantanés</h3>
              <p className="text-muted-foreground">
                Recevez vos gains instantanément. Sans attente, sans tracas. Votre argent, votre temps.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Plateforme sécurisée</h3>
              <p className="text-muted-foreground">
                Sécurité de niveau bancaire. Vos fonds et vos données sont toujours protégés grâce à un chiffrement de pointe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
            <TrendingUp className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-4xl font-bold">Prêt à gagner gros ?</h2>
            <p className="text-xl text-muted-foreground">
              Rejoignez des milliers de gagnants sur WAGERVERSE. Recevez un bonus de bienvenue de 50€ dès aujourd'hui.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
              <Link to="/auth">Créer un compte maintenant</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
