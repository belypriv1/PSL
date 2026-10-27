import React from 'react';
import { District, MatchStatus, PlayerPosition } from '../../types';
import { Shield, MapPin, CheckCircle, Clock, XCircle, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DistrictBadge: React.FC<{ district: District; className?: string }> = ({
  district,
  className = '',
}) => {
  const { translateDistrict } = useLanguage();
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 border border-zinc-700/80 text-zinc-300 ${className}`}
    >
      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
      <span>{translateDistrict(district)}</span>
    </span>
  );
};

export const PositionBadge: React.FC<{ position: PlayerPosition; className?: string }> = ({
  position,
  className = '',
}) => {
  const { translatePosition } = useLanguage();
  const styles: Record<PlayerPosition, string> = {
    Attacker: 'bg-red-950/60 text-red-300 border-red-800/60',
    Defender: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    'All-Rounder': 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[position]} ${className}`}
    >
      {translatePosition(position)}
    </span>
  );
};

export const MatchStatusBadge: React.FC<{ status: MatchStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const { t } = useLanguage();
  if (status === 'approved') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 ${className}`}
      >
        <CheckCircle className="w-3 h-3 shrink-0" />
        <span>{t('common.verified')}</span>
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-400 ${className}`}
      >
        <XCircle className="w-3 h-3 text-zinc-500 shrink-0" />
        <span>{t('common.rejected')}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 border border-amber-600/60 text-amber-300 animate-pulse ${className}`}
    >
      <Clock className="w-3 h-3 shrink-0" />
      <span>{t('common.awaiting')}</span>
    </span>
  );
};

export const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return (
      <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 font-display text-base font-bold flex items-center justify-center shadow-sm shadow-amber-500/30">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="w-7 h-7 rounded-lg bg-slate-400/20 border border-slate-300 text-slate-200 font-display text-base font-bold flex items-center justify-center">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="w-7 h-7 rounded-lg bg-amber-800/30 border border-amber-700 text-amber-500 font-display text-base font-bold flex items-center justify-center">
        3
      </span>
    );
  }

  return (
    <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono-num text-xs font-semibold flex items-center justify-center">
      #{rank}
    </span>
  );
};
