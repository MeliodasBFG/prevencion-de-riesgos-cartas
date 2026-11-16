'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Hand,
  Layers,
  ShieldCheck,
  Swords,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CardInstance, GamePhase } from '@/types/game';
import { InstructionBookButton } from './InstructionBookButton';

interface GameInstructionsPanelProps {
  phase: GamePhase;
  isReady: boolean;
  selectedCard: CardInstance | null;
  awaitingBenchmarkTarget: boolean;
  stagedDiscardCount: number;
  onOpenBook: () => void;
}

export function GameInstructionsPanel({
  phase,
  isReady,
  selectedCard,
  awaitingBenchmarkTarget,
  stagedDiscardCount,
  onOpenBook,
}: GameInstructionsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  let coachMessage =
    'Arrastra una carta de tu abanico hacia la Mesa, tus Puestos o la pila de Descarte (o tócala para apuntar).';

  if (phase === 'RESOLUTION') {
    coachMessage =
      'Resolución en curso: observa cómo se voltean las cartas sobre la mesa en orden de prioridad.';
  } else if (isReady) {
    coachMessage =
      'Tu carta ya está boca abajo sobre la mesa. Esperando a que el resto de empresas terminen...';
  } else if (stagedDiscardCount > 0) {
    coachMessage = `Tienes ${stagedDiscardCount} carta(s) en la pila de descarte. Arrastra más o pulsa "Confirmar Descarte" en la mesa.`;
  } else if (selectedCard) {
    if (
      selectedCard.category === 'WORKSTATION' ||
      selectedCard.category === 'PREVENTION'
    ) {
      coachMessage = `Carta "${selectedCard.title}" preparada: suéltala o toca uno de tus puestos iluminados.`;
    } else if (
      selectedCard.category === 'ACTION' &&
      selectedCard.actionEffect === 'BENCHMARKING'
    ) {
      coachMessage = awaitingBenchmarkTarget
        ? 'Paso 2: Toca o arrastra hacia uno de tus propios puestos para aplicar la protección copiada.'
        : 'Paso 1: Toca en el Radar a un rival que tenga un puesto Verde (Escudo) o Dorado (ISO).';
    } else {
      coachMessage = `Carta "${selectedCard.title}" lista en mesa: elige un rival iluminado en el Radar superior.`;
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
            <Compass className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 block leading-none">
              Guía de Turno
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate sm:whitespace-normal">
              {coachMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <InstructionBookButton onClick={onOpenBook} compact />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-slate-300"
          >
            <span>{expanded ? 'Ocultar pasos' : 'Ver pasos'}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 text-slate-300">
                <Hand className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Jugar:</strong> Arrastra 1 carta a la Mesa, Puesto o Rival.
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Orden:</strong> 1º Puestos · 2º Escudos/ISO · 3º Riesgos.
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 text-slate-300">
                <span className="inline-flex items-center gap-0.5 text-sky-400 shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                  <Swords className="w-3.5 h-3.5 text-red-400" />
                </span>
                <span>
                  <strong>Meta:</strong> 4 puestos <strong>ISO 45001</strong> (2 escudos +
                  test).
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
