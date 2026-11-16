'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Clock,
  Landmark,
  Layers,
  LogOut,
  ShieldCheck,
  Users,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import { pickPrlQuestion } from '@/data/questions';
import { ConnectionStatus } from '@/hooks/useMultiplayerParty';
import {
  doesPlayRequireQuiz,
  getValidWorkstationSectorsForCard,
} from '@/lib/gameEngine';
import { soundEngine } from '@/lib/soundEffects';
import {
  CardInstance,
  ClientGameView,
  ConcreteSector,
  PlayerActionSubmission,
  PrlQuestion,
  RoundDuration,
} from '@/types/game';
import { HostControlBar } from './HostControlBar';
import { PlayerCompanyBoard } from './PlayerCompanyBoard';
import { PlayerHand } from './PlayerHand';
import { PrlQuizModal } from './PrlQuizModal';
import { RivalRadar } from './RivalRadar';
import { RoundBulletinModal } from './RoundBulletinModal';

interface GameArenaProps {
  view: ClientGameView;
  isHost: boolean;
  status: ConnectionStatus;
  onSubmitAction: (
    submission: Omit<PlayerActionSubmission, 'playerId' | 'submittedAt'>
  ) => void;
  onCancelAction: () => void;
  onTogglePause: () => void;
  onChangeDuration: (duration: RoundDuration) => void;
  onForceResolve: () => void;
  onSkipBulletin: () => void;
  onLeaveRoom: () => void;
  onOpenGuide: () => void;
}

interface PendingQuizState {
  question: PrlQuestion;
  card: CardInstance;
  targetSector: ConcreteSector;
  sourcePlayerId?: string;
  sourceSector?: ConcreteSector;
}

