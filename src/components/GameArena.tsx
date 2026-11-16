'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { GameInstructionsPanel } from './GameInstructionsPanel';
import { GameTable } from './GameTable';
import { HostControlBar } from './HostControlBar';
import { InstructionBookButton } from './InstructionBookButton';
import { PlayerCompanyBoard } from './PlayerCompanyBoard';
import { PlayerHand } from './PlayerHand';
import { PrlQuizModal } from './PrlQuizModal';
import { RivalRadar } from './RivalRadar';

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

interface DropHit {
  zone: 'TABLE' | 'DISCARD' | 'SELF_SECTOR' | 'RIVAL' | null;
  selfSector?: ConcreteSector;
  rivalId?: string;
}

function hitTestPoint(rect: DOMRect, x: number, y: number): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function detectDropTarget(clientX: number, clientY: number): DropHit {
  if (typeof document === 'undefined') return { zone: null };

  const selfEls = document.querySelectorAll<HTMLElement>('[data-drop-self-sector]');
  for (const el of selfEls) {
    if (hitTestPoint(el.getBoundingClientRect(), clientX, clientY)) {
      const s = el.dataset.dropSelfSector as ConcreteSector | undefined;
      if (s) return { zone: 'SELF_SECTOR', selfSector: s };
    }
  }

  const rivalEls = document.querySelectorAll<HTMLElement>('[data-drop-rival]');
  for (const el of rivalEls) {
    if (hitTestPoint(el.getBoundingClientRect(), clientX, clientY)) {
      const rId = el.dataset.dropRival;
      if (rId) return { zone: 'RIVAL', rivalId: rId };
    }
  }

  const discardEl = document.querySelector<HTMLElement>('[data-drop-zone="DISCARD"]');
  if (discardEl && hitTestPoint(discardEl.getBoundingClientRect(), clientX, clientY)) {
    return { zone: 'DISCARD' };
  }

  const tableEl = document.querySelector<HTMLElement>('[data-drop-zone="TABLE"]');
  if (tableEl && hitTestPoint(tableEl.getBoundingClientRect(), clientX, clientY)) {
    return { zone: 'TABLE' };
  }

  return { zone: null };
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
  const [seatedCardId, setSeatedCardId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [stateRound, setStateRound] = useState<number>(view.round);
  const [stagedDiscardIds, setStagedDiscardIds] = useState<string[]>([]);
  const [benchmarkSource, setBenchmarkSource] = useState<{
    playerId: string;
    sector: ConcreteSector;
  } | null>(null);
  const [quizState, setQuizState] = useState<PendingQuizState | null>(null);
  const [recentQuestionIds, setRecentQuestionIds] = useState<string[]>([]);
  const [muted, setMuted] = useState(() => soundEngine.isMuted());

  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [hoveredSelfSector, setHoveredSelfSector] =
    useState<ConcreteSector | null>(null);
  const [hoveredRivalId, setHoveredRivalId] = useState<string | null>(null);

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
  const isPlanningActive = view.phase === 'PLANNING' && !me?.ready;
  const sameRound = stateRound === view.round && isPlanningActive;

  const activeSelectedCardId = sameRound ? selectedCardId : null;
  const activeSeatedCardId = sameRound ? seatedCardId : null;
  const activeDraggingCardId = sameRound ? draggingCardId : null;
  const activeStagedDiscardIds = useMemo(
    () => (sameRound ? stagedDiscardIds : []),
    [sameRound, stagedDiscardIds]
  );
  const activeBenchmarkSource = sameRound ? benchmarkSource : null;
  const activeQuiz = sameRound ? quizState : null;

  const focusedCardId =
    activeDraggingCardId ?? activeSeatedCardId ?? activeSelectedCardId;

  const focusedCard = useMemo(
    () => me?.hand.find((c) => c.id === focusedCardId) ?? null,
    [me, focusedCardId]
  );

  const seatedCard = useMemo(
    () => me?.hand.find((c) => c.id === activeSeatedCardId) ?? null,
    [me, activeSeatedCardId]
  );

  const stagedDiscardCards = useMemo(
    () =>
      me
        ? me.hand.filter((c) => activeStagedDiscardIds.includes(c.id))
        : [],
    [me, activeStagedDiscardIds]
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
    if (!me || !focusedCard) {
      return { selfSectors: [], rivalTargets: [], benchmarkSources: [] };
    }
    return getValidWorkstationSectorsForCard(me, view.players, focusedCard);
  }, [me, view.players, focusedCard]);

  if (!me) return null;

  const rivals = view.players.filter((p) => p.id !== me.id);
  const connectedPlayers = view.players.filter((p) => p.connected);
  const readyCount = connectedPlayers.filter((p) => p.ready).length;
  const totalConnected = connectedPlayers.length;

  const roundsUntilInspection = 3 - (view.round % 3);
  const isInspectionRound = view.round % 3 === 0;

  const clearAllLocalSelection = () => {
    setSelectedCardId(null);
    setSeatedCardId(null);
    setDraggingCardId(null);
    setStagedDiscardIds([]);
    setBenchmarkSource(null);
    setQuizState(null);
    setHoveredZone(null);
    setHoveredSelfSector(null);
    setHoveredRivalId(null);
  };

  const executeSelfPlay = (
    card: CardInstance,
    sector: ConcreteSector,
    bSource = activeBenchmarkSource
  ) => {
    const isBenchmark =
      card.category === 'ACTION' && card.actionEffect === 'BENCHMARKING';
    if (isBenchmark && !bSource) return;

    if (doesPlayRequireQuiz(me, card, sector)) {
      const q = pickPrlQuestion(sector, recentQuestionIds);
      setStateRound(view.round);
      setQuizState({
        question: q,
        card,
        targetSector: sector,
        sourcePlayerId: bSource?.playerId,
        sourceSector: bSource?.sector,
      });
      return;
    }

    if (card.category === 'PREVENTION' || isBenchmark) {
      soundEngine.playShieldAdded();
    } else {
      soundEngine.playCard();
    }

    onSubmitAction({
      mode: 'PLAY',
      cardId: card.id,
      targetPlayerId: me.id,
      targetSector: sector,
      sourcePlayerId: bSource?.playerId,
      sourceSector: bSource?.sector,
    });
    clearAllLocalSelection();
  };

  const executeRivalPlay = (
    card: CardInstance,
    playerId: string,
    sector: ConcreteSector
  ) => {
    if (card.category === 'HAZARD') {
      soundEngine.playRiskAlarm();
    } else {
      soundEngine.playCard();
    }
    onSubmitAction({
      mode: 'PLAY',
      cardId: card.id,
      targetPlayerId: playerId,
      targetSector: sector,
    });
    clearAllLocalSelection();
  };

  const handleSelectCard = (card: CardInstance) => {
    setStateRound(view.round);
    setStagedDiscardIds([]);
    setBenchmarkSource(null);

    if (activeSelectedCardId === card.id || activeSeatedCardId === card.id) {
      setSelectedCardId(null);
      setSeatedCardId(null);
      return;
    }

    if (card.category === 'ACTION' && card.actionEffect === 'EMERGENCY_PLAN') {
      soundEngine.playCard();
      onSubmitAction({
        mode: 'PLAY',
        cardId: card.id,
        targetPlayerId: me.id,
      });
      clearAllLocalSelection();
      return;
    }

    soundEngine.playCountdownTick(false);
    setSelectedCardId(card.id);
    setSeatedCardId(card.id);
  };

  const handleDragStartCard = (card: CardInstance) => {
    setStateRound(view.round);
    setDraggingCardId(card.id);
    setSelectedCardId(card.id);
    soundEngine.playCountdownTick(false);
  };

  const handleDragMoveCard = (
    _card: CardInstance,
    clientX: number,
    clientY: number
  ) => {
    const hit = detectDropTarget(clientX, clientY);
    setHoveredZone(hit.zone);
    setHoveredSelfSector(hit.selfSector ?? null);
    setHoveredRivalId(hit.rivalId ?? null);
  };

  const handleDragEndCard = (
    card: CardInstance,
    clientX: number,
    clientY: number
  ) => {
    const hit = detectDropTarget(clientX, clientY);
    setDraggingCardId(null);
    setHoveredZone(null);
    setHoveredSelfSector(null);
    setHoveredRivalId(null);

    if (!hit.zone) return;

    // 1. Dropped on Discard Pile
    if (hit.zone === 'DISCARD') {
      if (card.id === me.blockedCardId) return;
      soundEngine.playCard();
      setStateRound(view.round);
      setSelectedCardId(null);
      setSeatedCardId(null);
      setBenchmarkSource(null);
      setStagedDiscardIds((prev) =>
        prev.includes(card.id) ? prev : [...prev, card.id]
      );
      return;
    }

    const targets = getValidWorkstationSectorsForCard(me, view.players, card);

    // 2. Dropped directly on one of your Workstations
    if (hit.zone === 'SELF_SECTOR' && hit.selfSector) {
      if (targets.selfSectors.includes(hit.selfSector)) {
        const isBench =
          card.category === 'ACTION' && card.actionEffect === 'BENCHMARKING';
        if (isBench && !activeBenchmarkSource) {
          // Seat on table until they pick a rival source
          setSeatedCardId(card.id);
          return;
        }
        executeSelfPlay(card, hit.selfSector);
      }
      return;
    }

    // 3. Dropped directly on a Rival in the Radar
    if (hit.zone === 'RIVAL' && hit.rivalId) {
      if (card.category === 'ACTION' && card.actionEffect === 'BENCHMARKING') {
        const sources = targets.benchmarkSources.filter(
          (b) => b.playerId === hit.rivalId
        );
        if (sources.length > 0 && targets.selfSectors.length > 0) {
          setStateRound(view.round);
          setBenchmarkSource({
            playerId: sources[0].playerId,
            sector: sources[0].sector,
          });
          setSeatedCardId(card.id);
          setSelectedCardId(card.id);
          soundEngine.playCountdownTick(false);
        }
        return;
      }

      const rivalSectors = targets.rivalTargets.filter(
        (t) => t.playerId === hit.rivalId
      );
      if (rivalSectors.length === 1 || card.actionEffect === 'INSPECTION_SURPRISE') {
        if (rivalSectors[0]) {
          executeRivalPlay(card, hit.rivalId, rivalSectors[0].sector);
        }
      } else if (rivalSectors.length > 1) {
        setStateRound(view.round);
        setSeatedCardId(card.id);
        setSelectedCardId(card.id);
      }
      return;
    }

    // 4. Dropped onto the Central Table Deployment Zone
    if (hit.zone === 'TABLE') {
      if (!playableMap[card.id]) return;

      if (card.category === 'ACTION' && card.actionEffect === 'EMERGENCY_PLAN') {
        soundEngine.playCard();
        onSubmitAction({
          mode: 'PLAY',
          cardId: card.id,
          targetPlayerId: me.id,
        });
        clearAllLocalSelection();
        return;
      }

      if (
        (card.category === 'WORKSTATION' || card.category === 'PREVENTION') &&
        targets.selfSectors.length === 1
      ) {
        executeSelfPlay(card, targets.selfSectors[0]);
        return;
      }

      // Multiple targets or rival selection required -> physically seat card on table!
      soundEngine.playCard();
      setStateRound(view.round);
      setStagedDiscardIds([]);
      setSeatedCardId(card.id);
      setSelectedCardId(card.id);
    }
  };

  const handleSelectSelfSector = (sector: ConcreteSector) => {
    if (!focusedCard) return;
    executeSelfPlay(focusedCard, sector);
  };

  const handleSelectRivalTarget = (
    playerId: string,
    sector: ConcreteSector
  ) => {
    if (!focusedCard) return;
    executeRivalPlay(focusedCard, playerId, sector);
  };

  const handleSelectBenchmarkSource = (
    playerId: string,
    sector: ConcreteSector
  ) => {
    soundEngine.playCountdownTick(false);
    setStateRound(view.round);
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
    clearAllLocalSelection();
  };

  const handleConfirmDiscards = () => {
    if (activeStagedDiscardIds.length === 0) return;
    soundEngine.playCard();
    onSubmitAction({
      mode: 'DISCARD',
      discardCardIds: activeStagedDiscardIds,
    });
    clearAllLocalSelection();
  };

  const handlePassTurn = () => {
    soundEngine.playCountdownTick(false);
    onSubmitAction({ mode: 'PASS' });
    clearAllLocalSelection();
  };

  const timerUrgent =
    view.phase === 'PLANNING' &&
    view.config.roundDuration > 0 &&
    view.timeLeft <= 7;

  const hiddenHandCardIds = [
    ...(activeSeatedCardId ? [activeSeatedCardId] : []),
    ...activeStagedDiscardIds,
    ...(me.ready && view.myPendingAction?.cardId
      ? [view.myPendingAction.cardId]
      : []),
    ...(me.ready && view.myPendingAction?.discardCardIds
      ? view.myPendingAction.discardCardIds
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-2.5 py-3 sm:px-5 sm:py-4">
      <div className="max-w-7xl mx-auto space-y-3">
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

          {/* Right Controls: Timer + Host Panel + Mini Book + Audio + Exit */}
          <div className="flex flex-wrap items-center gap-2">
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

            <InstructionBookButton onClick={onOpenGuide} />

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

        {/* PANEL INTEGRADO DE INSTRUCCIONES */}
        <GameInstructionsPanel
          phase={view.phase}
          isReady={me.ready}
          selectedCard={focusedCard}
          awaitingBenchmarkTarget={Boolean(activeBenchmarkSource)}
          stagedDiscardCount={stagedDiscardCards.length}
          onOpenBook={onOpenGuide}
        />

        {/* ZONA SUPERIOR: RADAR MULTIJUGADOR */}
        {rivals.length > 0 && (
          <RivalRadar
            rivals={rivals}
            selectedCard={focusedCard}
            validRivalTargets={activeTargets.rivalTargets}
            validBenchmarkSources={activeTargets.benchmarkSources}
            selectedTarget={null}
            selectedBenchmarkSource={activeBenchmarkSource}
            hoveredRivalId={hoveredRivalId}
            onSelectRivalTarget={handleSelectRivalTarget}
            onSelectBenchmarkSource={handleSelectBenchmarkSource}
          />
        )}

        {/* ZONA CENTRAL: MESA FÍSICA DE OPERACIONES PRL */}
        <GameTable
          view={view}
          isHost={isHost}
          isReady={me.ready}
          seatedCard={seatedCard}
          stagedDiscardCards={stagedDiscardCards}
          hoveredZone={hoveredZone}
          onCancelSeated={() => {
            setSeatedCardId(null);
            setSelectedCardId(null);
            setBenchmarkSource(null);
          }}
          onConfirmDiscards={handleConfirmDiscards}
          onClearDiscards={() => setStagedDiscardIds([])}
          onCancelReady={onCancelAction}
          onSkipBulletin={onSkipBulletin}
        />

        {/* ZONA INFERIOR: TU EMPRESA + TU MANO EN ABANICO */}
        <PlayerCompanyBoard
          me={me}
          selectedCard={focusedCard}
          validSelfSectors={activeTargets.selfSectors}
          selectedSelfSector={null}
          hoveredSelfSector={hoveredSelfSector}
          awaitingBenchmarkTarget={Boolean(activeBenchmarkSource)}
          onSelectSelfSector={handleSelectSelfSector}
        />

        <PlayerHand
          me={me}
          round={view.round}
          selectedCardId={activeSelectedCardId}
          hiddenCardIds={hiddenHandCardIds}
          pendingAction={view.myPendingAction}
          playableMap={playableMap}
          readyCount={readyCount}
          totalConnected={totalConnected}
          onSelectCard={handleSelectCard}
          onDragStartCard={handleDragStartCard}
          onDragMoveCard={handleDragMoveCard}
          onDragEndCard={handleDragEndCard}
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
    </div>
  );
}
