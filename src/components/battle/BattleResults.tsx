// @/components/battle/BattleResults.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Home, RefreshCw } from 'lucide-react';

// Props for BattleResults
interface BattleResultsProps {
  roomCode: string;
  results: {
    finalScore: number;
    totalQuestions: number;
    // Add other relevant results here, e.g., opponent scores, time taken etc.
  };
  onRestart: () => void; // Callback to restart the game (optional, depends on game logic)
  onBackToLobby: () => void; // Callback to go back to the lobby
}

export const BattleResults = ({ roomCode, results, onRestart, onBackToLobby }: BattleResultsProps) => {
  const percentage = (results.finalScore / results.totalQuestions) * 100;
  const isWinner = percentage >= 70; // Example win condition

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black p-4 text-white">
      <Card className="w-full max-w-xl bg-gray-800 border border-gray-700 shadow-xl text-center">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-extrabold text-yellow-400 flex items-center justify-center space-x-3">
            <Trophy className="w-8 h-8" />
            <span>Battle Results!</span>
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg mt-2">
            Room Code: <span className="font-mono text-purple-400">{roomCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">Your Score:</h3>
            <p className="text-5xl font-extrabold text-green-400">
              {results.finalScore} / {results.totalQuestions}
            </p>
            <p className="text-xl text-blue-300 mt-2">({percentage.toFixed(0)}%)</p>
          </div>

          <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">
              {isWinner ? "Victory!" : "Better Luck Next Time!"}
            </h3>
            <p className={`text-xl font-semibold ${isWinner ? 'text-lime-400' : 'text-orange-400'}`}>
              {isWinner ? "You performed excellently!" : "Keep practicing to improve!"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={onBackToLobby}
              className="flex-1 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Home className="w-5 h-5 mr-2" /> Back to Lobby
            </Button>
            <Button
              onClick={onRestart}
              variant="outline"
              className="flex-1 py-3 text-lg border-purple-400 text-purple-400 hover:bg-purple-900 font-semibold"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};