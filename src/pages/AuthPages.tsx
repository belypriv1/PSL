import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { District, PlayerPosition, SUEZ_DISTRICTS } from '../types';
import { 
  User, 
  Lock, 
  Mail, 
  LogIn, 
  UserPlus, 
  Users, 
  Phone,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AuthPagesProps {
  initialMode?: 'login' | 'signup';
  onNavigate: (page: string, params?: any) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ initialMode = 'login', onNavigate }) => {
  const { login, signUp, quickLoginAs } = useAuth();
  const { addPlayer } = useData();
  const { t, language, translateDistrict } = useLanguage();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState<District>('Port Tawfiq');
  
  // Optional Partner Details
  const [showPartnerFields, setShowPartnerFields] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim() || !email.trim()) {
          setError(language === 'ar' ? 'يرجى كتابة الاسم والبريد الإلكتروني.' : 'Please provide your name and email.');
          setLoading(false);
          return;
        }

        const res = await signUp({
          email,
          fullName: fullName.trim(),
          district,
          position: 'All-Rounder',
          phone: phone.trim() || undefined,
          partnerName: partnerName.trim() || undefined,
          partnerPhone: partnerPhone.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || (language === 'ar' ? 'فشل التسجيل' : 'Registration failed.'));
          setLoading(false);
          return;
        }

        const newPlayer = await addPlayer({
          name: fullName.trim(),
          phone: phone.trim() || undefined,
          partner_name: partnerName.trim() || undefined,
          partner_phone: partnerPhone.trim() || undefined,
          district,
          position: 'All-Rounder',
        });

        setLoading(false);
        onNavigate('profile', { playerId: newPlayer.id });
      } else {
        if (!email.trim()) {
          setError(language === 'ar' ? 'يرجى كتابة البريد الإلكتروني.' : 'Please enter your email.');
          setLoading(false);
          return;
        }

        await login(email, 'player');
        setLoading(false);
        onNavigate('rankings-individual');
      }
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'حدث خطأ' : 'Authentication error.'));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="rounded-3xl bg-[#0c091d] border border-purple-800/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-purple-500/50 psl-multi-glow bg-black mx-auto shadow-xl">
            <img
              src="/psl-logo.png"
              alt="Pad Station Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl font-black uppercase text-white tracking-wide">
            {mode === 'login' ? t('auth.signInTitle') : t('auth.createTitle')}
          </h1>
          <p className="text-zinc-400 text-xs">
            {mode === 'login'
              ? (language === 'ar' ? 'سجل دخولك لمتابعة ترتيبك وإحصائياتك' : 'Sign in to access your player stats')
              : (language === 'ar' ? 'انضم لدوري السويس، البداية من ٠ نقطة للجميع' : 'Join the league, everyone starts at 0 PTS')}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#140e2b] border border-purple-900/40 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-purple-900/60 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('nav.logIn')}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'psl-purple-red-btn text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('nav.joinPsl')}
          </button>
        </div>

        {/* Instant Reviewer Quick Login */}
        <div className="mb-5 p-3 rounded-2xl bg-[#140f29]/80 border border-purple-800/30 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'ar' ? 'دخول سريع للتجربة:' : 'Quick Test:'}</span>
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                quickLoginAs('admin');
                onNavigate('admin');
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-[11px] font-bold transition-colors"
            >
              {language === 'ar' ? 'مسؤول' : 'Admin'}
            </button>
            <button
              type="button"
              onClick={() => {
                quickLoginAs('player');
                onNavigate('rankings-individual');
              }}
              className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700/60 text-sky-200 text-[11px] font-bold transition-colors"
            >
              {language === 'ar' ? 'لاعب' : 'Player'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
            {error}
          </div>
        )}

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">{t('auth.fullName')}</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'مثال: يوسف نبيل' : 'e.g. Youssef Nabil'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#140e2b] border border-purple-800/40 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* District & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">{t('auth.district')}</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as District)}
                    className="w-full px-3 py-2.5 bg-[#140e2b] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    {SUEZ_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-[#140e2b]">
                        {translateDistrict(d)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    {t('auth.phone')} <span className="text-zinc-500 text-[10px]">({language === 'ar' ? 'اختياري' : 'optional'})</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="010xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#140e2b] border border-purple-800/40 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Optional Partner Section - Super Simple Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowPartnerFields(!showPartnerFields)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#140e2b] hover:bg-[#1a1236] border border-purple-900/50 text-xs font-bold text-sky-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>
                      {language === 'ar' ? '+ إضافة الزميل في اللعب (اختياري)' : '+ Add Doubles Partner (Optional)'}
                    </span>
                  </div>
                  {showPartnerFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showPartnerFields && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-[#100b24] border border-purple-800/40 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-300">
                          {language === 'ar' ? 'اسم الزميل' : 'Partner Name'}
                        </label>
                        <input
                          type="text"
                          placeholder={language === 'ar' ? 'اسم زميلك' : 'Partner name'}
                          value={partnerName}
                          onChange={(e) => setPartnerName(e.target.value)}
                          className="w-full px-2.5 py-2 bg-black border border-purple-900/60 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-300">
                          {language === 'ar' ? 'رقم هاتف الزميل' : 'Partner Phone'}
                        </label>
                        <input
                          type="tel"
                          placeholder="010xxxxxxxx"
                          value={partnerPhone}
                          onChange={(e) => setPartnerPhone(e.target.value)}
                          className="w-full px-2.5 py-2 bg-black border border-purple-900/60 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="email"
                required
                placeholder="athlete@padbolsuez.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#140e2b] border border-purple-800/40 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#140e2b] border border-purple-800/40 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl psl-purple-red-btn text-white font-display text-xl font-bold tracking-wider uppercase transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-4"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                <span>{t('nav.logIn')}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>{t('nav.joinPsl')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
