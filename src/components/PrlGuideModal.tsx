'use client';

import {
  Award,
  BookOpen,
  Layers,
  ShieldCheck,
  Swords,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function PrlGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Manual Rápido de Misión · Alerta Cero ISO 45001
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Basado en la Ley 31/1995 de PRL, Reales Decretos técnicos e ISO 45001:2018
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar guía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="font-bold text-amber-300 flex items-center gap-2 mb-1">
              <Award className="w-4 h-4" /> Objetivo de la Misión
            </h3>
            <p className="text-slate-200 leading-relaxed">
              Sé el primero en conseguir{' '}
              <strong className="text-amber-300">
                4 Puestos de Trabajo Certificados ISO 45001
              </strong>{' '}
              (Obra en Altura, Laboratorio Químico, Planta Industrial y Oficina/PVD) o
              alcanza la mayor Puntuación de Seguridad Laboral al terminar las rondas
              pactadas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-semibold text-sky-300 flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4" /> Turnos Simultáneos (3 Fases)
              </h4>
              <ol className="space-y-1.5 text-slate-300 text-xs sm:text-sm list-decimal list-inside">
                <li>
                  <strong>Planificación:</strong> Eliges en secreto 1 carta (y su objetivo) o
                  activas <em>Descartar y Renovar</em>.
                </li>
                <li>
                  <strong>Resolución Simultánea:</strong> 1º Puestos nuevos → 2º EPIs y
                  Certificaciones ISO → 3º Riesgos e Inspecciones.
                </li>
                <li>
                  <strong>Reposición e Inspección Global:</strong> Robas hasta 4 cartas.{' '}
                  <span className="text-amber-300">Cada 3 rondas</span> hay{' '}
                  <strong>Inspección General</strong> (+100 pts si todo está protegido, -50 pts
                  si tienes riesgos activos).
                </li>
              </ol>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4" /> Código de Colores del Radar
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-500 inline-block" />
                  <span className="text-slate-300">
                    <strong>Gris:</strong> Puesto vacío (sin desplegar).
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-sky-500/40 border border-sky-400 inline-block" />
                  <span className="text-slate-300">
                    <strong>Azul:</strong> Puesto Sano (sin escudo ni riesgo).
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500/40 border border-emerald-400 inline-block" />
                  <span className="text-slate-300">
                    <strong>Verde:</strong> Protegido x1 (absorbe el próximo riesgo).
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-400/60 border border-amber-300 inline-block" />
                  <span className="text-amber-200">
                    <strong>Dorado brillante:</strong> Certificado ISO 45001 (+300 pts, inmune).
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-red-500/60 border border-red-400 animate-pulse inline-block" />
                  <span className="text-red-300">
                    <strong>Rojo parpadeante:</strong> En Riesgo (un 2º riesgo destruye el puesto).
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4" /> Prevención y EPIs
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sobre puesto <strong>En Riesgo</strong>: lo neutraliza. Sobre puesto{' '}
                <strong>Sano</strong>: añade 1 Escudo. Con el{' '}
                <strong>2º Escudo</strong> desbloqueas un{' '}
                <strong>Reto Test de PRL</strong> para certificar{' '}
                <strong>ISO 45001</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3.5">
              <h4 className="font-semibold text-red-300 flex items-center gap-1.5 mb-1">
                <Swords className="w-4 h-4" /> Riesgos Laborales
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lánzalos al sector correspondiente de cualquier rival (salvo ISO 45001).
                Rompe 1 escudo EPI, o deja <strong>En Riesgo</strong>. Dos riesgos
                acumulados causan <strong>Baja / Siniestro</strong> y destruyen el puesto.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
              <h4 className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4" /> Inspección y Gestión
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Inspección Sorpresa</strong> (+100 pts y bloquea carta si tiene
                riesgos), <strong>Benchmarking</strong> (copia protección rival),{' '}
                <strong>Plan de Emergencia</strong> (limpia todos tus riesgos) y{' '}
                <strong>Subcontratación</strong> (roba puesto no certificado).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors"
          >
            ¡Entendido, volver a la misión!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
