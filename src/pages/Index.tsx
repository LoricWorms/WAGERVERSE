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
              <span className="text-sm font-medium">Live Betting • Real-time Odds • Instant Payouts</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                WAGERVERSE
              </span>
              <br />
              <span className="text-foreground">E-Sports Betting</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              The ultimate platform for e-sports enthusiasts. Place bets on your favorite teams, track live matches, and win big with competitive odds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
                <Link to="/auth">Start Betting Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary/50 hover:bg-primary/10 text-lg px-8">
                <Link to="/matches">View Live Matches</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-12">
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">$1M+</div>
                <div className="text-sm text-muted-foreground">Total Payouts</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
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
              Why Choose WAGERVERSE
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Best Odds</h3>
              <p className="text-muted-foreground">
                Competitive odds across all major e-sports tournaments. Maximize your potential winnings.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border hover:border-secondary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Payouts</h3>
              <p className="text-muted-foreground">
                Get your winnings instantly. No waiting, no hassle. Your money, your time.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
              <p className="text-muted-foreground">
                Bank-level security. Your funds and data are always protected with industry-leading encryption.
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
            <h2 className="text-4xl font-bold">Ready to Win Big?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of winners on WAGERVERSE. Get $1000 welcome bonus when you sign up today.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
              <Link to="/auth">Create Account Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
