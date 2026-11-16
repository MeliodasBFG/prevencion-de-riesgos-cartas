'use client';

import {
  AlertTriangle,
  Award,
  Building2,
  FastForward,
  Flame,
  Landmark,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RoundEvent, RoundEventType } from '@/types/game';

interface RoundBulletinModalProps {
  round: number;
  timeLeft: number;
  events: RoundEvent[];
  globalInspectionTriggered: boolean;
  isHost: boolean;
  onSkip: () => void;
}

const EVENT_BADGE: Record<
  RoundEventType,
  { color: string; icon: typeof Award }
> = {
  CERTIFIED: {
    color: 'border-amber-400/60 bg-amber-500/15 text-amber-200',
    icon: Award,
  },
  ACCIDENT: {
    color: 'border-red-500/70 bg-red-500/20 text-red-200',
    icon: Flame,
  },
  RISK: {
    color: 'border-orange-500/60 bg-orange-500/15 text-orange-200',
    icon: AlertTriangle,
  },
  BLOCKED: {
    color: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200',
    icon: ShieldCheck,
  },
  PREVENTED: {
    color: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200',
    icon: ShieldCheck,
  },
  SHIELD: {
    color: 'border-sky-500/50 bg-sky-500/15 text-sky-200',
    icon: ShieldCheck,
  },
  WORKSTATION: {
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
    icon: Building2,
  },
  AUDIT_FAILED: {
    color: 'border-slate-600 bg-slate-800/80 text-slate-300',
    icon: AlertTriangle,
  },
  INSPECTION: {
    color: 'border-yellow-500/50 bg-yellow-500/15 text-yellow-200',
    icon: Search,
  },
  BENCHMARK: {
    color: 'border-teal-500/50 bg-teal-500/15 text-teal-200',
    icon: Sparkles,
  },
  EMERGENCY: {
    color: 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100',
    icon: ShieldCheck,
  },
  STEAL: {
    color: 'border-purple-500/60 bg-purple-500/15 text-purple-200',
    icon: Building2,
  },
  GLOBAL_INSPECTION: {
    color: 'border-amber-300 bg-gradient-to-r from-amber-500/25 to-yellow-500/15 text-amber-100',
    icon: Landmark,
  },
};

export function RoundBulletinModal({
  round,
  timeLeft,
  events,
  globalInspectionTriggered,
  isHost,
  onSkip,
}: RoundBulletinModalProps) {
  const progressPct = Math.max(0, Math.min(100, (timeLeft / 5) * 100));

  // Prioritize highlighting major events first (max 10 items so 20-player bulletin stays crisp)
  const prioritized = [...events].sort((a, b) => {
    const rank = (t: RoundEventType) => {
      if (t === 'GLOBAL_INSPECTION') return 0;
      if (t === 'CERTIFIED') return 1;
      if (t === 'ACCIDENT') return 2;
      if (t === 'BLOCKED' || t === 'EMERGENCY') return 3;
      if (t === 'INSPECTION' || t === 'STEAL') return 4;
      if (t === 'RISK' || t === 'PREVENTED') return 5;
      return 6;
    };
    return rank(a.type) - rank(b.type);
  });

  const visibleEvents = prioritized.slice(0, 10);
  const hiddenCount = Math.max(0, prioritized.length - visibleEvents.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                Resolución Simultánea Completada
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Boletín de la Ronda {round}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-sm font-bold text-amber-300">
              {timeLeft}s
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {globalInspectionTriggered && (
          <div className="rounded-xl border border-amber-400/70 bg-amber-500/15 p-3 text-xs sm:text-sm font-semibold text-amber-200 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-300 shrink-0" />
            <span>
              ¡Cada 3 rondas actúa la Inspección General de Trabajo! Empresas con
              riesgos activos pierden -50 pts; las 100% protegidas ganan +100 pts.
            </span>
          </div>
        )}

        <div className="space-y-2">
          {visibleEvents.map((ev) => {
            const cfg = EVENT_BADGE[ev.type];
            const Icon = cfg.icon;
            return (
              <div
                key={ev.id}
                className={`rounded-xl border p-3 flex items-start gap-3 ${cfg.color}`}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-extrabold">
                    {ev.title}
                  </div>
                  <div className="text-xs opacity-90 leading-snug mt-0.5">
                    {ev.description}
                  </div>
                </div>
              </div>
            );
          })}

          {hiddenCount > 0 && (
            <p className="text-center text-xs text-slate-400 pt-1">
              + {hiddenCount} suceso(s) menores adicionales registrados en los tableros.
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Manos repuestas a 4 cartas. Siguiente fase en breve...
          </span>
          {isHost && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" /> Continuar Ya
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
