export type District =
  | 'Al Arbaeen'
  | 'Faisal'
  | 'Attaka'
  | 'Port Tawfiq'
  | 'Suez Center'
  | 'Al Ganayen';

export const SUEZ_DISTRICTS: District[] = [
  'Al Arbaeen',
  'Faisal',
  'Attaka',
  'Port Tawfiq',
  'Suez Center',
  'Al Ganayen',
];

export const PSL_LOGO = '/psl-logo.png';

export const OFFICIAL_COURT_LOCATION = 'Padstation Suez';

export const SUEZ_COURTS = [
  'Padstation Suez',
];

export type PlayerPosition = 'Attacker' | 'Defender' | 'All-Rounder';

export interface Player {
  id: string;
  user_id?: string;
  name: string;
  nickname?: string;
  phone?: string;
  partner_name?: string;
  partner_phone?: string;
  district: District;
  avatar_url?: string;
  position: PlayerPosition;
  individual_points: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  sets_won: number;
  sets_lost: number;
  form: ('W' | 'L')[];
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  player1_id: string;
  player2_id: string;
  team_points: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  sets_won: number;
  sets_lost: number;
  created_at: string;
}

export interface SetScore {
  team_a: number;
  team_b: number;
}

export type MatchStatus = 'pending' | 'approved' | 'rejected';

export interface Match {
  id: string;
  match_date: string;
  court_location: string;
  team_a_player1_id: string;
  team_a_player2_id: string;
  team_a_name: string;
  team_b_player1_id: string;
  team_b_player2_id: string;
  team_b_name: string;
  sets: SetScore[];
  winner_team: 'team_a' | 'team_b';
  status: MatchStatus;
  submitted_by: string;
  submitted_by_name: string;
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  points_awarded: boolean;
}

export type UserRole = 'player' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  player_id?: string;
  name: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
