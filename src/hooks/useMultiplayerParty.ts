'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataConnection, default as PeerType } from 'peerjs';
import {
  addBotsToLobby,
  advanceFromResolution,
  cancelPlayerAction,
  createInitialGameState,
  DEFAULT_CONFIG,
  joinOrReconnectPlayer,
  removeBotFromLobby,
  resetToLobby,
  resolveRound,
  sanitizeStateForPlayer,
  setPlayerConnection,
  startGame,
  submitPlayerAction,
  updateGameConfig,
} from '@/lib/gameEngine';
import {
  ClientGameView,
  GameConfig,
  GameState,
  PeerMessage,
  PlayerActionSubmission,
} from '@/types/game';

const STORAGE_PLAYER_ID = 'alerta_cero_player_id';
const STORAGE_PLAYER_NAME = 'alerta_cero_player_name';
const STORAGE_PLAYER_AVATAR = 'alerta_cero_player_avatar';
const STORAGE_LAST_ROOM = 'alerta_cero_last_room';

const PEER_PREFIX = 'alerta-cero-iso45001-';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export type ConnectionStatus =
  | 'IDLE'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export function normalizeRoomCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('PRL-')) return cleaned;
  if (cleaned.startsWith('PRL') && cleaned.length > 3) {
    return `PRL-${cleaned.slice(3).replace(/^-+/, '')}`;
  }
  return `PRL-${cleaned}`;
}

export function generateRoomCode(): string {
  const num = 100 + Math.floor(Math.random() * 900);
  return `PRL-${num}`;
}

function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return 'ssr-player';
  try {
    const existing = window.localStorage.getItem(STORAGE_PLAYER_ID);
    if (existing) return existing;
    const generated =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `plr-${crypto.randomUUID().slice(0, 12)}`
        : `plr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(STORAGE_PLAYER_ID, generated);
    return generated;
  } catch {
    return `plr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function loadSavedProfile(): {
  name: string;
  avatar: string;
  lastRoom: string;
} {
  if (typeof window === 'undefined') {
    return { name: '', avatar: '👷', lastRoom: '' };
  }
  try {
    return {
      name: window.localStorage.getItem(STORAGE_PLAYER_NAME) || '',
      avatar: window.localStorage.getItem(STORAGE_PLAYER_AVATAR) || '👷',
      lastRoom: window.localStorage.getItem(STORAGE_LAST_ROOM) || '',
    };
  } catch {
    return { name: '', avatar: '👷', lastRoom: '' };
  }
}

export function saveProfile(name: string, avatar: string, roomCode?: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PLAYER_NAME, name);
    window.localStorage.setItem(STORAGE_PLAYER_AVATAR, avatar);
    if (roomCode !== undefined) {
      window.localStorage.setItem(STORAGE_LAST_ROOM, roomCode);
    }
  } catch {
    // Ignore storage errors
  }
}

