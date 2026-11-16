'use client';

import { useState } from 'react';
import {
  Award,
  BookMarked,
  CheckCircle2,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SECTOR_META } from '@/data/cardTemplates';
import { soundEngine } from '@/lib/soundEffects';
import { ConcreteSector, PrlQuestion } from '@/types/game';
import { SectorIcon } from './SectorIcon';

interface PrlQuizModalProps {
  question: PrlQuestion;
  targetSector: ConcreteSector;
  onComplete: (correct: boolean) => void;
  onCancel: () => void;
}

export function PrlQuizModal({
  question,
  targetSector,
  onComplete,
  onCancel,
}: PrlQuizModalProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const answered = selectedIdx !== null;
  const isCorrect = selectedIdx === question.correctIndex;
  const sectorMeta = SECTOR_META[targetSector];

  const handleChoose = (idx: number) => {
    if (answered) return;
    setSelectedIdx(idx);
    if (idx === question.correctIndex) {
      soundEngine.playIsoCertified();
    } else {
      soundEngine.playError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl border border-amber-400/50 bg-slate-900 text-slate-100 shadow-2xl p-5 sm:p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Auditoría de Certificación ISO 45001
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Reto Rápido PRL · {sectorMeta.workstationTitle}</span>
              </h2>
            </div>
          </div>

          {!answered && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Cancelar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${sectorMeta.badgeClass}`}
          >
            <SectorIcon sector={targetSector} className="w-3.5 h-3.5" />
            {sectorMeta.label}
          </span>
          <span className="text-slate-400">
            Si aciertas, el puesto queda <strong className="text-amber-300">Certificado (+300 pts e inmune)</strong>.
          </span>
        </div>

        {/* Question */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-4">
          <p className="text-sm sm:text-base font-bold text-white leading-snug">
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const isThisSelected = selectedIdx === idx;
            const isRightOption = idx === question.correctIndex;

            let btnStyle =
              'border-slate-700 bg-slate-950/70 hover:border-amber-400/70 hover:bg-slate-800 text-slate-200';
            if (answered) {
              if (isRightOption) {
                btnStyle =
                  'border-emerald-400 bg-emerald-500/20 text-emerald-100';
              } else if (isThisSelected && !isRightOption) {
                btnStyle = 'border-red-400 bg-red-500/20 text-red-100';
              } else {
                btnStyle = 'border-slate-800 bg-slate-950/40 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleChoose(idx)}
                className={`w-full text-left rounded-xl border p-3 text-xs sm:text-sm font-medium transition-all flex items-start gap-2.5 ${btnStyle}`}
              >
                <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-relaxed">{opt}</span>
                {answered && isRightOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {answered && isThisSelected && !isRightOption && (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback + Explanation */}
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 space-y-2 ${
              isCorrect
                ? 'border-emerald-500/50 bg-emerald-500/15'
                : 'border-red-500/45 bg-red-500/15'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-sm font-extrabold flex items-center gap-1.5 ${
                  isCorrect ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {isCorrect ? (
                  <>
                    <Award className="w-4 h-4" /> ¡Auditoría Superada! ISO 45001
                    desbloqueada (+300 pts)
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" /> Auditoría No Superada (el
                    puesto mantiene 1 escudo)
                  </>
                )}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded-md border border-slate-700">
                <BookMarked className="w-3 h-3 text-amber-400" />
                {question.reference}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {question.explanation}
            </p>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => onComplete(isCorrect)}
                className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-extrabold transition-colors ${
                  isCorrect
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                Confirmar y Enviar Jugada
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
