import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Team, Match, SetScore, District, PlayerPosition } from '../types';
import { getSupabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface DataContextType {
  players: Player[];
  teams: Team[];
  matches: Match[];
  loading: boolean;
  addPlayer: (data: {
    name: string;
    nickname?: string;
    phone?: string;
    partner_name?: string;
    partner_phone?: string;
    district: District;
    position: PlayerPosition;
    avatar_url?: string;
  }) => Promise<Player>;
  submitMatch: (matchData: {
    court_location: string;
    match_date: string;
    team_a_player1_id: string;
    team_a_player2_id: string;
    team_a_name?: string;
    team_b_player1_id: string;
    team_b_player2_id: string;
    team_b_name?: string;
    sets: SetScore[];
    notes?: string;
    submitted_by: string;
    submitted_by_name: string;
  }) => Promise<{ success: boolean; match?: Match; error?: string }>;
  approveMatch: (matchId: string, adminId: string) => Promise<{ success: boolean; error?: string }>;
  rejectMatch: (matchId: string, adminId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  revertMatchApproval: (matchId: string, adminId: string) => Promise<{ success: boolean; error?: string }>;
  getPlayerById: (id: string) => Player | undefined;
  getTeamById: (id: string) => Team | undefined;
  getMatchesForPlayer: (playerId: string) => Match[];
  loadSampleTournamentData: () => void;
  resetAllDataToZero: () => void;
}

const PLAYERS_STORAGE = 'psl_players_data_v1';
const TEAMS_STORAGE = 'psl_teams_data_v1';
const MATCHES_STORAGE = 'psl_matches_data_v1';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize data: check Supabase or fallback to local storage
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data: pData } = await supabase.from('players').select('*').order('individual_points', { ascending: false });
        const { data: tData } = await supabase.from('teams').select('*').order('team_points', { ascending: false });
        const { data: mData } = await supabase.from('matches').select('*').order('match_date', { ascending: false });

        if (pData && pData.length > 0) setPlayers(pData);
        if (tData && tData.length > 0) setTeams(tData);
        if (mData && mData.length > 0) setMatches(mData);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Supabase fetch failed, using local storage state:', err);
      }
    }

    // Load from local storage
    try {
      const storedPlayers = localStorage.getItem(PLAYERS_STORAGE);
      const storedTeams = localStorage.getItem(TEAMS_STORAGE);
      const storedMatches = localStorage.getItem(MATCHES_STORAGE);

      if (storedPlayers) {
        setPlayers(JSON.parse(storedPlayers));
      } else {
        setPlayers([]);
      }

      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      } else {
        setTeams([]);
      }

      if (storedMatches) {
        setMatches(JSON.parse(storedMatches));
      } else {
        setMatches([]);
      }
    } catch (e) {
      console.error('Failed reading storage:', e);
      setPlayers([]);
      setTeams([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync to local storage whenever state changes
  const saveLocalState = (newPlayers: Player[], newTeams: Team[], newMatches: Match[]) => {
    setPlayers(newPlayers);
    setTeams(newTeams);
    setMatches(newMatches);
    try {
      localStorage.setItem(PLAYERS_STORAGE, JSON.stringify(newPlayers));
      localStorage.setItem(TEAMS_STORAGE, JSON.stringify(newTeams));
      localStorage.setItem(MATCHES_STORAGE, JSON.stringify(newMatches));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  };

  // 1. Add Player
  const addPlayer = async (data: {
    name: string;
    nickname?: string;
    phone?: string;
    partner_name?: string;
    partner_phone?: string;
    district: District;
    position: PlayerPosition;
    avatar_url?: string;
  }): Promise<Player> => {
    const newPlayer: Player = {
      id: 'ply-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name: data.name.trim(),
      nickname: data.nickname?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      partner_name: data.partner_name?.trim() || undefined,
      partner_phone: data.partner_phone?.trim() || undefined,
      district: data.district,
      position: data.position,
      avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      individual_points: 0, // CRITICAL: starts at 0 points
      matches_played: 0,
      matches_won: 0,
      matches_lost: 0,
      sets_won: 0,
      sets_lost: 0,
      form: [],
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('players').insert(newPlayer);
      } catch (err) {
        console.error('Failed to add player to Supabase:', err);
      }
    }

    const updatedPlayers = [...players, newPlayer];
    saveLocalState(updatedPlayers, teams, matches);
    return newPlayer;
  };

  // Helper to find or create doubles team
  const findOrCreateTeam = (
    p1Id: string,
    p2Id: string,
    proposedName: string,
    currentTeams: Team[]
  ): { team: Team; updatedTeams: Team[] } => {
    const sorted = [p1Id, p2Id].sort();
    const existing = currentTeams.find(
      (t) =>
        (t.player1_id === sorted[0] && t.player2_id === sorted[1]) ||
        (t.player1_id === sorted[1] && t.player2_id === sorted[0])
    );

    if (existing) {
      return { team: existing, updatedTeams: currentTeams };
    }

    const newTeam: Team = {
      id: 'team-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name: proposedName,
      player1_id: sorted[0],
      player2_id: sorted[1],
      team_points: 0, // Starts at 0 points
      matches_played: 0,
      matches_won: 0,
      matches_lost: 0,
      sets_won: 0,
      sets_lost: 0,
      created_at: new Date().toISOString(),
    };

    return {
      team: newTeam,
      updatedTeams: [...currentTeams, newTeam],
    };
  };

  // 2. Submit Match
  const submitMatch = async (matchData: {
    court_location: string;
    match_date: string;
    team_a_player1_id: string;
    team_a_player2_id: string;
    team_a_name?: string;
    team_b_player1_id: string;
    team_b_player2_id: string;
    team_b_name?: string;
    sets: SetScore[];
    notes?: string;
    submitted_by: string;
    submitted_by_name: string;
  }): Promise<{ success: boolean; match?: Match; error?: string }> => {
    // Validate 4 unique players
    const uniqueIds = new Set([
      matchData.team_a_player1_id,
      matchData.team_a_player2_id,
      matchData.team_b_player1_id,
      matchData.team_b_player2_id,
    ]);

    if (uniqueIds.size !== 4) {
      return {
        success: false,
        error: 'A Padbol doubles match requires 4 distinct registered players (2 per team).',
      };
    }

    // Determine winner based on sets won
    let setsA = 0;
    let setsB = 0;
    for (const s of matchData.sets) {
      if (s.team_a > s.team_b) setsA++;
      else if (s.team_b > s.team_a) setsB++;
    }

    if (setsA === setsB) {
      return {
        success: false,
        error: 'Padbol matches cannot end in a draw. Please input valid set results.',
      };
    }

    const winner_team: 'team_a' | 'team_b' = setsA > setsB ? 'team_a' : 'team_b';

    // Auto-generate team names if missing
    const p1A = players.find((p) => p.id === matchData.team_a_player1_id);
    const p2A = players.find((p) => p.id === matchData.team_a_player2_id);
    const p1B = players.find((p) => p.id === matchData.team_b_player1_id);
    const p2B = players.find((p) => p.id === matchData.team_b_player2_id);

    const defaultTeamAName =
      matchData.team_a_name?.trim() || `${p1A?.name?.split(' ')[0] || 'A1'} & ${p2A?.name?.split(' ')[0] || 'A2'}`;
    const defaultTeamBName =
      matchData.team_b_name?.trim() || `${p1B?.name?.split(' ')[0] || 'B1'} & ${p2B?.name?.split(' ')[0] || 'B2'}`;

    // Ensure doubles teams exist in registry
    let curTeams = [...teams];
    const resA = findOrCreateTeam(matchData.team_a_player1_id, matchData.team_a_player2_id, defaultTeamAName, curTeams);
    curTeams = resA.updatedTeams;
    const resB = findOrCreateTeam(matchData.team_b_player1_id, matchData.team_b_player2_id, defaultTeamBName, curTeams);
    curTeams = resB.updatedTeams;

    const newMatch: Match = {
      id: 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      match_date: matchData.match_date || new Date().toISOString(),
      court_location: matchData.court_location,
      team_a_player1_id: matchData.team_a_player1_id,
      team_a_player2_id: matchData.team_a_player2_id,
      team_a_name: defaultTeamAName,
      team_b_player1_id: matchData.team_b_player1_id,
      team_b_player2_id: matchData.team_b_player2_id,
      team_b_name: defaultTeamBName,
      sets: matchData.sets,
      winner_team,
      status: 'pending', // CRITICAL: Always pending initially!
      submitted_by: matchData.submitted_by,
      submitted_by_name: matchData.submitted_by_name,
      submitted_at: new Date().toISOString(),
      notes: matchData.notes,
      points_awarded: false, // CRITICAL: Points not awarded yet
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('matches').insert(newMatch);
      } catch (err) {
        console.error('Supabase match insert error:', err);
      }
    }

    const updatedMatches = [newMatch, ...matches];
    saveLocalState(players, curTeams, updatedMatches);

    return { success: true, match: newMatch };
  };

  // 3. Approve Match (ADMIN PROTECTED)
  // Ranking rules:
  // - Every player on winning team receives 3 individual points
  // - Losing players receive 0 points
  // - Winning doubles team receives 3 team points; losing team receives 0
  // - Individual points and team points are separate
  // - Duplicate points strictly prevented!
  const approveMatch = async (matchId: string, adminId: string): Promise<{ success: boolean; error?: string }> => {
    const matchIndex = matches.findIndex((m) => m.id === matchId);
    if (matchIndex === -1) {
      return { success: false, error: 'Match not found.' };
    }

    const match = matches[matchIndex];

    // Duplicate protection
    if (match.status === 'approved' || match.points_awarded) {
      return { success: false, error: 'Points have already been awarded for this match.' };
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: rpcError } = await supabase.rpc('approve_match', {
          p_match_id: matchId,
          p_admin_id: adminId,
        });
        if (rpcError) {
          console.warn('Supabase RPC call failed, falling back to local atomic transaction:', rpcError);
        }
      } catch (e) {
        console.error('Supabase error:', e);
      }
    }

    // Identify winners and losers
    const isTeamAWinner = match.winner_team === 'team_a';
    const winningPlayerIds = isTeamAWinner
      ? [match.team_a_player1_id, match.team_a_player2_id]
      : [match.team_b_player1_id, match.team_b_player2_id];

    const losingPlayerIds = isTeamAWinner
      ? [match.team_b_player1_id, match.team_b_player2_id]
      : [match.team_a_player1_id, match.team_a_player2_id];

    // Compute set stats
    let teamASetsWon = 0;
    let teamBSetsWon = 0;
    for (const s of match.sets) {
      if (s.team_a > s.team_b) teamASetsWon++;
      else if (s.team_b > s.team_a) teamBSetsWon++;
    }

    // 1. Update Players
    const updatedPlayers = players.map((player) => {
      if (winningPlayerIds.includes(player.id)) {
        const setsWonThisMatch = isTeamAWinner ? teamASetsWon : teamBSetsWon;
        const setsLostThisMatch = isTeamAWinner ? teamBSetsWon : teamASetsWon;
        return {
          ...player,
          individual_points: player.individual_points + 3, // +3 Individual Points for winner
          matches_played: player.matches_played + 1,
          matches_won: player.matches_won + 1,
          sets_won: player.sets_won + setsWonThisMatch,
          sets_lost: player.sets_lost + setsLostThisMatch,
          form: ['W' as const, ...player.form].slice(0, 5),
        };
      } else if (losingPlayerIds.includes(player.id)) {
        const setsWonThisMatch = isTeamAWinner ? teamBSetsWon : teamASetsWon;
        const setsLostThisMatch = isTeamAWinner ? teamASetsWon : teamBSetsWon;
        return {
          ...player,
          individual_points: player.individual_points + 0, // 0 Points for loser
          matches_played: player.matches_played + 1,
          matches_lost: player.matches_lost + 1,
          sets_won: player.sets_won + setsWonThisMatch,
          sets_lost: player.sets_lost + setsLostThisMatch,
          form: ['L' as const, ...player.form].slice(0, 5),
        };
      }
      return player;
    });

    // 2. Update Doubles Teams (Separate Team Points)
    // Find or create winning team and losing team
    let curTeams = [...teams];
    const winningDoubles = findOrCreateTeam(
      winningPlayerIds[0],
      winningPlayerIds[1],
      isTeamAWinner ? match.team_a_name : match.team_b_name,
      curTeams
    );
    curTeams = winningDoubles.updatedTeams;

    const losingDoubles = findOrCreateTeam(
      losingPlayerIds[0],
      losingPlayerIds[1],
      isTeamAWinner ? match.team_b_name : match.team_a_name,
      curTeams
    );
    curTeams = losingDoubles.updatedTeams;

    const updatedTeams = curTeams.map((team) => {
      const isWinnerTeam =
        (team.player1_id === winningPlayerIds[0] && team.player2_id === winningPlayerIds[1]) ||
        (team.player1_id === winningPlayerIds[1] && team.player2_id === winningPlayerIds[0]);

      const isLoserTeam =
        (team.player1_id === losingPlayerIds[0] && team.player2_id === losingPlayerIds[1]) ||
        (team.player1_id === losingPlayerIds[1] && team.player2_id === losingPlayerIds[0]);

      if (isWinnerTeam) {
        return {
          ...team,
          team_points: team.team_points + 3, // +3 Team points
          matches_played: team.matches_played + 1,
          matches_won: team.matches_won + 1,
        };
      }
      if (isLoserTeam) {
        return {
          ...team,
          team_points: team.team_points + 0, // 0 Team points
          matches_played: team.matches_played + 1,
          matches_lost: team.matches_lost + 1,
        };
      }
      return team;
    });

    // 3. Mark match as approved & points_awarded = true
    const updatedApprovedMatch: Match = {
      ...match,
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      points_awarded: true,
    };

    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = updatedApprovedMatch;

    saveLocalState(updatedPlayers, updatedTeams, updatedMatches);

    // Sports celebration trigger!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ef4444', '#ffffff', '#111111'],
      });
    } catch {
      // ignore
    }

    return { success: true };
  };

  // 4. Reject Match (ADMIN PROTECTED)
  const rejectMatch = async (
    matchId: string,
    adminId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    const matchIndex = matches.findIndex((m) => m.id === matchId);
    if (matchIndex === -1) {
      return { success: false, error: 'Match not found.' };
    }

    const match = matches[matchIndex];
    if (match.status === 'approved' && match.points_awarded) {
      return {
        success: false,
        error: 'This match was already approved with points awarded. Use "Revert Points" first if correction is needed.',
      };
    }

    const updatedRejectedMatch: Match = {
      ...match,
      status: 'rejected',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      rejection_reason: reason.trim() || 'Did not meet official PSL verification standards.',
      points_awarded: false, // Remains false, does not affect rankings
    };

    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = updatedRejectedMatch;

    // Rankings are NOT affected by rejected matches
    saveLocalState(players, teams, updatedMatches);
    return { success: true };
  };

  // 5. Admin Match Revert / Correction Tool
  const revertMatchApproval = async (
    matchId: string,
    adminId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const matchIndex = matches.findIndex((m) => m.id === matchId);
    if (matchIndex === -1) {
      return { success: false, error: 'Match not found.' };
    }

    const match = matches[matchIndex];
    if (match.status !== 'approved' || !match.points_awarded) {
      return { success: false, error: 'Only approved matches with points awarded can be reverted.' };
    }

    const isTeamAWinner = match.winner_team === 'team_a';
    const winningPlayerIds = isTeamAWinner
      ? [match.team_a_player1_id, match.team_a_player2_id]
      : [match.team_b_player1_id, match.team_b_player2_id];

    const losingPlayerIds = isTeamAWinner
      ? [match.team_b_player1_id, match.team_b_player2_id]
      : [match.team_a_player1_id, match.team_a_player2_id];

    // Safely deduct the 3 points and roll back stats
    const revertedPlayers = players.map((p) => {
      if (winningPlayerIds.includes(p.id)) {
        return {
          ...p,
          individual_points: Math.max(0, p.individual_points - 3),
          matches_played: Math.max(0, p.matches_played - 1),
          matches_won: Math.max(0, p.matches_won - 1),
          form: p.form.slice(1),
        };
      }
      if (losingPlayerIds.includes(p.id)) {
        return {
          ...p,
          matches_played: Math.max(0, p.matches_played - 1),
          matches_lost: Math.max(0, p.matches_lost - 1),
          form: p.form.slice(1),
        };
      }
      return p;
    });

    const revertedTeams = teams.map((team) => {
      const isWinnerTeam =
        (team.player1_id === winningPlayerIds[0] && team.player2_id === winningPlayerIds[1]) ||
        (team.player1_id === winningPlayerIds[1] && team.player2_id === winningPlayerIds[0]);

      const isLoserTeam =
        (team.player1_id === losingPlayerIds[0] && team.player2_id === losingPlayerIds[1]) ||
        (team.player1_id === losingPlayerIds[1] && team.player2_id === losingPlayerIds[0]);

      if (isWinnerTeam) {
        return {
          ...team,
          team_points: Math.max(0, team.team_points - 3),
          matches_played: Math.max(0, team.matches_played - 1),
          matches_won: Math.max(0, team.matches_won - 1),
        };
      }
      if (isLoserTeam) {
        return {
          ...team,
          matches_played: Math.max(0, team.matches_played - 1),
          matches_lost: Math.max(0, team.matches_lost - 1),
        };
      }
      return team;
    });

    const revertedMatch: Match = {
      ...match,
      status: 'pending',
      approved_by: undefined,
      approved_at: undefined,
      points_awarded: false,
      notes: (match.notes ? match.notes + ' | ' : '') + `Approval reverted by Admin on ${new Date().toLocaleDateString()}`,
    };

    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = revertedMatch;

    saveLocalState(revertedPlayers, revertedTeams, updatedMatches);
    return { success: true };
  };

  const getPlayerById = (id: string): Player | undefined => {
    return players.find((p) => p.id === id);
  };

  const getTeamById = (id: string): Team | undefined => {
    return teams.find((t) => t.id === id);
  };

  const getMatchesForPlayer = (playerId: string): Match[] => {
    return matches.filter(
      (m) =>
        m.team_a_player1_id === playerId ||
        m.team_a_player2_id === playerId ||
        m.team_b_player1_id === playerId ||
        m.team_b_player2_id === playerId
    );
  };

  // Optional Demo Tournament Data Loader for realistic testing
  const loadSampleTournamentData = () => {
    const samplePlayers: Player[] = [
      {
        id: 'ply-suez-01',
        name: 'Ziad "El-Canal" Mansour',
        nickname: 'The Canal Sniper',
        phone: '01012345671',
        partner_name: 'Ahmed "Matrix" Reda',
        partner_phone: '01012345672',
        district: 'Port Tawfiq',
        position: 'Attacker',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        individual_points: 9,
        matches_played: 3,
        matches_won: 3,
        matches_lost: 0,
        sets_won: 6,
        sets_lost: 1,
        form: ['W', 'W', 'W'],
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'ply-suez-02',
        name: 'Ahmed "Matrix" Reda',
        nickname: 'Wall of Faisal',
        phone: '01012345672',
        partner_name: 'Ziad "El-Canal" Mansour',
        partner_phone: '01012345671',
        district: 'Faisal',
        position: 'Defender',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        individual_points: 9,
        matches_played: 3,
        matches_won: 3,
        matches_lost: 0,
        sets_won: 6,
        sets_lost: 1,
        form: ['W', 'W', 'W'],
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'ply-suez-03',
        name: 'Omar "Tornado" Hamdy',
        nickname: 'Arbaeen Bullet',
        district: 'Al Arbaeen',
        position: 'All-Rounder',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        individual_points: 6,
        matches_played: 3,
        matches_won: 2,
        matches_lost: 1,
        sets_won: 5,
        sets_lost: 3,
        form: ['W', 'L', 'W'],
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'ply-suez-04',
        name: 'Mostafa "Falcon" Ezzat',
        nickname: 'Aerial Falcon',
        district: 'Al Arbaeen',
        position: 'Attacker',
        avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
        individual_points: 6,
        matches_played: 3,
        matches_won: 2,
        matches_lost: 1,
        sets_won: 5,
        sets_lost: 3,
        form: ['W', 'L', 'W'],
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'ply-suez-05',
        name: 'Karim "El-Gedid" Bayoumi',
        nickname: 'Attaka Rock',
        district: 'Attaka',
        position: 'Defender',
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        individual_points: 3,
        matches_played: 2,
        matches_won: 1,
        matches_lost: 1,
        sets_won: 2,
        sets_lost: 2,
        form: ['L', 'W'],
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'ply-suez-06',
        name: 'Youssef "Ace" Shalaby',
        nickname: 'Spin Master',
        district: 'Suez Center',
        position: 'Attacker',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        individual_points: 3,
        matches_played: 2,
        matches_won: 1,
        matches_lost: 1,
        sets_won: 2,
        sets_lost: 2,
        form: ['L', 'W'],
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'ply-suez-07',
        name: 'Tamer "El-Captain" Shawky',
        nickname: 'Ganayen General',
        district: 'Al Ganayen',
        position: 'All-Rounder',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        individual_points: 0,
        matches_played: 2,
        matches_won: 0,
        matches_lost: 2,
        sets_won: 1,
        sets_lost: 4,
        form: ['L', 'L'],
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'ply-suez-08',
        name: 'Hassan "Iron" Bakr',
        nickname: 'Suez Shield',
        district: 'Suez Center',
        position: 'Defender',
        avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        individual_points: 0,
        matches_played: 2,
        matches_won: 0,
        matches_lost: 2,
        sets_won: 1,
        sets_lost: 4,
        form: ['L', 'L'],
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    const sampleTeams: Team[] = [
      {
        id: 'team-suez-01',
        name: 'Red Sea Titans (Mansour / Reda)',
        player1_id: 'ply-suez-01',
        player2_id: 'ply-suez-02',
        team_points: 9,
        matches_played: 3,
        matches_won: 3,
        matches_lost: 0,
        sets_won: 6,
        sets_lost: 1,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'team-suez-02',
        name: 'Arbaeen Storm (Hamdy / Ezzat)',
        player1_id: 'ply-suez-03',
        player2_id: 'ply-suez-04',
        team_points: 6,
        matches_played: 3,
        matches_won: 2,
        matches_lost: 1,
        sets_won: 5,
        sets_lost: 3,
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'team-suez-03',
        name: 'Attaka Express (Bayoumi / Shalaby)',
        player1_id: 'ply-suez-05',
        player2_id: 'ply-suez-06',
        team_points: 3,
        matches_played: 2,
        matches_won: 1,
        matches_lost: 1,
        sets_won: 2,
        sets_lost: 2,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'team-suez-04',
        name: 'Ganayen Falcons (Shawky / Bakr)',
        player1_id: 'ply-suez-07',
        player2_id: 'ply-suez-08',
        team_points: 0,
        matches_played: 2,
        matches_won: 0,
        matches_lost: 2,
        sets_won: 1,
        sets_lost: 4,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    const sampleMatches: Match[] = [
      {
        id: 'm-sample-01',
        match_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        court_location: 'Padstation Suez',
        team_a_player1_id: 'ply-suez-01',
        team_a_player2_id: 'ply-suez-02',
        team_a_name: 'Red Sea Titans',
        team_b_player1_id: 'ply-suez-03',
        team_b_player2_id: 'ply-suez-04',
        team_b_name: 'Arbaeen Storm',
        sets: [
          { team_a: 6, team_b: 4 },
          { team_a: 4, team_b: 6 },
          { team_a: 7, team_b: 5 },
        ],
        winner_team: 'team_a',
        status: 'approved',
        submitted_by: 'user-sample',
        submitted_by_name: 'Ziad Mansour',
        submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        approved_by: 'admin-psl-suez-01',
        approved_at: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
        notes: 'Spectacular 3-set championship rematch at Padstation Suez.',
        points_awarded: true,
      },
      {
        id: 'm-sample-02',
        match_date: new Date(Date.now() - 86400000 * 3).toISOString(),
        court_location: 'Padstation Suez',
        team_a_player1_id: 'ply-suez-05',
        team_a_player2_id: 'ply-suez-06',
        team_a_name: 'Attaka Express',
        team_b_player1_id: 'ply-suez-07',
        team_b_player2_id: 'ply-suez-08',
        team_b_name: 'Ganayen Falcons',
        sets: [
          { team_a: 6, team_b: 2 },
          { team_a: 6, team_b: 3 },
        ],
        winner_team: 'team_a',
        status: 'approved',
        submitted_by: 'user-sample-2',
        submitted_by_name: 'Karim Bayoumi',
        submitted_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        approved_by: 'admin-psl-suez-01',
        approved_at: new Date(Date.now() - 86400000 * 3 + 1800000).toISOString(),
        notes: 'Dominant service performance by Bayoumi & Shalaby at Padstation Suez.',
        points_awarded: true,
      },
      {
        id: 'm-sample-03',
        match_date: new Date(Date.now() - 3600000 * 4).toISOString(),
        court_location: 'Padstation Suez',
        team_a_player1_id: 'ply-suez-03',
        team_a_player2_id: 'ply-suez-04',
        team_a_name: 'Arbaeen Storm',
        team_b_player1_id: 'ply-suez-05',
        team_b_player2_id: 'ply-suez-06',
        team_b_name: 'Attaka Express',
        sets: [
          { team_a: 6, team_b: 3 },
          { team_a: 6, team_b: 4 },
        ],
        winner_team: 'team_a',
        status: 'pending', // PENDING MATCH READY FOR ADMIN APPROVAL DEMO!
        submitted_by: 'user-sample-3',
        submitted_by_name: 'Omar Hamdy',
        submitted_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        notes: 'Submitted for League verification at Padstation Suez.',
        points_awarded: false,
      },
    ];

    saveLocalState(samplePlayers, sampleTeams, sampleMatches);
  };

  // Reset to 0 points completely
  const resetAllDataToZero = () => {
    saveLocalState([], [], []);
  };

  return (
    <DataContext.Provider
      value={{
        players,
        teams,
        matches,
        loading,
        addPlayer,
        submitMatch,
        approveMatch,
        rejectMatch,
        revertMatchApproval,
        getPlayerById,
        getTeamById,
        getMatchesForPlayer,
        loadSampleTournamentData,
        resetAllDataToZero,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
