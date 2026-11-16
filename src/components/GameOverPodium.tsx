'use client';

import { useEffect } from 'react';
import {
  Award,
  Bot,
  CheckCircle2,
  LogOut,
  Medal,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCertifiedCount, getStandings } from '@/lib/gameEngine';
import { soundEngine } from '@/lib/soundEffects';
import { ClientGameView } from '@/types/game';

interface GameOverPodiumProps {
  view: ClientGameView;
  isHost: boolean;
  onReturnToLobby: () => void;
  onLeaveRoom: () => void;
}

export function GameOverPodium({
  view,
  isHost,
  onReturnToLobby,
  onLeaveRoom,
}: GameOverPodiumProps) {
  const standings = getStandings(view.players);
  const top3 = standings.slice(0, 3);

  useEffect(() => {
    soundEngine.playVictory();

    let cancelled = false;
    void import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return;
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        if (cancelled) return;
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 450);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const podiumOrder =
    top3.length === 3
      ? [
          { player: top3[1], rank: 2, height: 'h-28', badge: '🥈 2º Puesto', color: 'border-slate-400/60 bg-slate-800/80 text-slate-200' },
          { player: top3[0], rank: 1, height: 'h-36', badge: '🥇 Campeón PRL', color: 'border-amber-400 bg-gradient-to-b from-amber-500/25 to-slate-900 text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.25)]' },
          { player: top3[2], rank: 3, height: 'h-24', badge: '🥉 3º Puesto', color: 'border-orange-500/50 bg-orange-950/30 text-orange-200' },
        ]
      : top3.map((p, i) => ({
          player: p,
          rank: i + 1,
          height: i === 0 ? 'h-32' : 'h-24',
          badge: i === 0 ? '🥇 Campeón PRL' : '🥈 2º Puesto',
          color:
            i === 0
              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
              : 'border-slate-500 bg-slate-800/80 text-slate-200',
        }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-3 py-6 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Victory Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-400/50 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-6 text-center shadow-2xl space-y-2"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Trophy className="w-4 h-4" /> Misión Finalizada · Ronda {view.round}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            ¡Podio de Seguridad Laboral!
          </h1>
          {view.endReason && (
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">
              {view.endReason}
            </p>
          )}
        </motion.div>

        {/* Top 3 Podium */}
        <div
          className={`grid gap-3 items-end ${
            podiumOrder.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {podiumOrder.map((entry) => {
            const certs = getCertifiedCount(entry.player);
            return (
              <motion.div
                key={entry.player.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: entry.rank * 0.1 }}
                className={`rounded-2xl border p-4 flex flex-col justify-between ${entry.color} ${entry.height}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    {entry.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold">
                    <Award className="w-4 h-4 text-amber-300" /> {certs}/4 ISO
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl">{entry.player.avatar}</span>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-black text-white truncate">
                      {entry.player.name}
                    </div>
                    <div className="font-mono text-sm font-bold text-emerald-300">
                      {entry.player.score} pts
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Standings & Training Analytics Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-400" />
              Clasificación y Estadísticas de Formación PRL ({standings.length}{' '}
              jugadores)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Empresa / Jugador</th>
                  <th className="py-2.5 px-2 text-right">Puntuación</th>
                  <th className="py-2.5 px-2 text-center">ISO 45001</th>
                  <th className="py-2.5 px-2 text-center">Acierto Test PRL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {standings.map((p, idx) => {
                  const certs = getCertifiedCount(p);
                  const accuracy =
                    p.quizTotal > 0
                      ? Math.round((p.quizCorrect / p.quizTotal) * 100)
                      : null;
                  const isMe = p.id === view.me?.id;
                  return (
                    <tr
                      key={p.id}
                      className={
                        isMe ? 'bg-amber-500/10 text-white' : 'text-slate-200'
                      }
                    >
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-400">
                        {idx + 1}º
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.avatar}</span>
                          <span className="font-bold truncate max-w-[180px] sm:max-w-xs">
                            {p.name}
                          </span>
                          {p.isBot && (
                            <Bot className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          )}
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                              TÚ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-extrabold text-emerald-300">
                        {p.score} pts
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/35 px-2 py-0.5 text-xs font-bold text-amber-300">
                          {certs}/4
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {accuracy !== null ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-sky-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {accuracy}% ({p.quizCorrect}/{p.quizTotal})
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">
                            Sin auditorías
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isHost && (
            <button
              type="button"
              onClick={onReturnToLobby}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 text-sm shadow-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Nueva Partida (Volver al Lobby)
            </button>
          )}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold px-5 py-3 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Salir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
