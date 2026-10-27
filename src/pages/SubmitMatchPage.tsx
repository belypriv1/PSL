import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SUEZ_COURTS, SetScore } from '../types';
import { 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  MapPin, 
  Users, 
  ArrowRight,
  UserPlus
} from 'lucide-react';

interface SubmitMatchPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const SubmitMatchPage: React.FC<SubmitMatchPageProps> = ({ onNavigate }) => {
  const { players, submitMatch, loadSampleTournamentData } = useData();
  const { user } = useAuth();
  const { t, language, isRtl, translateDistrict } = useLanguage();

  const [court, setCourt] = useState(SUEZ_COURTS[0]);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [teamAPlayer1, setTeamAPlayer1] = useState(players[0]?.id || '');
  const [teamAPlayer2, setTeamAPlayer2] = useState(players[1]?.id || '');
  const [teamBPlayer1, setTeamBPlayer1] = useState(players[2]?.id || '');
  const [teamBPlayer2, setTeamBPlayer2] = useState(players[3]?.id || '');

  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');

  // Set scores (Padbol matches are typically best of 3 sets)
  const [set1A, setSet1A] = useState<number>(6);
  const [set1B, setSet1B] = useState<number>(4);
  const [set2A, setSet2A] = useState<number>(6);
  const [set2B, setSet2B] = useState<number>(3);
  const [includeSet3, setIncludeSet3] = useState<boolean>(false);
  const [set3A, setSet3A] = useState<number>(6);
  const [set3B, setSet3B] = useState<number>(4);

  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedMatchId, setSubmittedMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate winner preview
  const sets: SetScore[] = [
    { team_a: Number(set1A), team_b: Number(set1B) },
    { team_a: Number(set2A), team_b: Number(set2B) },
  ];
  if (includeSet3) {
    sets.push({ team_a: Number(set3A), team_b: Number(set3B) });
  }

  let setsWonA = 0;
  let setsWonB = 0;
  for (const s of sets) {
    if (s.team_a > s.team_b) setsWonA++;
    else if (s.team_b > s.team_a) setsWonB++;
  }

  const predictedWinner: 'team_a' | 'team_b' | 'tie' =
    setsWonA > setsWonB ? 'team_a' : setsWonB > setsWonA ? 'team_b' : 'tie';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const playerIds = [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2];
    if (new Set(playerIds).size !== 4) {
      setError(
        language === 'ar'
          ? 'يرجى اختيار ٤ لاعبين مختلفين. لا يمكن للاعب أن يلعب في الفريقين معاً.'
          : 'Please select 4 distinct players. A player cannot play on both teams or twice in the same match.'
      );
      return;
    }

    if (predictedWinner === 'tie') {
      setError(
        language === 'ar'
          ? 'مباريات البادبول لا تنتهي بالتعادل. يرجى تعديل نتيجة الأشواط لتحديد الفائز (٢-٠ أو ٢-١).'
          : 'Padbol matches must have a decisive winner (2-0 or 2-1). Please adjust the set scores.'
      );
      return;
    }

