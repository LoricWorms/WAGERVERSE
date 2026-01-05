import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Trophy, Zap, Shield, Users } from "lucide-react";

const Index = () => {
  const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all transform hover:-translate-y-1">
      <CardContent className="p-6 text-center">
        <div className="inline-block bg-primary/10 text-primary p-3 rounded-lg mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{children}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col items-center">

      {/* Hero Section */}
      <section className="w-full text-center py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full bg-primary/10 blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-secondary/10 blur-3xl -z-10" />
        
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            L'arène ultime des paris <span className="text-primary">E-Sport</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
            Plongez au cœur de l'action. Pariez sur vos équipes préférées, analysez les statistiques et vivez chaque match comme si vous y étiez.
          </p>
          <div className="flex justify-center items-center gap-4">
            <Button size="lg" asChild>
              <Link to="/matches">
                Voir les matchs <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth?mode=signup">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-16 text-center container">
        <h2 className="text-sm uppercase text-muted-foreground font-semibold tracking-widest">
          Jeux Populaires
        </h2>
        <div className="flex justify-center items-center gap-8 md:gap-12 mt-6 flex-wrap">
          {/* Replace with actual game logos */}
          <span className="text-2xl font-semibold text-muted-foreground">League of Legends</span>
          <span className="text-2xl font-semibold text-muted-foreground">CS:GO</span>
          <span className="text-2xl font-semibold text-muted-foreground">Valorant</span>
          <span className="text-2xl font-semibold text-muted-foreground">Dota 2</span>
          <span className="text-2xl font-semibold text-muted-foreground">Rocket League</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 md:py-32 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Pourquoi <span className="text-primary">WAGERVERSE</span> ?</h2>
            <p className="text-muted-foreground text-lg">
              Nous avons construit la plateforme que nous avons toujours voulu utiliser. Rapide, sécurisée et conçue pour les vrais fans.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <FeatureCard icon={<Trophy className="h-6 w-6"/>} title="Cotes compétitives">
              Obtenez le meilleur retour sur investissement avec nos cotes optimisées en temps réel sur les plus grands tournois.
            </FeatureCard>
            <FeatureCard icon={<Zap className="h-6 w-6"/>} title="Paiements instantanés">
              Vos gains sont crédités sur votre compte à la seconde où un match se termine. Pas d'attente.
            </FeatureCard>
            <FeatureCard icon={<Shield className="h-6 w-6"/>} title="Sécurité renforcée">
              Nous utilisons un cryptage de pointe et les meilleures pratiques pour garantir que vos fonds et données sont en sécurité.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-4xl text-center">
            <Users className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-8">Ils nous font confiance</h2>
            <div className="space-y-8">
              <blockquote className="text-2xl font-medium leading-relaxed">
                “La meilleure plateforme de paris e-sport que j'ai utilisée. L'interface est clean, les paiements sont rapides. Je ne peux que recommander !”
              </blockquote>
              <footer className="text-center">
                <p className="font-bold">Alex "TheStrategist" Dubois</p>
                <p className="text-muted-foreground">Parieur professionnel & Streamer</p>
              </footer>
            </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-24 md:py-32 bg-gradient-to-t from-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Prêt à placer votre premier pari ?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Rejoignez des milliers d'autres fans et commencez à gagner aujourd'hui. L'inscription est rapide et gratuite.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/auth?mode=signup">
              Rejoignez WAGERVERSE gratuitement <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
