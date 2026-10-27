import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { getStoredSupabaseConfig } from '../../lib/supabase';
import { 
  Trophy, 
  Users, 
  ShieldCheck, 
  PlusCircle, 
  Menu, 
  X, 
  Database, 
  HelpCircle,
  LogOut,
  Globe,
  Flame
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenSupabaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenSupabaseConfig }) => {
  const { user, isAdmin, logout, switchRole } = useAuth();
  const { matches } = useData();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabaseConfig = getStoredSupabaseConfig();

  const pendingMatchesCount = matches.filter((m) => m.status === 'pending').length;

  const handleNav = (page: string, params?: any) => {
    onNavigate(page, params);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090714]/90 backdrop-blur-md border-b border-purple-900/30">
      {/* Top Banner: League Location, Language Switcher, Quick Test Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-[#0d0a1d] to-sky-950/60 border-b border-purple-800/20 px-4 py-1.5 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Location & Tagline */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-purple-600 to-rose-500 text-white tracking-wider uppercase shadow-sm">
              {t('brand.suezEgypt')}
            </span>
            <span className="hidden sm:inline font-semibold text-sky-300/90 text-[11px]">
              {t('brand.tagline')}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 hover:text-white transition-all shadow-sm"
              title="تغيير اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Supabase status indicator */}
            <button
              onClick={onOpenSupabaseConfig}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                supabaseConfig.isConnected
                  ? 'bg-sky-950/60 border-sky-600/50 text-sky-300 hover:bg-sky-900/50'
                  : 'bg-zinc-900/90 border-purple-900/50 text-zinc-300 hover:border-purple-500/60'
              }`}
              title="Supabase Database Status"
            >
              <Database className="w-3 h-3 text-rose-400" />
              <span className="hidden xs:inline">
                {supabaseConfig.isConnected ? t('nav.supabaseConnected') : t('nav.supabaseOffline')}
              </span>
            </button>

            {/* Quick Role Switcher for instant evaluator testing */}
            <div className="flex items-center gap-1 text-[11px] bg-black/60 border border-purple-800/40 rounded px-1.5 py-0.5">
              <span className="text-zinc-400 text-[10px]">{t('nav.role')}:</span>
              <button
                onClick={() => switchRole('admin')}
                className={`px-1.5 py-0.5 rounded font-bold text-[10px] transition-colors ${
                  isAdmin 
                    ? 'bg-gradient-to-r from-purple-600 to-rose-500 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('nav.admin')}
              </button>
              <button
                onClick={() => switchRole('player')}
                className={`px-1.5 py-0.5 rounded font-bold text-[10px] transition-colors ${
                  !isAdmin ? 'bg-sky-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('nav.player')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-purple-500/50 psl-multi-glow group-hover:scale-105 group-hover:border-sky-400 transition-all bg-black shrink-0">
              <img 
                src="/psl-logo.png" 
                alt="Pad Station League Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-2xl font-bold tracking-wider text-white group-hover:text-purple-300 transition-colors">
                  {t('brand.title')}
                </span>
                <span className="text-rose-400 font-display text-2xl font-bold tracking-wider">
                  {t('brand.league')}
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-sky-400 uppercase -mt-1">
                {t('brand.suezCircuit')}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'home'
                  ? 'bg-purple-950/60 text-white border-b-2 border-rose-500'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-950/30'
              }`}
            >
              {t('nav.home')}
            </button>

            <button
              onClick={() => handleNav('rankings-individual')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'rankings-individual'
                  ? 'bg-purple-950/60 text-white border-b-2 border-rose-500'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-950/30'
              }`}
            >
              <Trophy className="w-4 h-4 text-purple-400" />
              <span>{t('nav.playerRankings')}</span>
            </button>

            <button
              onClick={() => handleNav('rankings-team')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'rankings-team'
                  ? 'bg-purple-950/60 text-white border-b-2 border-sky-400'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-950/30'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>{t('nav.teamRankings')}</span>
            </button>

            <button
              onClick={() => handleNav('submit-match')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'submit-match'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                  : 'text-zinc-200 hover:text-rose-400 hover:bg-purple-950/30'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-rose-400" />
              <span>{t('nav.submitMatch')}</span>
            </button>

            <button
              onClick={() => handleNav('rules')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'rules'
                  ? 'bg-purple-950/60 text-white border-b-2 border-purple-500'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-950/30'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <span>{t('nav.rules')}</span>
            </button>

            {/* Admin Dashboard Tab */}
            <button
              onClick={() => handleNav('admin')}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#15102a] text-zinc-200 hover:bg-[#1f173d] border border-purple-800/40'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${currentPage === 'admin' ? 'text-white' : 'text-purple-400'}`} />
              <span>{t('nav.adminPanel')}</span>
              {pendingMatchesCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse">
                  {pendingMatchesCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Profile / Auth Area & Language Toggle */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Switcher: English primary, Arabic secondary */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#140f29] hover:bg-purple-950/70 border border-purple-800/50 hover:border-sky-400 text-xs font-bold text-zinc-200 hover:text-white transition-all shadow-sm cursor-pointer"
              title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 bg-[#140f29] border border-purple-800/40 rounded-xl p-1.5 px-3">
                <div 
                  onClick={() => handleNav('profile', { playerId: user.player_id || 'ply-suez-01' })}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-rose-500 border border-purple-400 flex items-center justify-center font-bold text-white text-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div 
                  onClick={() => handleNav('profile', { playerId: user.player_id || 'ply-suez-01' })}
                  className="cursor-pointer"
                >
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-purple-400' : 'bg-sky-400'}`} />
                    {isAdmin ? t('nav.administrator') : t('nav.player')}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title={t('nav.logout')}
                  className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('auth')}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  {t('nav.logIn')}
                </button>
                <button
                  onClick={() => handleNav('auth', { mode: 'signup' })}
                  className="px-3.5 py-1.5 text-xs font-bold psl-purple-red-btn text-white rounded-lg shadow-md shadow-purple-600/25 transition-all"
                >
                  {t('nav.joinPsl')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Language Switch */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 p-1.5 px-2.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-200 text-xs font-bold cursor-pointer"
              title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Globe className="w-3 h-3 text-sky-400" />
              <span>{language === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            <button
              onClick={() => handleNav('admin')}
              className="p-1.5 rounded-md bg-[#140f29] border border-purple-800 text-rose-400 relative"
            >
              <ShieldCheck className="w-5 h-5" />
              {pendingMatchesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-black">
                  {pendingMatchesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-purple-950/40"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0919] border-b border-purple-900/40 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-purple-900/30">
            <button
              onClick={() => handleNav('home')}
              className="p-2.5 rounded-lg bg-[#140f29] text-left text-sm font-bold text-white"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => handleNav('submit-match')}
              className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-left text-sm font-bold text-rose-300 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav.submitMatch')}</span>
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleNav('rankings-individual')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-zinc-300 hover:bg-purple-950/40 font-semibold"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>{t('nav.playerRankings')}</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('rankings-team')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-zinc-300 hover:bg-purple-950/40 font-semibold"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>{t('nav.teamRankings')}</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('admin')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-bold text-purple-300 bg-purple-950/40 border border-purple-800/40"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>{t('nav.adminPanel')}</span>
              </div>
              {pendingMatchesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs">
                  {pendingMatchesCount} {t('nav.pending')}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('rules')}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm text-zinc-300 hover:bg-purple-950/40 font-semibold"
            >
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <span>{t('nav.rules')}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div 
                  onClick={() => handleNav('profile', { playerId: user.player_id || 'ply-suez-01' })}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-rose-500 flex items-center justify-center font-bold text-white text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-zinc-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-rose-300 px-3 py-1.5 rounded bg-[#140f29] border border-purple-800/40"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="w-full py-2.5 text-center text-sm font-bold psl-purple-red-btn text-white rounded-lg"
              >
                {t('nav.joinPsl')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
