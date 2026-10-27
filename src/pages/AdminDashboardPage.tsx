import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { District, PlayerPosition, SUEZ_DISTRICTS } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  UserPlus, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Users, 
  Trophy, 
  Flame, 
  Lock,
  Sparkles,
  FileText
} from 'lucide-react';
import { MatchStatusBadge, DistrictBadge, PositionBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, switchRole } = useAuth();
  const { t, isRtl, translateDistrict, translatePosition } = useLanguage();
  const { 
    matches, 
    players, 
    approveMatch, 
    rejectMatch, 
    revertMatchApproval, 
    addPlayer,
    loadSampleTournamentData 
  } = useData();

  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'players'>('pending');
  const [rejectingMatchId, setRejectingMatchId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Player Form State
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNickname, setNewPlayerNickname] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [newPlayerPartnerName, setNewPlayerPartnerName] = useState('');
  const [newPlayerPartnerPhone, setNewPlayerPartnerPhone] = useState('');
  const [newPlayerDistrict, setNewPlayerDistrict] = useState<District>('Al Arbaeen');
  const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>('All-Rounder');

  // Filter pending vs verified matches
  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const historicalMatches = matches.filter((m) => m.status !== 'pending');

  // Handle Match Approval
  const handleApprove = async (matchId: string) => {
    setActionError(null);
    setActionSuccess(null);
    const result = await approveMatch(matchId, user?.id || 'admin-psl-suez');
    if (!result.success) {
      setActionError(result.error || 'Failed to approve match.');
    } else {
      setActionSuccess(isRtl ? 'تم اعتماد المباراة بنجاح! تم منح +٣ نقاط فردية و+٣ نقاط للزوجي.' : 'Match verified! +3 individual points and +3 team points awarded.');
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Match Rejection
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingMatchId) return;

    setActionError(null);
    setActionSuccess(null);
    const result = await rejectMatch(
      rejectingMatchId,
      user?.id || 'admin-psl-suez',
      rejectionReason || (isRtl ? 'تم رفض النتيجة بقرار لجنة الحكام.' : 'Result disputed by league commissioner.')
    );

    if (!result.success) {
      setActionError(result.error || 'Failed to reject match.');
    } else {
      setActionSuccess(isRtl ? 'تم رفض المباراة. لم يتم تعديل النقاط.' : 'Match rejected. Rankings were not affected.');
      setRejectingMatchId(null);
      setRejectionReason('');
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Result Revert / Correction
  const handleRevert = async (matchId: string) => {
    if (!window.confirm(t('admin.revertConfirm'))) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    const result = await revertMatchApproval(matchId, user?.id || 'admin-psl-suez');
    if (!result.success) {
      setActionError(result.error || 'Failed to revert match.');
    } else {
      setActionSuccess(isRtl ? 'تم تصحيح النتيجة واسترجاع النقاط بأمان.' : 'Match result corrected and points safely deducted.');
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Create Player
  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    await addPlayer({
      name: newPlayerName.trim(),
      nickname: newPlayerNickname.trim() || undefined,
      phone: newPlayerPhone.trim() || undefined,
      partner_name: newPlayerPartnerName.trim() || undefined,
      partner_phone: newPlayerPartnerPhone.trim() || undefined,
      district: newPlayerDistrict,
      position: newPlayerPosition,
    });

    setNewPlayerName('');
    setNewPlayerNickname('');
    setNewPlayerPhone('');
    setNewPlayerPartnerName('');
    setNewPlayerPartnerPhone('');
    setShowAddPlayerModal(false);
    setActionSuccess(isRtl ? 'تم تسجيل ملف اللاعب بنجاح برصيد ٠ نقطة أولية!' : 'Player profile registered with 0 initial points!');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Protected View Check
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-10 rounded-3xl bg-zinc-950 border border-purple-500/40 psl-multi-glow space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-4xl font-black uppercase text-white tracking-wide">
              {t('admin.clearanceRequired')}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              {t('admin.clearanceDesc')}
            </p>
          </div>

          {/* Quick evaluation switcher */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-purple-500/20 max-w-md mx-auto space-y-3">
            <p className="text-xs font-bold text-sky-400">
              {t('admin.testingNotice')}
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {t('admin.testingDesc')}
            </p>
            <button
              onClick={() => switchRole('admin')}
              className="psl-purple-red-btn w-full py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {t('admin.enableAdminBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-purple-900/30">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>{isRtl ? 'لوحة تحكم مسؤولي وحكام دوري السويس' : 'Certified PSL Administrative Console'}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            {t('admin.dashboardTitle')}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {t('admin.dashboardSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPlayerModal(true)}
            className="psl-purple-red-btn flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('admin.registerPlayerBtn')}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Messages */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-purple-900/30 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'pending'
              ? 'border-purple-500 text-white bg-purple-950/30 rounded-t-lg'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-4 h-4 text-sky-400" />
          <span>{t('admin.pendingApprovals')}</span>
          {pendingMatches.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {pendingMatches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'history'
              ? 'border-purple-500 text-white bg-purple-950/30 rounded-t-lg'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>{t('admin.history')} ({historicalMatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'players'
              ? 'border-purple-500 text-white bg-purple-950/30 rounded-t-lg'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>{t('admin.playerManagement')} ({players.length})</span>
        </button>
      </div>
      {/* Tab 1: Pending Matches */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingMatches.length === 0 ? (
            <EmptyState
              title={t('admin.queueClear')}
              description={t('admin.noPending')}
              actionText={t('nav.submitMatch')}
              onAction={() => onNavigate('submit-match')}
              secondaryActionText={matches.length === 0 ? (isRtl ? 'تحميل بطولة السويس التجريبية' : 'Load Suez Tournament Matches') : undefined}
              onSecondaryAction={matches.length === 0 ? loadSampleTournamentData : undefined}
              icon={CheckCircle2}
            />
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900/60 border border-purple-500/20 rounded-xl text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong className="text-white">{pendingMatches.length} {t('admin.waitingValidation')}</strong>
                </span>
                <span className="text-[11px] text-sky-400 font-semibold">
                  {t('admin.ruleNotice')}
                </span>
              </div>

              {pendingMatches.map((m) => {
                const isTeamAWinner = m.winner_team === 'team_a';
                const p1A = players.find((p) => p.id === m.team_a_player1_id);
                const p2A = players.find((p) => p.id === m.team_a_player2_id);
                const p1B = players.find((p) => p.id === m.team_b_player1_id);
                const p2B = players.find((p) => p.id === m.team_b_player2_id);

                return (
                  <div
                    key={m.id}
                    className="p-6 rounded-2xl bg-zinc-950 border border-purple-500/25 space-y-4 relative overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <MatchStatusBadge status={m.status} />
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          {m.court_location}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400 font-mono-num">
                          {new Date(m.match_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {t('admin.submittedBy')}: <strong className="text-zinc-300">{m.submitted_by_name}</strong>
                      </div>
                    </div>

                    {/* Teams & Scores Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Team A */}
                      <div
                        className={`p-4 rounded-xl border transition-all ${
                          isTeamAWinner
                            ? 'bg-gradient-to-r from-purple-950/40 to-rose-950/30 border-purple-500/50 psl-multi-glow'
                            : 'bg-zinc-900/40 border-purple-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">{m.team_a_name}</span>
                          {isTeamAWinner && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-purple-600 to-rose-600 text-white uppercase">
                              {t('admin.winnerAward')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">
                          {p1A?.name || 'Player A1'} & {p2A?.name || 'Player A2'}
                        </p>
                      </div>

                      {/* Team B */}
                      <div
                        className={`p-4 rounded-xl border transition-all ${
                          !isTeamAWinner
                            ? 'bg-gradient-to-r from-purple-950/40 to-rose-950/30 border-purple-500/50 psl-multi-glow'
                            : 'bg-zinc-900/40 border-purple-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">{m.team_b_name}</span>
                          {!isTeamAWinner && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-purple-600 to-rose-600 text-white uppercase">
                              {t('admin.winnerAward')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">
                          {p1B?.name || 'Player B1'} & {p2B?.name || 'Player B2'}
                        </p>
                      </div>
                    </div>

                    {/* Set Scores Bar */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-purple-500/20">
                      <span className="text-xs font-bold text-sky-400">{t('admin.setBreakdown')}:</span>
                      <div className="flex items-center gap-4 font-mono-num font-bold text-sm">
                        {m.sets.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-xs text-zinc-500">{t('match.set')} {idx + 1}:</span>
                            <span className={s.team_a > s.team_b ? 'text-sky-400 font-black' : 'text-zinc-300'}>
                              {s.team_a}
                            </span>
                            <span className="text-zinc-600">-</span>
                            <span className={s.team_b > s.team_a ? 'text-rose-400 font-black' : 'text-zinc-300'}>
                              {s.team_b}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {m.notes && (
                      <p className="text-xs text-zinc-400 italic">
                        {t('admin.refereeNotes')}: {m.notes}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => setRejectingMatchId(m.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-zinc-500" />
                        <span>{t('admin.rejectBtn')}</span>
                      </button>

                      <button
                        onClick={() => handleApprove(m.id)}
                        className="psl-purple-red-btn flex items-center gap-1.5 px-6 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-102 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('admin.approveBtn')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Historical Matches & Result Corrections */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-3 bg-zinc-900/60 border border-purple-500/20 rounded-xl text-xs text-zinc-400">
            {isRtl 
              ? 'يمكن للمسؤولين استعراض كافة المباريات المعتمدة والمرفوضة وتصحيح أي أخطاء وسحب النقاط الممنوحة عند الحاجة.'
              : 'Administrators can view all verified and rejected matches, inspect point distributions, or revert an erroneous approval.'}
          </div>

          {historicalMatches.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs">
              {isRtl ? 'لا توجد مباريات سابقة في السجل حتى الآن.' : 'No historical matches on record.'}
            </div>
          ) : (
            <div className="space-y-3">
              {historicalMatches.map((m) => {
                const isApproved = m.status === 'approved';
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-zinc-950 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <MatchStatusBadge status={m.status} />
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400">{m.court_location}</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-500 font-mono-num">
                          {new Date(m.match_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-bold text-white text-sm pt-0.5">
                        {m.team_a_name} vs {m.team_b_name}
                      </p>
                      {m.rejection_reason && (
                        <p className="text-xs text-rose-400">
                          {isRtl ? 'سبب الرفض:' : 'Rejection Reason:'} {m.rejection_reason}
                        </p>
                      )}
                      {m.approved_at && (
                        <p className="text-[11px] text-zinc-500">
                          {isRtl ? 'تم الاعتماد في' : 'Approved on'} {new Date(m.approved_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono-num text-xs font-bold text-sky-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-purple-500/20">
                        {m.sets.map((s, i) => (
                          <span key={i}>
                            {s.team_a}-{s.team_b}
                          </span>
                        ))}
                      </div>

                      {isApproved && (
                        <button
                          onClick={() => handleRevert(m.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                          title={t('admin.revertWarning')}
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                          <span>{t('admin.revertBtn')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Player Management */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              {isRtl 
                ? 'سجل لاعبي السويس المعتمدين. يبدأ كل لاعب برصيد ٠ نقطة. لا يمكن للاعبين تعديل نقاطهم بأنفسهم.'
                : 'Suez registered players directory. Initial points start at 0. Players cannot modify their own ranking.'}
            </p>
            <button
              onClick={() => setShowAddPlayerModal(true)}
              className="psl-purple-red-btn px-4 py-2 rounded-lg text-white font-bold text-xs uppercase cursor-pointer"
            >
              + {t('admin.registerPlayerBtn')}
            </button>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-zinc-950 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-zinc-900/60 border-b border-purple-900/30 text-[11px] uppercase font-bold text-zinc-400">
                <tr>
                  <th className="py-3 px-4">{t('rankings.player')}</th>
                  <th className="py-3 px-4">{t('rankings.district')}</th>
                  <th className="py-3 px-4">{t('rankings.role')}</th>
                  <th className="py-3 px-4 text-center">{t('rankings.mp')}</th>
                  <th className="py-3 px-4 text-center">{t('rankings.w')}-{t('rankings.l')}</th>
                  <th className="py-3 px-4 text-right">{t('rankings.pts')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {players.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <img
                        src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.name}`}
                        alt={p.name}
                        className="w-7 h-7 rounded-lg border border-purple-500/30"
                      />
                      <div>
                        <span>{p.name}</span>
                        {p.partner_name && (
                          <div className="text-[10px] text-zinc-500 font-normal">
                            {t('rankings.partner')}: {p.partner_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <DistrictBadge district={p.district} />
                    </td>
                    <td className="py-3 px-4">
                      <PositionBadge position={p.position} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono-num font-semibold text-zinc-300">
                      {p.matches_played}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-num text-zinc-300">
                      {p.matches_won}W - {p.matches_lost}L
                    </td>
                    <td className="py-3 px-4 text-right font-display text-lg font-black text-sky-400">
                      {p.individual_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Match Modal */}
      {rejectingMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-display text-2xl font-bold text-white uppercase">
              {t('admin.rejectModalTitle')}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('admin.rejectModalDesc')}
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder={t('admin.rejectReasonPlaceholder')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingMatchId(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase cursor-pointer"
                >
                  {t('admin.confirmRejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Player Modal (with Simplified Optional Partner) */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-purple-500/40 psl-multi-glow rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-white uppercase">
                {t('admin.registerPlayerBtn')}
              </h3>
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">{t('auth.fullName')} *</label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'مثال: كريم السيد' : 'e.g. Karim El-Sayed'}
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">{t('auth.nickname')}</label>
                  <input
                    type="text"
                    placeholder={isRtl ? 'مثال: القرش' : 'e.g. The Shark'}
                    value={newPlayerNickname}
                    onChange={(e) => setNewPlayerNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">{t('auth.phone')}</label>
                  <input
                    type="tel"
                    placeholder="010xxxxxxxx"
                    value={newPlayerPhone}
                    onChange={(e) => setNewPlayerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">{t('auth.district')}</label>
                  <select
                    value={newPlayerDistrict}
                    onChange={(e) => setNewPlayerDistrict(e.target.value as District)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {SUEZ_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-zinc-900">
                        {translateDistrict(d)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">{t('auth.position')}</label>
                  <select
                    value={newPlayerPosition}
                    onChange={(e) => setNewPlayerPosition(e.target.value as PlayerPosition)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="All-Rounder" className="bg-zinc-900">{translatePosition('All-Rounder')}</option>
                    <option value="Attacker" className="bg-zinc-900">{translatePosition('Attacker')}</option>
                    <option value="Defender" className="bg-zinc-900">{translatePosition('Defender')}</option>
                  </select>
                </div>
              </div>

              {/* Simple & Clean Optional Doubles Partner */}
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t('admin.partnerOptional')}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {isRtl ? '(اختياري - بدون تفاصيل معقدة)' : '(Optional - simple)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={t('admin.partnerName')}
                    value={newPlayerPartnerName}
                    onChange={(e) => setNewPlayerPartnerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/60 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="tel"
                    placeholder={t('admin.partnerPhone')}
                    value={newPlayerPartnerPhone}
                    onChange={(e) => setNewPlayerPartnerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/60 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-purple-500/20 text-[11px] text-zinc-400">
                {t('admin.initialZeroReminder')}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="psl-purple-red-btn px-5 py-2 rounded-lg text-white text-xs font-bold uppercase cursor-pointer"
                >
                  {t('admin.registerProfileBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
