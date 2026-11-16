'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  normalizeRoomCode,
  useMultiplayerParty,
} from '@/hooks/useMultiplayerParty';
import { GameArena } from './GameArena';
import { GameOverPodium } from './GameOverPodium';
import { LandingLobby } from './LandingLobby';
import { PrlGuideModal } from './PrlGuideModal';

export function AlertaCeroApp() {
  const searchParams = useSearchParams();
  const rawRoom = searchParams.get('room') || '';
  const initialRoomParam = rawRoom ? normalizeRoomCode(rawRoom) : '';

  const [guideOpen, setGuideOpen] = useState(false);

  const {
    isHost,
    status,
    errorMsg,
    view,
    createRoom,
    startSoloPractice,
    joinRoom,
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
  } = useMultiplayerParty();

  return (
    <>
      {(!view || view.phase === 'LOBBY') && (
        <LandingLobby
          initialRoomParam={initialRoomParam}
          status={status}
          errorMsg={errorMsg}
          view={view}
          isHost={isHost}
          onCreateRoom={createRoom}
          onStartSoloPractice={startSoloPractice}
          onJoinRoom={joinRoom}
          onLeaveRoom={leaveRoom}
          onAddBots={addBots}
          onRemoveBot={removeBot}
          onUpdateConfig={updateConfig}
          onStartMatch={startMatch}
          onOpenGuide={() => setGuideOpen(true)}
        />
      )}

      {view && (view.phase === 'PLANNING' || view.phase === 'RESOLUTION') && (
        <GameArena
          view={view}
          isHost={isHost}
          status={status}
          onSubmitAction={submitAction}
          onCancelAction={cancelAction}
          onTogglePause={togglePause}
          onChangeDuration={(roundDuration) => updateConfig({ roundDuration })}
          onForceResolve={forceResolveRound}
          onSkipBulletin={skipBulletin}
          onLeaveRoom={leaveRoom}
          onOpenGuide={() => setGuideOpen(true)}
        />
      )}

      {view && view.phase === 'GAME_OVER' && (
        <GameOverPodium
          view={view}
          isHost={isHost}
          onReturnToLobby={returnToLobby}
          onLeaveRoom={leaveRoom}
        />
      )}

      {guideOpen && <PrlGuideModal onClose={() => setGuideOpen(false)} />}
    </>
  );
}
