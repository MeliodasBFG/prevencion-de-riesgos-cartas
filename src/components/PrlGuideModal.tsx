'use client';

import {
  AlertTriangle,
  Award,
  Building2,
  Flame,
  Hand,
  Landmark,
  RefreshCw,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function PrlGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, rotateX: 8 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-amber-500/60 bg-[#fcf8ec] text-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.65)] p-5 sm:p-7 relative"
      >
        {/* Red bookmark ribbon corner */}
        <div className="absolute top-0 right-10 w-6 h-8 bg-red-600 rounded-b-md shadow-md flex items-end justify-center pb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-amber-200 pb-3.5">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-700">
              Hoja Rápida de Reglas
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ¿Cómo se juega a Alerta Cero?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-slate-700 transition-colors"
            aria-label="Cerrar hoja de instrucciones"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* 1. Objective */}
          <div className="rounded-xl bg-amber-100/80 border border-amber-300 px-4 py-3 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-600 shrink-0" />
            <p className="text-sm font-bold text-slate-800">
              Gana quien consiga primero{' '}
              <span className="text-amber-800 underline decoration-amber-500 decoration-2">
                4 Puestos Certificados ISO 45001
              </span>{' '}
              (o más puntos al acabarse las rondas).
            </p>
          </div>

          {/* 2. 3 Simple Steps */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Cada ronda en 3 pasos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
                <div className="flex items-center gap-2 font-black text-sky-700 text-sm mb-1">
                  <Hand className="w-4 h-4" /> 1. Arrastra 1 carta
                </div>
                <p className="text-xs text-slate-600">
                  Ponla boca abajo en la <strong>Mesa</strong> (o arrástrala a tu puesto /
                  un rival). Si no te sirven, tíralas a <strong>Descarte</strong>.
                </p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
                <div className="flex items-center gap-2 font-black text-emerald-700 text-sm mb-1">
                  <Zap className="w-4 h-4" /> 2. Se voltean todas
                </div>
                <p className="text-xs text-slate-600">
                  Todos juegan a la vez: primero nacen puestos, luego protegen escudos y al
                  final caen los riesgos.
                </p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
                <div className="flex items-center gap-2 font-black text-amber-700 text-sm mb-1">
                  <RefreshCw className="w-4 h-4" /> 3. Roba hasta 4
                </div>
                <p className="text-xs text-slate-600">
                  El mazo reparte cartas nuevas. Cada 3 rondas hay{' '}
                  <strong>Inspección General</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* 3. The 4 Card Types */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Tipos de Cartas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5 flex items-start gap-2.5">
                <Building2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-sky-900">
                    Puesto de Trabajo
                  </div>
                  <p className="text-[11px] text-sky-800">
                    Abre uno de tus 4 sectores (Obra, Químico, Planta u Oficina).
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-emerald-900">
                    Escudo / EPI
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Quita un riesgo o añade 1 escudo.{' '}
                    <strong>Con 2 escudos + Test PRL = ¡ISO 45001!</strong>
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 flex items-start gap-2.5">
                <Flame className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-red-900">
                    Riesgo Laboral
                  </div>
                  <p className="text-[11px] text-red-800">
                    Ataca a un rival. Rompe su escudo o lo deja en riesgo.{' '}
                    <strong>2 riesgos seguidos destruyen el puesto.</strong>
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 flex items-start gap-2.5">
                <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-amber-900">
                    Gestión e Inspección
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Inspección (+100 pts y bloquea carta), Emergencia (limpia riesgos),
                    Benchmarking o Subcontratar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Radar Colors + Golden Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl bg-white border border-slate-200 p-3">
              <div className="text-xs font-black text-slate-700 mb-2">
                Colores de los Puestos
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                  ● Gris: Vacío
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                  ● Azul: Sano
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● Verde: 1 Escudo
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-400">
                  ★ Dorado: ISO 45001
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                  ▲ Rojo: En Riesgo
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 text-slate-100 p-3 flex flex-col justify-center gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Un puesto <strong>ISO 45001</strong> es inmune para siempre (+300 pts).</span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Cada 3 rondas: <strong>+100 pts</strong> si todo protegido, <strong>-50</strong> si hay riesgos.</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Si se acaba el reloj, pasas turno automáticamente.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-sm shadow transition-colors"
          >
            ¡Listo, a jugar!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