export function useMultiplayerParty() {
  const [isHost, setIsHost] = useState<boolean>(false);
  const [status, setStatus] = useState<ConnectionStatus>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [view, setView] = useState<ClientGameView | null>(null);

  const peerRef = useRef<PeerType | null>(null);
  const isHostRef = useRef<boolean>(false);
  const playerIdRef = useRef<string>('');
  const hostStateRef = useRef<GameState | null>(null);
  const retryCreateRef = useRef<
    ((name: string, avatar: string, config: GameConfig, attempt: number) => void) | null
  >(null);
  const retryJoinRef = useRef<
    ((roomCode: string, name: string, avatar: string) => void) | null
  >(null);

  // Host maps: playerId <-> DataConnection
  const playerConnsRef = useRef<Map<string, DataConnection>>(new Map());
  const connToPlayerRef = useRef<Map<string, string>>(new Map());

  // Client connection to Host
  const clientConnRef = useRef<DataConnection | null>(null);
  const joinParamsRef = useRef<{
    roomCode: string;
    name: string;
    avatar: string;
  } | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualLeaveRef = useRef<boolean>(false);

  useEffect(() => {
    playerIdRef.current = getOrCreatePlayerId();
  }, []);

  const broadcastState = useCallback((state: GameState) => {
    const myId = playerIdRef.current;
    setView(sanitizeStateForPlayer(state, myId));

    for (const [targetPlayerId, conn] of playerConnsRef.current.entries()) {
      if (conn.open) {
        try {
          const msg: PeerMessage = {
            type: 'STATE_SYNC',
            view: sanitizeStateForPlayer(state, targetPlayerId),
          };
          conn.send(msg);
        } catch {
          // Connection will be cleaned up on close/error
        }
      }
    }
  }, []);

  const commitHostState = useCallback(
    (updater: (prev: GameState) => GameState) => {
      if (!hostStateRef.current) return;
      const next = updater(hostStateRef.current);
      hostStateRef.current = next;
      broadcastState(next);
    },
    [broadcastState]
  );

  const cleanupPeer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (clientConnRef.current) {
      try {
        clientConnRef.current.close();
      } catch {
        // Ignore
      }
      clientConnRef.current = null;
    }

    for (const conn of playerConnsRef.current.values()) {
      try {
        conn.close();
      } catch {
        // Ignore
      }
    }
    playerConnsRef.current.clear();
    connToPlayerRef.current.clear();

    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch {
        // Ignore
      }
      peerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      manualLeaveRef.current = true;
      cleanupPeer();
    };
  }, [cleanupPeer]);

  // ==========================================
  // HOST: CREATE ROOM
  // ==========================================
  const createRoom = useCallback(
    async (
      name: string,
      avatar: string,
      config: GameConfig = DEFAULT_CONFIG,
      attempt = 0
    ): Promise<void> => {
      manualLeaveRef.current = false;
      cleanupPeer();
      setStatus('CONNECTING');
      setErrorMsg(null);
      setIsHost(true);
      isHostRef.current = true;

      const myId = playerIdRef.current || getOrCreatePlayerId();
      playerIdRef.current = myId;
      const roomCode = generateRoomCode();
      saveProfile(name, avatar, roomCode);

      try {
        const { default: Peer } = await import('peerjs');
        const peerId = `${PEER_PREFIX}${roomCode.toLowerCase()}`;
        const peer = new Peer(peerId, {
          debug: 0,
          config: { iceServers: ICE_SERVERS },
        });
        peerRef.current = peer;

        peer.on('open', () => {
          const initial = createInitialGameState(
            myId,
            name,
            avatar,
            roomCode,
            config
          );
          hostStateRef.current = initial;
          setView(sanitizeStateForPlayer(initial, myId));
          setStatus('CONNECTED');
        });

        peer.on('connection', (conn) => {
          conn.on('data', (rawData) => {
            const msg = rawData as PeerMessage;
            if (!msg || typeof msg !== 'object') return;

            if (msg.type === 'PING') {
              if (conn.open) {
                conn.send({ type: 'PONG', ts: msg.ts } satisfies PeerMessage);
              }
              return;
            }

            if (msg.type === 'JOIN_REQUEST') {
              if (!hostStateRef.current) return;
              const result = joinOrReconnectPlayer(
                hostStateRef.current,
                msg.playerId,
                msg.name,
                msg.avatar
              );

              if (!result.ok) {
                conn.send({
                  type: 'JOIN_REJECTED',
                  reason: result.reason || 'No se pudo unir a la sala.',
                } satisfies PeerMessage);
                setTimeout(() => {
                  try {
                    conn.close();
                  } catch {
                    // Ignore
                  }
                }, 300);
                return;
              }

              // Replace any prior connection for this playerId
              const oldConn = playerConnsRef.current.get(msg.playerId);
              if (oldConn && oldConn.connectionId !== conn.connectionId) {
                connToPlayerRef.current.delete(oldConn.connectionId);
                try {
                  oldConn.close();
                } catch {
                  // Ignore
                }
              }

              playerConnsRef.current.set(msg.playerId, conn);
              connToPlayerRef.current.set(conn.connectionId, msg.playerId);
              hostStateRef.current = result.state;

              conn.send({
                type: 'JOIN_ACCEPTED',
                playerId: msg.playerId,
                view: sanitizeStateForPlayer(result.state, msg.playerId),
              } satisfies PeerMessage);

              broadcastState(result.state);
              return;
            }

            if (msg.type === 'SUBMIT_ACTION') {
              const boundPlayerId = connToPlayerRef.current.get(conn.connectionId);
              if (!boundPlayerId || boundPlayerId !== msg.submission.playerId) return;
              commitHostState((prev) => submitPlayerAction(prev, msg.submission));
              return;
            }

            if (msg.type === 'CANCEL_ACTION') {
              const boundPlayerId = connToPlayerRef.current.get(conn.connectionId);
              if (!boundPlayerId || boundPlayerId !== msg.playerId) return;
              commitHostState((prev) => cancelPlayerAction(prev, msg.playerId));
            }
          });

          const handleDrop = () => {
            const droppedPlayerId = connToPlayerRef.current.get(conn.connectionId);
            connToPlayerRef.current.delete(conn.connectionId);
            if (!droppedPlayerId) return;

            const currentMapped = playerConnsRef.current.get(droppedPlayerId);
            if (currentMapped && currentMapped.connectionId === conn.connectionId) {
              playerConnsRef.current.delete(droppedPlayerId);
              commitHostState((prev) =>
                setPlayerConnection(prev, droppedPlayerId, false)
              );
            }
          };

          conn.on('close', handleDrop);
          conn.on('error', handleDrop);
        });

        peer.on('disconnected', () => {
          if (!manualLeaveRef.current && !peer.destroyed) {
            try {
              peer.reconnect();
            } catch {
              // Ignore
            }
          }
        });

        peer.on('error', (err) => {
          const errType = (err as { type?: string })?.type;
          if (errType === 'unavailable-id' && attempt < 5) {
            retryCreateRef.current?.(name, avatar, config, attempt + 1);
            return;
          }
          setErrorMsg(
            'No se pudo inicializar la sala P2P. Comprueba tu conexión e inténtalo de nuevo.'
          );
          setStatus('ERROR');
        });
      } catch {
        setErrorMsg('Error al cargar el módulo WebRTC en este navegador.');
        setStatus('ERROR');
      }
    },
    [broadcastState, cleanupPeer, commitHostState]
  );

  // ==========================================
  // CLIENT: JOIN ROOM
  // ==========================================
  const connectToHost = useCallback(
    async (roomCode: string, name: string, avatar: string, isRetry = false) => {
      const normalized = normalizeRoomCode(roomCode);
      if (!normalized) {
        setErrorMsg('Introduce un código de sala válido (ej. PRL-842).');
        setStatus('ERROR');
        return;
      }

      if (!isRetry) {
        manualLeaveRef.current = false;
        cleanupPeer();
        setStatus('CONNECTING');
      } else {
        setStatus('RECONNECTING');
      }

      setErrorMsg(null);
      setIsHost(false);
      isHostRef.current = false;
      joinParamsRef.current = { roomCode: normalized, name, avatar };
      saveProfile(name, avatar, normalized);

      const myId = playerIdRef.current || getOrCreatePlayerId();
      playerIdRef.current = myId;

      try {
        const { default: Peer } = await import('peerjs');
        const peer = new Peer({
          debug: 0,
          config: { iceServers: ICE_SERVERS },
        });
        peerRef.current = peer;

        let opened = false;
        const connectTimeout = setTimeout(() => {
          if (!opened && !manualLeaveRef.current) {
            setErrorMsg(
              `No se encontró la sala ${normalized} o la red bloqueó WebRTC. Verifica el código con el Host.`
            );
            setStatus('ERROR');
          }
        }, 12000);

        peer.on('open', () => {
          const hostPeerId = `${PEER_PREFIX}${normalized.toLowerCase()}`;
          const conn = peer.connect(hostPeerId, {
            reliable: true,
            serialization: 'json',
          });
          clientConnRef.current = conn;

          conn.on('open', () => {
            opened = true;
            clearTimeout(connectTimeout);
            conn.send({
              type: 'JOIN_REQUEST',
              playerId: myId,
              name,
              avatar,
            } satisfies PeerMessage);
          });

          conn.on('data', (rawData) => {
            const msg = rawData as PeerMessage;
            if (!msg || typeof msg !== 'object') return;

            if (msg.type === 'JOIN_ACCEPTED') {
              setView(msg.view);
              setStatus('CONNECTED');
              setErrorMsg(null);
              return;
            }

            if (msg.type === 'JOIN_REJECTED') {
              manualLeaveRef.current = true;
              clearTimeout(connectTimeout);
              setErrorMsg(msg.reason);
              setStatus('ERROR');
              cleanupPeer();
              return;
            }

            if (msg.type === 'STATE_SYNC') {
              setView(msg.view);
              setStatus('CONNECTED');
              return;
            }

            if (msg.type === 'ROOM_CLOSED') {
              manualLeaveRef.current = true;
              setErrorMsg(msg.reason || 'El Host cerró la sala.');
              setStatus('ERROR');
              cleanupPeer();
            }
          });

          const scheduleReconnect = () => {
            clearTimeout(connectTimeout);
            if (manualLeaveRef.current || !joinParamsRef.current) return;
            setStatus('RECONNECTING');
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = setTimeout(() => {
              if (!manualLeaveRef.current && joinParamsRef.current) {
                const params = joinParamsRef.current;
                cleanupPeer();
                retryJoinRef.current?.(params.roomCode, params.name, params.avatar);
              }
            }, 2500);
          };

          conn.on('close', scheduleReconnect);
          conn.on('error', scheduleReconnect);
        });

        peer.on('error', (err) => {
          clearTimeout(connectTimeout);
          const errType = (err as { type?: string })?.type;
          if (errType === 'peer-unavailable') {
            setErrorMsg(
              `No existe ninguna sala activa con el código ${normalized}.`
            );
            setStatus('ERROR');
            return;
          }
          if (!manualLeaveRef.current && joinParamsRef.current && isRetry) {
            reconnectTimerRef.current = setTimeout(() => {
              if (!manualLeaveRef.current && joinParamsRef.current) {
                const params = joinParamsRef.current;
                cleanupPeer();
                retryJoinRef.current?.(params.roomCode, params.name, params.avatar);
              }
            }, 3000);
          } else {
            setErrorMsg('No se pudo conectar con la sala. Comprueba tu conexión.');
            setStatus('ERROR');
          }
        });
      } catch {
        setErrorMsg('Error iniciando conexión P2P en el navegador.');
        setStatus('ERROR');
      }
    },
    [cleanupPeer]
  );

  useEffect(() => {
    retryCreateRef.current = (n, av, cfg, att) => {
      void createRoom(n, av, cfg, att);
    };
    retryJoinRef.current = (rc, n, av) => {
      void connectToHost(rc, n, av, true);
    };
  }, [createRoom, connectToHost]);

  // Client keepalive ping every 8 seconds
  useEffect(() => {
    if (isHost || status !== 'CONNECTED') return;
    const interval = setInterval(() => {
      const conn = clientConnRef.current;
      if (conn && conn.open) {
        try {
          conn.send({ type: 'PING', ts: Date.now() } satisfies PeerMessage);
        } catch {
          // Ignore
        }
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isHost, status]);

  // ==========================================
  // HOST ROUND TIMER LOOP
  // ==========================================
  useEffect(() => {
    if (!isHost) return;

    const timer = setInterval(() => {
      const state = hostStateRef.current;
      if (!state) return;

      if (state.phase === 'PLANNING') {
        if (state.paused || state.config.roundDuration === 0) return;
        if (state.timeLeft <= 1) {
          commitHostState((prev) => resolveRound(prev));
        } else {
          commitHostState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
        }
      } else if (state.phase === 'RESOLUTION') {
        if (state.timeLeft <= 1) {
          commitHostState((prev) => advanceFromResolution(prev));
        } else {
          commitHostState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isHost, commitHostState]);

  const startSoloPractice = useCallback(
    (
      name: string,
      avatar: string,
      botCount = 7,
      config: GameConfig = DEFAULT_CONFIG
    ) => {
      manualLeaveRef.current = false;
      cleanupPeer();
      setErrorMsg(null);
      setIsHost(true);
      isHostRef.current = true;

      const myId = playerIdRef.current || getOrCreatePlayerId();
      playerIdRef.current = myId;
      const roomCode = 'LOCAL';
      saveProfile(name, avatar);

      let initial = createInitialGameState(myId, name, avatar, roomCode, config);
      initial = addBotsToLobby(initial, Math.max(1, Math.min(19, botCount)));
      hostStateRef.current = initial;
      setView(sanitizeStateForPlayer(initial, myId));
      setStatus('CONNECTED');
    },
    [cleanupPeer]
  );

  // ==========================================
  // PUBLIC ACTIONS FOR HOST & CLIENTS
  // ==========================================
  const leaveRoom = useCallback(() => {
    manualLeaveRef.current = true;
    if (isHostRef.current) {
      for (const conn of playerConnsRef.current.values()) {
        if (conn.open) {
          try {
            conn.send({
              type: 'ROOM_CLOSED',
              reason: 'El Director de Partida ha cerrado la sala.',
            } satisfies PeerMessage);
          } catch {
            // Ignore
          }
        }
      }
    }
    cleanupPeer();
    hostStateRef.current = null;
    joinParamsRef.current = null;
    setIsHost(false);
    isHostRef.current = false;
    setView(null);
    setStatus('IDLE');
    setErrorMsg(null);
  }, [cleanupPeer]);

  const addBots = useCallback(
    (count: number) => {
      if (!isHostRef.current) return;
      commitHostState((prev) => addBotsToLobby(prev, count));
    },
    [commitHostState]
  );

  const removeBot = useCallback(
    (botId?: string) => {
      if (!isHostRef.current) return;
      commitHostState((prev) => removeBotFromLobby(prev, botId));
    },
    [commitHostState]
  );

  const updateConfig = useCallback(
    (partial: Partial<GameConfig>) => {
      if (!isHostRef.current) return;
      commitHostState((prev) => updateGameConfig(prev, partial));
    },
    [commitHostState]
  );

  const startMatch = useCallback(() => {
    if (!isHostRef.current) return;
    commitHostState((prev) => startGame(prev));
  }, [commitHostState]);

  const togglePause = useCallback(() => {
    if (!isHostRef.current) return;
    commitHostState((prev) => ({ ...prev, paused: !prev.paused }));
  }, [commitHostState]);

  const forceResolveRound = useCallback(() => {
    if (!isHostRef.current) return;
    commitHostState((prev) =>
      prev.phase === 'PLANNING' ? resolveRound(prev) : prev
    );
  }, [commitHostState]);

  const skipBulletin = useCallback(() => {
    if (!isHostRef.current) return;
    commitHostState((prev) =>
      prev.phase === 'RESOLUTION' ? advanceFromResolution(prev) : prev
    );
  }, [commitHostState]);

  const returnToLobby = useCallback(() => {
    if (!isHostRef.current) return;
    commitHostState((prev) => resetToLobby(prev));
  }, [commitHostState]);

  const submitAction = useCallback(
    (submission: Omit<PlayerActionSubmission, 'playerId' | 'submittedAt'>) => {
      const myId = playerIdRef.current;
      if (!myId) return;

      const fullSubmission: PlayerActionSubmission = {
        ...submission,
        playerId: myId,
        submittedAt: Date.now(),
      };

      if (isHostRef.current) {
        commitHostState((prev) => submitPlayerAction(prev, fullSubmission));
      } else if (clientConnRef.current && clientConnRef.current.open) {
        clientConnRef.current.send({
          type: 'SUBMIT_ACTION',
          submission: fullSubmission,
        } satisfies PeerMessage);
      }
    },
    [commitHostState]
  );

  const cancelAction = useCallback(() => {
    const myId = playerIdRef.current;
    if (!myId) return;
    if (isHostRef.current) {
      commitHostState((prev) => cancelPlayerAction(prev, myId));
    } else if (clientConnRef.current && clientConnRef.current.open) {
      clientConnRef.current.send({
        type: 'CANCEL_ACTION',
        playerId: myId,
      } satisfies PeerMessage);
    }
  }, [commitHostState]);

  return {
    isHost,
    status,
    errorMsg,
    view,
    createRoom,
    startSoloPractice,
    joinRoom: connectToHost,
    leaveRoom,
    addBots,
    removeBot,
    updateConfig,
    startMatch,
    togglePause,
    forceResolveRound,
    skipBulletin,
    returnToLobby,
    submitAction,
    cancelAction,
  };
}
