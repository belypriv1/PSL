import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, Search, ArrowUpDown, Shield } from 'lucide-react';
import { RankBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface TeamRankingsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const TeamRankingsPage: React.FC<TeamRankingsPageProps> = ({ onNavigate }) => {
  const { teams, players, loadSampleTournamentData } = useData();
  const { t, language, isRtl } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'winRate' | 'matches'>('points');

  // Filter & sort teams
  const filteredTeams = useMemo(() => {
    return teams
      .filter((team) => {
        const p1 = players.find((p) => p.id === team.player1_id);
        const p2 = players.find((p) => p.id === team.player2_id);
        const query = searchQuery.toLowerCase();

        return (
          team.name.toLowerCase().includes(query) ||
          (p1 && p1.name.toLowerCase().includes(query)) ||
          (p2 && p2.name.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'points') {
          if (b.team_points !== a.team_points) {
            return b.team_points - a.team_points;
          }
          return b.matches_won - a.matches_won;
        }
        if (sortBy === 'winRate') {
          const rateA = a.matches_played > 0 ? a.matches_won / a.matches_played : 0;
          const rateB = b.matches_played > 0 ? b.matches_won / b.matches_played : 0;
          return rateB - rateA;
        }
        if (sortBy === 'matches') {
          return b.matches_played - a.matches_played;
        }
        return 0;
      });
  }, [teams, players, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-purple-900/30">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{t('brand.suezCircuit')}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            {t('rankings.teamTitle')}
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm mt-1 max-w-xl">
            {t('rankings.teamSubtitle')}
          </p>
        </div>

        <button
          onClick={() => onNavigate('submit-match')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl psl-purple-red-btn text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/30"
        >
          <span>{t('nav.submitMatch')}</span>
        </button>
      </div>

      {/* Point Separation Banner */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-center gap-3 text-xs text-zinc-300">
        <Shield className="w-5 h-5 text-sky-400 shrink-0" />
        <div>
          <strong className="text-white">{t('home.ruleSeparate')}</strong>{' '}
          {language === 'ar'
            ? 'نقاط الفرق الزوجية تعكس نتائج وتناغم هذا الثنائي المحدد. لا تختلط إطلاقاً برصيد اللاعب الفردي.'
            : 'Team rankings reflect the synergy of specific 2-player partnerships. Individual player points do not alter this table.'}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c091d] border border-purple-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-purple-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={t('rankings.searchTeamPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2 bg-[#140e2b] border border-purple-800/40 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-[#140e2b] border border-purple-800/40 rounded-xl px-3 py-1.5 w-full sm:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-zinc-200 w-full focus:outline-none cursor-pointer"
            >
              <option value="points" className="bg-[#140e2b]">{language === 'ar' ? 'ترتيب حسب: نقاط الفرق الزوجية' : 'Sort by: Team Points'}</option>
              <option value="winRate" className="bg-[#140e2b]">{t('rankings.sortByWinRate')}</option>
              <option value="matches" className="bg-[#140e2b]">{t('rankings.sortByMatches')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          title={language === 'ar' ? 'لا توجد فرق زوجية مسجلة بعد' : 'No Doubles Teams Recorded Yet'}
          description={
            teams.length === 0
              ? language === 'ar'
                ? 'يتم رصد الفرق الزوجية تلقائياً فور اعتماد المباريات التي يشارك فيها أي ثنائي، وتبدأ من رصيد صفر نقطة.'
                : 'Doubles teams are automatically tracked when 2-player partnerships complete verified matches, starting at 0 team points.'
              : language === 'ar'
                ? 'لا يوجد فريق يطابق كلمة البحث الحالية.'
                : 'No doubles teams match your active search filter.'
          }
          actionText={teams.length === 0 ? t('nav.submitMatch') : language === 'ar' ? 'مسح البحث' : 'Clear Search'}
          onAction={() => {
            if (teams.length === 0) {
              onNavigate('submit-match');
            } else {
              setSearchQuery('');
            }
          }}
          secondaryActionText={teams.length === 0 ? t('home.loadSample') : undefined}
          onSecondaryAction={teams.length === 0 ? loadSampleTournamentData : undefined}
        />
      ) : (
        <div className="rounded-3xl border border-purple-900/30 bg-[#0c091d] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-900/30 bg-[#140f29]/80 text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  <th className="py-3.5 px-4 text-center w-14">{t('rankings.rank')}</th>
                  <th className="py-3.5 px-4">{t('rankings.doublesTeam')}</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">{t('rankings.partners')}</th>
                  <th className="py-3.5 px-3 text-center">{t('rankings.mp')}</th>
                  <th className="py-3.5 px-3 text-center">{t('rankings.w')}</th>
                  <th className="py-3.5 px-3 text-center">{t('rankings.l')}</th>
                  <th className="py-3.5 px-4 text-center">{t('rankings.winRate')}</th>
                  <th className="py-3.5 px-5 text-right font-black text-sky-400">{t('rankings.teamPts')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/40 text-xs">
                {filteredTeams.map((team, index) => {
                  const rank = index + 1;
                  const p1 = players.find((p) => p.id === team.player1_id);
                  const p2 = players.find((p) => p.id === team.player2_id);
                  const winRate =
                    team.matches_played > 0
                      ? Math.round((team.matches_won / team.matches_played) * 100)
                      : 0;

                  return (
                    <tr
                      key={team.id}
                      className="hover:bg-[#150f30]/50 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center font-bold">
                        <div className="flex justify-center">
                          <RankBadge rank={rank} />
                        </div>
                      </td>

                      {/* Team Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">
                          {team.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 md:hidden mt-0.5">
                          {p1?.name} & {p2?.name}
                        </div>
                      </td>

                      {/* Partners */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => p1 && onNavigate('profile', { playerId: p1.id })}
                            className="text-zinc-300 hover:text-purple-300 transition-colors underline font-medium"
                          >
                            {p1?.name || 'Player 1'}
                          </button>
                          <span className="text-zinc-600">&</span>
                          <button
                            onClick={() => p2 && onNavigate('profile', { playerId: p2.id })}
                            className="text-zinc-300 hover:text-purple-300 transition-colors underline font-medium"
                          >
                            {p2?.name || 'Player 2'}
                          </button>
                        </div>
                      </td>

                      {/* Matches Played */}
                      <td className="py-4 px-3 text-center font-mono-num font-semibold text-zinc-300">
                        {team.matches_played}
                      </td>

                      {/* Wins */}
                      <td className="py-4 px-3 text-center font-mono-num font-semibold text-emerald-400">
                        {team.matches_won}
                      </td>

                      {/* Losses */}
                      <td className="py-4 px-3 text-center font-mono-num font-semibold text-zinc-500">
                        {team.matches_lost}
                      </td>

                      {/* Win Rate */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono-num font-bold text-sky-400">
                          {winRate}%
                        </span>
                      </td>

                      {/* Team Points */}
                      <td className="py-4 px-5 text-right">
                        <span className="font-display text-2xl font-black text-sky-400 tracking-wide">
                          {team.team_points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
