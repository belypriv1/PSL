import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Trophy, 
  Users, 
  PlusCircle, 
  ShieldCheck, 
  ChevronRight, 
  Award, 
  Flame, 
  MapPin, 
  Sparkles,
  Calendar,
  CheckCircle2,
  RefreshCcw,
  ArrowUpRight
} from 'lucide-react';
import { DistrictBadge, RankBadge, MatchStatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenSupabaseConfig: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSupabaseConfig }) => {
  const { players, teams, matches, loadSampleTournamentData, resetAllDataToZero } = useData();
  const { user, isAdmin } = useAuth();
  const { t, language, isRtl } = useLanguage();

  // Sort players by points descending, then wins descending
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.individual_points !== a.individual_points) {
      return b.individual_points - a.individual_points;
    }
    return b.matches_won - a.matches_won;
  });

  const top3Players = sortedPlayers.slice(0, 3);

  // Sort teams by team_points descending, then wins descending
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.team_points !== a.team_points) {
      return b.team_points - a.team_points;
    }
    return b.matches_won - a.matches_won;
  });

  // Recent approved matches
  const approvedMatches = matches.filter((m) => m.status === 'approved');
  const recentApproved = approvedMatches.slice(0, 4);

  // Statistics
  const totalApprovedMatches = approvedMatches.length;
  const totalPointsAwarded = approvedMatches.length * 6;
  const pendingCount = matches.filter((m) => m.status === 'pending').length;

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 border-b border-purple-900/30">
        {/* Athletic Background Glows: Purple and Light Blue */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-600/15 via-sky-600/10 to-transparent pointer-events-none blur-3xl -z-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Headline and Copy */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-300 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>{t('home.heroBadge')}</span>
              </div>

              <div className="space-y-2">
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none">
                  {t('brand.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-sky-400">{t('brand.league')}</span>
                </h1>
                <p className="font-display text-2xl sm:text-4xl text-sky-300 font-bold tracking-wider">
                  “{t('brand.tagline')}”
                </p>
              </div>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                {t('home.heroDesc')}
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('rankings-individual')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl psl-purple-red-btn text-white font-display text-xl font-bold tracking-wider uppercase shadow-xl shadow-purple-600/30 transition-all hover:-translate-y-0.5"
                >
                  <Trophy className="w-5 h-5" />
                  <span>{t('home.viewLeaderboards')}</span>
                </button>

                <button
                  onClick={() => onNavigate('submit-match')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#140f29] hover:bg-[#1f173d] text-white border border-sky-400/50 font-display text-xl font-bold tracking-wider uppercase transition-all shadow-md shadow-sky-500/10 hover:border-sky-300"
                >
                  <PlusCircle className="w-5 h-5 text-sky-400" />
                  <span>{t('home.submitMatch')}</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#0e0a20] hover:bg-[#181136] text-purple-300 border border-purple-500/50 font-display text-xl font-bold tracking-wider uppercase transition-all"
                  >
                    <ShieldCheck className="w-5 h-5 text-rose-400" />
                    <span>{t('home.adminHub')} ({pendingCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Glowing Logo Emblem Card */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-rose-500 to-sky-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition duration-500" />
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-[#090714] border-2 border-purple-500/60 p-3 overflow-hidden shadow-2xl psl-multi-glow flex items-center justify-center">
                  <img
                    src="/psl-logo.png"
                    alt="Official Pad Station League Emblem"
                    className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test & Demo Controls Bar */}
          <div className="mt-10 p-4 rounded-2xl bg-[#0d0a1f]/90 border border-purple-800/40 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{t('home.demoControlsTitle')}</p>
                <p className="text-[11px] text-zinc-400">
                  {t('home.demoControlsDesc')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadSampleTournamentData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181238] hover:bg-[#231a50] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>{t('home.loadSample')}</span>
              </button>

              <button
                onClick={resetAllDataToZero}
                className="px-3 py-1.5 rounded-lg bg-[#181238] hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-purple-900/50 text-xs font-semibold transition-colors"
              >
                {t('home.resetZero')}
              </button>

              <button
                onClick={onOpenSupabaseConfig}
                className="px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-500/40 text-xs font-bold transition-colors"
              >
                {t('home.supabaseGuide')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* League Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl psl-card-gradient border border-purple-800/30">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('home.statAthletes')}</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="font-display text-4xl font-black text-white">{players.length}</p>
            <p className="text-[11px] text-sky-400 mt-1">{t('home.statAthletesSub')}</p>
          </div>

          <div className="p-5 rounded-2xl psl-card-gradient border border-purple-800/30">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('home.statTeams')}</span>
              <Trophy className="w-4 h-4 text-sky-400" />
            </div>
            <p className="font-display text-4xl font-black text-white">{teams.length}</p>
            <p className="text-[11px] text-purple-300 mt-1">{t('home.statTeamsSub')}</p>
          </div>

          <div className="p-5 rounded-2xl psl-card-gradient border border-purple-800/30">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('home.statVerified')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-display text-4xl font-black text-white">{totalApprovedMatches}</p>
            <p className="text-[11px] text-rose-300 mt-1">{pendingCount} {t('home.statVerifiedSub')}</p>
          </div>

          <div className="p-5 rounded-2xl psl-card-gradient border border-purple-800/30">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('home.statPoints')}</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <p className="font-display text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400">
              {totalPointsAwarded} <span className="text-sm font-sans text-zinc-300 font-bold">{t('rankings.pts')}</span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">{t('home.statPointsSub')}</p>
          </div>
        </div>
      </section>

      {/* Top Players Spotlight (Podium) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              <span>{t('home.championshipStandings')}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide text-white">
              {t('home.topPlayers')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('rankings-individual')}
            className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 group"
          >
            <span>{t('home.fullIndividual')}</span>
            <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {sortedPlayers.length === 0 ? (
          <EmptyState
            title={language === 'ar' ? 'لا يوجد لاعبون مسجلون بعد' : 'No Players Registered Yet'}
            description={
              language === 'ar'
                ? 'يبدأ جدول ترتيب بادبول السويس من رصيد صفر نقطة. سجل حسابك كلاعب أو قم بتحميل بطولة السويس التجريبية للبدء.'
                : 'The Suez Padbol ranking leaderboard starts at 0 points. Add your player profile or load exhibition tournament sample data to begin.'
            }
            actionText={language === 'ar' ? 'تسجيل لاعب جديد' : 'Register Player'}
            onAction={() => onNavigate('auth', { mode: 'signup' })}
            secondaryActionText={t('home.loadSample')}
            onSecondaryAction={loadSampleTournamentData}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {top3Players.map((player, idx) => {
              const rank = idx + 1;
              const winRate =
                player.matches_played > 0
                  ? Math.round((player.matches_won / player.matches_played) * 100)
                  : 0;

              return (
                <div
                  key={player.id}
                  onClick={() => onNavigate('profile', { playerId: player.id })}
                  className={`relative p-6 rounded-3xl bg-[#0d091e] border transition-all cursor-pointer group hover:-translate-y-1 ${
                    rank === 1
                      ? 'border-purple-500/70 psl-purple-glow'
                      : 'border-purple-900/40 hover:border-sky-400/50'
                  }`}
                >
                  {/* Rank Header */}
                  <div className="flex items-center justify-between mb-4">
                    <RankBadge rank={rank} />
                    <DistrictBadge district={player.district} />
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src={player.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`}
                      alt={player.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 group-hover:border-sky-400 transition-colors"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                        {player.name}
                      </h3>
                      {player.nickname && (
                        <p className="text-xs text-rose-400 font-semibold">"{player.nickname}"</p>
                      )}
                      {player.partner_name && (
                        <p className="text-[11px] text-sky-400 flex items-center gap-1 font-medium mt-0.5">
                          <Users className="w-3 h-3 shrink-0" />
                          <span>{t('rankings.partner')}: {player.partner_name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Points & Stats */}
                  <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#140e2b] border border-purple-800/30 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">{t('rankings.pts')}</p>
                      <p className="font-display text-3xl font-black text-rose-400">
                        {player.individual_points}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">{t('rankings.mp')}</p>
                      <p className="font-mono-num text-sm font-bold text-white pt-1">
                        {player.matches_won}{t('rankings.w')} - {player.matches_lost}{t('rankings.l')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">{t('rankings.winRate')}</p>
                      <p className="font-mono-num text-sm font-bold text-sky-400 pt-1">
                        {winRate}%
                      </p>
                    </div>
                  </div>

                  {/* View profile CTA */}
                  <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs text-zinc-400 group-hover:text-purple-200 transition-colors">
                    <span>{t('home.viewCareer')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Approved Matches Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('home.officialResults')}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide text-white">
              {t('home.recentApproved')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('submit-match')}
            className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300"
          >
            <span>{t('home.submitMatch')}</span>
            <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {recentApproved.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0d091e] border border-purple-900/40">
            <p className="text-zinc-300 text-sm">
              {language === 'ar' ? 'لم يتم تسجيل مباريات معتمدة حتى الآن.' : 'No approved matches recorded yet.'}
            </p>
            <p className="text-zinc-400 text-xs mt-1">
              {language === 'ar'
                ? 'يتم إرسال المباريات أولاً لتراجعها إدارة الدوري وتمنح النقاط رسمياً.'
                : 'Matches must be submitted and approved by an administrator before appearing here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentApproved.map((match) => {
              const isTeamAWinner = match.winner_team === 'team_a';
              return (
                <div
                  key={match.id}
                  className="p-5 rounded-2xl bg-[#0c091d] border border-purple-900/30 hover:border-purple-600/50 transition-colors space-y-4"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-purple-900/30 pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span className="truncate max-w-[200px] text-zinc-300">{match.court_location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-[11px] text-zinc-400">
                        {new Date(match.match_date).toLocaleDateString()}
                      </span>
                      <MatchStatusBadge status={match.status} />
                    </div>
                  </div>

                  {/* Team A vs Team B */}
                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        isTeamAWinner
                          ? 'bg-purple-950/40 border-purple-500/50 text-white font-bold'
                          : 'bg-[#140e2b]/50 border-purple-900/20 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isTeamAWinner && (
                          <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                        )}
                        <span className="text-sm truncate max-w-[220px]">{match.team_a_name}</span>
                        {isTeamAWinner && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gradient-to-r from-purple-600 to-rose-500 text-white uppercase font-black">
                            +3 {t('rankings.pts')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono-num font-bold text-sm">
                        {match.sets.map((set, i) => (
                          <span
                            key={i}
                            className={set.team_a > set.team_b ? 'text-rose-400 font-extrabold' : 'text-zinc-500'}
                          >
                            {set.team_a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        !isTeamAWinner
                          ? 'bg-purple-950/40 border-purple-500/50 text-white font-bold'
                          : 'bg-[#140e2b]/50 border-purple-900/20 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {!isTeamAWinner && (
                          <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                        )}
                        <span className="text-sm truncate max-w-[220px]">{match.team_b_name}</span>
                        {!isTeamAWinner && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gradient-to-r from-purple-600 to-rose-500 text-white uppercase font-black">
                            +3 {t('rankings.pts')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono-num font-bold text-sm">
                        {match.sets.map((set, i) => (
                          <span
                            key={i}
                            className={set.team_b > set.team_a ? 'text-rose-400 font-extrabold' : 'text-zinc-500'}
                          >
                            {set.team_b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {match.notes && (
                    <p className="text-[11px] text-zinc-400 italic truncate">
                      {match.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Constitution Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-[#0c091d] border border-purple-800/40 psl-grid-bg relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>{t('home.suezConstitution')}</span>
            </div>
            <h3 className="font-display text-3xl font-black uppercase text-white tracking-wide">
              {t('home.rankingEngineTitle')}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {language === 'ar'
                ? 'لضمان أعلى معايير العدالة والتنافسية بين لاعبي السويس، يعتمد دوري بادستيشن نظاماً رياضياً إلكترونياً صارماً وموثقاً:'
                : 'To guarantee total fairness across all clubs and tournaments in Suez, Padstation League enforces mathematically strict, tamper-proof ranking logic:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#140f29] border border-purple-800/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">{t('home.ruleZero')}</strong>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{t('home.ruleZeroDesc')}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#140f29] border border-purple-800/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">{t('home.ruleThree')}</strong>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{t('home.ruleThreeDesc')}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#140f29] border border-purple-800/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">{t('home.ruleSeparate')}</strong>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{t('home.ruleSeparateDesc')}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#140f29] border border-purple-800/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">{t('home.ruleAdmin')}</strong>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{t('home.ruleAdminDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
