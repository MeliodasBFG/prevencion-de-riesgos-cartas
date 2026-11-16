'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  BookOpen,
  Bot,
  Check,
  Copy,
  Crown,
  Link2,
  Loader2,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ConnectionStatus,
  loadSavedProfile,
  normalizeRoomCode,
} from '@/hooks/useMultiplayerParty';
import { DEFAULT_CONFIG, PLAYER_AVATARS } from '@/lib/gameEngine';
import { soundEngine } from '@/lib/soundEffects';
import {
  ClientGameView,
  GameConfig,
  RoundDuration,
  WinMode,
} from '@/types/game';

interface LandingLobbyProps {
  initialRoomParam: string;
  status: ConnectionStatus;
  errorMsg: string | null;
  view: ClientGameView | null;
  isHost: boolean;
  onCreateRoom: (name: string, avatar: string, config: GameConfig) => void;
  onStartSoloPractice: (
    name: string,
    avatar: string,
    botCount: number,
    config: GameConfig
  ) => void;
  onJoinRoom: (roomCode: string, name: string, avatar: string) => void;
  onLeaveRoom: () => void;
  onAddBots: (count: number) => void;
  onRemoveBot: (botId?: string) => void;
  onUpdateConfig: (partial: Partial<GameConfig>) => void;
  onStartMatch: () => void;
  onOpenGuide: () => void;
}

const emptySubscribe = () => () => {};

