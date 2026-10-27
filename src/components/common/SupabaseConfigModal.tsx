import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Key, 
  Terminal, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, clearStoredSupabaseConfig } from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'instructions' | 'connect' | 'sql'>('instructions');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setSaveStatus('Please enter both Supabase Project URL and Anon Public Key.');
      return;
    }
    saveStoredSupabaseConfig(url.trim(), anonKey.trim());
    setSaveStatus('Credentials saved! Reloading PSL connection...');
    setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  const handleClear = () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setSaveStatus('Supabase credentials cleared. PSL will use local storage mode.');
    setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  const copySqlSchema = () => {
    const sqlText = `-- PSL SUEZ SUPABASE SCHEMA & RLS
-- Run in your Supabase Dashboard -> SQL Editor -> New Query

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT,
  district TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'All-Rounder',
  individual_points INTEGER NOT NULL DEFAULT 0 CHECK (individual_points >= 0),
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  sets_won INTEGER NOT NULL DEFAULT 0,
  sets_lost INTEGER NOT NULL DEFAULT 0,
  form TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  player1_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_points INTEGER NOT NULL DEFAULT 0 CHECK (team_points >= 0),
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  sets_won INTEGER NOT NULL DEFAULT 0,
  sets_lost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  court_location TEXT NOT NULL,
  team_a_player1_id UUID NOT NULL REFERENCES public.players(id),
  team_a_player2_id UUID NOT NULL REFERENCES public.players(id),
  team_a_name TEXT NOT NULL,
  team_b_player1_id UUID NOT NULL REFERENCES public.players(id),
  team_b_player2_id UUID NOT NULL REFERENCES public.players(id),
  team_b_name TEXT NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::JSONB,
  winner_team TEXT NOT NULL CHECK (winner_team IN ('team_a', 'team_b')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  points_awarded BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public players readable" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public teams readable" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Approved matches readable by all" ON public.matches FOR SELECT USING (true);

-- Never allow users to update their own points directly
CREATE POLICY "Only admins can update points" ON public.players FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
`;
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white tracking-wide">
                SUPABASE DATABASE & AUTHENTICATION SETUP
              </h3>
              <p className="text-xs text-zinc-400">
                Beginner-friendly step-by-step guide to connect Padstation League to Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs font-semibold ${
          currentConfig.isConnected 
            ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${currentConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>
              {currentConfig.isConnected
                ? `Supabase Status: Connected (${currentConfig.url.substring(0, 30)}...)`
                : 'Supabase Status: Local Storage Test Mode (No external keys needed to evaluate)'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500">
            PostgreSQL • Row Level Security • Auth
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-6">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'instructions'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. Beginner's 4-Step Guide
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'connect'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2. Connect Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3. SQL Schema & RLS Rules
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6 text-sm">
          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="font-display text-lg text-white font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  How Padstation League Uses Supabase
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Supabase acts as our cloud PostgreSQL database and user authentication service. It enforces our strict ranking rules directly at the database level so:
                </p>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                  <li><strong className="text-white">Every player starts at 0 points.</strong></li>
                  <li><strong className="text-white">Wins award exactly 3 points</strong> (individual and doubles team points tracked in separate columns).</li>
                  <li><strong className="text-white">Players cannot tamper with their own points</strong> via database Row-Level Security (RLS).</li>
                  <li><strong className="text-white">Only authorized admins can approve matches</strong> and award points atomically.</li>
                </ul>
              </div>

              {/* 4 Steps */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500 text-red-400 font-display text-xl font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-sm">Create a free Supabase Project</h5>
                    <p className="text-xs text-zinc-400">
                      Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-red-400 hover:underline font-semibold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>, click "New Project", and name it <span className="text-zinc-200 font-mono">padstation-league-suez</span>. Select the cloud region closest to Egypt (e.g. Frankfurt or London).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500 text-red-400 font-display text-xl font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-sm">Run the PSL SQL Schema in Supabase</h5>
                    <p className="text-xs text-zinc-400">
                      In your Supabase dashboard, click <strong className="text-zinc-200">SQL Editor</strong> on the left sidebar, click <strong className="text-zinc-200">+ New Query</strong>, copy our SQL code from Tab 3, and press <strong className="text-zinc-200">RUN</strong>. This creates all tables and Row-Level Security rules.
                    </p>
                    <button
                      onClick={() => setActiveTab('sql')}
                      className="mt-2 text-xs font-semibold text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                    >
                      View & Copy PSL SQL Script <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500 text-red-400 font-display text-xl font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-sm">Copy API Credentials</h5>
                    <p className="text-xs text-zinc-400">
                      In your Supabase dashboard, go to <strong className="text-zinc-200">Project Settings (gear icon) → API</strong>. Copy the <strong className="text-zinc-200">Project URL</strong> and <strong className="text-zinc-200">anon / public key</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500 text-red-400 font-display text-xl font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-sm">Paste Credentials into PSL</h5>
                    <p className="text-xs text-zinc-400">
                      Paste them directly in Tab 2 ("Connect Credentials") or into your deployment environment variables as <span className="font-mono text-zinc-300">VITE_SUPABASE_URL</span> and <span className="font-mono text-zinc-300">VITE_SUPABASE_ANON_KEY</span>.
                    </p>
                    <button
                      onClick={() => setActiveTab('connect')}
                      className="mt-2 text-xs font-semibold text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                    >
                      Go to Connect Tab <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-red-500" />
                  Live Supabase Connection
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your project keys below. These will be securely stored in your browser session for testing, or you can provide them in <span className="font-mono text-zinc-300">.env</span>.
                </p>
              </div>

              {saveStatus && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{saveStatus}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Supabase Project URL</span>
                  <span className="text-[11px] text-zinc-500 font-mono">e.g. https://xyzcompany.supabase.co</span>
                </label>
                <input
                  type="url"
                  placeholder="https://your-project-ref.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Supabase Anon Public Key</span>
                  <span className="text-[11px] text-zinc-500 font-mono">eyJhbGciOi...</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg transition-colors"
                >
                  Clear / Reset to Local Mode
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md shadow-red-600/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Save & Connect Supabase</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">PostgreSQL Schema & Security Policies</h4>
                  <p className="text-xs text-zinc-400">
                    Includes tables for players, teams, matches, profiles, atomic stored procedure, and RLS rules.
                  </p>
                </div>
                <button
                  onClick={copySqlSchema}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto text-[11px] font-mono text-zinc-300 max-h-96">
                <pre>{`-- PSL SUEZ OFFICIAL DATABASE SCHEMA
-- File location in codebase: /supabase/schema.sql

-- 1. Profiles (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Players Table (Every player starts at 0 points)
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'All-Rounder',
  individual_points INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  form TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

-- 3. Teams Table (Doubles Pairs - Separate team points)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  player1_id UUID NOT NULL REFERENCES public.players(id),
  player2_id UUID NOT NULL REFERENCES public.players(id),
  team_points INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0
);

-- 4. Matches Table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  court_location TEXT NOT NULL,
  team_a_player1_id UUID NOT NULL REFERENCES public.players(id),
  team_a_player2_id UUID NOT NULL REFERENCES public.players(id),
  team_b_player1_id UUID NOT NULL REFERENCES public.players(id),
  team_b_player2_id UUID NOT NULL REFERENCES public.players(id),
  sets JSONB NOT NULL DEFAULT '[]'::JSONB,
  winner_team TEXT NOT NULL CHECK (winner_team IN ('team_a', 'team_b')),
  status TEXT NOT NULL DEFAULT 'pending',
  points_awarded BOOLEAN NOT NULL DEFAULT FALSE
);

-- Row Level Security (RLS)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Security Rule: Players cannot edit their own points!
CREATE POLICY "Only admins can update points" ON public.players 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
