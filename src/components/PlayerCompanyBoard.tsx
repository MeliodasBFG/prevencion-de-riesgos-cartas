'use client';

import {
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { SECTOR_META } from '@/data/cardTemplates';
import {
  CardInstance,
  ConcreteSector,
  CONCRETE_SECTORS,
  PlayerState,
} from '@/types/game';
import { getWorkstationVisualStatus, SectorIcon } from './SectorIcon';

interface PlayerCompanyBoardProps {
  me: PlayerState;
  selectedCard: CardInstance | null;
  validSelfSectors: ConcreteSector[];
  selectedSelfSector: ConcreteSector | null;
  hoveredSelfSector?: ConcreteSector | null;
  awaitingBenchmarkTarget: boolean;
  onSelectSelfSector: (sector: ConcreteSector) => void;
}

export function PlayerCompanyBoard({
  me,
  selectedCard,
  validSelfSectors,
  selectedSelfSector,
  hoveredSelfSector,
  awaitingBenchmarkTarget,
  onSelectSelfSector,
}: PlayerCompanyBoardProps) {
  const certifiedCount = CONCRETE_SECTORS.filter(
    (s) => me.workstations[s].certified
  ).length;

  const isSelfTargetingCard =
    selectedCard?.category === 'WORKSTATION' ||
    selectedCard?.category === 'PREVENTION' ||
    (selectedCard?.category === 'ACTION' &&
      selectedCard.actionEffect === 'BENCHMARKING' &&
      awaitingBenchmarkTarget);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{me.avatar}</span>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Tu Empresa: {me.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-bold text-amber-300">
                <Award className="w-3.5 h-3.5" /> {certifiedCount}/4 ISO 45001
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Puntuación de Seguridad:{' '}
              <strong className="text-emerald-300 font-mono">{me.score} pts</strong>
              {me.lastActionSummary && (
                <span className="ml-2 text-slate-500">
                  · Última ronda: {me.lastActionSummary}
                </span>
              )}
            </p>
          </div>
        </div>

        {isSelfTargetingCard && validSelfSectors.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
            {awaitingBenchmarkTarget
              ? 'Paso 2: Elige en qué puesto propio aplicar la medida'
              : 'Haz clic en uno de tus puestos iluminados'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {CONCRETE_SECTORS.map((sector) => {
          const slot = me.workstations[sector];
          const meta = SECTOR_META[sector];
          const visual = getWorkstationVisualStatus(slot);
          const isValid =
            isSelfTargetingCard && validSelfSectors.includes(sector);
          const isSelected = selectedSelfSector === sector;

          let cardTheme = 'border-slate-800 bg-slate-950/70';
          if (slot.certified) {
            cardTheme =
              'border-amber-400/70 bg-gradient-to-br from-amber-500/15 via-slate-950 to-yellow-500/10 shadow-[0_0_20px_rgba(251,191,36,0.18)]';
          } else if (slot.inRisk) {
            cardTheme =
              'border-red-500/70 bg-gradient-to-br from-red-500/15 to-slate-950';
          } else if (slot.shields >= 1) {
            cardTheme =
              'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-slate-950';
          } else if (slot.occupied) {
            cardTheme =
              'border-sky-500/40 bg-gradient-to-br from-sky-500/10 to-slate-950';
          }

          const isDragHovered = isValid && hoveredSelfSector === sector;

          if (isDragHovered) {
            cardTheme =
              'border-amber-300 ring-4 ring-amber-400/90 bg-emerald-500/25 scale-[1.03]';
          } else if (isSelected) {
            cardTheme =
              'border-yellow-300 ring-2 ring-yellow-400 bg-amber-500/15';
          } else if (isValid) {
            cardTheme +=
              ' ring-2 ring-emerald-400/80 cursor-pointer hover:bg-emerald-950/30 hover:scale-[1.01]';
          }

          return (
            <button
              key={sector}
              type="button"
              data-drop-self-sector={isValid ? sector : undefined}
              disabled={!isValid}
              onClick={() => isValid && onSelectSelfSector(sector)}
              className={`text-left rounded-xl border p-3 transition-all relative overflow-hidden ${cardTheme} disabled:cursor-default`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.accentClass}`}
                  >
                    <SectorIcon sector={sector} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">
                      {meta.workstationTitle}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {meta.shortLabel}
                    </div>
                  </div>
                </div>

                {slot.certified ? (
                  <Award className="w-5 h-5 text-amber-300 shrink-0" />
                ) : slot.inRisk ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
                ) : slot.shields >= 1 ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : slot.occupied ? (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                ) : (
                  <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </div>

              {/* Status Bar & Shield Progress */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${visual.dotClass}`}
                >
                  {visual.label}
                </span>

                {slot.occupied && !slot.certified && !slot.inRisk && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-medium">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    {slot.shields}/2 Escudos
                  </span>
                )}
                {slot.occupied && slot.inRisk && (
                  <span className="text-[10px] font-bold text-red-300">
                    ¡2º riesgo = Baja!
                  </span>
                )}
                {slot.certified && (
                  <span className="text-[10px] font-bold text-amber-300">
                    Inmune · +300 pts
                  </span>
                )}
                {!slot.occupied && (
                  <span className="text-[10px] text-slate-500">
                    Sin desplegar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
