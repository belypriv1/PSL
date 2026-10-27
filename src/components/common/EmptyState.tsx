import React from 'react';
import { Trophy, Plus, Sparkles, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  icon: Icon = Trophy,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-zinc-950/80 border border-zinc-800/80 psl-grid-bg my-6">
      <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 psl-red-glow">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="font-display text-2xl font-bold text-white tracking-wide mb-2">
        {title}
      </h3>

      <p className="text-zinc-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </div>
  );
};
