'use client';

import { useEffect, useState } from 'react';
import {
  Award,
  FastForward,
  Flame,
  Landmark,
  Layers,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CardInstance,
  ClientGameView,
  ResolvedPlayVisual,
  RoundEventType,
} from '@/types/game';
import { CardBackVisual, PlayingCard } from './PlayingCard';

interface GameTableProps {
  view: ClientGameView;
  isHost: boolean;
  isReady: boolean;
  seatedCard: CardInstance | null;
  stagedDiscardCards: CardInstance[];
  hoveredZone: string | null;
  onCancelSeated: () => void;
  onConfirmDiscards: () => void;
  onClearDiscards: () => void;
  onCancelReady: () => void;
  onSkipBulletin: () => void;
}

const OUTCOME_BADGE: Record<
  RoundEventType | 'MISS',
  { bg: string; label: string }
> = {
  CERTIFIED: { bg: 'bg-amber-400 text-slate-950', label: '🏆 ¡ISO 45001!' },
  ACCIDENT: { bg: 'bg-red-600 text-white', label: '🚨 ¡Siniestro!' },
  RISK: { bg: 'bg-orange-500 text-slate-950', label: '⚠️ En Riesgo' },
  BLOCKED: { bg: 'bg-emerald-500 text-slate-950', label: '🛡️ Bloqueado' },
  PREVENTED: { bg: 'bg-emerald-400 text-slate-950', label: '✓ Neutralizado' },
  SHIELD: { bg: 'bg-sky-400 text-slate-950', label: '🛡️ Escudo x1' },
  WORKSTATION: { bg: 'bg-sky-500 text-slate-950', label: '🏗️ Nuevo Puesto' },
  AUDIT_FAILED: { bg: 'bg-slate-600 text-white', label: 'Auditoría fallida' },
  INSPECTION: { bg: 'bg-yellow-400 text-slate-950', label: '🔍 ¡Inspección!' },
  BENCHMARK: { bg: 'bg-teal-400 text-slate-950', label: '✨ Benchmarking' },
  EMERGENCY: { bg: 'bg-emerald-400 text-slate-950', label: '🚨 Evacuación' },
  STEAL: { bg: 'bg-purple-400 text-slate-950', label: '🔄 Subcontratado' },
  GLOBAL_INSPECTION: { bg: 'bg-amber-400 text-slate-950', label: '🏛️ Insp. Global' },
  MISS: { bg: 'bg-slate-700 text-slate-200', label: 'Sin efecto' },
};

function ResolutionShowcaseCard({
  play,
  index,
}: {
  play: ResolvedPlayVisual;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 180 + index * 140);
    return () => clearTimeout(t);
  }, [index]);

  const badge = OUTCOME_BADGE[play.outcome];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-200 max-w-[114px]">
        <span>{play.playerAvatar}</span>
        <span className="truncate">{play.playerName.replace(/^🤖\s*/, '')}</span>
      </div>

      <PlayingCard
        card={play.card}
        compact
        faceDown={!flipped}
        dealIndex={0}
        stampLabel={flipped ? play.outcomeLabel || badge.label : undefined}
        stampColor={badge.bg}
      />

      {play.targetName && (
        <span className="text-[9px] text-slate-400 truncate max-w-[110px]">
          → {play.targetName.replace(/^🤖\s*/, '')}
        </span>
      )}
    </motion.div>
  );
}

