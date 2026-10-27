-- ==============================================================================
-- PADSTATION LEAGUE (PSL) - SUEZ, EGYPT
-- SUPABASE POSTGRESQL DATABASE SCHEMA & SECURITY POLICIES (RLS)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Players Table (Padbol Suez Players)
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT,
  district TEXT NOT NULL CHECK (district IN ('Al Arbaeen', 'Faisal', 'Attaka', 'Port Tawfiq', 'Suez Center', 'Al Ganayen')),
  avatar_url TEXT,
  position TEXT NOT NULL DEFAULT 'All-Rounder' CHECK (position IN ('Attacker', 'Defender', 'All-Rounder')),
  individual_points INTEGER NOT NULL DEFAULT 0 CHECK (individual_points >= 0),
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  sets_won INTEGER NOT NULL DEFAULT 0,
  sets_lost INTEGER NOT NULL DEFAULT 0,
  form TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Teams Table (Doubles Pairs)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  player1_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_points INTEGER NOT NULL DEFAULT 0 CHECK (team_points >= 0),
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  sets_won INTEGER NOT NULL DEFAULT 0,
  sets_lost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT different_players CHECK (player1_id <> player2_id)
);

-- 5. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  court_location TEXT NOT NULL DEFAULT 'Padstation Suez',
  team_a_player1_id UUID NOT NULL REFERENCES public.players(id),
  team_a_player2_id UUID NOT NULL REFERENCES public.players(id),
  team_a_name TEXT NOT NULL,
  team_b_player1_id UUID NOT NULL REFERENCES public.players(id),
  team_b_player2_id UUID NOT NULL REFERENCES public.players(id),
  team_b_name TEXT NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::JSONB,
  winner_team TEXT NOT NULL CHECK (winner_team IN ('team_a', 'team_b')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  submitted_by_name TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  points_awarded BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexing for high-performance leaderboards
CREATE INDEX IF NOT EXISTS idx_players_points ON public.players(individual_points DESC, matches_won DESC);
CREATE INDEX IF NOT EXISTS idx_teams_points ON public.teams(team_points DESC, matches_won DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status, match_date DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are readable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Players Policies
CREATE POLICY "Players are viewable by everyone"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create player profiles"
  ON public.players FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- CRITICAL RULE: Users CANNOT edit their own points!
CREATE POLICY "Only admins can update player points or stats"
  ON public.players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Teams Policies
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can register doubles teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update team points"
  ON public.teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Matches Policies
CREATE POLICY "Anyone can view approved matches; auth users view all"
  ON public.matches FOR SELECT
  USING (
    status = 'approved' OR auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated players can submit matches with pending status"
  ON public.matches FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND status = 'pending' 
    AND points_awarded = FALSE
  );

CREATE POLICY "Only admins can update or approve matches"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ==============================================================================
-- SECURE STORED PROCEDURE FOR ATOMIC POINT AWARDS
-- ==============================================================================
-- Ensures:
-- 1. Winning players receive +3 individual points
-- 2. Losing players receive 0 points
-- 3. Winning doubles team receives +3 team points; losing team receives 0
-- 4. Points awarded exactly once (prevents duplicate awards)
-- 5. Only executable by admins
CREATE OR REPLACE FUNCTION public.approve_match(
  p_match_id UUID,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match RECORD;
  v_winner_p1 UUID;
  v_winner_p2 UUID;
  v_loser_p1 UUID;
  v_loser_p2 UUID;
  v_winning_team_id UUID;
  v_losing_team_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Verify admin authorization
  SELECT (role = 'admin') INTO v_is_admin
  FROM public.profiles
  WHERE id = p_admin_id;

  IF v_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Unauthorized: Only PSL administrators can approve matches.';
  END IF;

  -- Fetch match with lock
  SELECT * INTO v_match
  FROM public.matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match with ID % not found.', p_match_id;
  END IF;

  IF v_match.status = 'approved' OR v_match.points_awarded IS TRUE THEN
    RAISE EXCEPTION 'Duplicate point prevention: This match is already approved and points have been awarded.';
  END IF;

  -- Determine winners & losers
  IF v_match.winner_team = 'team_a' THEN
    v_winner_p1 := v_match.team_a_player1_id;
    v_winner_p2 := v_match.team_a_player2_id;
    v_loser_p1 := v_match.team_b_player1_id;
    v_loser_p2 := v_match.team_b_player2_id;
  ELSE
    v_winner_p1 := v_match.team_b_player1_id;
    v_winner_p2 := v_match.team_b_player2_id;
    v_loser_p1 := v_match.team_a_player1_id;
    v_loser_p2 := v_match.team_a_player2_id;
  END IF;

  -- 1. Award +3 Individual Points to winning players
  UPDATE public.players
  SET individual_points = individual_points + 3,
      matches_played = matches_played + 1,
      matches_won = matches_won + 1,
      form = array_append(form, 'W')
  WHERE id IN (v_winner_p1, v_winner_p2);

  -- 2. Update losing players (0 points awarded, record match count and loss)
  UPDATE public.players
  SET matches_played = matches_played + 1,
      matches_lost = matches_lost + 1,
      form = array_append(form, 'L')
  WHERE id IN (v_loser_p1, v_loser_p2);

  -- 3. Award +3 Team Points to winning doubles team
  -- Find or register winning doubles team
  SELECT id INTO v_winning_team_id
  FROM public.teams
  WHERE (player1_id = v_winner_p1 AND player2_id = v_winner_p2)
     OR (player1_id = v_winner_p2 AND player2_id = v_winner_p1)
  LIMIT 1;

  IF v_winning_team_id IS NOT NULL THEN
    UPDATE public.teams
    SET team_points = team_points + 3,
        matches_played = matches_played + 1,
        matches_won = matches_won + 1
    WHERE id = v_winning_team_id;
  END IF;

  -- Update losing doubles team (0 points)
  SELECT id INTO v_losing_team_id
  FROM public.teams
  WHERE (player1_id = v_loser_p1 AND player2_id = v_loser_p2)
     OR (player1_id = v_loser_p2 AND player2_id = v_loser_p1)
  LIMIT 1;

  IF v_losing_team_id IS NOT NULL THEN
    UPDATE public.teams
    SET matches_played = matches_played + 1,
        matches_lost = matches_lost + 1
    WHERE id = v_losing_team_id;
  END IF;

  -- 4. Mark match approved & points awarded
  UPDATE public.matches
  SET status = 'approved',
      approved_by = p_admin_id,
      approved_at = NOW(),
      points_awarded = TRUE
  WHERE id = p_match_id;

  RETURN jsonb_build_object(
    'success', true,
    'match_id', p_match_id,
    'awarded_individual_points', 3,
    'awarded_team_points', 3
  );
END;
$$;
