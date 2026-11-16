'use client';

import { Crown, FastForward, Pause, Play, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { GameConfig, GamePhase, RoundDuration } from '@/types/game';

interface HostControlBarProps {
  phase: GamePhase;
  paused: boolean;
  config: GameConfig;
  onTogglePause: () => void;
  onChangeDuration: (duration: RoundDuration) => void;
  onForceResolve: () => void;
}

const DURATIONS: { value: RoundDuration; label: string }[] = [
  { value: 20, label: '20s' },
  { value: 35, label: '35s' },
  { value: 60, label: '60s' },
  { value: 0, label: 'Sin límite' },
];

export function HostControlBar({
  phase,
  paused,
  config,
  onTogglePause,
  onChangeDuration,
  onForceResolve,
}: HostControlBarProps) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="relative flex items-center gap-1.5 rounded-xl border border-amber-500/35 bg-slate-900/90 px-2.5 py-1.5 shadow-lg">
      <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300 pr-1 border-r border-slate-700">
        <Crown className="w-3.5 h-3.5" /> Host
      </span>

      {phase === 'PLANNING' && (
        <>
          <button
            type="button"
            onClick={onTogglePause}
            title={paused ? 'Reanudar reloj' : 'Pausar reloj'}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              paused
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {paused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reanudar</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pausar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onForceResolve}
            title="Resolver la ronda inmediatamente sin esperar a jugadores inactivos"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 text-xs transition-colors shadow-sm"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Resolver Ronda Ahora</span>
          </button>
        </>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((o) => !o)}
          title="Ajustar duración de ronda"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 text-xs text-slate-300"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {config.roundDuration === 0 ? '∞' : `${config.roundDuration}s`}
          </span>
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-40">
            <p className="text-[11px] font-semibold text-slate-400 uppercase px-2 py-1">
              Duración de ronda
            </p>
            <div className="space-y-1">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => {
                    onChangeDuration(d.value);
                    setOpenMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    config.roundDuration === d.value
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{d.label}</span>
                  {config.roundDuration === d.value && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
