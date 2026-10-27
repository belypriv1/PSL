import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ArrowLeft, 
  Trophy, 
  Award, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Flame, 
  Users, 
  Phone,
  AlertCircle 
} from 'lucide-react';
import { DistrictBadge, PositionBadge, MatchStatusBadge, RankBadge } from '../components/common/Badge';

interface PlayerProfilePageProps {
  playerId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({ playerId, onNavigate }) => {
  const { players, teams, matches, getPlayerById } = useData();
  const { t, language, isRtl } = useLanguage();
  const player = getPlayerById(playerId);

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-[#0c091d] border border-purple-900/40 rounded-3xl">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="font-display text-3xl font-bold text-white mb-2">
            {language === 'ar' ? 'الملف الشخصي غير موجود' : 'Player Profile Not Found'}
          </h2>
          <p className="text-zinc-400 text-xs mb-6">
            {language === 'ar' ? 'معرف اللاعب المطلوب غير موجود في سجلات دوري السويس.' : 'The requested player ID does not exist in the PSL registry.'}
          </p>
          <button
            onClick={() => onNavigate('rankings-individual')}
            className="px-5 py-2.5 rounded-xl psl-purple-red-btn text-white font-bold text-xs uppercase"
          >
            {language === 'ar' ? 'العودة لجدول الترتيب' : 'Return to Leaderboards'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate player rank among all registered players
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.individual_points !== a.individual_points) {
      return b.individual_points - a.individual_points;
    }
    return b.matches_won - a.matches_won;
  });
  const currentRank = sortedPlayers.findIndex((p) => p.id === player.id) + 1;

  // Find all matches featuring this player
  const playerMatches = matches.filter(
    (m) =>
      m.team_a_player1_id === player.id ||
      m.team_a_player2_id === player.id ||
      m.team_b_player1_id === player.id ||
      m.team_b_player2_id === player.id
  );

  // Teams this player belongs to
  const playerTeams = teams.filter(
    (t) => t.player1_id === player.id || t.player2_id === player.id
  );
  const highestTeamPoints = playerTeams.reduce(
    (max, t) => Math.max(max, t.team_points),
    0
  );

  const winRate =
    player.matches_played > 0
      ? Math.round((player.matches_won / player.matches_played) * 100)
      : 0;

