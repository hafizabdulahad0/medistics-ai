
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface BattleRoomProps {
  roomId: string;
  onLeave: () => void;
  onBattleStart: () => void;
}

export const BattleRoom = ({ roomId, onLeave, onBattleStart }: BattleRoomProps) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');

  // Fetch room data
  const { data: room } = useQuery({
    queryKey: ['battleRoom', roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
    refetchInterval: 2000
  });

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (gameState === 'playing') {
      timerId = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 0) {
            clearInterval(timerId);
            nextQuestion();
            return 30;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerId);
  }, [gameState, currentQuestion]);

  useEffect(() => {
    if (room?.status === 'in_progress' && gameState === 'waiting') {
      setGameState('playing');
      onBattleStart();
    }
  }, [room?.status, gameState, onBattleStart]);

  // For now, we'll check if user is the first participant (host logic can be improved later)
  const isHost = true; // Simplified for now

  const handleAnswer = (questionIndex: number, selectedOption: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const nextQuestion = () => {
    if (room && currentQuestion < room.total_questions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(30);
    } else {
      setGameState('finished');
    }
  };

  const startGame = async () => {
    if (!isHost || !room) return;
    
    try {
      const { error } = await supabase
        .from('battle_rooms')
        .update({ status: 'in_progress' })
        .eq('id', room.id);

      if (error) throw error;
      setGameState('playing');
      onBattleStart();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  if (!room) {
    return <div>Loading...</div>;
  }

  // Mock questions for now
  const mockQuestions = [
    {
      question: "What is the largest organ in the human body?",
      options: ["Heart", "Liver", "Skin", "Brain"]
    },
    {
      question: "Which bone is the longest in the human body?",
      options: ["Tibia", "Femur", "Humerus", "Radius"]
    }
  ];

  return (
    <div className="min-h-screen w-full py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Battle Room: {room.room_code}</CardTitle>
            <CardDescription>
              Type: {room.battle_type} | Questions: {room.total_questions} | Time: {room.time_per_question}s per question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gameState === 'waiting' && (
              <div className="text-center">
                {isHost ? (
                  <>
                    <p>You are the host. Start the game when ready!</p>
                    <Button onClick={startGame}>Start Game</Button>
                  </>
                ) : (
                  <p>Waiting for the host to start the game...</p>
                )}
              </div>
            )}

            {gameState === 'playing' && mockQuestions[currentQuestion] && (
              <>
                <div className="mb-4">
                  <Progress value={(currentQuestion + 1) / room.total_questions * 100} />
                  <p className="text-sm mt-1">Question {currentQuestion + 1} of {room.total_questions}</p>
                </div>

                <div className="mb-6">
                  <p className="text-lg font-semibold">{mockQuestions[currentQuestion].question}</p>
                  <ul className="mt-2 space-y-2">
                    {mockQuestions[currentQuestion].options.map((option, index) => (
                      <li key={index}>
                        <Button
                          variant={answers[currentQuestion] === option ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => handleAnswer(currentQuestion, option)}
                          disabled={!!answers[currentQuestion]}
                        >
                          {option}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <p>Time Left: {timeLeft}s</p>
                  <Button onClick={nextQuestion} disabled={!answers[currentQuestion]}>
                    Next Question
                  </Button>
                </div>
              </>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <p className="text-2xl font-bold mb-4">Game Over!</p>
                <p>Your Score: (To be implemented)</p>
                <Button onClick={onLeave} className="mt-4">Leave Room</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