export function LandingLobby({
  initialRoomParam,
  status,
  errorMsg,
  view,
  isHost,
  onCreateRoom,
  onStartSoloPractice,
  onJoinRoom,
  onLeaveRoom,
  onAddBots,
  onRemoveBot,
  onUpdateConfig,
  onStartMatch,
  onOpenGuide,
}: LandingLobbyProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const savedProfile = isClient
    ? loadSavedProfile()
    : { name: '', avatar: '👷', lastRoom: '' };

  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [roomInputOverride, setRoomInputOverride] = useState<string | null>(null);
  const [tabOverride, setTabOverride] = useState<'CREATE' | 'JOIN' | null>(null);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mutedOverride, setMutedOverride] = useState<boolean | null>(null);

  const name = nameOverride ?? (savedProfile.name || 'Equipo Seguridad');
  const setName = (val: string) => setNameOverride(val);
  const avatar = avatarOverride ?? (savedProfile.avatar || '👷');
  const setAvatar = (val: string) => setAvatarOverride(val);
  const roomInput =
    roomInputOverride ??
    (initialRoomParam
      ? normalizeRoomCode(initialRoomParam)
      : savedProfile.lastRoom && savedProfile.lastRoom !== 'LOCAL'
        ? savedProfile.lastRoom
        : '');
  const setRoomInput = (val: string) => setRoomInputOverride(val);
  const activeTab = tabOverride ?? (initialRoomParam ? 'JOIN' : 'CREATE');
  const setActiveTab = (val: 'CREATE' | 'JOIN') => setTabOverride(val);
  const muted = mutedOverride ?? (isClient ? soundEngine.isMuted() : false);

  const handleToggleMute = () => {
    setMutedOverride(soundEngine.toggleMute());
  };

  const handleCopyCode = async () => {
    if (!view) return;
    try {
      await navigator.clipboard.writeText(view.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  const handleCopyLink = async () => {
    if (!view || typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(
      view.roomCode
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  // ==========================================
  // VIEW 2: LOBBY WAITING ROOM (CONNECTED)
  // ==========================================
  if (view && view.phase === 'LOBBY') {
    const totalPlayers = view.players.length;
    const botCount = view.players.filter((p) => p.isBot).length;
    const humanCount = totalPlayers - botCount;
    const missingFor15 = Math.max(0, 15 - totalPlayers);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 px-3 py-5 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Alerta Cero: Misión ISO 45001
                </h1>
                <p className="text-xs text-slate-400">
                  Sala de Espera Elástica (2 a 20 jugadores · Turnos Simultáneos)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                title={muted ? 'Activar sonido' : 'Silenciar sonido'}
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <button
                type="button"
                onClick={onOpenGuide}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200"
              >
                <BookOpen className="w-4 h-4 text-amber-400" /> Guía PRL
              </button>
              <button
                type="button"
                onClick={onLeaveRoom}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300"
              >
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          </div>

          {/* Room Code & Share Panel + Host Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Share Card */}
            <div className="lg:col-span-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  {view.roomCode === 'LOCAL'
                    ? 'Modo Práctica Local'
                    : 'Código de Sala Multijugador'}
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-white bg-slate-950/90 border border-slate-700 rounded-xl px-4 py-2">
                    {view.roomCode}
                  </span>
                  {view.roomCode !== 'LOCAL' && (
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200"
                      >
                        {copiedCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedCode ? 'Copiado' : 'Copiar Código'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300"
                      >
                        {copiedLink ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Link2 className="w-3.5 h-3.5" />
                        )}
                        {copiedLink ? 'Enlace Copiado' : 'Copiar Enlace'}
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {view.roomCode === 'LOCAL'
                    ? 'Jugando en modo local con Bots de IA. Ideal para practicar reglas o aulas sin conexión P2P.'
                    : 'Comparte el código o el enlace con tu clase o equipo. Pueden conectarse desde 4G/5G o distintas redes Wi-Fi hasta 20 jugadores.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <strong>{totalPlayers}</strong> / {view.config.maxPlayers} participantes
                </span>
                <span className="text-slate-400">
                  {humanCount} humano(s) · {botCount} bot(s)
                </span>
              </div>
            </div>

            {/* Host Configuration & Bot Manager */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  {isHost
                    ? 'Panel del Director de Partida (Host)'
                    : 'Configuración de la Partida'}
                </h2>
                {!isHost && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Esperando al Host...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Objetivo de Victoria
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: '4_ISO', label: '4 ISO 45001' },
                        { id: '10_ROUNDS', label: '10 Rondas' },
                        { id: '15_ROUNDS', label: '15 Rondas' },
                      ] as { id: WinMode; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!isHost}
                        onClick={() => onUpdateConfig({ winMode: opt.id })}
                        className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          view.config.winMode === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        } disabled:cursor-default`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Reloj de Planificación
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 20, label: '20s' },
                        { id: 35, label: '35s' },
                        { id: 60, label: '60s' },
                        { id: 0, label: '∞' },
                      ] as { id: RoundDuration; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!isHost}
                        onClick={() => onUpdateConfig({ roundDuration: opt.id })}
                        className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          view.config.roundDuration === opt.id
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        } disabled:cursor-default`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isHost && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={totalPlayers >= view.config.maxPlayers}
                      onClick={() => onAddBots(1)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" /> +1 Bot
                    </button>
                    <button
                      type="button"
                      disabled={totalPlayers >= view.config.maxPlayers}
                      onClick={() => onAddBots(4)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200"
                    >
                      <Bot className="w-3.5 h-3.5 text-sky-400" /> +4 Bots
                    </button>
                    {missingFor15 > 0 && (
                      <button
                        type="button"
                        onClick={() => onAddBots(missingFor15)}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 px-2.5 py-1.5 text-xs font-semibold text-sky-300"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Rellenar a 15
                      </button>
                    )}
                    {botCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onRemoveBot()}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/40 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Quitar Bot
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={totalPlayers < 2}
                    onClick={() => {
                      soundEngine.playCard();
                      onStartMatch();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-extrabold px-5 py-2.5 text-sm shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Misión ({totalPlayers} jugadores)
                  </button>
                </div>
              )}

              {isHost && totalPlayers < 2 && (
                <p className="text-xs text-amber-300">
                  Se necesitan al menos 2 participantes (humanos o bots) para iniciar.
                </p>
              )}
            </div>
          </div>

          {/* Connected Players Roster */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Empresas Participantes ({totalPlayers})
              </h3>
              <span className="text-xs text-slate-400">
                Mazo autoescalado al iniciar: <strong>{totalPlayers * 12}</strong> cartas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {view.players.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative rounded-xl border p-3 flex items-center gap-2.5 ${
                    p.id === view.me?.id
                      ? 'border-amber-400/60 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <span className="text-2xl select-none">{p.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate">
                        {p.name}
                      </span>
                      {p.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                      {p.isBot ? (
                        <span className="text-sky-400 flex items-center gap-0.5">
                          <Bot className="w-3 h-3" /> IA
                        </span>
                      ) : p.connected ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Wifi className="w-3 h-3" /> En línea
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-0.5">
                          <WifiOff className="w-3 h-3" /> Reconectando
                        </span>
                      )}
                    </div>
                  </div>
                  {isHost && p.isBot && (
                    <button
                      type="button"
                      onClick={() => onRemoveBot(p.id)}
                      title="Quitar bot"
                      className="text-slate-500 hover:text-red-400 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: WELCOME / CREATE OR JOIN
  // ==========================================
  const busy = status === 'CONNECTING' || status === 'RECONNECTING';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Subtle tactical backdrop glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-500/10 blur-3xl" />

      <div className="max-w-4xl w-full mx-auto relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <ShieldCheck className="w-4 h-4" /> Party Edition · 2 a 20 Jugadores
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
              title={muted ? 'Activar sonido' : 'Silenciar'}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200"
            >
              <BookOpen className="w-4 h-4 text-amber-400" /> Reglas y Guía PRL
            </button>
          </div>
        </div>

        <div className="text-center sm:text-left space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Alerta Cero:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-emerald-400">
              Misión ISO 45001
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            Juego estratégico multijugador de Prevención de Riesgos Laborales en turnos
            simultáneos. Protege tus 4 sectores, neutraliza riesgos, supera auditorías
            y certifica tu empresa antes que nadie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Profile */}
          <div className="md:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              1. Tu Identidad de Empresa
            </h2>

            <div>
              <label
                htmlFor="player-name"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Nombre o Empresa
              </label>
              <input
                id="player-name"
                type="text"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Constructora Norte"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400 mb-2">
                Elige tu Emblema
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {PLAYER_AVATARS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setAvatar(em)}
                    className={`h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      avatar === em
                        ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-sm'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Create or Join */}
          <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('CREATE')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'CREATE'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4" /> Crear Sala (Host)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('JOIN')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'JOIN'
                    ? 'bg-sky-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Unirse con Código
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/15 p-3 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            {activeTab === 'CREATE' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Condición de Victoria
                    </label>
                    <select
                      value={config.winMode}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          winMode: e.target.value as WinMode,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="4_ISO">4 Certificaciones ISO 45001</option>
                      <option value="10_ROUNDS">10 Rondas (o 4 ISO)</option>
                      <option value="15_ROUNDS">15 Rondas (o 4 ISO)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Tiempo por Ronda
                    </label>
                    <select
                      value={config.roundDuration}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          roundDuration: Number(e.target.value) as RoundDuration,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value={35}>35 segundos (Recomendado)</option>
                      <option value={20}>20 segundos (Modo Turbo)</option>
                      <option value={60}>60 segundos (Aula / Debate)</option>
                      <option value={0}>Sin límite de tiempo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    disabled={busy || !name.trim()}
                    onClick={() => onCreateRoom(name.trim(), avatar, config)}
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 px-4 text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando Sala P2P...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        Crear Sala Multijugador Online
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={busy || !name.trim()}
                    onClick={() =>
                      onStartSoloPractice(name.trim(), avatar, 7, config)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold py-2.5 px-4 text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4 text-sky-400" />
                    Práctica Instantánea vs 7 Bots (Sin Red)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="room-code"
                    className="block text-xs font-medium text-slate-400 mb-1.5"
                  >
                    Código de Sala (ej. PRL-842)
                  </label>
                  <input
                    id="room-code"
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                    placeholder="PRL-842"
                    className="w-full font-mono text-lg font-bold tracking-wider rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 focus:border-sky-400 focus:outline-none uppercase"
                  />
                </div>

                <button
                  type="button"
                  disabled={busy || !name.trim() || !roomInput.trim()}
                  onClick={() =>
                    onJoinRoom(normalizeRoomCode(roomInput), name.trim(), avatar)
                  }
                  className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 px-4 text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {status === 'RECONNECTING'
                        ? 'Reconectando...'
                        : 'Conectando por WebRTC...'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Entrar a la Partida
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400">
                  Si se corta tu cobertura 4G/5G o recargas la página, vuelve a entrar
                  con el mismo código para recuperar tu empresa y tus cartas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