  // Simple badges
  const badges = [
    {
      title: language === 'ar' ? 'رائد بادبول السويس' : 'Suez Pioneer',
      desc: language === 'ar' ? 'مسجل في دوري السويس الرسمي' : 'Registered in PSL inaugural circuit',
      unlocked: true,
      icon: Trophy,
    },
    {
      title: language === 'ar' ? 'أول فوز معتمد' : 'First Victory',
      desc: language === 'ar' ? 'حقق +٣ نقاط في مباراة رسمية' : 'Earned +3 PTS in verified match',
      unlocked: player.matches_won >= 1,
      icon: Award,
    },
    {
      title: language === 'ar' ? 'سلسلة انتصارات' : 'Winning Streak',
      desc: language === 'ar' ? 'فاز في ٣ مباريات متتالية' : 'Won 3 consecutive matches',
      unlocked: player.form.slice(0, 3).filter((f) => f === 'W').length === 3,
      icon: Flame,
    },
    {
      title: language === 'ar' ? 'لاعب مخضرم' : 'Veteran Athlete',
      desc: language === 'ar' ? 'خاض ٥ مباريات رسمية فأكثر' : 'Competed in 5+ tournament fixtures',
      unlocked: player.matches_played >= 5,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('rankings-individual')}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span>{language === 'ar' ? 'الرجوع إلى جدول الترتيب' : 'Back to Individual Rankings'}</span>
      </button>

      {/* Profile Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c091d] border border-purple-800/40 relative overflow-hidden psl-purple-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={player.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`}
              alt={player.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-purple-500 shadow-xl"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <RankBadge rank={currentRank} />
                <DistrictBadge district={player.district} />
                <PositionBadge position={player.position} />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
                {player.name}
              </h1>
              {player.nickname && (
                <p className="text-sm font-semibold text-rose-400">"{player.nickname}"</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t('profile.memberSince')} {new Date(player.created_at).toLocaleDateString()}</span>
                </span>
                {player.phone && (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Phone className="w-3 h-3 text-sky-400" />
                    <span className="font-mono-num">{player.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Points Highlight */}
          <div className="p-5 rounded-2xl bg-[#140e2b] border border-purple-700/50 text-center min-w-[190px] shadow-lg">
            <p className="text-[11px] uppercase font-bold text-purple-300 tracking-wider">
              {t('profile.individualPoints')}
            </p>
            <p className="font-display text-6xl font-black text-rose-400 leading-tight">
              {player.individual_points}
            </p>
            <p className="text-[10px] text-sky-400 mt-1 uppercase tracking-wider font-bold">
              {language === 'ar' ? `المركز #${currentRank} في السويس` : `Rank #${currentRank} in Suez`}
            </p>
          </div>
        </div>
      </div>

      {/* Simple, Minimal Doubles Partner Card */}
      {player.partner_name && (
        <div className="p-4 rounded-2xl bg-[#0e0a22] border border-purple-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/40 text-sky-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-purple-300">
                {language === 'ar' ? 'الزميل (الفريق الزوجي)' : 'Doubles Partner'}
              </span>
              <p className="text-sm font-bold text-white mt-0.5">{player.partner_name}</p>
            </div>
          </div>
          {player.partner_phone && (
            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-mono-num bg-sky-950/40 border border-sky-800/40 px-3 py-1.5 rounded-lg">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>{player.partner_phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Key Career Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c091d] border border-purple-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
            {t('profile.matchesPlayed')}
          </span>
          <p className="font-display text-3xl font-black text-white mt-1">
            {player.matches_played}
          </p>
          <p className="text-[11px] text-zinc-400 font-mono-num mt-1">
            {player.matches_won} {t('rankings.w')} • {player.matches_lost} {t('rankings.l')}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c091d] border border-purple-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
            {t('profile.winPercentage')}
          </span>
          <p className="font-display text-3xl font-black text-sky-400 mt-1">
            {winRate}%
          </p>
          <div className="w-full bg-[#140e2b] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c091d] border border-purple-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
            {t('profile.topDoublesPoints')}
          </span>
          <p className="font-display text-3xl font-black text-white mt-1">
            {highestTeamPoints}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">{language === 'ar' ? 'نقاط فرق مستقلة' : 'Separate team points'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c091d] border border-purple-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
            {t('profile.recentForm')}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            {player.form.length === 0 ? (
              <span className="text-zinc-500 text-xs">{language === 'ar' ? 'لا توجد مباريات' : 'No matches'}</span>
            ) : (
              player.form.map((res, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black font-mono-num ${
                    res === 'W'
                      ? 'bg-purple-900/80 border border-purple-400 text-purple-200'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {res}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-rose-400" />
          <span>{t('profile.suezBadges')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b, i) => {
            const IconComponent = b.icon;
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                  b.unlocked
                    ? 'bg-[#0c091d] border-purple-800/40 text-white'
                    : 'bg-[#090714]/40 border-purple-950/20 opacity-40 text-zinc-500'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    b.unlocked
                      ? 'bg-purple-900/40 text-rose-400 border border-purple-500/40'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">{b.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match History */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <span>{t('profile.matchHistory')}</span>
        </h3>

        {playerMatches.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0c091d] border border-purple-900/30 text-zinc-400 text-xs">
            {language === 'ar' ? 'لا توجد مباريات مسجلة لهذا اللاعب حتى الآن.' : 'No match records found for this player yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {playerMatches.map((m) => {
              const inTeamA =
                m.team_a_player1_id === player.id || m.team_a_player2_id === player.id;
              const playerWon =
                (inTeamA && m.winner_team === 'team_a') ||
                (!inTeamA && m.winner_team === 'team_b');

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-[#0c091d] border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <MatchStatusBadge status={m.status} />
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400 font-mono-num">
                        {new Date(m.match_date).toLocaleDateString()}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{m.court_location}</span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span
                        className={`text-sm font-bold ${
                          playerWon && m.status === 'approved' ? 'text-sky-300' : 'text-white'
                        }`}
                      >
                        {m.team_a_name} vs {m.team_b_name}
                      </span>
                      {m.status === 'approved' && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                            playerWon
                              ? 'bg-gradient-to-r from-purple-600 to-rose-500 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {playerWon ? `+3 ${t('rankings.pts')}` : `0 ${t('rankings.pts')}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#140e2b] border border-purple-800/40 px-3 py-1.5 rounded-xl font-mono-num font-bold text-xs text-white">
                      <span>{language === 'ar' ? 'النتيجة:' : 'Scores:'}</span>
                      {m.sets.map((s, idx) => (
                        <span key={idx} className="text-zinc-300">
                          {s.team_a}-{s.team_b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
