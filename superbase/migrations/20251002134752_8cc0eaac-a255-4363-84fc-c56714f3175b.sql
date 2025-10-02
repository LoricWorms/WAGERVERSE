-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tag TEXT,
  founded_year INTEGER,
  total_earning DECIMAL(15,2) DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  prize_pool DECIMAL(15,2),
  start_date TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  localisation TEXT,
  statut TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  real_name TEXT,
  country TEXT,
  age INTEGER,
  role TEXT,
  avatar_url TEXT,
  total_earning DECIMAL(15,2) DEFAULT 0,
  twitch_followers INTEGER DEFAULT 0,
  youtube_suscribers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create team_players junction table
CREATE TABLE public.team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  position TEXT,
  join_date TIMESTAMPTZ,
  salary DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, player_id)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  team1_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  match_date TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  format TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create match_odds table
CREATE TABLE public.match_odds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  odds DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, team_id)
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  balance DECIMAL(15,2) DEFAULT 1000,
  total_bet DECIMAL(15,2) DEFAULT 0,
  total_won DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  odds DECIMAL(5,2) NOT NULL,
  potential_win DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-logos', 'team-logos', true);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  )
$$;

-- RLS Policies for games (public read, admin write)
CREATE POLICY "Games viewable by all" ON public.games FOR SELECT USING (true);
CREATE POLICY "Games writable by admin" ON public.games FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for teams (public read, admin write)
CREATE POLICY "Teams viewable by all" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Teams writable by admin" ON public.teams FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for tournaments (public read, admin write)
CREATE POLICY "Tournaments viewable by all" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Tournaments writable by admin" ON public.tournaments FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for players (public read, admin write)
CREATE POLICY "Players viewable by all" ON public.players FOR SELECT USING (true);
CREATE POLICY "Players writable by admin" ON public.players FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for team_players (public read, admin write)
CREATE POLICY "Team players viewable by all" ON public.team_players FOR SELECT USING (true);
CREATE POLICY "Team players writable by admin" ON public.team_players FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for matches (public read, admin write)
CREATE POLICY "Matches viewable by all" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Matches writable by admin" ON public.matches FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for match_odds (public read, admin write)
CREATE POLICY "Match odds viewable by all" ON public.match_odds FOR SELECT USING (true);
CREATE POLICY "Match odds writable by admin" ON public.match_odds FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (admin only)
CREATE POLICY "User roles viewable by owner or admin" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "User roles writable by admin only" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for bets
CREATE POLICY "Bets viewable by owner" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Bets insertable by authenticated" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bets viewable by admin" ON public.bets FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Bets updatable by admin" ON public.bets FOR UPDATE USING (public.is_admin(auth.uid()));

-- Storage policies for team logos
CREATE POLICY "Team logos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'team-logos');
CREATE POLICY "Admins can upload team logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-logos' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can update team logos" ON storage.objects FOR UPDATE USING (bucket_id = 'team-logos' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete team logos" ON storage.objects FOR DELETE USING (bucket_id = 'team-logos' AND public.is_admin(auth.uid()));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    1000
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_players_updated_at BEFORE UPDATE ON public.team_players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_match_odds_updated_at BEFORE UPDATE ON public.match_odds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON public.bets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();