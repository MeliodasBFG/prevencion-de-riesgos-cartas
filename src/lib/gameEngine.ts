import {
  drawCards,
  generateScaledDeck,
  getWorkstationTitle,
  SECTOR_META,
  shuffleArray,
} from '@/data/cardTemplates';
import { pickPrlQuestion } from '@/data/questions';
import {
  CardInstance,
  ClientGameView,
  ConcreteSector,
  CONCRETE_SECTORS,
  GameConfig,
  GameState,
  PlayerActionSubmission,
  PlayerState,
  PublicPlayerSummary,
  ResolvedPlayVisual,
  RoundEvent,
  WorkstationSlot,
} from '@/types/game';

export const PLAYER_AVATARS = [
  '👷',
  '🦺',
  '🧪',
  '⚙️',
  '💻',
  '🛡️',
  '🧯',
  '🩺',
  '🏗️',
  '🔬',
  '⚡',
  '📋',
  '🏢',
  '🚧',
  '🎓',
  '🔍',
  '🚨',
  '🏭',
  '🧰',
  '🌟',
];

const BOT_NAMES = [
  'Constructora Atlas',
  'Química Delta',
  'Industrias Sur',
  'Oficinas Cero',
  'Ingeniería Alfa',
  'Lab BioSafe',
  'Metalúrgica Norte',
  'Estudio Ergo',
  'Obras Horizonte',
  'FarmaGuard',
  'Mecánica LOTO',
  'Consultora PRL',
  'Energía Segura',
  'Logística Vértice',
  'Planta Modelo',
  'Grupo ISO',
  'Taller Precisión',
  'Campus Seguro',
  'TecnoPrevención',
];

export const DEFAULT_CONFIG: GameConfig = {
  winMode: '4_ISO',
  roundDuration: 35,
  maxPlayers: 20,
};

export function createEmptyWorkstations(): Record<ConcreteSector, WorkstationSlot> {
  return {
    CONSTRUCCION: {
      sector: 'CONSTRUCCION',
      title: getWorkstationTitle('CONSTRUCCION'),
      occupied: false,
      shields: 0,
      inRisk: false,
      certified: false,
    },
    QUIMICO: {
      sector: 'QUIMICO',
      title: getWorkstationTitle('QUIMICO'),
      occupied: false,
      shields: 0,
      inRisk: false,
      certified: false,
    },
    INDUSTRIAL: {
      sector: 'INDUSTRIAL',
      title: getWorkstationTitle('INDUSTRIAL'),
      occupied: false,
      shields: 0,
      inRisk: false,
      certified: false,
    },
    OFICINA: {
      sector: 'OFICINA',
      title: getWorkstationTitle('OFICINA'),
      occupied: false,
      shields: 0,
      inRisk: false,
      certified: false,
    },
  };
}

export function createPlayer(
  id: string,
  name: string,
  avatar: string,
  isHost: boolean,
  isBot: boolean
): PlayerState {
  return {
    id,
    name: name.trim().slice(0, 24) || 'Empresa PRL',
    avatar: avatar || '👷',
    isHost,
    isBot,
    connected: true,
    score: 0,
    workstations: createEmptyWorkstations(),
    hand: [],
    blockedCardId: null,
    ready: false,
    quizCorrect: 0,
    quizTotal: 0,
    lastActionSummary: null,
  };
}

export function createInitialGameState(
  hostId: string,
  hostName: string,
  hostAvatar: string,
  roomCode: string,
  config: GameConfig = DEFAULT_CONFIG
): GameState {
  return {
    roomCode,
    phase: 'LOBBY',
    round: 0,
    timeLeft: config.roundDuration,
    paused: false,
    config,
    players: [createPlayer(hostId, hostName, hostAvatar, true, false)],
    deck: [],
    discardPile: [],
    pendingActions: {},
    roundBulletin: [],
    lastResolvedPlays: [],
    winnerIds: [],
    endReason: null,
    globalInspectionTriggered: false,
  };
}

export function joinOrReconnectPlayer(
  state: GameState,
  id: string,
  name: string,
  avatar: string
): { state: GameState; ok: boolean; reason?: string } {
  const existingIdx = state.players.findIndex((p) => p.id === id);
  if (existingIdx !== -1) {
    const players = state.players.map((p, idx) =>
      idx === existingIdx
        ? {
            ...p,
            connected: true,
            name: state.phase === 'LOBBY' ? name.trim().slice(0, 24) || p.name : p.name,
            avatar: state.phase === 'LOBBY' ? avatar || p.avatar : p.avatar,
          }
        : p
    );
    return { state: { ...state, players }, ok: true };
  }

  if (state.phase !== 'LOBBY') {
    return {
      state,
      ok: false,
      reason: 'La partida ya está en curso. Solo pueden reconectarse jugadores de la sala.',
    };
  }

  if (state.players.length >= state.config.maxPlayers) {
    return {
      state,
      ok: false,
      reason: `La sala ha alcanzado el máximo de ${state.config.maxPlayers} jugadores.`,
    };
  }

  const newPlayer = createPlayer(id, name, avatar, false, false);
  return {
    state: {
      ...state,
      players: [...state.players, newPlayer],
    },
    ok: true,
  };
}

export function setPlayerConnection(
  state: GameState,
  playerId: string,
  connected: boolean
): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, connected } : p
    ),
  };
}

