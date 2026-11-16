export type ConcreteSector = 'CONSTRUCCION' | 'QUIMICO' | 'INDUSTRIAL' | 'OFICINA';
export type Sector = ConcreteSector | 'ALL';

export const CONCRETE_SECTORS: ConcreteSector[] = [
  'CONSTRUCCION',
  'QUIMICO',
  'INDUSTRIAL',
  'OFICINA',
];

export type CardCategory = 'WORKSTATION' | 'HAZARD' | 'PREVENTION' | 'ACTION';

export type ActionEffect =
  | 'INSPECTION_SURPRISE'
  | 'BENCHMARKING'
  | 'EMERGENCY_PLAN'
  | 'SAFE_SUBCONTRACT';

export interface CardTemplate {
  templateId: string;
  title: string;
  category: CardCategory;
  sector: Sector;
  actionEffect?: ActionEffect;
  description: string;
  prlTip: string;
  weight: number;
}

export interface CardInstance {
  id: string;
  templateId: string;
  title: string;
  category: CardCategory;
  sector: Sector;
  actionEffect?: ActionEffect;
  description: string;
  prlTip: string;
}

export interface WorkstationSlot {
  sector: ConcreteSector;
  title: string;
  occupied: boolean;
  shields: number;
  inRisk: boolean;
  certified: boolean;
}

export interface PrlQuestion {
  id: string;
  sector: Sector;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  reference: string;
}

export interface PlayerActionSubmission {
  playerId: string;
  mode: 'PLAY' | 'DISCARD' | 'PASS';
  cardId?: string;
  discardCardIds?: string[];
  targetPlayerId?: string;
  targetSector?: ConcreteSector;
  sourcePlayerId?: string;
  sourceSector?: ConcreteSector;
  quizResult?: {
    questionId: string;
    correct: boolean;
  };
  submittedAt: number;
}

export type RoundEventType =
  | 'WORKSTATION'
  | 'PREVENTED'
  | 'SHIELD'
  | 'CERTIFIED'
  | 'AUDIT_FAILED'
  | 'RISK'
  | 'BLOCKED'
  | 'ACCIDENT'
  | 'INSPECTION'
  | 'BENCHMARK'
  | 'EMERGENCY'
  | 'STEAL'
  | 'GLOBAL_INSPECTION';

export interface RoundEvent {
  id: string;
  type: RoundEventType;
  title: string;
  description: string;
  involvedPlayerIds: string[];
}

export interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  connected: boolean;
  score: number;
  workstations: Record<ConcreteSector, WorkstationSlot>;
  hand: CardInstance[];
  blockedCardId: string | null;
  ready: boolean;
  quizCorrect: number;
  quizTotal: number;
  lastActionSummary: string | null;
}

export interface PublicPlayerSummary {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  connected: boolean;
  score: number;
  workstations: Record<ConcreteSector, WorkstationSlot>;
  ready: boolean;
  handCount: number;
  hasBlockedCard: boolean;
  quizCorrect: number;
  quizTotal: number;
  lastActionSummary: string | null;
}

export type WinMode = '4_ISO' | '10_ROUNDS' | '15_ROUNDS';
export type RoundDuration = 20 | 35 | 60 | 0;

export interface GameConfig {
  winMode: WinMode;
  roundDuration: RoundDuration;
  maxPlayers: number;
}

export type GamePhase = 'LOBBY' | 'PLANNING' | 'RESOLUTION' | 'GAME_OVER';

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  round: number;
  timeLeft: number;
  paused: boolean;
  config: GameConfig;
  players: PlayerState[];
  deck: CardInstance[];
  discardPile: CardInstance[];
  pendingActions: Record<string, PlayerActionSubmission>;
  roundBulletin: RoundEvent[];
  winnerIds: string[];
  endReason: string | null;
  globalInspectionTriggered: boolean;
}

export interface ClientGameView {
  roomCode: string;
  phase: GamePhase;
  round: number;
  timeLeft: number;
  paused: boolean;
  config: GameConfig;
  players: PublicPlayerSummary[];
  me: PlayerState | null;
  myPendingAction: PlayerActionSubmission | null;
  roundBulletin: RoundEvent[];
  winnerIds: string[];
  endReason: string | null;
  globalInspectionTriggered: boolean;
  deckCount: number;
  discardCount: number;
}

export type PeerMessage =
  | {
      type: 'JOIN_REQUEST';
      playerId: string;
      name: string;
      avatar: string;
    }
  | {
      type: 'JOIN_ACCEPTED';
      playerId: string;
      view: ClientGameView;
    }
  | {
      type: 'JOIN_REJECTED';
      reason: string;
    }
  | {
      type: 'STATE_SYNC';
      view: ClientGameView;
    }
  | {
      type: 'SUBMIT_ACTION';
      submission: PlayerActionSubmission;
    }
  | {
      type: 'CANCEL_ACTION';
      playerId: string;
    }
  | {
      type: 'PING';
      ts: number;
    }
  | {
      type: 'PONG';
      ts: number;
    }
  | {
      type: 'ROOM_CLOSED';
      reason: string;
    };
