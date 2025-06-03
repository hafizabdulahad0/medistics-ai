import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Users, Trophy, ArrowLeft, Crown } from 'lucide-react';
import { BattleRoom as BattleRoomType, Participant, DatabaseBattleRoom, DatabaseParticipant } from '@/types/battle';

interface BattleRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const BattleRoom = ({ roomId, onLeaveRoom }: BattleRoomProps) => {
  const [room, setRoom] = useState<BattleRoomType | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [battleCompleted, setBattleCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (roomId) {
      joinRoom();
      setupRealtimeSubscriptions();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (timeLeft > 0 && room?.status === 'in_progress' && !hasAnswered) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && room?.status === 'in_progress' && !hasAnswered) {
      submitAnswer(''); // Auto-submit empty answer when time runs out
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, room?.status, hasAnswered]);

  const joinRoom = async () => {
    try {
      setIsLoading(true);

      // Get room details
      const { data: roomData, error: roomError } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      // Convert database type to app type with proper status casting
      const typedRoom: BattleRoomType = {
        ...roomData,
        battle_type: roomData.battle_type as '1v1' | '2v2' | '4p',
        status: roomData.status as 'waiting' | 'in_progress' | 'completed',
        current_players: roomData.current_players || 0,
        current_question: roomData.current_question || 0,
        time_per_question: roomData.time_per_question || 15,
        total_questions: roomData.total_questions || 10,
        questions: Array.isArray(roomData.questions) ? roomData.questions : null
      };

      setRoom(typedRoom);

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('battle_participants')
        .select('*')
        .eq('battle_room_id', roomId)
        .eq('user_id', user?.id)
        .single();

      if (!existingParticipant) {
        // Add user as participant
        const { error: participantError } = await supabase
          .from('battle_participants')
          .insert([{
            battle_room_id: roomId,
            user_id: user?.id,
            username: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'
          }]);

        if (participantError) throw participantError;

        // Update room participant count
        await supabase
          .from('battle_rooms')
          .update({ current_players: typedRoom.current_players + 1 })
          .eq('id', roomId);
      }

      await loadParticipants();
      await loadCurrentQuestion();

    } catch (error: any) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join battle room",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('battle_participants')
        .select('*')
        .eq('battle_room_id', roomId)
        .order('score', { ascending: false });

      if (error) throw error;
      
      // Convert database types to app types
      const typedParticipants: Participant[] = (data || []).map((participant: DatabaseParticipant) => ({
        ...participant,
        score: participant.score || 0,
        answers: Array.isArray(participant.answers) ? participant.answers : []
      }));
      
      setParticipants(typedParticipants);
    } catch (error: any) {
      console.error('Error loading participants:', error);
    }
  };

  const loadCurrentQuestion = async () => {
    try {
      const { data: roomData, error } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      const roomPayload = roomData as any;

      if (roomPayload.status === 'completed') {
        setBattleCompleted(true);
        await loadFinalResults();
        return;
      }

      if (roomPayload.questions && Array.isArray(roomPayload.questions)) {
        const questionIndex = roomPayload.current_question || 0;
        if (questionIndex < roomPayload.questions.length) {
          setCurrentQuestion(roomPayload.questions[questionIndex]);
          setTimeLeft(roomPayload.time_per_question || 15);
          setHasAnswered(false);
          setSelectedAnswer('');
        }
      }
    } catch (error: any) {
      console.error('Error loading question:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to room updates
    const roomSubscription = supabase
      .channel(`battle_room_${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battle_rooms',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        console.log('Room update:', payload);
        if (payload.new) {
          const typedRoom: BattleRoomType = {
            ...(payload.new as DatabaseBattleRoom),
            battle_type: (payload.new as DatabaseBattleRoom).battle_type as '1v1' | '2v2' | '4p',
            status: (payload.new as DatabaseBattleRoom).status as 'waiting' | 'in_progress' | 'completed',
            current_players: (payload.new as DatabaseBattleRoom).current_players || 0,
            current_question: (payload.new as DatabaseBattleRoom).current_question || 0,
            time_per_question: (payload.new as DatabaseBattleRoom).time_per_question || 15,
            total_questions: (payload.new as DatabaseBattleRoom).total_questions || 10,
            questions: Array.isArray((payload.new as DatabaseBattleRoom).questions) ? (payload.new as DatabaseBattleRoom).questions : null
          };
          setRoom(typedRoom);
          loadCurrentQuestion();
        }
      })
      .subscribe();

    // Subscribe to participant updates
    const participantSubscription = supabase
      .channel(`battle_participants_${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battle_participants',
        filter: `battle_room_id=eq.${roomId}`
      }, (payload) => {
        console.log('Participant update:', payload);
        loadParticipants();
      })
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
      participantSubscription.unsubscribe();
    };
  };

  const submitAnswer = async (answer: string) => {
    if (hasAnswered || !currentQuestion) return;

    try {
      setHasAnswered(true);
      const isCorrect = answer === currentQuestion.correct_answer;
      const timeBonus = Math.max(0, timeLeft * 2);
      const points = isCorrect ? 100 + timeBonus : 0;

      // Update participant's answers and score
      const currentParticipant = participants.find(p => p.user_id === user?.id);
      if (currentParticipant) {
        const newAnswers = [...(currentParticipant.answers || []), {
          question_index: room?.current_question,
          selected_answer: answer,
          correct_answer: currentQuestion.correct_answer,
          is_correct: isCorrect,
          time_taken: (room?.time_per_question || 15) - timeLeft,
          points_earned: points
        }];

        await supabase
          .from('battle_participants')
          .update({
            answers: newAnswers,
            score: (currentParticipant.score || 0) + points
          })
          .eq('id', currentParticipant.id);
      }

      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect ? `+${points} points` : `Correct answer: ${currentQuestion.correct_answer}`,
        variant: isCorrect ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    }
  };

  const loadFinalResults = async () => {
    try {
      const { data, error } = await supabase
        .from('battle_results')
        .select('*')
        .eq('battle_room_id', roomId)
        .order('rank', { ascending: true });

      if (error) throw error;
      setFinalResults(data || []);
    } catch (error: any) {
      console.error('Error loading results:', error);
    }
  };

  const markReady = async () => {
    try {
      const currentParticipant = participants.find(p => p.user_id === user?.id);
      if (currentParticipant) {
        await supabase
          .from('battle_participants')
          .update({ is_ready: true })
          .eq('id', currentParticipant.id);
      }
    } catch (error: any) {
      console.error('Error marking ready:', error);
    }
  };

  const leaveRoom = async () => {
    try {
      // Remove participant
      await supabase
        .from('battle_participants')
        .delete()
        .eq('battle_room_id', roomId)
        .eq('user_id', user?.id);

      // Update room participant count
      if (room) {
        await supabase
          .from('battle_rooms')
          .update({ current_players: Math.max(0, room.current_players - 1) })
          .eq('id', roomId);
      }

      onLeaveRoom();
    } catch (error: any) {
      console.error('Error leaving room:', error);
      onLeaveRoom(); // Leave anyway
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Trophy className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 text-center text-sm font-bold">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Joining battle...</span>
      </div>
    );
  }

  if (battleCompleted && finalResults.length > 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Battle Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {finalResults.map((result, index) => (
              <div
                key={result.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  result.user_id === user?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getRankIcon(result.rank)}
                  <div>
                    <p className="font-medium">Player {index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.total_correct}/{result.total_questions} correct ({result.accuracy_percentage}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{result.final_score}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={onLeaveRoom} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lobby
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-8">
        <p>Battle room not found</p>
        <Button onClick={onLeaveRoom} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lobby
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Badge variant="secondary">{room.battle_type}</Badge>
                <span>Room: {room.room_code}</span>
              </CardTitle>
            </div>
            <Button variant="outline" onClick={leaveRoom}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {participants.length}/{room.max_players} players
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {room.time_per_question}s per question
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  participant.user_id === user?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    participant.is_ready ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="font-medium">{participant.username}</span>
                  {participant.user_id === user?.id && (
                    <Badge variant="secondary">You</Badge>
                  )}
                </div>
                <span className="font-bold">{participant.score} pts</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Area */}
      {room.status === 'waiting' ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Waiting for players...</p>
            <p className="text-muted-foreground mb-4">
              Need {room.max_players - participants.length} more player(s) to start
            </p>
            <Button onClick={markReady} variant="outline">
              Ready Up
            </Button>
          </CardContent>
        </Card>
      ) : currentQuestion ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {(room.current_question || 0) + 1} of {room.total_questions}</CardTitle>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-lg">{timeLeft}s</span>
              </div>
            </div>
            <Progress value={(timeLeft / (room.time_per_question || 15)) * 100} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className="justify-start text-left h-auto p-4"
                  onClick={() => {
                    setSelectedAnswer(option);
                    submitAnswer(option);
                  }}
                  disabled={hasAnswered}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
            {hasAnswered && (
              <div className="text-center text-muted-foreground">
                <p>Answer submitted! Waiting for next question...</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading question...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
