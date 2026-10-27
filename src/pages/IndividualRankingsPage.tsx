import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { District, SUEZ_DISTRICTS, PlayerPosition } from '../types';
import { 
  Trophy, 
  Search, 
  Filter, 
  MapPin, 
  ArrowUpDown, 
  ChevronRight, 
  UserPlus, 
  Users,
  Sparkles
} from 'lucide-react';
import { DistrictBadge, PositionBadge, RankBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface IndividualRankingsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const IndividualRankingsPage: React.FC<IndividualRankingsPageProps> = ({ onNavigate }) => {
  const { players, loadSampleTournamentData } = useData();
  const { t, language, isRtl, translateDistrict, translatePosition } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'points' | 'winRate' | 'matches' | 'wins'>('points');

  // Filter & sort players
  const filteredRankings = useMemo(() => {
    return players
      .filter((player) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          player.name.toLowerCase().includes(query) ||
          (player.nickname && player.nickname.toLowerCase().includes(query)) ||
          (player.partner_name && player.partner_name.toLowerCase().includes(query));

        const matchesDistrict =
          selectedDistrict === 'ALL' || player.district === selectedDistrict;

        const matchesPosition =
          selectedPosition === 'ALL' || player.position === selectedPosition;

        return matchesSearch && matchesDistrict && matchesPosition;
      })
      .sort((a, b) => {
        if (sortBy === 'points') {
          if (b.individual_points !== a.individual_points) {
            return b.individual_points - a.individual_points;
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
        if (sortBy === 'wins') {
          return b.matches_won - a.matches_won;
        }
        return 0;
      });
  }, [players, searchQuery, selectedDistrict, selectedPosition, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-purple-900/30">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>{t('home.championshipStandings')}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            {t('rankings.individualTitle')}
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm mt-1 max-w-xl">
            {t('rankings.individualSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('auth', { mode: 'signup' })}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl psl-purple-red-btn text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('rankings.registerPlayer')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c091d] border border-purple-800/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search query */}
          <div className="relative">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-purple-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={t('rankings.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 bg-[#140e2b] border border-purple-800/40 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-2 bg-[#140e2b] border border-purple-800/40 rounded-xl px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 w-full focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#140e2b]">{t('rankings.allDistricts')}</option>
              {SUEZ_DISTRICTS.map((d) => (
                <option key={d} value={d} className="bg-[#140e2b]">
                  {translateDistrict(d)}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-2 bg-[#140e2b] border border-purple-800/40 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 w-full focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#140e2b]">{t('rankings.allPositions')}</option>
              <option value="Attacker" className="bg-[#140e2b]">{translatePosition('Attacker')}</option>
              <option value="Defender" className="bg-[#140e2b]">{translatePosition('Defender')}</option>
              <option value="All-Rounder" className="bg-[#140e2b]">{translatePosition('All-Rounder')}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-[#140e2b] border border-purple-800/40 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-zinc-200 w-full focus:outline-none cursor-pointer"
            >
              <option value="points" className="bg-[#140e2b]">{t('rankings.sortByPoints')}</option>
              <option value="winRate" className="bg-[#140e2b]">{t('rankings.sortByWinRate')}</option>
              <option value="wins" className="bg-[#140e2b]">{t('rankings.sortByWins')}</option>
              <option value="matches" className="bg-[#140e2b]">{t('rankings.sortByMatches')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {filteredRankings.length === 0 ? (
        <EmptyState
          title={language === 'ar' ? 'لم يتم العثور على لاعبين' : 'No Players Found'}
          description={
            players.length === 0
              ? language === 'ar'
                ? 'يبدأ جدول تصنيف السويس من رصيد صفر نقطة. سجل حسابك الآن أو حمل بيانات بطولة السويس الاستعراضية للبدء.'
                : 'The PSL Suez leaderboard starts completely clean with 0 points. Add real players or load official Suez exhibition data to get started.'
              : language === 'ar'
                ? 'لا يوجد لاعب مطابق لخيارات البحث أو التصفية الحالية.'
                : 'No players match your active search or district filters.'
          }
          actionText={players.length === 0 ? t('rankings.registerPlayer') : language === 'ar' ? 'إلغاء التصفية' : 'Clear Filters'}
          onAction={() => {
            if (players.length === 0) {
              onNavigate('auth', { mode: 'signup' });
            } else {
              setSearchQuery('');
              setSelectedDistrict('ALL');
              setSelectedPosition('ALL');
            }
          }}
          secondaryActionText={players.length === 0 ? t('home.loadSample') : undefined}
          onSecondaryAction={players.length === 0 ? loadSampleTournamentData : undefined}
        />
      ) : (
        <div className="rounded-3xl border border-purple-900/30 bg-[#0c091d] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-900/30 bg-[#140f29]/80 text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  <th className="py-3.5 px-4 text-center w-14">{t('rankings.rank')}</th>
                  <th className="py-3.5 px-4">{t('rankings.player')}</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">{t('rankings.district')}</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">{t('rankings.role')}</th>
                  <th className="py-3.5 px-3 text-center">{t('rankings.mp')}</th>
                  <th className="py-3.5 px-3 text-center">{t('rankings.w')}</th>
                  <th className="py-3.5 px-3 text-center">{t('rankings.l')}</th>
                  <th className="py-3.5 px-4 text-center">{t('rankings.winRate')}</th>
                  <th className="py-3.5 px-4 text-center hidden sm:table-cell">{t('rankings.form')}</th>
                  <th className="py-3.5 px-5 text-right font-black text-rose-400">{t('rankings.pts')}</th>
                  <th className="py-3.5 px-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/40 text-xs">
                {filteredRankings.map((player, index) => {
                  const rank = index + 1;
                  const winRate =
                    player.matches_played > 0
                      ? Math.round((player.matches_won / player.matches_played) * 100)
                      : 0;

                  return (
                    <tr
                      key={player.id}
                      onClick={() => onNavigate('profile', { playerId: player.id })}
                      className="hover:bg-[#150f30]/60 transition-colors cursor-pointer group"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center font-bold">
                        <div className="flex justify-center">
                          <RankBadge rank={rank} />
                        </div>
                      </td>

                      {/* Player info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`}
                            alt={player.name}
                            className="w-10 h-10 rounded-xl object-cover border border-purple-800/60 group-hover:border-sky-400 transition-colors"
                          />
                          <div>
                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors text-sm">
                              {player.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {player.nickname && (
                                <span className="text-[11px] text-rose-300 font-medium">
                                  "{player.nickname}"
                                </span>
                              )}
                              {player.partner_name && (
                                <span className="text-[10px] text-sky-300 bg-sky-950/60 border border-sky-800/40 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5 shrink-0" />
                                  <span>{t('rankings.partner')}: {player.partner_name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* District */}
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <DistrictBadge district={player.district} />
                      </td>

                      {/* Role/Position */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <PositionBadge position={player.position} />
                      </td>

                      {/* Matches Played */}
                      <td className="py-4 px-3 text-center font-mono-num font-semibold text-zinc-300">
                        {player.matches_played}
                      </td>

                      {/* Wins */}
                      <td className="py-4 px-3 text-center font-mono-num font-semibold text-emerald-400">
                        {player.matches_won}
                      </td>

                      {/* Losses */}
                      <td className="py-4 px-3 text-center font-mono-num font-semibold text-zinc-500">
                        {player.matches_lost}
                      </td>

                      {/* Win Rate */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono-num font-bold text-sky-400">
                          {winRate}%
                        </span>
                      </td>

                      {/* Recent Form */}
                      <td className="py-4 px-4 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {player.form.length === 0 ? (
                            <span className="text-zinc-600 text-[10px]">—</span>
                          ) : (
                            player.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono-num ${
                                  res === 'W'
                                    ? 'bg-purple-900 border border-purple-400 text-purple-200'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {res}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-5 text-right">
                        <span className="font-display text-2xl font-black text-rose-400 tracking-wide">
                          {player.individual_points}
                        </span>
                      </td>

                      {/* Action Chevron */}
                      <td className="py-4 px-3 text-center">
                        <ChevronRight className={`w-4 h-4 text-zinc-600 group-hover:text-sky-400 transition-all ${isRtl ? 'rotate-180' : ''}`} />
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
