import React from 'react';
import { Trophy, Shield, MapPin, Award, CheckCircle } from 'lucide-react';
import { SUEZ_COURTS } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenSupabaseConfig: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSupabaseConfig }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#070510] border-t border-purple-900/30 text-zinc-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/50 psl-multi-glow bg-black shrink-0">
                <img 
                  src="/psl-logo.png" 
                  alt="Pad Station Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display text-2xl font-bold tracking-wider text-white">
                {t('brand.title')} <span className="text-rose-400">{t('brand.league')}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {language === 'ar'
                ? 'الدوري التنافسي الرسمي المعتمد لتصنيف لاعبي وفرق البادبول في محافظة السويس، مصر.'
                : 'The official competitive Padbol player ranking and tournament circuit for Suez, Egypt.'}
            </p>
            <div className="p-3 bg-[#130f26] border border-purple-800/40 rounded-xl">
              <p className="font-display text-lg text-white font-bold tracking-wide">
                “{t('brand.tagline')}”
              </p>
              <p className="text-[11px] text-sky-400 mt-0.5">
                {language === 'ar' ? 'معيار بادبول الرسمي لمحافظة السويس' : 'Suez Governorate Official Padbol Standard'}
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-display text-lg text-white font-bold uppercase tracking-wider mb-3">
              {language === 'ar' ? 'روابط الدوري' : 'League Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-purple-300 transition-colors"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('rankings-individual')} 
                  className="hover:text-purple-300 transition-colors"
                >
                  {t('nav.playerRankings')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('rankings-team')} 
                  className="hover:text-purple-300 transition-colors"
                >
                  {t('nav.teamRankings')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('submit-match')} 
                  className="hover:text-rose-400 transition-colors"
                >
                  {t('nav.submitMatch')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('admin')} 
                  className="text-purple-300 hover:text-white transition-colors font-semibold"
                >
                  {t('nav.adminPanel')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('rules')} 
                  className="hover:text-purple-300 transition-colors"
                >
                  {t('nav.rules')}
                </button>
              </li>
            </ul>
          </div>

          {/* Official League Venue: One Location, One Court */}
          <div>
            <h4 className="font-display text-lg text-white font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>{language === 'ar' ? 'مقر وملعب الدوري الرسمي' : 'Official League Venue'}</span>
            </h4>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3.5 rounded-xl bg-[#130f26] border border-purple-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Padstation Suez</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    {language === 'ar' ? 'ملعب واحد' : 'Single Court'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {language === 'ar' ? 'السويس، جمهورية مصر العربية' : 'Suez, Egypt'}
                </p>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {language === 'ar'
                  ? 'الموقع والملعب المعتمد الحصري لكافة مباريات وبطولات دوري بادستيشن في السويس.'
                  : 'The single exclusive court and venue for all official PSL sanctioned matches.'}
              </p>
            </div>
          </div>

          {/* Database & Ranking Rules Guarantee */}
          <div>
            <h4 className="font-display text-lg text-white font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>{language === 'ar' ? 'النزاهة وقواعد النقاط' : 'Integrity & Storage'}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'فوز = ٣ نقاط | خسارة = ٠ نقاط' : 'Win = 3 PTS | Loss = 0 PTS'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{language === 'ar' ? 'فصل نقاط الفردي عن الزوجي' : 'Separate Individual & Team Points'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{language === 'ar' ? 'حماية تامة من تكرار النقاط' : 'Zero duplicate point awards'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{language === 'ar' ? 'قاعدة بيانات سوبابيز PostgreSQL' : 'Supabase PostgreSQL + RLS Protected'}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenSupabaseConfig}
                  className="w-full text-center px-3 py-1.5 rounded-lg bg-[#140f29] border border-purple-800/50 hover:border-sky-400 text-purple-200 hover:text-white font-semibold transition-colors"
                >
                  {t('home.supabaseGuide')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-900/30 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {t('brand.title')} {t('brand.league')} {t('brand.suezEgypt')}.</p>
          <p className="mt-2 sm:mt-0 font-mono-num text-[11px] text-zinc-400">
            Suez Governorate Padbol Division • System v1.2
          </p>
        </div>
      </div>
    </footer>
  );
};