export function addBotsToLobby(state: GameState, count: number): GameState {
  if (state.phase !== 'LOBBY') return state;
  const availableSlots = state.config.maxPlayers - state.players.length;
  const toAdd = Math.max(0, Math.min(count, availableSlots));
  if (toAdd === 0) return state;

  const usedNames = new Set(state.players.map((p) => p.name));
  const nextPlayers = [...state.players];

  for (let i = 0; i < toAdd; i++) {
    const candidate =
      BOT_NAMES.find((n) => !usedNames.has(n)) ||
      `Bot Empresa ${nextPlayers.filter((p) => p.isBot).length + 1}`;
    usedNames.add(candidate);
    const botIndex = nextPlayers.length;
    const avatar = PLAYER_AVATARS[botIndex % PLAYER_AVATARS.length];
    const botId = `bot-${Date.now().toString(36)}-${i}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    nextPlayers.push(createPlayer(botId, `🤖 ${candidate}`, avatar, false, true));
  }

  return { ...state, players: nextPlayers };
}

export function removeBotFromLobby(state: GameState, botId?: string): GameState {
  if (state.phase !== 'LOBBY') return state;
  if (botId) {
    return {
      ...state,
      players: state.players.filter((p) => !(p.isBot && p.id === botId)),
    };
  }
  const lastBotIdx = [...state.players].reverse().findIndex((p) => p.isBot);
  if (lastBotIdx === -1) return state;
  const realIdx = state.players.length - 1 - lastBotIdx;
  return {
    ...state,
    players: state.players.filter((_, i) => i !== realIdx),
  };
}

export function updateGameConfig(
  state: GameState,
  partial: Partial<GameConfig>
): GameState {
  const nextConfig: GameConfig = { ...state.config, ...partial };
  const nextTimeLeft =
    state.phase === 'PLANNING' && partial.roundDuration !== undefined
      ? partial.roundDuration === 0
        ? 0
        : Math.min(state.timeLeft || partial.roundDuration, partial.roundDuration)
      : state.phase === 'LOBBY' && partial.roundDuration !== undefined
        ? partial.roundDuration
        : state.timeLeft;

  return {
    ...state,
    config: nextConfig,
    timeLeft: nextTimeLeft,
  };
}

export function startGame(state: GameState): GameState {
  if (state.players.length < 2) return state;

  let deck = generateScaledDeck(state.players.length);
  const discardPile: CardInstance[] = [];

  // Fair opening deal: 4 cards per player, guaranteeing at least 1 WORKSTATION card if available
  const dealtPlayers: PlayerState[] = state.players.map((p) => {
    const hand: CardInstance[] = [];
    const wsIdx = deck.findIndex((c) => c.category === 'WORKSTATION');
    if (wsIdx !== -1) {
      hand.push(deck[wsIdx]);
      deck = [...deck.slice(0, wsIdx), ...deck.slice(wsIdx + 1)];
    }
    const drawRes = drawCards(deck, discardPile, 4 - hand.length, state.players.length);
    deck = drawRes.deck;
    hand.push(...drawRes.drawn);

    return {
      ...p,
      score: 0,
      workstations: createEmptyWorkstations(),
      hand,
      blockedCardId: null,
      ready: false,
      quizCorrect: 0,
      quizTotal: 0,
      lastActionSummary: null,
    };
  });

  const nextState: GameState = {
    ...state,
    phase: 'PLANNING',
    round: 1,
    timeLeft: state.config.roundDuration,
    paused: false,
    players: dealtPlayers,
    deck,
    discardPile,
    pendingActions: {},
    roundBulletin: [],
    lastResolvedPlays: [],
    winnerIds: [],
    endReason: null,
    globalInspectionTriggered: false,
  };

  return applyBotSubmissions(nextState);
}

export function resetToLobby(state: GameState): GameState {
  return {
    ...state,
    phase: 'LOBBY',
    round: 0,
    timeLeft: state.config.roundDuration,
    paused: false,
    deck: [],
    discardPile: [],
    pendingActions: {},
    roundBulletin: [],
    lastResolvedPlays: [],
    winnerIds: [],
    endReason: null,
    globalInspectionTriggered: false,
    players: state.players.map((p) => ({
      ...p,
      score: 0,
      workstations: createEmptyWorkstations(),
      hand: [],
      blockedCardId: null,
      ready: false,
      quizCorrect: 0,
      quizTotal: 0,
      lastActionSummary: null,
    })),
  };
}

// ==========================================
// TARGETING & RULE VALIDATION HELPERS
// ==========================================

export function getCertifiedCount(player: Pick<PlayerState, 'workstations'>): number {
  return CONCRETE_SECTORS.filter((s) => player.workstations[s].certified).length;
}

export function getValidWorkstationSectorsForCard(
  player: PlayerState,
  allPlayers: PublicPlayerSummary[] | PlayerState[],
  card: CardInstance
): {
  selfSectors: ConcreteSector[];
  rivalTargets: { playerId: string; sector: ConcreteSector }[];
  benchmarkSources: { playerId: string; sector: ConcreteSector }[];
} {
  if (card.id === player.blockedCardId) {
    return { selfSectors: [], rivalTargets: [], benchmarkSources: [] };
  }

  if (card.category === 'WORKSTATION') {
    const sector = card.sector as ConcreteSector;
    return {
      selfSectors: player.workstations[sector].occupied ? [] : [sector],
      rivalTargets: [],
      benchmarkSources: [],
    };
  }

  if (card.category === 'PREVENTION') {
    const selfSectors = CONCRETE_SECTORS.filter((s) => {
      const slot = player.workstations[s];
      return (
        slot.occupied &&
        !slot.certified &&
        (card.sector === 'ALL' || card.sector === s)
      );
    });
    return { selfSectors, rivalTargets: [], benchmarkSources: [] };
  }

  if (card.category === 'HAZARD') {
    const rivalTargets: { playerId: string; sector: ConcreteSector }[] = [];
    for (const rival of allPlayers) {
      if (rival.id === player.id) continue;
      for (const s of CONCRETE_SECTORS) {
        const slot = rival.workstations[s];
        if (
          slot.occupied &&
          !slot.certified &&
          (card.sector === 'ALL' || card.sector === s)
        ) {
          rivalTargets.push({ playerId: rival.id, sector: s });
        }
      }
    }
    return { selfSectors: [], rivalTargets, benchmarkSources: [] };
  }

  if (card.category === 'ACTION') {
    if (card.actionEffect === 'EMERGENCY_PLAN') {
      const riskySectors = CONCRETE_SECTORS.filter(
        (s) => player.workstations[s].occupied && player.workstations[s].inRisk
      );
      return { selfSectors: riskySectors, rivalTargets: [], benchmarkSources: [] };
    }

    if (card.actionEffect === 'INSPECTION_SURPRISE') {
      const rivalTargets: { playerId: string; sector: ConcreteSector }[] = [];
      for (const rival of allPlayers) {
        if (rival.id === player.id) continue;
        // Can inspect any rival (especially effective if they have active risks)
        const occupied = CONCRETE_SECTORS.filter(
          (s) => rival.workstations[s].occupied
        );
        const preferredSector =
          occupied.find((s) => rival.workstations[s].inRisk) ??
          occupied[0] ??
          'CONSTRUCCION';
        rivalTargets.push({ playerId: rival.id, sector: preferredSector });
      }
      return { selfSectors: [], rivalTargets, benchmarkSources: [] };
    }

    if (card.actionEffect === 'BENCHMARKING') {
      const selfSectors = CONCRETE_SECTORS.filter(
        (s) => player.workstations[s].occupied && !player.workstations[s].certified
      );
      const benchmarkSources: { playerId: string; sector: ConcreteSector }[] = [];
      for (const rival of allPlayers) {
        if (rival.id === player.id) continue;
        for (const s of CONCRETE_SECTORS) {
          const slot = rival.workstations[s];
          if (slot.occupied && (slot.shields >= 1 || slot.certified)) {
            benchmarkSources.push({ playerId: rival.id, sector: s });
          }
        }
      }
      return {
        selfSectors: benchmarkSources.length > 0 ? selfSectors : [],
        rivalTargets: [],
        benchmarkSources: selfSectors.length > 0 ? benchmarkSources : [],
      };
    }

    if (card.actionEffect === 'SAFE_SUBCONTRACT') {
      const rivalTargets: { playerId: string; sector: ConcreteSector }[] = [];
      for (const rival of allPlayers) {
        if (rival.id === player.id) continue;
        for (const s of CONCRETE_SECTORS) {
          const rivalSlot = rival.workstations[s];
          const mySlot = player.workstations[s];
          if (rivalSlot.occupied && !rivalSlot.certified && !mySlot.occupied) {
            rivalTargets.push({ playerId: rival.id, sector: s });
          }
        }
      }
      return { selfSectors: [], rivalTargets, benchmarkSources: [] };
    }
  }

  return { selfSectors: [], rivalTargets: [], benchmarkSources: [] };
}

export function doesPlayRequireQuiz(
  player: PlayerState,
  card: CardInstance,
  targetSector?: ConcreteSector
): boolean {
  if (!targetSector) return false;
  const isPreventive =
    card.category === 'PREVENTION' ||
    (card.category === 'ACTION' && card.actionEffect === 'BENCHMARKING');
  if (!isPreventive) return false;

  const slot = player.workstations[targetSector];
  return slot.occupied && !slot.certified && !slot.inRisk && slot.shields >= 1;
}

// ==========================================
// SUBMISSIONS & BOT AI
// ==========================================

export function submitPlayerAction(
  state: GameState,
  submission: PlayerActionSubmission
): GameState {
  if (state.phase !== 'PLANNING') return state;
  const player = state.players.find((p) => p.id === submission.playerId);
  if (!player) return state;

  // Validate blocked card guard
  if (
    submission.mode === 'PLAY' &&
    submission.cardId &&
    submission.cardId === player.blockedCardId
  ) {
    return state;
  }

  const cleanDiscardIds =
    submission.mode === 'DISCARD' && submission.discardCardIds
      ? submission.discardCardIds.filter((id) => id !== player.blockedCardId)
      : undefined;

  const nextSubmission: PlayerActionSubmission = {
    ...submission,
    discardCardIds: cleanDiscardIds,
    submittedAt: submission.submittedAt || Date.now(),
  };

  const nextPending = {
    ...state.pendingActions,
    [player.id]: nextSubmission,
  };

  const nextPlayers = state.players.map((p) =>
    p.id === player.id ? { ...p, ready: true } : p
  );

  const updated: GameState = {
    ...state,
    pendingActions: nextPending,
    players: nextPlayers,
  };

  // Check if all connected players (humans + bots) are ready
  const allReady = updated.players.every((p) => !p.connected || p.ready);
  if (allReady) {
    return resolveRound(updated);
  }

  return updated;
}

export function cancelPlayerAction(state: GameState, playerId: string): GameState {
  if (state.phase !== 'PLANNING') return state;
  const nextPending = { ...state.pendingActions };
  delete nextPending[playerId];
  return {
    ...state,
    pendingActions: nextPending,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, ready: false } : p
    ),
  };
}

function chooseBotSubmission(
  bot: PlayerState,
  state: GameState
): PlayerActionSubmission {
  const playableHand = bot.hand.filter((c) => c.id !== bot.blockedCardId);

  // 1. Priority: Neutralize active risks with EMERGENCY_PLAN or PREVENTION
  const riskySectors = CONCRETE_SECTORS.filter(
    (s) => bot.workstations[s].occupied && bot.workstations[s].inRisk
  );
  if (riskySectors.length >= 2) {
    const emergency = playableHand.find(
      (c) => c.category === 'ACTION' && c.actionEffect === 'EMERGENCY_PLAN'
    );
    if (emergency) {
      return {
        playerId: bot.id,
        mode: 'PLAY',
        cardId: emergency.id,
        submittedAt: Date.now(),
      };
    }
  }

  for (const card of playableHand) {
    if (card.category === 'PREVENTION') {
      const targets = getValidWorkstationSectorsForCard(bot, state.players, card);
      const riskyTarget = targets.selfSectors.find(
        (s) => bot.workstations[s].inRisk
      );
      if (riskyTarget) {
        return {
          playerId: bot.id,
          mode: 'PLAY',
          cardId: card.id,
          targetPlayerId: bot.id,
          targetSector: riskyTarget,
          submittedAt: Date.now(),
        };
      }
    }
  }

  // 2. Certify ISO 45001 if a slot has 1 shield
  for (const card of playableHand) {
    if (card.category === 'PREVENTION') {
      const targets = getValidWorkstationSectorsForCard(bot, state.players, card);
      const upgradeTarget = targets.selfSectors.find(
        (s) => !bot.workstations[s].inRisk && bot.workstations[s].shields === 1
      );
      if (upgradeTarget) {
        const q = pickPrlQuestion(card.sector);
        const correct = Math.random() < 0.72;
        return {
          playerId: bot.id,
          mode: 'PLAY',
          cardId: card.id,
          targetPlayerId: bot.id,
          targetSector: upgradeTarget,
          quizResult: { questionId: q.id, correct },
          submittedAt: Date.now(),
        };
      }
    }
  }

  // 3. Place missing Workstation
  for (const card of playableHand) {
    if (card.category === 'WORKSTATION') {
      const targets = getValidWorkstationSectorsForCard(bot, state.players, card);
      if (targets.selfSectors.length > 0) {
        return {
          playerId: bot.id,
          mode: 'PLAY',
          cardId: card.id,
          targetPlayerId: bot.id,
          targetSector: targets.selfSectors[0],
          submittedAt: Date.now(),
        };
      }
    }
  }

  // 4. Add shield to healthy workstation
  for (const card of playableHand) {
    if (card.category === 'PREVENTION') {
      const targets = getValidWorkstationSectorsForCard(bot, state.players, card);
      if (targets.selfSectors.length > 0) {
        return {
          playerId: bot.id,
          mode: 'PLAY',
          cardId: card.id,
          targetPlayerId: bot.id,
          targetSector: targets.selfSectors[0],
          submittedAt: Date.now(),
        };
      }
    }
  }

  // 5. Play SAFE_SUBCONTRACT or BENCHMARKING or INSPECTION_SURPRISE
  for (const card of playableHand) {
    if (card.category === 'ACTION') {
      const targets = getValidWorkstationSectorsForCard(bot, state.players, card);
      if (card.actionEffect === 'SAFE_SUBCONTRACT' && targets.rivalTargets.length > 0) {
        const t = targets.rivalTargets[Math.floor(Math.random() * targets.rivalTargets.length)];
        return {
          playerId: bot.id,
          mode: 'PLAY',
          cardId: card.id,
          targetPlayerId: t.playerId,
          targetSector: t.sector,
          submittedAt: Date.now(),
        };
      }
      if (
        card.actionEffect === 'BENCHMARKING' &&
        targets.benchmarkSources.length > 0 &&
        targets.selfSectors.length > 0
      ) {
        const src = targets.benchmarkSources[0];
        const dst =
          targets.selfSectors.find((s) => bot.workstations[s].shields === 1) ??
          targets.selfSectors[0];
        const needsQuiz = doesPlayRequireQuiz(bot, card, dst);
        return {
          playerId: bot.id,
          mode: 'PLAY',
          cardId: card.id,
          sourcePlayerId: src.playerId,
          sourceSector: src.sector,
          targetPlayerId: bot.id,
          targetSector: dst,
          quizResult: needsQuiz
            ? { questionId: pickPrlQuestion(dst).id, correct: Math.random() < 0.72 }
            : undefined,
          submittedAt: Date.now(),
        };
      }
      if (card.actionEffect === 'INSPECTION_SURPRISE') {
        const riskyRival = state.players.find(
          (r) =>
            r.id !== bot.id &&
            CONCRETE_SECTORS.some((s) => r.workstations[s].inRisk)
        );
        if (riskyRival) {
          return {
            playerId: bot.id,
            mode: 'PLAY',
            cardId: card.id,
            targetPlayerId: riskyRival.id,
            submittedAt: Date.now(),
          };
        }
      }
    }
  }

  // 6. Launch HAZARD at strongest non-certified rival workstation
  const hazards = playableHand.filter((c) => c.category === 'HAZARD');
  for (const card of hazards) {
    const targets = getValidWorkstationSectorsForCard(bot, state.players, card);
    if (targets.rivalTargets.length > 0) {
      // Prioritize rivals with highest score / already in risk
      const scored = targets.rivalTargets
        .map((t) => {
          const rival = state.players.find((p) => p.id === t.playerId)!;
          const slot = rival.workstations[t.sector];
          const priority =
            (slot.inRisk ? 100 : 0) +
            (slot.shields === 0 ? 40 : 10) +
            getCertifiedCount(rival) * 30 +
            rival.score * 0.05;
          return { t, priority };
        })
        .sort((a, b) => b.priority - a.priority);

      const best = scored[0].t;
      return {
        playerId: bot.id,
        mode: 'PLAY',
        cardId: card.id,
        targetPlayerId: best.playerId,
        targetSector: best.sector,
        submittedAt: Date.now(),
      };
    }
  }

  // 7. Discard duplicate workstations or unplayable cards
  if (playableHand.length > 0) {
    const discardIds = playableHand
      .filter((c) => c.category === 'WORKSTATION')
      .map((c) => c.id);
    const chosenDiscards =
      discardIds.length > 0
        ? discardIds
        : playableHand.slice(0, Math.min(2, playableHand.length)).map((c) => c.id);
    return {
      playerId: bot.id,
      mode: 'DISCARD',
      discardCardIds: chosenDiscards,
      submittedAt: Date.now(),
    };
  }

  return {
    playerId: bot.id,
    mode: 'PASS',
    submittedAt: Date.now(),
  };
}

export function applyBotSubmissions(state: GameState): GameState {
  if (state.phase !== 'PLANNING') return state;
  const nextPending = { ...state.pendingActions };
  const nextPlayers = state.players.map((p) => {
    if (!p.isBot) return p;
    if (!nextPending[p.id]) {
      nextPending[p.id] = chooseBotSubmission(p, state);
    }
    return { ...p, ready: true };
  });

  return {
    ...state,
    pendingActions: nextPending,
    players: nextPlayers,
  };
}

// ==========================================
// SIMULTANEOUS ROUND RESOLUTION
// ==========================================

let eventSeq = 0;
function makeEvent(
  type: RoundEvent['type'],
  title: string,
  description: string,
  involvedPlayerIds: string[]
): RoundEvent {
  eventSeq += 1;
  return {
    id: `evt-${Date.now().toString(36)}-${eventSeq}`,
    type,
    title,
    description,
    involvedPlayerIds,
  };
}

function consumeCardFromHand(
  player: PlayerState,
  cardId: string,
  discardPile: CardInstance[]
): CardInstance | null {
  const idx = player.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) return null;
  const [card] = player.hand.splice(idx, 1);
  discardPile.push(card);
  return card;
}

export function resolveRound(state: GameState): GameState {
  if (state.phase !== 'PLANNING') return state;

  // Deep clone mutable working structures cleanly
  const players: PlayerState[] = state.players.map((p) => ({
    ...p,
    workstations: {
      CONSTRUCCION: { ...p.workstations.CONSTRUCCION },
      QUIMICO: { ...p.workstations.QUIMICO },
      INDUSTRIAL: { ...p.workstations.INDUSTRIAL },
      OFICINA: { ...p.workstations.OFICINA },
    },
    hand: [...p.hand],
    lastActionSummary: null,
  }));
  const playerMap = new Map<string, PlayerState>(players.map((p) => [p.id, p]));
  let deck = [...state.deck];
  let discardPile = [...state.discardPile];
  const bulletin: RoundEvent[] = [];
  const resolvedPlays: ResolvedPlayVisual[] = [];

  // Normalize missing submissions -> PASS
  const submissions: PlayerActionSubmission[] = players.map((p) => {
    const sub = state.pendingActions[p.id];
    if (!sub) {
      p.lastActionSummary = 'Pasó turno (tiempo agotado)';
      return { playerId: p.id, mode: 'PASS', submittedAt: Date.now() };
    }
    return sub;
  });

  // ------------------------------------------
  // 0. DISCARD & RENEW HAND SUBMISSIONS
  // ------------------------------------------
  for (const sub of submissions) {
    if (sub.mode !== 'DISCARD') continue;
    const actor = playerMap.get(sub.playerId);
    if (!actor || !sub.discardCardIds || sub.discardCardIds.length === 0) continue;

    let discardedCount = 0;
    for (const cid of sub.discardCardIds) {
      if (cid === actor.blockedCardId) continue;
      if (consumeCardFromHand(actor, cid, discardPile)) {
        discardedCount++;
      }
    }
    actor.lastActionSummary =
      discardedCount > 0
        ? `Descartó y renovó ${discardedCount} carta(s)`
        : 'Pasó turno';
  }

  // Helper to resolve a played card lookup
  const playEntries = submissions
    .filter((s) => s.mode === 'PLAY' && s.cardId)
    .map((sub) => {
      const actor = playerMap.get(sub.playerId)!;
      const card = actor.hand.find((c) => c.id === sub.cardId);
      return { sub, actor, card };
    })
    .filter(
      (item): item is { sub: PlayerActionSubmission; actor: PlayerState; card: CardInstance } =>
        Boolean(item.card) && item.card!.id !== item.actor.blockedCardId
    )
    .sort((a, b) => a.sub.submittedAt - b.sub.submittedAt);

  // ------------------------------------------
  // PRIORITY 1º: COLOCACIÓN DE NUEVOS PUESTOS DE TRABAJO
  // ------------------------------------------
  for (const { sub, actor, card } of playEntries) {
    if (card.category !== 'WORKSTATION') continue;
    const sector = card.sector as ConcreteSector;
    const slot = actor.workstations[sector];
    consumeCardFromHand(actor, card.id, discardPile);

    if (!slot.occupied) {
      slot.occupied = true;
      slot.shields = 0;
      slot.inRisk = false;
      slot.certified = false;
      actor.score += 40;
      actor.lastActionSummary = `Abrió puesto: ${slot.title} (+40 pts)`;
      bulletin.push(
        makeEvent(
          'WORKSTATION',
          `Nuevo puesto en ${actor.name}`,
          `${actor.name} inauguró ${slot.title}.`,
          [actor.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        outcome: 'WORKSTATION',
        outcomeLabel: 'Puesto abierto (+40)',
        priority: 1,
      });
    } else {
      actor.lastActionSummary = `${slot.title} ya estaba ocupado`;
    }
    void sub;
  }

  // ------------------------------------------
  // PRIORITY 2º: MEDIDAS PREVENTIVAS, EPIS, BENCHMARKING, EMERGENCIA Y CERTIFICACIONES ISO 45001
  // ------------------------------------------
  const applyPreventiveEffect = (
    actor: PlayerState,
    slot: WorkstationSlot,
    card: CardInstance,
    sourceLabel: string,
    quizResult?: { questionId: string; correct: boolean }
  ) => {
    if (slot.inRisk) {
      slot.inRisk = false;
      slot.shields = 0;
      actor.score += 50;
      actor.lastActionSummary = `Neutralizó riesgo en ${slot.title} (+50 pts)`;
      bulletin.push(
        makeEvent(
          'PREVENTED',
          `Riesgo controlado en ${actor.name}`,
          `${actor.name} neutralizó el riesgo en ${slot.title} con ${sourceLabel}.`,
          [actor.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        outcome: 'PREVENTED',
        outcomeLabel: 'Riesgo neutralizado (+50)',
        priority: 2,
      });
      return;
    }

    if (slot.shields === 0) {
      slot.shields = 1;
      actor.score += 50;
      actor.lastActionSummary = `Protegió ${slot.title} con Escudo (+50 pts)`;
      bulletin.push(
        makeEvent(
          'SHIELD',
          `Escudo preventivo en ${actor.name}`,
          `${actor.name} protegió ${slot.title} (${sourceLabel}).`,
          [actor.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        outcome: 'SHIELD',
        outcomeLabel: 'Escudo x1 (+50)',
        priority: 2,
      });
      return;
    }

    // 2nd Shield -> ISO 45001 Certification Quiz check!
    actor.quizTotal += 1;
    if (quizResult?.correct) {
      actor.quizCorrect += 1;
      slot.certified = true;
      slot.shields = 0;
      slot.inRisk = false;
      actor.score += 300;
      actor.lastActionSummary = `¡Certificó ISO 45001 en ${slot.title}! (+300 pts)`;
      bulletin.push(
        makeEvent(
          'CERTIFIED',
          `🏆 ¡ISO 45001 para ${actor.name}!`,
          `${actor.name} superó el reto PRL y certificó ${slot.title} (+300 pts, inmune toda la partida).`,
          [actor.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        outcome: 'CERTIFIED',
        outcomeLabel: '¡ISO 45001! (+300)',
        priority: 2,
      });
    } else {
      slot.shields = 1;
      actor.lastActionSummary = `Auditoría ISO fallida en ${slot.title} (sigue x1 escudo)`;
      bulletin.push(
        makeEvent(
          'AUDIT_FAILED',
          `Auditoría ISO no superada (${actor.name})`,
          `${actor.name} falló la pregunta de auditoría en ${slot.title}; el puesto conserva 1 escudo.`,
          [actor.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        outcome: 'AUDIT_FAILED',
        outcomeLabel: 'Auditoría fallida',
        priority: 2,
      });
    }
  };

  // Run EMERGENCY_PLAN first within Priority 2, or sequentially by submission
  for (const { sub, actor, card } of playEntries) {
    if (card.category === 'ACTION' && card.actionEffect === 'EMERGENCY_PLAN') {
      consumeCardFromHand(actor, card.id, discardPile);
      let cleared = 0;
      for (const s of CONCRETE_SECTORS) {
        if (actor.workstations[s].occupied && actor.workstations[s].inRisk) {
          actor.workstations[s].inRisk = false;
          cleared++;
        }
      }
      if (cleared > 0) {
        const pts = cleared * 50;
        actor.score += pts;
        actor.lastActionSummary = `Plan de Emergencia: limpió ${cleared} riesgo(s) (+${pts} pts)`;
        bulletin.push(
          makeEvent(
            'EMERGENCY',
            `🚨 Plan de Emergencia en ${actor.name}`,
            `${actor.name} evacuó y limpió ${cleared} riesgo(s) activo(s) de golpe (+${pts} pts).`,
            [actor.id]
          )
        );
        resolvedPlays.push({
          id: `rp-${actor.id}-${card.id}`,
          playerId: actor.id,
          playerName: actor.name,
          playerAvatar: actor.avatar,
          card,
          outcome: 'EMERGENCY',
          outcomeLabel: `Limpió ${cleared} riesgo(s)`,
          priority: 2,
        });
      } else {
        actor.lastActionSummary = 'Plan de Emergencia sin riesgos activos';
      }
      continue;
    }

    if (card.category === 'PREVENTION') {
      consumeCardFromHand(actor, card.id, discardPile);
      const targetSector = sub.targetSector;
      if (!targetSector) continue;
      const slot = actor.workstations[targetSector];
      if (!slot.occupied || slot.certified) continue;
      if (card.sector !== 'ALL' && card.sector !== targetSector) continue;

      applyPreventiveEffect(actor, slot, card, card.title, sub.quizResult);
      continue;
    }

    if (card.category === 'ACTION' && card.actionEffect === 'BENCHMARKING') {
      consumeCardFromHand(actor, card.id, discardPile);
      const sourcePlayer = sub.sourcePlayerId
        ? playerMap.get(sub.sourcePlayerId)
        : undefined;
      const sourceSector = sub.sourceSector;
      const targetSector = sub.targetSector;
      if (!sourcePlayer || !sourceSector || !targetSector) continue;

      const sourceSlot = sourcePlayer.workstations[sourceSector];
      const targetSlot = actor.workstations[targetSector];
      if (
        sourceSlot.occupied &&
        (sourceSlot.shields >= 1 || sourceSlot.certified) &&
        targetSlot.occupied &&
        !targetSlot.certified
      ) {
        applyPreventiveEffect(
          actor,
          targetSlot,
          card,
          `Benchmarking (${sourcePlayer.name})`,
          sub.quizResult
        );
        bulletin.push(
          makeEvent(
            'BENCHMARK',
            `Benchmarking de ${actor.name}`,
            `${actor.name} replicó buenas prácticas de ${sourcePlayer.name} en ${targetSlot.title}.`,
            [actor.id, sourcePlayer.id]
          )
        );
      }
    }
  }

  // ------------------------------------------
  // PRIORITY 3º: RIESGOS LABORALES, SUBCONTRATACIÓN E INSPECCIONES
  // ------------------------------------------

  // 3a. Hazards
  for (const { sub, actor, card } of playEntries) {
    if (card.category !== 'HAZARD') continue;
    consumeCardFromHand(actor, card.id, discardPile);

    const target = sub.targetPlayerId ? playerMap.get(sub.targetPlayerId) : undefined;
    const targetSector = sub.targetSector;
    if (!target || !targetSector || target.id === actor.id) continue;
    if (card.sector !== 'ALL' && card.sector !== targetSector) continue;

    const slot = target.workstations[targetSector];
    if (!slot.occupied) {
      actor.lastActionSummary = `Riesgo en ${target.name} (${SECTOR_META[targetSector].shortLabel}) sin puesto activo`;
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'MISS',
        outcomeLabel: 'Sin objetivo',
        priority: 3,
      });
      continue;
    }

    if (slot.certified) {
      actor.lastActionSummary = `${target.name} bloqueó "${card.title}" con ISO 45001`;
      bulletin.push(
        makeEvent(
          'BLOCKED',
          `🛡️ ISO 45001 blindó a ${target.name}`,
          `${actor.name} lanzó "${card.title}", pero ${slot.title} está certificado ISO 45001.`,
          [actor.id, target.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'BLOCKED',
        outcomeLabel: 'Blindado ISO 45001',
        priority: 3,
      });
      continue;
    }

    if (slot.shields >= 1) {
      slot.shields = 0;
      target.score += 25;
      actor.lastActionSummary = `Riesgo rompió escudo EPI de ${target.name}`;
      bulletin.push(
        makeEvent(
          'BLOCKED',
          `🦺 EPI detuvo el accidente en ${target.name}`,
          `${target.name} bloqueó "${card.title}" en ${slot.title} gracias a su Escudo Preventivo (+25 pts).`,
          [actor.id, target.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'BLOCKED',
        outcomeLabel: 'Bloqueado por EPI',
        priority: 3,
      });
      continue;
    }

    if (!slot.inRisk) {
      slot.inRisk = true;
      actor.score += 20;
      actor.lastActionSummary = `Puso en riesgo ${slot.title} de ${target.name}`;
      bulletin.push(
        makeEvent(
          'RISK',
          `⚠️ Alerta en ${target.name}`,
          `${actor.name} provocó "${card.title}" en ${slot.title} de ${target.name}. ¡Queda En Riesgo!`,
          [actor.id, target.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'RISK',
        outcomeLabel: '¡En Riesgo!',
        priority: 3,
      });
      continue;
    }

    // Already inRisk -> Baja Laboral / Siniestro! Destroys workstation
    slot.occupied = false;
    slot.shields = 0;
    slot.inRisk = false;
    slot.certified = false;
    actor.score += 40;
    actor.lastActionSummary = `Siniestro destruyó ${slot.title} de ${target.name}`;
    bulletin.push(
      makeEvent(
        'ACCIDENT',
        `🚨 ¡Baja Laboral / Siniestro en ${target.name}!`,
        `Segundo riesgo acumulado ("${card.title}") destruyó ${slot.title} de ${target.name}.`,
        [actor.id, target.id]
      )
    );
    resolvedPlays.push({
      id: `rp-${actor.id}-${card.id}`,
      playerId: actor.id,
      playerName: actor.name,
      playerAvatar: actor.avatar,
      card,
      targetName: target.name,
      outcome: 'ACCIDENT',
      outcomeLabel: '¡Siniestro!',
      priority: 3,
    });
  }

  // 3b. Safe Subcontracting
  for (const { sub, actor, card } of playEntries) {
    if (card.category !== 'ACTION' || card.actionEffect !== 'SAFE_SUBCONTRACT') continue;
    consumeCardFromHand(actor, card.id, discardPile);

    const target = sub.targetPlayerId ? playerMap.get(sub.targetPlayerId) : undefined;
    const targetSector = sub.targetSector;
    if (!target || !targetSector || target.id === actor.id) continue;

    const targetSlot = target.workstations[targetSector];
    const mySlot = actor.workstations[targetSector];

    if (targetSlot.occupied && !targetSlot.certified && !mySlot.occupied) {
      mySlot.occupied = true;
      mySlot.shields = targetSlot.shields;
      mySlot.inRisk = targetSlot.inRisk;
      mySlot.certified = false;

      targetSlot.occupied = false;
      targetSlot.shields = 0;
      targetSlot.inRisk = false;
      targetSlot.certified = false;

      actor.score += 60;
      actor.lastActionSummary = `Subcontrató ${mySlot.title} de ${target.name} (+60 pts)`;
      bulletin.push(
        makeEvent(
          'STEAL',
          `🔄 Subcontratación Segura de ${actor.name}`,
          `${actor.name} adquirió ${mySlot.title} desde ${target.name} (+60 pts).`,
          [actor.id, target.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'STEAL',
        outcomeLabel: 'Subcontratado (+60)',
        priority: 3,
      });
    } else {
      actor.lastActionSummary = `Subcontratación fallida en ${SECTOR_META[targetSector].shortLabel}`;
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'MISS',
        outcomeLabel: 'Bloqueado',
        priority: 3,
      });
    }
  }

  // 3c. Inspection Surprise (evaluate after hazards so new risks count!)
  const inspectionTargetsToFreeze: string[] = [];
  for (const { sub, actor, card } of playEntries) {
    if (card.category !== 'ACTION' || card.actionEffect !== 'INSPECTION_SURPRISE') continue;
    consumeCardFromHand(actor, card.id, discardPile);

    const target = sub.targetPlayerId ? playerMap.get(sub.targetPlayerId) : undefined;
    if (!target || target.id === actor.id) continue;

    const hasActiveRisks = CONCRETE_SECTORS.some(
      (s) => target.workstations[s].occupied && target.workstations[s].inRisk
    );

    if (hasActiveRisks) {
      actor.score += 100;
      inspectionTargetsToFreeze.push(target.id);
      actor.lastActionSummary = `Inspección Sorpresa exitosa a ${target.name} (+100 pts)`;
      bulletin.push(
        makeEvent(
          'INSPECTION',
          `🔍 Inspección Sorpresa a ${target.name}`,
          `${actor.name} detectó riesgos activos en ${target.name}: gana +100 pts y bloquea 1 carta suya en la próxima ronda.`,
          [actor.id, target.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'INSPECTION',
        outcomeLabel: '¡Infracción! (+100)',
        priority: 3,
      });
    } else {
      actor.lastActionSummary = `Inspección a ${target.name}: sin infracciones`;
      bulletin.push(
        makeEvent(
          'INSPECTION',
          `Inspección Sorpresa a ${target.name}`,
          `${actor.name} inspeccionó a ${target.name}, pero no tenía riesgos activos.`,
          [actor.id, target.id]
        )
      );
      resolvedPlays.push({
        id: `rp-${actor.id}-${card.id}`,
        playerId: actor.id,
        playerName: actor.name,
        playerAvatar: actor.avatar,
        card,
        targetName: target.name,
        outcome: 'MISS',
        outcomeLabel: 'Sin infracciones',
        priority: 3,
      });
    }
  }

  // ------------------------------------------
  // PHASE 3: REPLENISHMENT & GLOBAL INSPECTION
  // ------------------------------------------
  for (const p of players) {
    p.blockedCardId = null;
    p.ready = false;
    const needed = Math.max(0, 4 - p.hand.length);
    if (needed > 0) {
      const res = drawCards(deck, discardPile, needed, players.length);
      deck = res.deck;
      discardPile = res.discardPile;
      p.hand.push(...res.drawn);
    }
  }

  // Apply next-round blocked cards from Surprise Inspections after hands are replenished
  for (const targetId of inspectionTargetsToFreeze) {
    const target = playerMap.get(targetId);
    if (target && target.hand.length > 0) {
      const randomCard = target.hand[Math.floor(Math.random() * target.hand.length)];
      target.blockedCardId = randomCard.id;
    }
  }

  // Every 3 rounds: Inspección General de Trabajo
  let globalInspectionTriggered = false;
  if (state.round % 3 === 0) {
    globalInspectionTriggered = true;
    let sanctionedCount = 0;
    let rewardedCount = 0;

    for (const p of players) {
      const occupied = CONCRETE_SECTORS.map((s) => p.workstations[s]).filter(
        (s) => s.occupied
      );
      const hasRisk = occupied.some((s) => s.inRisk);
      const allProtected =
        occupied.length > 0 &&
        occupied.every((s) => !s.inRisk && (s.shields >= 1 || s.certified));

      if (hasRisk) {
        p.score = Math.max(0, p.score - 50);
        sanctionedCount++;
      } else if (allProtected) {
        p.score += 100;
        rewardedCount++;
      }
    }

    bulletin.unshift(
      makeEvent(
        'GLOBAL_INSPECTION',
        `🏛️ Inspección General de Trabajo (Ronda ${state.round})`,
        `${rewardedCount} empresa(s) con todos sus puestos protegidos ganaron +100 pts; ${sanctionedCount} con riesgos activos perdieron -50 pts.`,
        []
      )
    );
  }

  if (bulletin.length === 0) {
    bulletin.push(
      makeEvent(
        'WORKSTATION',
        `Ronda ${state.round} completada`,
        'Los equipos reorganizaron sus estrategias y renovaron su mano de PRL.',
        []
      )
    );
  }

  return {
    ...state,
    phase: 'RESOLUTION',
    timeLeft: 5,
    paused: false,
    players,
    deck,
    discardPile,
    pendingActions: {},
    roundBulletin: bulletin,
    lastResolvedPlays: resolvedPlays,
    globalInspectionTriggered,
  };
}

export function advanceFromResolution(state: GameState): GameState {
  if (state.phase !== 'RESOLUTION') return state;

  // Evaluate victory conditions
  const isoWinners = state.players.filter((p) => getCertifiedCount(p) >= 4);
  const roundLimitReached =
    (state.config.winMode === '10_ROUNDS' && state.round >= 10) ||
    (state.config.winMode === '15_ROUNDS' && state.round >= 15);

  if (isoWinners.length > 0) {
    const topScore = Math.max(...isoWinners.map((p) => p.score));
    const winners = isoWinners
      .filter((p) => p.score === topScore)
      .map((p) => p.id);
    return {
      ...state,
      phase: 'GAME_OVER',
      timeLeft: 0,
      winnerIds: winners,
      endReason:
        isoWinners.length === 1
          ? `¡${isoWinners[0].name} completó los 4 Puestos Certificados ISO 45001!`
          : '¡Múltiples empresas completaron las 4 Certificaciones ISO 45001! Desempate por Puntuación de Seguridad.',
    };
  }

  if (roundLimitReached) {
    const sorted = [...state.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return getCertifiedCount(b) - getCertifiedCount(a);
    });
    const best = sorted[0];
    const bestCerts = getCertifiedCount(best);
    const winners = sorted
      .filter((p) => p.score === best.score && getCertifiedCount(p) === bestCerts)
      .map((p) => p.id);

    return {
      ...state,
      phase: 'GAME_OVER',
      timeLeft: 0,
      winnerIds: winners,
      endReason: `Final de las ${state.round} rondas reglamentarias. ¡Victoria por mayor Puntuación de Seguridad Laboral!`,
    };
  }

  // Continue to next round
  const nextRoundState: GameState = {
    ...state,
    phase: 'PLANNING',
    round: state.round + 1,
    timeLeft: state.config.roundDuration,
    paused: false,
    pendingActions: {},
    globalInspectionTriggered: false,
    lastResolvedPlays: [],
    players: state.players.map((p) => ({ ...p, ready: false })),
  };

  return applyBotSubmissions(nextRoundState);
}

// ==========================================
// SANITIZATION FOR PER-PEER BROADCAST
// ==========================================

export function toPublicSummary(p: PlayerState): PublicPlayerSummary {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    isHost: p.isHost,
    isBot: p.isBot,
    connected: p.connected,
    score: p.score,
    workstations: p.workstations,
    ready: p.ready,
    handCount: p.hand.length,
    hasBlockedCard: Boolean(p.blockedCardId),
    quizCorrect: p.quizCorrect,
    quizTotal: p.quizTotal,
    lastActionSummary: p.lastActionSummary,
  };
}

export function sanitizeStateForPlayer(
  state: GameState,
  viewerPlayerId: string
): ClientGameView {
  const me = state.players.find((p) => p.id === viewerPlayerId) ?? null;
  return {
    roomCode: state.roomCode,
    phase: state.phase,
    round: state.round,
    timeLeft: state.timeLeft,
    paused: state.paused,
    config: state.config,
    players: state.players.map(toPublicSummary),
    me,
    myPendingAction: state.pendingActions[viewerPlayerId] ?? null,
    roundBulletin: state.roundBulletin,
    lastResolvedPlays: state.lastResolvedPlays,
    topDiscardCard:
      state.discardPile.length > 0
        ? state.discardPile[state.discardPile.length - 1]
        : null,
    winnerIds: state.winnerIds,
    endReason: state.endReason,
    globalInspectionTriggered: state.globalInspectionTriggered,
    deckCount: state.deck.length,
    discardCount: state.discardPile.length,
  };
}

export function getStandings(players: PublicPlayerSummary[]): PublicPlayerSummary[] {
  return [...players].sort((a, b) => {
    const aCert = getCertifiedCount(a);
    const bCert = getCertifiedCount(b);
    if (aCert >= 4 && bCert < 4) return -1;
    if (bCert >= 4 && aCert < 4) return 1;
    if (b.score !== a.score) return b.score - a.score;
    return bCert - aCert;
  });
}

// Unused export helper so tree-shaking / debugging stays handy
export { shuffleArray };
