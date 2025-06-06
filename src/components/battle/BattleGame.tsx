
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, Users, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleGameProps {
  roomCode: string;
  onGameEnd: (results: any) => void;
  onLeave: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'What is the largest organ in the human body?',
    options: ['Heart', 'Liver', 'Skin', 'Brain'],
    correct_answer: 'Skin'
  },
  {
    id: '2',
    question: 'Which bone is the longest in the human body?',
    options: ['Tibia', 'Femur', 'Humerus', 'Radius'],
    correct_answer: 'Femur'
  },
  {
    id: '3',
    question: 'What is the normal resting heart rate for adults?',
    options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-140 bpm'],
    correct_answer: '60-100 bpm'
  },
  {
    id: '4',
    question: 'Which blood type is considered the universal donor?',
    options: ['A+', 'B+', 'AB+', 'O-'],
    correct_answer: 'O-'
  },
  {
    id: '5',
    question: 'What is the medical term for high blood pressure?',
    options: ['Hypotension', 'Hypertension', 'Tachycardia', 'Bradycardia'],
    correct_answer: 'Hypertension'
  }
];

export const BattleGame = ({ roomCode, onGameEnd, onLeave }: BattleGameProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gamePhase, setGamePhase] = useState<'playing' | 'result' | 'waiting'>('playing');
  const [playerCount] = useState(2);
  const [opponentScore] = useState(0);

  const currentQ = mockQuestions[currentQuestion];
  const totalQuestions = mockQuestions.length;

  // Timer effect
  useEffect(() => {
    if (gamePhase !== 'playing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, timeLeft, currentQuestion]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowResult(true);
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
    } else {
      // Game ended
      const results = {
        score,
        totalQuestions,
        accuracy: Math.round((score / totalQuestions) * 100),
        rank: score > opponentScore ? 1 : 2
      };
      onGameEnd(results);
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
                    <span>{score}/{currentQuestion + 1}</span>
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
              <span className="text-sm font-medium">Question {currentQuestion + 1} of {totalQuestions}</span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% Complete
              </span>
            </div>
            <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
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
                        disabled={showResult}
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
