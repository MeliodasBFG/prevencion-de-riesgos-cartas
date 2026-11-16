'use client';

import { useState } from 'react';
import {
  Award,
  Bot,
  CheckCircle2,
  Clock,
  Crosshair,
  WifiOff,
} from 'lucide-react';
import { SECTOR_META } from '@/data/cardTemplates';
import { getCertifiedCount } from '@/lib/gameEngine';
import {
  CardInstance,
  ConcreteSector,
  CONCRETE_SECTORS,
  PublicPlayerSummary,
} from '@/types/game';
import { SectorIcon, WorkstationMiniBadge } from './SectorIcon';

interface RivalRadarProps {
  rivals: PublicPlayerSummary[];
  selectedCard: CardInstance | null;
  validRivalTargets: { playerId: string; sector: ConcreteSector }[];
  validBenchmarkSources: { playerId: string; sector: ConcreteSector }[];
  selectedTarget: { playerId: string; sector: ConcreteSector } | null;
  selectedBenchmarkSource: { playerId: string; sector: ConcreteSector } | null;
  onSelectRivalTarget: (playerId: string, sector: ConcreteSector) => void;
  onSelectBenchmarkSource: (playerId: string, sector: ConcreteSector) => void;
}

export function RivalRadar({
  rivals,
  selectedCard,
  validRivalTargets,
  validBenchmarkSources,
  selectedTarget,
  selectedBenchmarkSource,
  onSelectRivalTarget,
  onSelectBenchmarkSource,
}: RivalRadarProps) {
  const [expandedRivalId, setExpandedRivalId] = useState<string | null>(null);

  const isBenchmarkMode =
    selectedCard?.category === 'ACTION' &&
    selectedCard.actionEffect === 'BENCHMARKING';
  const isHazardMode = selectedCard?.category === 'HAZARD';
  const isInspectionMode =
    selectedCard?.category === 'ACTION' &&
    selectedCard.actionEffect === 'INSPECTION_SURPRISE';
  const isSubcontractMode =
    selectedCard?.category === 'ACTION' &&
    selectedCard.actionEffect === 'SAFE_SUBCONTRACT';

  const targetingRivals =
    isHazardMode || isInspectionMode || isSubcontractMode || isBenchmarkMode;

  const activeTargetsList = isBenchmarkMode
    ? validBenchmarkSources
    : validRivalTargets;

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-amber-400" />
            Radar de Empresas Rivales ({rivals.length})
          </h2>
          {targetingRivals && activeTargetsList.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              {isHazardMode
                ? 'Haz clic en un rival resaltado para atacar'
                : isBenchmarkMode
                  ? 'Paso 1: Haz clic en un escudo rival para copiar'
                  : isInspectionMode
                    ? 'Elige un rival para Inspección Sorpresa'
                    : 'Haz clic en el puesto rival a subcontratar'}
            </span>
          )}
        </div>

        {/* Compact Color Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 border border-slate-500" />
            Vacío
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/40 border border-sky-400" />
            Sano
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-400" />
            Protegido x1
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/60 border border-amber-300" />
            ISO 45001
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/60 border border-red-400" />
            En Riesgo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {rivals.map((rival) => {
          const validSectors = activeTargetsList
            .filter((t) => t.playerId === rival.id)
            .map((t) => t.sector);
          const isValidTarget = targetingRivals && validSectors.length > 0;
          const isSelected = isBenchmarkMode
            ? selectedBenchmarkSource?.playerId === rival.id
            : selectedTarget?.playerId === rival.id;

          const certs = getCertifiedCount(rival);
          const showSectorPicker =
            isValidTarget &&
            expandedRivalId === rival.id &&
            validSectors.length > 1 &&
            !isInspectionMode;

          const handleCardClick = () => {
            if (!isValidTarget) return;
            if (isInspectionMode) {
              onSelectRivalTarget(rival.id, validSectors[0]);
              setExpandedRivalId(null);
              return;
            }
            if (validSectors.length === 1) {
              if (isBenchmarkMode) {
                onSelectBenchmarkSource(rival.id, validSectors[0]);
              } else {
                onSelectRivalTarget(rival.id, validSectors[0]);
              }
              setExpandedRivalId(null);
              return;
            }
            // Multiple valid sectors: toggle inline sector selector
            setExpandedRivalId((prev) => (prev === rival.id ? null : rival.id));
          };

          const borderClass = isSelected
            ? 'border-yellow-300 ring-2 ring-yellow-400/80 bg-amber-500/15'
            : isValidTarget
              ? isHazardMode
                ? 'border-red-400/90 ring-2 ring-red-500/60 bg-red-950/25 cursor-pointer hover:bg-red-950/40'
                : 'border-amber-400/90 ring-2 ring-amber-400/60 bg-amber-950/25 cursor-pointer hover:bg-amber-950/40'
              : 'border-slate-800 bg-slate-900/80';

          return (
            <div
              key={rival.id}
              onClick={handleCardClick}
              role={isValidTarget ? 'button' : undefined}
              tabIndex={isValidTarget ? 0 : undefined}
              onKeyDown={(e) => {
                if (isValidTarget && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleCardClick();
                }
              }}
              className={`rounded-xl border p-2.5 transition-all select-none ${borderClass}`}
            >
              {/* Top row: Avatar + Name + Ready */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-lg leading-none shrink-0">
                    {rival.avatar}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {rival.name.replace(/^🤖\s*/, '')}
                      </span>
                      {rival.isBot && (
                        <Bot className="w-3 h-3 text-sky-400 shrink-0" />
                      )}
                      {!rival.connected && !rival.isBot && (
                        <WifiOff className="w-3 h-3 text-red-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono font-semibold text-amber-300">
                        {rival.score} pts
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-amber-200/80">
                        <Award className="w-2.5 h-2.5" />
                        {certs}/4
                      </span>
                    </div>
                  </div>
                </div>

                {rival.ready ? (
                  <span
                    title="Listo"
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span
                    title="Pensando..."
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-500 shrink-0"
                  >
                    <Clock className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* 4 Mini Sector Indicators */}
              <div className="mt-2 flex items-center justify-between gap-1">
                {CONCRETE_SECTORS.map((sector) => {
                  const slot = rival.workstations[sector];
                  const sectorValid =
                    isValidTarget && validSectors.includes(sector);
                  const sectorSelected =
                    isSelected &&
                    (isBenchmarkMode
                      ? selectedBenchmarkSource?.sector === sector
                      : selectedTarget?.sector === sector);

                  return (
                    <WorkstationMiniBadge
                      key={sector}
                      slot={slot}
                      highlighted={sectorValid || sectorSelected}
                      onClick={
                        sectorValid
                          ? () => {
                              if (isBenchmarkMode) {
                                onSelectBenchmarkSource(rival.id, sector);
                              } else {
                                onSelectRivalTarget(rival.id, sector);
                              }
                              setExpandedRivalId(null);
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>

              {/* Inline quick-picker when rival has >1 valid sector */}
              {showSectorPicker && (
                <div className="mt-2 pt-2 border-t border-slate-700/80 flex flex-wrap gap-1">
                  {validSectors.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isBenchmarkMode) {
                          onSelectBenchmarkSource(rival.id, s);
                        } else {
                          onSelectRivalTarget(rival.id, s);
                        }
                        setExpandedRivalId(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-amber-400/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-200 transition-colors"
                    >
                      <SectorIcon sector={s} className="w-3 h-3" />
                      {SECTOR_META[s].shortLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
