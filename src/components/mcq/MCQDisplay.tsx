
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface MCQDisplayProps {
  subject: string;
  chapter: string;
  onBack: () => void;
}

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

// Mock data for demo purposes
const mockMCQs: Record<string, MCQ[]> = {
  'acellular-life': [
    {
      id: '1',
      question: 'Which acellular entity is considered non-living outside a host?',
      options: ['Virus', 'Bacteria', 'Fungi', 'Protozoa'],
      correct_answer: 'Virus',
      explanation: 'Viruses are acellular entities that can only replicate inside living host cells and are considered non-living outside a host.'
    },
    {
      id: '2',
      question: 'What is the genetic material of most viruses?',
      options: ['DNA', 'RNA', 'Both DNA and RNA', 'Neither DNA nor RNA'],
      correct_answer: 'Both DNA and RNA',
      explanation: 'Viruses can have either DNA or RNA as their genetic material, but not both simultaneously in the same virus.'
    }
  ]
};

export const MCQDisplay = ({ subject, chapter, onBack }: MCQDisplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [score, setScore] = useState(0);

  // Use mock data for now
  const mcqs = mockMCQs[chapter] || [];

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestionIndex]);

  const currentMCQ = mcqs[currentQuestionIndex];
  const totalQuestions = mcqs.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentMCQ || !user) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedAnswer === currentMCQ.correct_answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowExplanation(true);
    setTimeSpent(timeTaken);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeSpent(0);
    } else {
      // Quiz completed
      toast({
        title: "Quiz Completed!",
        description: `You scored ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)`,
      });
      
      onBack();
    }
  };

  if (!mcqs || mcqs.length === 0) {
    return (
      <Card className="bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 backdrop-blur-sm">
        <CardContent className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No questions available for this chapter.</p>
          <Button onClick={onBack} className="mt-4 bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chapters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Chapters</span>
      </Button>

      {/* Progress Header */}
      <Card className="mb-6 bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900 dark:text-white">Question {currentQuestionIndex + 1} of {totalQuestions}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{timeSpent}s</span>
              </div>
              <span>Score: {score}/{currentQuestionIndex}</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed text-gray-900 dark:text-white">
                {currentMCQ?.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMCQ?.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentMCQ.correct_answer;
                  const showResult = showExplanation;
                  
                  let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
                  
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass += "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
                    } else {
                      buttonClass += "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "bg-purple-50 dark:bg-purple-900/50 border-purple-500 text-purple-700 dark:text-purple-300";
                    } else {
                      buttonClass += "bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      className={buttonClass}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showExplanation}
                      whileHover={!showExplanation ? { scale: 1.01 } : {}}
                      whileTap={!showExplanation ? { scale: 0.99 } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white">{String.fromCharCode(65 + index)}. {option}</span>
                        {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && currentMCQ?.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Explanation:</h4>
                  <p className="text-blue-800 dark:text-blue-300">{currentMCQ.explanation}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                {!showExplanation && selectedAnswer && (
                  <Button 
                    onClick={handleSubmitAnswer}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Submit Answer
                  </Button>
                )}
                
                {showExplanation && (
                  <Button 
                    onClick={handleNextQuestion}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
