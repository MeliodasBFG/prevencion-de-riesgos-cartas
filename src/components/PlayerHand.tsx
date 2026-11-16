'use client';

import { CheckCircle2, Lock, RotateCcw, SkipForward } from 'lucide-react';
import { CardInstance, PlayerActionSubmission, PlayerState } from '@/types/game';
import { PlayingCard } from './PlayingCard';

interface PlayerHandProps {
  me: PlayerState;
  round: number;
  selectedCardId: string | null;
  hiddenCardIds: string[];
  pendingAction: PlayerActionSubmission | null;
  playableMap: Record<string, boolean>;
  readyCount: number;
  totalConnected: number;
  onSelectCard: (card: CardInstance) => void;
  onDragStartCard: (card: CardInstance) => void;
  onDragMoveCard: (card: CardInstance, clientX: number, clientY: number) => void;
  onDragEndCard: (card: CardInstance, clientX: number, clientY: number) => void;
  onPassTurn: () => void;
  onCancelSubmission: () => void;
}

const FAN_ANGLES = [-6, -2, 2, 6];
const FAN_Y_OFFSETS = [10, 0, 0, 10];

export function PlayerHand({
  me,
  round,
  selectedCardId,
  hiddenCardIds,
  pendingAction,
  playableMap,
  readyCount,
  totalConnected,
  onSelectCard,
  onDragStartCard,
  onDragMoveCard,
  onDragEndCard,
  onPassTurn,
  onCancelSubmission,
}: PlayerHandProps) {
  const isReady = me.ready && pendingAction !== null;
  const visibleCards = me.hand.filter((c) => !hiddenCardIds.includes(c.id));

  return (
    <section className="rounded-2xl border border-slate-800/90 bg-slate-900/75 px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-xl space-y-3">
      {/* Hand Header + Quick Pass / Ready Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            Tu Mano ({visibleCards.length} cartas)
          </h2>
          {me.blockedCardId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-red-300">
              <Lock className="w-3 h-3" /> 1 carta bloqueada por Inspección
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isReady ? (
            <button
              type="button"
              onClick={onPassTurn}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" /> Pasar Ronda
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                Carta en mesa ({readyCount}/{totalConnected} listos)
              </span>
              <button
                type="button"
                onClick={onCancelSubmission}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
              >
                <RotateCcw className="w-3 h-3" /> Recoger
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Physical Fanned Hand */}
      {visibleCards.length > 0 ? (
        <div className="flex flex-wrap sm:flex-nowrap items-end justify-center gap-2 sm:-space-x-2 md:space-x-2 pt-3 pb-3 min-h-[245px]">
          {visibleCards.map((card, idx) => {
            const isBlocked = card.id === me.blockedCardId;
            const canPlay = !isBlocked && Boolean(playableMap[card.id]);
            const angle =
              visibleCards.length === 4 ? FAN_ANGLES[idx] : (idx - 1) * 3;
            const offsetY =
              visibleCards.length === 4 ? FAN_Y_OFFSETS[idx] : Math.abs(idx - 1) * 5;

            return (
              <PlayingCard
                key={`${round}-${card.id}`}
                card={card}
                dealIndex={idx}
                fanAngle={isReady ? 0 : angle}
                fanOffsetY={isReady ? 0 : offsetY}
                selected={selectedCardId === card.id}
                blocked={isBlocked}
                playable={canPlay}
                draggable={!isReady && !isBlocked}
                onClick={() => {
                  if (!isReady && !isBlocked && canPlay) {
                    onSelectCard(card);
                  }
                }}
                onDragStartCard={onDragStartCard}
                onDragMoveCard={onDragMoveCard}
                onDragEndCard={onDragEndCard}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-xs text-slate-400">
          {isReady
            ? 'Has colocado tu carta sobre la mesa. Espera a que finalice la ronda.'
            : 'Cartas colocadas sobre la mesa / descarte.'}
        </div>
      )}
    </section>
  );
}
