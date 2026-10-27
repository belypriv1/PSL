import React from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Flame, 
  Users, 
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RulesPageProps {
  onNavigate: (page: string) => void;
  onOpenSupabaseConfig: () => void;
}

export const RulesPage: React.FC<RulesPageProps> = ({ onNavigate, onOpenSupabaseConfig }) => {
  const { t, isRtl } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-purple-900/30 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>{t('rules.officialConstitution')}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            {t('rules.title')}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            {t('rules.subtitle')}
          </p>
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-purple-500/40 psl-multi-glow bg-black shrink-0 hidden sm:block p-1">
          <img src="/psl-logo.png" alt="Pad Station Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* The 6 Core PSL Ranking Principles */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-400" />
          <span>{t('rules.corePrinciples')}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule 1 */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-purple-500/20 hover:border-purple-500/40 transition-colors space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-black">1</span>
              <span>{t('rules.r1Title')}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{t('rules.r1Head')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('rules.r1Desc')}
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-rose-500/20 hover:border-rose-500/40 transition-colors space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-black">2</span>
              <span>{t('rules.r2Title')}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{t('rules.r2Head')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('rules.r2Desc')}
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-sky-500/20 hover:border-sky-500/40 transition-colors space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-black">3</span>
              <span>{t('rules.r3Title')}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{t('rules.r3Head')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('rules.r3Desc')}
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-purple-500/20 hover:border-purple-500/40 transition-colors space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-black">4</span>
              <span>{t('rules.r4Title')}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{t('rules.r4Head')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('rules.r4Desc')}
            </p>
          </div>

          {/* Rule 5 */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-sky-500/20 hover:border-sky-500/40 transition-colors space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-black">5</span>
              <span>{t('rules.r5Title')}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{t('rules.r5Head')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('rules.r5Desc')}
            </p>
          </div>

          {/* Rule 6 */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-rose-500/20 hover:border-rose-500/40 transition-colors space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-black">6</span>
              <span>{t('rules.r6Title')}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{t('rules.r6Head')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('rules.r6Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Padbol Match Format Guide */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-purple-500/20 space-y-4">
        <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span>{t('rules.padbolFormat')}</span>
        </h3>
        <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
            <span>{t('rules.padbolDoubles')}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
            <span>{t('rules.padbolSets')}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
            <span>{t('rules.padbolNoDraws')}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
            <span>{t('rules.padbolBody')}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
            <span>{t('rules.padbolWalls')}</span>
          </li>
        </ul>
      </div>

      {/* Supabase Security Deep Dive Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-950 to-sky-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Database Authorization & Row Level Security</span>
          </div>
          <h4 className="text-white font-bold text-sm">{t('rules.inspectSql')}</h4>
          <p className="text-zinc-400 text-xs">
            {t('rules.inspectSqlDesc')}
          </p>
        </div>

        <button
          onClick={onOpenSupabaseConfig}
          className="psl-purple-red-btn px-5 py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer"
        >
          {t('rules.viewSqlBtn')}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <button
          onClick={() => onNavigate('rankings-individual')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase border border-purple-500/30 transition-all cursor-pointer hover:border-sky-400"
        >
          <span>{t('rankings.individualTitle')}</span>
          <ArrowRight className={`w-4 h-4 text-sky-400 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => onNavigate('submit-match')}
          className="psl-purple-red-btn flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs font-bold uppercase transition-all cursor-pointer"
        >
          <span>{t('nav.submitMatch')}</span>
          <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};
