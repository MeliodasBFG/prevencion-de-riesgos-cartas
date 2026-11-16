'use client';

import {
  Building2,
  CheckCircle2,
  Flame,
  Info,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SECTOR_META } from '@/data/cardTemplates';
import {
  CardCategory,
  CardInstance,
  PlayerActionSubmission,
  PlayerState,
} from '@/types/game';
import { SectorIcon } from './SectorIcon';

interface PlayerHandProps {
  me: PlayerState;
  selectedCardId: string | null;
  discardMode: boolean;
  discardCardIds: string[];
  pendingAction: PlayerActionSubmission | null;
  playableMap: Record<string, boolean>;
  readyCount: number;
  totalConnected: number;
  onSelectCard: (card: CardInstance) => void;
  onToggleDiscardMode: () => void;
  onToggleDiscardCard: (cardId: string) => void;
  onConfirmDiscard: () => void;
  onPassTurn: () => void;
  onCancelSubmission: () => void;
}

const CATEGORY_STYLE: Record<
  CardCategory,
  {
    label: string;
    cardClass: string;
    headerClass: string;
    icon: typeof ShieldCheck;
  }
> = {
  WORKSTATION: {
    label: 'Puesto de Trabajo',
    cardClass:
      'border-sky-500/40 bg-gradient-to-b from-sky-950/50 to-slate-900 hover:border-sky-400',
    headerClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: Building2,
  },
  HAZARD: {
    label: 'Riesgo Laboral',
    cardClass:
      'border-red-500/45 bg-gradient-to-b from-red-950/55 to-slate-900 hover:border-red-400',
    headerClass: 'bg-red-500/20 text-red-300 border-red-500/35',
    icon: Flame,
  },
  PREVENTION: {
    label: 'Medida Preventiva / EPI',
    cardClass:
      'border-emerald-500/45 bg-gradient-to-b from-emerald-950/50 to-slate-900 hover:border-emerald-400',
    headerClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    icon: ShieldCheck,
  },
  ACTION: {
    label: 'Inspección / Gestión',
    cardClass:
      'border-amber-500/45 bg-gradient-to-b from-amber-950/50 to-slate-900 hover:border-amber-400',
    headerClass: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
    icon: Zap,
  },
};

export function PlayerHand({
  me,
  selectedCardId,
  discardMode,
  discardCardIds,
  pendingAction,
  playableMap,
  readyCount,
  totalConnected,
  onSelectCard,
  onToggleDiscardMode,
  onToggleDiscardCard,
  onConfirmDiscard,
  onPassTurn,
  onCancelSubmission,
}: PlayerHandProps) {
  const isReady = me.ready && pendingAction !== null;

  return (
    <section className="space-y-3">
      {/* Hand Header + Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            Tu Mano ({me.hand.length} cartas)
          </h2>
          {me.blockedCardId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-red-300">
              <Lock className="w-3 h-3" /> 1 carta bloqueada por Inspección
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isReady ? (
            <>
              <button
                type="button"
                onClick={onToggleDiscardMode}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                  discardMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {discardMode ? 'Cancelar Descarte' : 'Descartar y Renovar'}
              </button>

              {discardMode && discardCardIds.length > 0 && (
                <button
                  type="button"
                  onClick={onConfirmDiscard}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3.5 py-1.5 text-xs shadow-md transition-colors"
                >
                  Confirmar Descarte ({discardCardIds.length})
                </button>
              )}

              {!discardMode && (
                <button
                  type="button"
                  onClick={onPassTurn}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Pasar Ronda
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                Jugada secreta enviada ({readyCount}/{totalConnected} listos)
              </span>
              <button
                type="button"
                onClick={onCancelSubmission}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
              >
                <RotateCcw className="w-3 h-3" /> Cambiar
              </button>
            </div>
          )}
        </div>
      </div>

      {discardMode && !isReady && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-200">
          Selecciona de 1 a 4 cartas que quieras descartar para robar nuevas cartas al
          final de la ronda.
        </div>
      )}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {me.hand.map((card) => {
          const style = CATEGORY_STYLE[card.category];
          const CatIcon = style.icon;
          const sectorMeta = SECTOR_META[card.sector];
          const isBlocked = card.id === me.blockedCardId;
          const canPlay = !isBlocked && Boolean(playableMap[card.id]);
          const isSelectedForPlay = !discardMode && selectedCardId === card.id;
          const isSelectedForDiscard =
            discardMode && discardCardIds.includes(card.id);

          const disabled = isReady || isBlocked || (!discardMode && !canPlay);

          return (
            <motion.div
              key={card.id}
              whileHover={!disabled ? { y: -3 } : undefined}
              onClick={() => {
                if (isReady || isBlocked) return;
                if (discardMode) {
                  onToggleDiscardCard(card.id);
                } else if (canPlay) {
                  onSelectCard(card);
                }
              }}
              role={!disabled ? 'button' : undefined}
              tabIndex={!disabled ? 0 : undefined}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (discardMode) {
                    onToggleDiscardCard(card.id);
                  } else if (canPlay) {
                    onSelectCard(card);
                  }
                }
              }}
              className={`relative rounded-2xl border p-3.5 flex flex-col justify-between transition-all select-none ${
                style.cardClass
              } ${
                isSelectedForPlay
                  ? 'ring-2 ring-yellow-300 border-yellow-300 shadow-lg shadow-yellow-500/20 -translate-y-1'
                  : isSelectedForDiscard
                    ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/40'
                    : ''
              } ${
                isBlocked
                  ? 'opacity-55 grayscale cursor-not-allowed'
                  : disabled
                    ? 'opacity-65 cursor-not-allowed'
                    : 'cursor-pointer'
              }`}
            >
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.headerClass}`}
                  >
                    <CatIcon className="w-3 h-3" />
                    {style.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${sectorMeta.badgeClass}`}
                  >
                    <SectorIcon sector={card.sector} className="w-3 h-3" />
                    {sectorMeta.shortLabel}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-extrabold text-white leading-snug">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Educational PRL Tip Pill */}
              <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                <div className="rounded-lg bg-slate-950/75 border border-slate-800 p-2 text-[11px] text-slate-300 leading-snug flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{card.prlTip}</span>
                </div>

                {isBlocked && (
                  <div className="rounded-lg bg-red-500/25 border border-red-400/50 px-2 py-1 text-[11px] font-bold text-red-200 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Bloqueada esta ronda
                  </div>
                )}

                {!isBlocked && !discardMode && !canPlay && !isReady && (
                  <div className="text-[11px] font-medium text-slate-400 text-center">
                    Sin objetivos válidos ahora (puedes descartarla)
                  </div>
                )}

                {isSelectedForDiscard && (
                  <div className="rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-1 text-[11px] font-bold text-amber-200 text-center">
                    Marcada para descartar ✓
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
