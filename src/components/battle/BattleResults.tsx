
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, Award, Users, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BattleResultsProps {
  results: {
    score: number;
    totalQuestions: number;
    accuracy: number;
    rank: number;
    timeBonus?: number;
  };
  roomCode: string;
  onPlayAgain: () => void;
}

export const BattleResults = ({ results, roomCode, onPlayAgain }: BattleResultsProps) => {
  const { score, totalQuestions, accuracy, rank, timeBonus = 0 } = results;
  const finalScore = score * 10 + timeBonus;
  const isWinner = rank === 1;

  const getRankColor = () => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-orange-500';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-500 to-amber-700';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  const getRankIcon = () => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-yellow-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Main Results Card */}
        <Card className="mb-6 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${getRankColor()}`}></div>
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${getRankColor()} flex items-center justify-center text-4xl shadow-lg`}>
                {getRankIcon()}
              </div>
            </motion.div>
            
            <CardTitle className="text-3xl mb-2">
              {isWinner ? 'Victory!' : `${rank}${rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} Place`}
            </CardTitle>
            
            <p className="text-gray-600 dark:text-gray-400">
              Battle completed in room {roomCode}
            </p>
            
            <Badge 
              className={`mt-2 text-white bg-gradient-to-r ${getRankColor()}`}
              variant="secondary"
            >
              Rank #{rank}
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Target className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <Award className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{accuracy}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{finalScore}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">+{timeBonus}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Bonus</div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Performance Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-medium">{score}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy Rate:</span>
                  <span className="font-medium">{accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Rank:</span>
                  <span className="font-medium">#{rank}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Points:</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">{finalScore}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="lg"
              >
                Play Again
              </Button>
              
              <Link to="/battle" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  size="lg"
                >
                  New Battle
                </Button>
              </Link>
              
              <Link to="/dashboard" className="flex-1">
                <Button
                  variant="ghost"
                  className="w-full text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
