// @/components/battle/BattleGame.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, Users, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock questions for demonstration. In a real app, these would come from the backend,
// possibly filtered by the `subject` defined in `roomDetails`.
const mockQuestions = [
  { id: '1', question: 'What is the largest organ in the human body?', options: ['Heart', 'Liver', 'Skin', 'Brain'], correct_answer: 'Skin' },
  { id: '2', question: 'Which bone is the longest in the human body?', options: ['Tibia', 'Femur', 'Humerus', 'Radius'], correct_answer: 'Femur' },
  { id: '3', question: 'What is the normal resting heart rate for adults?', options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-140 bpm'], correct_answer: '60-100 bpm' },
  { id: '4', question: 'Which blood type is considered the universal donor?', options: ['A+', 'B+', 'AB+', 'O-'], correct_answer: 'O-' },
  { id: '5', question: 'What is the medical term for high blood pressure?', options: ['Hypotension', 'Hypertension', 'Tachycardia', 'Bradycardia'], correct_answer: 'Hypertension' }
];

interface BattleGameProps {
  roomCode: string;
  onGameEnd: (results: any) => void;
  onLeave: () => void;
  roomDetails: { // New prop to receive actual room settings
    time_per_question: number;
    total_questions: number;
    max_players: number;
    battle_participants: any[]; // Used for displaying player count
    subject: string; // Subject for questions (mocked for now)
  };
}

export const BattleGame = ({ roomCode, onGameEnd, onLeave, roomDetails }: BattleGameProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  // FIX: Safely initialize timeLeft using optional chaining and a fallback default
  const [timeLeft, setTimeLeft] = useState(roomDetails?.time_per_question || 15);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // FIX: Safely access battle_participants and total_questions with fallbacks
  const playerCount = roomDetails?.battle_participants?.length || 0;
  const opponentScore = 0; // This would need real-time data from other players

  const currentQ = mockQuestions[currentQuestionIndex]; // Still using mockQuestions
  const totalQuestions = roomDetails?.total_questions || mockQuestions.length; // Use roomDetails for total questions, with fallback

  // Timer effect
  useEffect(() => {
    // If showing result or time's already up, stop current timer
    if (showResult || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer); // Stop this interval
          // If no answer selected, treat as incorrect before moving on
          if (!selectedAnswer) {
            // No score change for skipped/incorrect
          }
          setShowResult(true); // Briefly show result (even if skipped)
          setTimeout(() => {
            handleNextQuestion(); // Move to next question after short delay
          }, 1000); // 1 second delay
          // FIX: Use optional chaining for roomDetails.time_per_question with a fallback
          return roomDetails?.time_per_question || 15; // Reset for next question
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: clear interval when component unmounts or dependencies change
    return () => clearInterval(timer);
  }, [timeLeft, currentQuestionIndex, showResult, selectedAnswer, roomDetails?.time_per_question]); // Include optional chaining in dependency array

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return; // Prevent changing answer after it's been submitted/revealed
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || showResult) return; // Prevent multiple submissions or submission after showing result
    
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowResult(true);
    // Move to next question after a brief display of the result
    setTimeout(() => {
      handleNextQuestion();
    }, 1500); // Show result for 1.5 seconds
  };

  const handleNextQuestion = () => {
    setShowResult(false); // Hide previous question's result feedback
    setSelectedAnswer(null); // Clear selected answer for the new question

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // FIX: Use optional chaining for roomDetails.time_per_question with a fallback
      setTimeLeft(roomDetails?.time_per_question || 15); // Reset timer for the new question
    } else {
      // Game has ended
      const results = {
        score,
        totalQuestions,
        accuracy: Math.round((score / totalQuestions) * 100),
        // This 'rank' is a placeholder and would require fetching other players' scores
        rank: score > opponentScore ? 1 : (score < opponentScore ? 2 : 'Tie') 
      };
      onGameEnd(results); // Call the onGameEnd prop to transition to results in parent
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <Card className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-white">Battle Arena</CardTitle>
                  <p className="text-white/80">Room: {roomCode}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{playerCount}</span>
                  </div>
                  <p className="text-xs text-white/80">Players</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Timer className="w-4 h-4" />
                    <span className={timeLeft <= 5 ? 'text-yellow-300 font-bold' : ''}>{timeLeft}s</span>
                  </div>
                  <p className="text-xs text-white/80">Time Left</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{score}/{currentQuestionIndex + 1}</span>
                  </div>
                  <p className="text-xs text-white/80">Score</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
              </span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex} // Key ensures re-animation on question change
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQ?.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQ?.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQ.correct_answer;
                    const showCorrect = showResult && isCorrect;
                    const showIncorrect = showResult && isSelected && !isCorrect;
                    
                    let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
                    
                    if (showCorrect) {
                      buttonClass += "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300";
                    } else if (showIncorrect) {
                      buttonClass += "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300";
                    } else if (isSelected) {
                      buttonClass += "bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300";
                    } else {
                      buttonClass += "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30";
                    }

                    return (
                      <motion.button
                        key={index}
                        className={buttonClass}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showResult} // Disable interaction when showing result
                        whileHover={!showResult ? { scale: 1.01 } : {}}
                        whileTap={!showResult ? { scale: 0.99 } : {}}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Submit Button */}
                {!showResult && selectedAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <Button 
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3"
                      size="lg"
                    >
                      Submit Answer
                    </Button>
                  </motion.div>
                )}

                {/* Result feedback */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                      selectedAnswer === currentQ.correct_answer 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      <span>
                        {selectedAnswer === currentQ.correct_answer ? '✅ Correct!' : '❌ Incorrect'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Leave Battle Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLeave}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Leave Battle
          </Button>
        </div>
      </div>
    </div>
  );
};
