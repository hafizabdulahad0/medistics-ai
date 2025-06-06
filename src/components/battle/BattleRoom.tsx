
import React, { useState } from 'react';
import { BattleGame } from './BattleGame';
import { BattleResults } from './BattleResults';

interface BattleRoomProps {
  roomId: string;
  onLeave: () => void;
  onBattleStart: () => void;
}

export const BattleRoom = ({ roomId, onLeave, onBattleStart }: BattleRoomProps) => {
  const [gameState, setGameState] = useState<'playing' | 'results'>('playing');
  const [battleResults, setBattleResults] = useState<any>(null);

  const handleGameEnd = (results: any) => {
    setBattleResults(results);
    setGameState('results');
  };

  const handlePlayAgain = () => {
    setGameState('playing');
    setBattleResults(null);
    onBattleStart();
  };

  if (gameState === 'results' && battleResults) {
    return (
      <BattleResults
        results={battleResults}
        roomCode={roomId}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return (
    <BattleGame
      roomCode={roomId}
      onGameEnd={handleGameEnd}
      onLeave={onLeave}
    />
  );
};