    setLoading(true);
    const result = await submitMatch({
      court_location: court,
      match_date: matchDate,
      team_a_player1_id: teamAPlayer1,
      team_a_player2_id: teamAPlayer2,
      team_a_name: teamAName.trim() || undefined,
      team_b_player1_id: teamBPlayer1,
      team_b_player2_id: teamBPlayer2,
      team_b_name: teamBName.trim() || undefined,
      sets,
      notes: notes.trim() || undefined,
      submitted_by: user?.id || 'guest-athlete',
      submitted_by_name: user?.name || 'Suez Padbol Athlete',
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to submit match.');
      return;
    }

    setSubmittedMatchId(result.match?.id || 'done');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-purple-900/30">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
          <PlusCircle className="w-4 h-4" />
          <span>{t('home.heroBadge')}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
          {t('match.submitTitle')}
        </h1>
        <p className="text-zinc-300 text-xs sm:text-sm mt-1">
          {t('match.submitSubtitle')}
        </p>
      </div>

      {/* Success Notification */}
      {submittedMatchId ? (
        <div className="p-8 rounded-3xl bg-[#0c091d] border border-purple-500/60 text-center space-y-5 psl-purple-glow">
          <div className="w-16 h-16 rounded-full bg-purple-950 border border-purple-400 text-sky-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-white uppercase tracking-wide">
              {language === 'ar' ? 'تم تسجيل المباراة بنجاح!' : 'Match Submitted Successfully!'}
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              {language === 'ar'
                ? 'مباراتك مسجلة الآن بقائمة انتظار التحقق الرسمية لدوري السويس. فور اعتمادها من الإدارة:'
                : 'Your match is now logged in the PSL Suez Verification Queue. Once approved by a League Administrator:'}
            </p>
            <div className="inline-block p-3.5 rounded-2xl bg-[#140e2b] border border-purple-800/40 text-xs font-semibold text-zinc-300 text-left space-y-1">
              <p className="text-emerald-400">✓ {language === 'ar' ? 'سيحصل كل لاعب فائز على +٣ نقاط فردية' : 'Winning players will each receive +3 Individual Points'}</p>
              <p className="text-sky-400">✓ {language === 'ar' ? 'سيحصل الفريق الزوجي الفائز على +٣ نقاط فرق' : 'Winning doubles team will receive +3 Team Points'}</p>
              <p className="text-zinc-400">• {language === 'ar' ? 'الفريق الخاسر لا تضاف له نقاط (٠ نقطة)' : 'Losing team & players receive 0 points'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl psl-purple-red-btn text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('admin.dashboardTitle')}</span>
            </button>
            <button
              onClick={() => {
                setSubmittedMatchId(null);
                setNotes('');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#140f29] hover:bg-[#1e173e] text-zinc-300 text-xs font-bold border border-purple-800/50 transition-colors"
            >
              {language === 'ar' ? 'تسجيل مباراة أخرى' : 'Submit Another Match'}
            </button>
          </div>
        </div>
      ) : players.length < 4 ? (
        <div className="p-8 rounded-3xl bg-[#0c091d] border border-purple-900/40 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="font-display text-2xl font-bold text-white">
            {language === 'ar' ? 'يلزم ٤ لاعبين لتسجيل مباراة زوجي' : '4 Players Required for Doubles Match'}
          </h3>
          <p className="text-zinc-400 text-xs max-w-md mx-auto">
            {language === 'ar'
              ? `رياضة البادبول تُلعب ٢ ضد ٢. مسجل حالياً في النظام ${players.length} لاعبين فقط.`
              : `Padbol is played 2 vs 2. Currently, there are only ${players.length} players registered in the PSL database.`}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('auth', { mode: 'signup' })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl psl-purple-red-btn text-white font-bold text-xs uppercase"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('rankings.registerPlayer')}</span>
            </button>
            <button
              onClick={loadSampleTournamentData}
              className="px-4 py-2.5 rounded-xl bg-[#140f29] hover:bg-[#1e173e] text-purple-200 text-xs font-semibold border border-purple-800"
            >
              {t('home.loadSample')}
            </button>
          </div>
        </div>
      ) : (
        /* Match Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Venue & Date */}
          <div className="p-6 rounded-3xl bg-[#0c091d] border border-purple-900/40 space-y-4">
            <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>{t('match.venueTitle')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {language === 'ar' ? 'الملعب والموقع الرسمي' : 'Official Court Location'}
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#140e2b] border border-purple-500/40 text-xs text-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="font-bold text-white tracking-wide">Padstation Suez</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {language === 'ar' ? 'الملعب الرسمي الوحيد' : 'Single Official Court'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">{t('match.matchDate')}</label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140e2b] border border-purple-800/40 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Teams Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <div className="p-6 rounded-3xl bg-[#0c091d] border border-purple-800/50 space-y-4 psl-purple-glow">
              <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
                <span className="font-display text-xl font-bold text-white uppercase">{t('match.teamA')}</span>
                <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded-md border border-purple-600/40">
                  {t('match.teamPair')} ١
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {language === 'ar' ? 'اسم الفريق (اختياري)' : 'Team / Pair Name (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Red Sea Titans"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e2b] border border-purple-800/40 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">{t('match.player1')}</label>
                <select
                  value={teamAPlayer1}
                  onChange={(e) => setTeamAPlayer1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e2b] border border-purple-800/40 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#140e2b]">
                      {p.name} ({translateDistrict(p.district)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">{t('match.player2')}</label>
                <select
                  value={teamAPlayer2}
                  onChange={(e) => setTeamAPlayer2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e2b] border border-purple-800/40 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#140e2b]">
                      {p.name} ({translateDistrict(p.district)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team B */}
            <div className="p-6 rounded-3xl bg-[#0c091d] border border-sky-800/50 space-y-4 psl-blue-glow">
              <div className="flex items-center justify-between pb-2 border-b border-sky-900/30">
                <span className="font-display text-xl font-bold text-white uppercase">{t('match.teamB')}</span>
                <span className="text-[10px] uppercase font-bold text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded-md border border-sky-600/40">
                  {t('match.teamPair')} ٢
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {language === 'ar' ? 'اسم الفريق (اختياري)' : 'Team / Pair Name (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arbaeen Storm"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e2b] border border-sky-800/40 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">{t('match.player1')}</label>
                <select
                  value={teamBPlayer1}
                  onChange={(e) => setTeamBPlayer1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e2b] border border-sky-800/40 text-xs text-white focus:outline-none focus:border-sky-400"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#140e2b]">
                      {p.name} ({translateDistrict(p.district)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">{t('match.player2')}</label>
                <select
                  value={teamBPlayer2}
                  onChange={(e) => setTeamBPlayer2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140e2b] border border-sky-800/40 text-xs text-white focus:outline-none focus:border-sky-400"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#140e2b]">
                      {p.name} ({translateDistrict(p.district)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sets Scorekeeper */}
          <div className="p-6 rounded-3xl bg-[#0c091d] border border-purple-900/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
              <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide">
                {t('match.setsTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setIncludeSet3(!includeSet3)}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 underline"
              >
                {includeSet3 ? t('match.removeSet3') : t('match.addSet3')}
              </button>
            </div>

            <div className="space-y-3">
              {/* Set 1 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#140e2b] border border-purple-800/30">
                <span className="font-bold text-xs text-white uppercase">{t('match.set')} ١</span>
                <div className="flex items-center gap-3 font-mono-num font-bold text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-purple-300">{t('match.teamA')}:</span>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={set1A}
                      onChange={(e) => setSet1A(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-black border border-purple-700/60 rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <span className="text-zinc-600">—</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-sky-300">{t('match.teamB')}:</span>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={set1B}
                      onChange={(e) => setSet1B(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-black border border-sky-700/60 rounded-lg text-center text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Set 2 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#140e2b] border border-purple-800/30">
                <span className="font-bold text-xs text-white uppercase">{t('match.set')} ٢</span>
                <div className="flex items-center gap-3 font-mono-num font-bold text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-purple-300">{t('match.teamA')}:</span>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={set2A}
                      onChange={(e) => setSet2A(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-black border border-purple-700/60 rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <span className="text-zinc-600">—</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-sky-300">{t('match.teamB')}:</span>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={set2B}
                      onChange={(e) => setSet2B(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-black border border-sky-700/60 rounded-lg text-center text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Set 3 */}
              {includeSet3 && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#140e2b] border border-purple-800/30">
                  <span className="font-bold text-xs text-white uppercase">{t('match.setDecider')}</span>
                  <div className="flex items-center gap-3 font-mono-num font-bold text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-purple-300">{t('match.teamA')}:</span>
                      <input
                        type="number"
                        min={0}
                        max={12}
                        value={set3A}
                        onChange={(e) => setSet3A(Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-black border border-purple-700/60 rounded-lg text-center text-white font-bold"
                      />
                    </div>
                    <span className="text-zinc-600">—</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-sky-300">{t('match.teamB')}:</span>
                      <input
                        type="number"
                        min={0}
                        max={12}
                        value={set3B}
                        onChange={(e) => setSet3B(Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-black border border-sky-700/60 rounded-lg text-center text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculated Outcome Preview */}
            <div className="mt-4 p-4 rounded-2xl bg-[#090714] border border-purple-800/40 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase">{t('match.calculatedOutcome')}</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {predictedWinner === 'team_a'
                    ? `${t('home.statTeams')}: ${t('match.teamA')}`
                    : predictedWinner === 'team_b'
                    ? `${t('home.statTeams')}: ${t('match.teamB')}`
                    : language === 'ar' ? 'تعادل / أشواط غير مكتملة' : 'Draw / Incomplete Sets'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-bold text-zinc-400 uppercase">{t('match.pointsDistribution')}</p>
                <p className="text-xs text-sky-400 font-bold mt-0.5">
                  {predictedWinner !== 'tie' ? `+3 ${t('rankings.pts')} | 0 ${t('rankings.pts')}` : 'Pending resolution'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-6 rounded-3xl bg-[#0c091d] border border-purple-900/40 space-y-2">
            <label className="text-xs font-semibold text-zinc-300">{t('match.notes')}</label>
            <textarea
              rows={2}
              placeholder="e.g. Official referee Mahmoud, Suez Padstation opening round..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#140e2b] border border-purple-800/40 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-zinc-400 max-w-sm">
              {language === 'ar'
                ? 'تحفظ المباريات بأمان في وضع الانتظار حتى يعتمدها مسؤول الدوري لمنع تكرار النقاط.'
                : 'Submitted matches are safely staged with zero duplicate point risk until certified by an authorized administrator.'}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl psl-purple-red-btn text-white font-display text-xl font-bold tracking-wider uppercase shadow-xl shadow-purple-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              <span>{loading ? '...' : t('match.submitBtn')}</span>
              <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