export function GameTable({
  view,
  isHost,
  isReady,
  seatedCard,
  stagedDiscardCards,
  hoveredZone,
  onCancelSeated,
  onConfirmDiscards,
  onClearDiscards,
  onCancelReady,
  onSkipBulletin,
}: GameTableProps) {
  const readyCount = view.players.filter((p) => p.connected && p.ready).length;
  const rivalCardsOnTable = Math.max(0, readyCount - (isReady ? 1 : 0));

  const isResolution = view.phase === 'RESOLUTION';
  const hasAccident =
    isResolution && view.roundBulletin.some((e) => e.type === 'ACCIDENT');
  const hasCert =
    isResolution && view.roundBulletin.some((e) => e.type === 'CERTIFIED');

  // Show up to 6 key resolved cards on table (always prioritizing local player's card + high-drama outcomes)
  const spotlightPlays = [...view.lastResolvedPlays]
    .sort((a, b) => {
      if (a.playerId === view.me?.id) return -1;
      if (b.playerId === view.me?.id) return 1;
      const weight = (o: ResolvedPlayVisual['outcome']) =>
        o === 'CERTIFIED' ? 0 : o === 'ACCIDENT' ? 1 : o === 'INSPECTION' ? 2 : 3;
      return weight(a.outcome) - weight(b.outcome);
    })
    .slice(0, 6);

  const deckLayers = Math.min(4, Math.max(1, Math.ceil(view.deckCount / 30)));
  const tableHighlighted = hoveredZone === 'TABLE';
  const discardHighlighted = hoveredZone === 'DISCARD';

  return (
    <motion.section
      animate={
        hasAccident
          ? { x: [0, -6, 6, -4, 4, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.45 }}
      className={`relative rounded-3xl border-4 p-3.5 sm:p-5 shadow-[inset_0_0_55px_rgba(0,0,0,0.75),0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-colors ${
        hasCert
          ? 'border-amber-400/60 bg-gradient-to-b from-amber-950/35 via-emerald-950/55 to-slate-950/95'
          : 'border-amber-900/45 bg-gradient-to-b from-emerald-950/60 via-slate-900/95 to-emerald-950/50'
      }`}
    >
      {/* Subtle tabletop felt blueprint lines */}
      <div className="pointer-events-none absolute inset-3 rounded-2xl border border-emerald-400/10" />

      {isResolution ? (
        /* ==========================================
           RESOLUTION TABLETOP CHOREOGRAPHY
           ========================================== */
        <div className="relative z-10 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-400/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm sm:text-base font-black text-white">
                  Mesa de Resolución · Ronda {view.round}
                </h2>
                <p className="text-[11px] text-emerald-200/80">
                  Las cartas se voltean en orden: 1º Puestos → 2º Escudos/ISO → 3º
                  Riesgos e Inspecciones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="font-mono text-xs font-black text-amber-300">
                  Siguiente ronda en {view.timeLeft}s
                </span>
                <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${Math.max(0, (view.timeLeft / 5) * 100)}%` }}
                  />
                </div>
              </div>
              {isHost && (
                <button
                  type="button"
                  onClick={onSkipBulletin}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1.5 text-xs shadow"
                >
                  <FastForward className="w-3.5 h-3.5" /> Continuar
                </button>
              )}
            </div>
          </div>

          {view.globalInspectionTriggered && (
            <div className="rounded-xl border border-amber-400/60 bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-100 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-300 shrink-0" />
              ¡Inspección General de Trabajo! +100 pts a empresas con todo protegido ·
              -50 pts si tienes riesgos activos.
            </div>
          )}

          {/* Flipped Cards on Table */}
          {spotlightPlays.length > 0 ? (
            <div className="flex flex-wrap items-start justify-center gap-3 py-1">
              {spotlightPlays.map((play, idx) => (
                <ResolutionShowcaseCard key={play.id} play={play} index={idx} />
              ))}
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-slate-300">
              Los equipos renovaron sus cartas y reordenaron su estrategia preventiva.
            </div>
          )}

          {/* Compact Event Ticker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {view.roundBulletin.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs flex items-start gap-2"
              >
                {ev.type === 'CERTIFIED' ? (
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : ev.type === 'ACCIDENT' || ev.type === 'RISK' ? (
                  <Flame className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="font-bold text-slate-100 truncate">{ev.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">
                    {ev.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ==========================================
           PLANNING TABLETOP (DECK + DROP ZONE + DISCARD)
           ========================================== */
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* LEFT: STACKED PHYSICAL DECK */}
          <div className="md:col-span-3 flex flex-row md:flex-col items-center justify-center gap-3">
            <div className="relative w-[84px] h-[118px] sm:w-[96px] sm:h-[136px]">
              {Array.from({ length: deckLayers }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    transform: `translate(${i * 2}px, ${-i * 2}px)`,
                  }}
                  className="absolute inset-0"
                >
                  <CardBackVisual compact />
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-950/90 border border-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-200">
                <Layers className="w-3 h-3 text-amber-400" />
                Mazo: {view.deckCount}
              </div>
              <p className="text-[10px] text-emerald-200/70 mt-0.5">
                Repone hasta 4 cartas
              </p>
            </div>
          </div>

          {/* CENTER: DEPLOYMENT TABLE DROP ZONE */}
          <div
            data-drop-zone="TABLE"
            className={`md:col-span-6 min-h-[175px] rounded-2xl border-2 border-dashed p-3.5 flex flex-col items-center justify-center gap-3 transition-all ${
              tableHighlighted
                ? 'border-amber-300 bg-amber-500/20 scale-[1.01] shadow-[0_0_25px_rgba(251,191,36,0.3)]'
                : seatedCard
                  ? 'border-sky-400/70 bg-sky-950/30'
                  : isReady
                    ? 'border-emerald-400/60 bg-emerald-950/30'
                    : 'border-emerald-400/25 bg-slate-950/35'
            }`}
          >
            <AnimatePresence mode="wait">
              {isReady ? (
                <motion.div
                  key="ready-table"
                  initial={{ scale: 0.8, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="flex flex-col sm:flex-row items-center gap-4"
                >
                  <div className="w-[88px] h-[126px] rotate-[-3deg] shadow-2xl">
                    <CardBackVisual compact />
                  </div>
                  <div className="text-center sm:text-left space-y-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
                      ✓ Carta colocada boca abajo
                    </span>
                    <p className="text-xs text-slate-300">
                      Tu jugada está segura sobre la mesa ({readyCount}/
                      {view.players.filter((p) => p.connected).length} listos).
                    </p>
                    <button
                      type="button"
                      onClick={onCancelReady}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-bold text-slate-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Recoger de la mesa
                    </button>
                  </div>
                </motion.div>
              ) : seatedCard ? (
                <motion.div
                  key="seated-card"
                  initial={{ scale: 0.85, y: 18, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="flex flex-col sm:flex-row items-center gap-3.5"
                >
                  <PlayingCard card={seatedCard} compact />
                  <div className="text-center sm:text-left space-y-1.5 max-w-[220px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 border border-sky-400/50 px-2.5 py-0.5 text-[11px] font-bold text-sky-200 animate-pulse">
                      Carta en mesa · Elige objetivo
                    </span>
                    <p className="text-xs text-slate-300">
                      {seatedCard.category === 'HAZARD' ||
                      (seatedCard.category === 'ACTION' &&
                        seatedCard.actionEffect !== 'EMERGENCY_PLAN')
                        ? 'Haz clic en un rival iluminado en el Radar superior.'
                        : 'Haz clic en uno de tus puestos iluminados abajo.'}
                    </p>
                    <button
                      type="button"
                      onClick={onCancelSeated}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-300"
                    >
                      <RotateCcw className="w-3 h-3" /> Devolver a la mano
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-2"
                >
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-100">
                    {tableHighlighted
                      ? '¡Suelta la carta aquí para jugarla!'
                      : 'Mesa de Despliegue PRL'}
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Arrastra una carta aquí para colocarla en la mesa, o llévala
                    directamente sobre un puesto o rival.
                  </p>

                  {/* Mini facedown fan of rivals' cards already on the table */}
                  {rivalCardsOnTable > 0 && (
                    <div className="pt-1 flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center -space-x-3">
                        {Array.from({
                          length: Math.min(8, rivalCardsOnTable),
                        }).map((_, idx) => (
                          <div
                            key={idx}
                            style={{ transform: `rotate(${(idx - 3) * 4}deg)` }}
                            className="w-8 h-11 rounded border border-amber-400/50 bg-slate-900 shadow-md flex items-center justify-center"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-300">
                        {rivalCardsOnTable} carta(s) rival(es) sobre la mesa
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: DISCARD PILE DROP ZONE */}
          <div
            data-drop-zone="DISCARD"
            className={`md:col-span-3 rounded-2xl border-2 border-dashed p-3 flex flex-col items-center justify-center gap-2 transition-all min-h-[168px] ${
              discardHighlighted
                ? 'border-red-400 bg-red-500/20 scale-[1.02]'
                : stagedDiscardCards.length > 0
                  ? 'border-amber-400 bg-amber-500/15'
                  : 'border-slate-700/80 bg-slate-950/45'
            }`}
          >
            {stagedDiscardCards.length > 0 ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-[84px] h-[118px]">
                  <div className="rotate-6">
                    <PlayingCard
                      card={stagedDiscardCards[stagedDiscardCards.length - 1]}
                      compact
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={onConfirmDiscards}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-2.5 py-1 text-[11px] shadow"
                  >
                    <RefreshCw className="w-3 h-3" /> Renovar (
                    {stagedDiscardCards.length})
                  </button>
                  <button
                    type="button"
                    onClick={onClearDiscards}
                    className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300"
                  >
                    Devolver
                  </button>
                </div>
              </div>
            ) : view.topDiscardCard ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="rotate-3 opacity-90">
                  <PlayingCard card={view.topDiscardCard} compact />
                </div>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Descarte ({view.discardCount})
                </span>
              </div>
            ) : (
              <div className="text-center space-y-1.5 py-4">
                <div className="w-12 h-16 mx-auto rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-slate-300">
                  Pila de Descarte
                </div>
                <p className="text-[10px] text-slate-500">
                  Suelta cartas aquí para renovar mano
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