export function GameArena({
  view,
  isHost,
  status,
  onSubmitAction,
  onCancelAction,
  onTogglePause,
  onChangeDuration,
  onForceResolve,
  onSkipBulletin,
  onLeaveRoom,
  onOpenGuide,
}: GameArenaProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardRound, setSelectedCardRound] = useState<number>(view.round);
  const [discardMode, setDiscardMode] = useState(false);
  const [discardCardIds, setDiscardCardIds] = useState<string[]>([]);
  const [benchmarkSource, setBenchmarkSource] = useState<{
    playerId: string;
    sector: ConcreteSector;
  } | null>(null);
  const [quizState, setQuizState] = useState<PendingQuizState | null>(null);
  const [recentQuestionIds, setRecentQuestionIds] = useState<string[]>([]);
  const [muted, setMuted] = useState(() => soundEngine.isMuted());

  const prevPhaseRef = useRef(view.phase);
  const prevTimeRef = useRef(view.timeLeft);

  // Audio feedback on phase transitions & countdown ticks
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = view.phase;

    if (view.phase === 'RESOLUTION' && prevPhase !== 'RESOLUTION') {
      if (view.globalInspectionTriggered) {
        soundEngine.playGlobalInspection();
      } else if (view.roundBulletin.some((e) => e.type === 'CERTIFIED')) {
        soundEngine.playIsoCertified();
      } else if (
        view.roundBulletin.some((e) => e.type === 'ACCIDENT' || e.type === 'RISK')
      ) {
        soundEngine.playRiskAlarm();
      } else {
        soundEngine.playRoundResolve();
      }
    }
  }, [view.phase, view.globalInspectionTriggered, view.roundBulletin]);

  useEffect(() => {
    const prevTime = prevTimeRef.current;
    prevTimeRef.current = view.timeLeft;
    if (
      view.phase === 'PLANNING' &&
      !view.paused &&
      view.config.roundDuration > 0 &&
      view.timeLeft !== prevTime &&
      view.timeLeft > 0 &&
      view.timeLeft <= 5
    ) {
      soundEngine.playCountdownTick(view.timeLeft <= 3);
    }
  }, [view.phase, view.paused, view.config.roundDuration, view.timeLeft]);

  const me = view.me;
  const activeSelectedCardId =
    selectedCardRound === view.round && view.phase === 'PLANNING' && !me?.ready
      ? selectedCardId
      : null;
  const activeDiscardMode =
    selectedCardRound === view.round && view.phase === 'PLANNING' && !me?.ready
      ? discardMode
      : false;
  const activeBenchmarkSource =
    selectedCardRound === view.round && view.phase === 'PLANNING' && !me?.ready
      ? benchmarkSource
      : null;
  const activeQuiz =
    selectedCardRound === view.round && view.phase === 'PLANNING' && !me?.ready
      ? quizState
      : null;

  const selectedCard = useMemo(
    () => me?.hand.find((c) => c.id === activeSelectedCardId) ?? null,
    [me, activeSelectedCardId]
  );

  const playableMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (!me) return map;
    for (const card of me.hand) {
      if (card.id === me.blockedCardId) {
        map[card.id] = false;
        continue;
      }
      const targets = getValidWorkstationSectorsForCard(me, view.players, card);
      if (card.category === 'ACTION' && card.actionEffect === 'BENCHMARKING') {
        map[card.id] =
          targets.benchmarkSources.length > 0 && targets.selfSectors.length > 0;
      } else {
        map[card.id] =
          targets.selfSectors.length > 0 || targets.rivalTargets.length > 0;
      }
    }
    return map;
  }, [me, view.players]);

  const activeTargets = useMemo(() => {
    if (!me || !selectedCard) {
      return { selfSectors: [], rivalTargets: [], benchmarkSources: [] };
    }
    return getValidWorkstationSectorsForCard(me, view.players, selectedCard);
  }, [me, view.players, selectedCard]);

  if (!me) return null;

  const rivals = view.players.filter((p) => p.id !== me.id);
  const connectedPlayers = view.players.filter((p) => p.connected);
  const readyCount = connectedPlayers.filter((p) => p.ready).length;
  const totalConnected = connectedPlayers.length;

  const roundsUntilInspection = 3 - (view.round % 3);
  const isInspectionRound = view.round % 3 === 0;

  const clearSelection = () => {
    setSelectedCardId(null);
    setDiscardMode(false);
    setDiscardCardIds([]);
    setBenchmarkSource(null);
    setQuizState(null);
  };

  const handleSelectCard = (card: CardInstance) => {
    setSelectedCardRound(view.round);
    setDiscardMode(false);
    setDiscardCardIds([]);
    setBenchmarkSource(null);

    if (activeSelectedCardId === card.id) {
      setSelectedCardId(null);
      return;
    }

    // Immediate self action without sector target: Emergency Plan
    if (card.category === 'ACTION' && card.actionEffect === 'EMERGENCY_PLAN') {
      soundEngine.playCard();
      onSubmitAction({
        mode: 'PLAY',
        cardId: card.id,
        targetPlayerId: me.id,
      });
      clearSelection();
      return;
    }

    // Auto-select if WORKSTATION has exact matching empty slot? Let player click their own board for tactile clarity, OR select card first!
    soundEngine.playCountdownTick(false);
    setSelectedCardId(card.id);
  };

  const handleSelectSelfSector = (sector: ConcreteSector) => {
    if (!selectedCard) return;

    const isBenchmark =
      selectedCard.category === 'ACTION' &&
      selectedCard.actionEffect === 'BENCHMARKING';
    if (isBenchmark && !activeBenchmarkSource) return;

    if (doesPlayRequireQuiz(me, selectedCard, sector)) {
      const q = pickPrlQuestion(sector, recentQuestionIds);
      setSelectedCardRound(view.round);
      setQuizState({
        question: q,
        card: selectedCard,
        targetSector: sector,
        sourcePlayerId: activeBenchmarkSource?.playerId,
        sourceSector: activeBenchmarkSource?.sector,
      });
      return;
    }

    if (selectedCard.category === 'PREVENTION' || isBenchmark) {
      soundEngine.playShieldAdded();
    } else {
      soundEngine.playCard();
    }

    onSubmitAction({
      mode: 'PLAY',
      cardId: selectedCard.id,
      targetPlayerId: me.id,
      targetSector: sector,
      sourcePlayerId: activeBenchmarkSource?.playerId,
      sourceSector: activeBenchmarkSource?.sector,
    });
    clearSelection();
  };

  const handleSelectRivalTarget = (
    playerId: string,
    sector: ConcreteSector
  ) => {
    if (!selectedCard) return;
    if (selectedCard.category === 'HAZARD') {
      soundEngine.playRiskAlarm();
    } else {
      soundEngine.playCard();
    }
    onSubmitAction({
      mode: 'PLAY',
      cardId: selectedCard.id,
      targetPlayerId: playerId,
      targetSector: sector,
    });
    clearSelection();
  };

  const handleSelectBenchmarkSource = (
    playerId: string,
    sector: ConcreteSector
  ) => {
    soundEngine.playCountdownTick(false);
    setSelectedCardRound(view.round);
    setBenchmarkSource({ playerId, sector });
  };

  const handleQuizComplete = (correct: boolean) => {
    if (!activeQuiz) return;
    setRecentQuestionIds((prev) => [...prev.slice(-14), activeQuiz.question.id]);
    onSubmitAction({
      mode: 'PLAY',
      cardId: activeQuiz.card.id,
      targetPlayerId: me.id,
      targetSector: activeQuiz.targetSector,
      sourcePlayerId: activeQuiz.sourcePlayerId,
      sourceSector: activeQuiz.sourceSector,
      quizResult: {
        questionId: activeQuiz.question.id,
        correct,
      },
    });
    clearSelection();
  };

  const handleToggleDiscardMode = () => {
    setSelectedCardRound(view.round);
    setSelectedCardId(null);
    setBenchmarkSource(null);
    setDiscardMode((prev) => !prev);
    setDiscardCardIds([]);
  };

  const handleToggleDiscardCard = (cardId: string) => {
    setSelectedCardRound(view.round);
    setDiscardCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleConfirmDiscard = () => {
    if (discardCardIds.length === 0) return;
    soundEngine.playCard();
    onSubmitAction({
      mode: 'DISCARD',
      discardCardIds,
    });
    clearSelection();
  };

  const handlePassTurn = () => {
    soundEngine.playCountdownTick(false);
    onSubmitAction({ mode: 'PASS' });
    clearSelection();
  };

  const timerUrgent =
    view.phase === 'PLANNING' &&
    view.config.roundDuration > 0 &&
    view.timeLeft <= 7;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-2.5 py-3 sm:px-5 sm:py-4">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* TOP MISSION CONTROL BAR */}
        <header className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/95 px-3.5 py-2.5 shadow-lg">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white leading-tight">
                  Alerta Cero · Sala{' '}
                  <span className="font-mono text-amber-300">{view.roomCode}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200">
                    Ronda {view.round}
                    {view.config.winMode === '10_ROUNDS'
                      ? '/10'
                      : view.config.winMode === '15_ROUNDS'
                        ? '/15'
                        : ''}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Mazo: {view.deckCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <strong className="text-emerald-300">
                      {readyCount}/{totalConnected}
                    </strong>{' '}
                    listos
                  </span>
                </div>
              </div>
            </div>

            {/* Global Inspection Indicator */}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                isInspectionRound
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200 animate-pulse'
                  : 'border-slate-700 bg-slate-950/70 text-slate-400'
              }`}
            >
              <Landmark className="w-3 h-3" />
              {isInspectionRound
                ? '¡Inspección General esta ronda!'
                : `Inspección General en ${roundsUntilInspection} ronda(s)`}
            </span>
          </div>

          {/* Right Controls: Timer + Host Panel + Guide/Audio/Exit */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Round Clock */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-sm font-black ${
                view.paused
                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-300'
                  : timerUrgent
                    ? 'border-red-400 bg-red-500/20 text-red-200 animate-pulse'
                    : 'border-slate-700 bg-slate-950 text-sky-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              {view.paused
                ? 'PAUSA'
                : view.config.roundDuration === 0
                  ? '∞'
                  : `${view.timeLeft}s`}
            </div>

            {isHost && (
              <HostControlBar
                phase={view.phase}
                paused={view.paused}
                config={view.config}
                onTogglePause={onTogglePause}
                onChangeDuration={onChangeDuration}
                onForceResolve={onForceResolve}
              />
            )}

            <button
              type="button"
              onClick={() => setMuted(soundEngine.toggleMute())}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
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
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guía PRL</span>
            </button>

            <button
              type="button"
              onClick={onLeaveRoom}
              className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300"
              title="Salir de la sala"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {status === 'RECONNECTING' && (
          <div className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-200 flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            Conexión inestable. Reconectando automáticamente con la sala...
          </div>
        )}

        {/* ZONA SUPERIOR: RADAR MULTIJUGADOR */}
        {rivals.length > 0 && (
          <RivalRadar
            rivals={rivals}
            selectedCard={selectedCard}
            validRivalTargets={activeTargets.rivalTargets}
            validBenchmarkSources={activeTargets.benchmarkSources}
            selectedTarget={null}
            selectedBenchmarkSource={activeBenchmarkSource}
            onSelectRivalTarget={handleSelectRivalTarget}
            onSelectBenchmarkSource={handleSelectBenchmarkSource}
          />
        )}

        {/* ZONA INFERIOR: TU EMPRESA + TU MANO */}
        <PlayerCompanyBoard
          me={me}
          selectedCard={selectedCard}
          validSelfSectors={activeTargets.selfSectors}
          selectedSelfSector={null}
          awaitingBenchmarkTarget={Boolean(activeBenchmarkSource)}
          onSelectSelfSector={handleSelectSelfSector}
        />

        <PlayerHand
          me={me}
          selectedCardId={activeSelectedCardId}
          discardMode={activeDiscardMode}
          discardCardIds={discardCardIds}
          pendingAction={view.myPendingAction}
          playableMap={playableMap}
          readyCount={readyCount}
          totalConnected={totalConnected}
          onSelectCard={handleSelectCard}
          onToggleDiscardMode={handleToggleDiscardMode}
          onToggleDiscardCard={handleToggleDiscardCard}
          onConfirmDiscard={handleConfirmDiscard}
          onPassTurn={handlePassTurn}
          onCancelSubmission={onCancelAction}
        />
      </div>

      {/* MODAL DE TEST PRL PARA CERTIFICACIÓN ISO 45001 */}
      {activeQuiz && (
        <PrlQuizModal
          question={activeQuiz.question}
          targetSector={activeQuiz.targetSector}
          onComplete={handleQuizComplete}
          onCancel={() => setQuizState(null)}
        />
      )}

      {/* BOLETÍN DE RONDA (5 SEGUNDOS) */}
      {view.phase === 'RESOLUTION' && (
        <RoundBulletinModal
          round={view.round}
          timeLeft={view.timeLeft}
          events={view.roundBulletin}
          globalInspectionTriggered={view.globalInspectionTriggered}
          isHost={isHost}
          onSkip={onSkipBulletin}
        />
      )}
    </div>
  );
}
