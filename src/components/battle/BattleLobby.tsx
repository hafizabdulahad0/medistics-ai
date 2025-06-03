import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Clock, Trophy, Swords } from 'lucide-react';
import { BattleRoom, DatabaseBattleRoom } from '@/types/battle';

interface BattleLobbyProps {
  onJoinBattle: (roomId: string) => void;
}

export const BattleLobby = ({ onJoinBattle }: BattleLobbyProps) => {
  const [rooms, setRooms] = useState<BattleRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [battleType, setBattleType] = useState<'1v1' | '2v2' | '4p'>('1v1');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert database types to app types with proper status casting
      const typedRooms: BattleRoom[] = (data || []).map((room: DatabaseBattleRoom) => ({
        ...room,
        battle_type: room.battle_type as '1v1' | '2v2' | '4p',
        status: room.status as 'waiting' | 'in_progress' | 'completed',
        current_players: room.current_players || 0,
        current_question: room.current_question || 0,
        time_per_question: room.time_per_question || 15,
        total_questions: room.total_questions || 10,
        questions: Array.isArray(room.questions) ? room.questions : null
      }));
      
      setRooms(typedRooms);
    } catch (error: any) {
      console.error('Error loading rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async () => {
    try {
      setIsCreating(true);
      
      const maxPlayers = battleType === '1v1' ? 2 : battleType === '2v2' ? 4 : 4;
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('battle_rooms')
        .insert([{
          room_code: roomCode,
          battle_type: battleType,
          max_players: maxPlayers,
          current_players: 0,
          status: 'waiting'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Room Created!",
        description: `Room code: ${roomCode}`,
      });

      onJoinBattle(data.id);
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create battle room",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoomByCode = async () => {
    if (!roomCode.trim()) return;

    try {
      const { data, error } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (error) throw error;

      if ((data.current_players || 0) >= data.max_players) {
        toast({
          title: "Room Full",
          description: "This battle room is already full",
          variant: "destructive",
        });
        return;
      }

      onJoinBattle(data.id);
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Room not found or already started",
        variant: "destructive",
      });
    }
  };

  const getBattleTypeColor = (type: string) => {
    switch (type) {
      case '1v1': return 'bg-blue-500';
      case '2v2': return 'bg-green-500';
      case '4p': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getBattleTypeIcon = (type: string) => {
    switch (type) {
      case '1v1': return <Swords className="w-4 h-4" />;
      case '2v2': return <Users className="w-4 h-4" />;
      case '4p': return <Trophy className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading battle rooms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Room Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Battle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select value={battleType} onValueChange={(value: '1v1' | '2v2' | '4p') => setBattleType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1v1">1v1 Duel</SelectItem>
                <SelectItem value="2v2">2v2 Team</SelectItem>
                <SelectItem value="4p">4 Player FFA</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createRoom} disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Battle Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Join by Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Join by Room Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter room code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="uppercase"
            />
            <Button onClick={joinRoomByCode} disabled={!roomCode.trim()}>
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Rooms */}
      <Card>
        <CardHeader>
          <CardTitle>Available Battle Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active battle rooms</p>
              <p className="text-sm">Create one or check back later!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getBattleTypeColor(room.battle_type)} text-white`}>
                      {getBattleTypeIcon(room.battle_type)}
                      <span className="ml-1">{room.battle_type}</span>
                    </Badge>
                    <div>
                      <p className="font-medium">Room: {room.room_code}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {room.current_players}/{room.max_players}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {room.time_per_question}s per question
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => onJoinBattle(room.id)}
                    disabled={room.current_players >= room.max_players}
                    variant={room.current_players >= room.max_players ? "secondary" : "default"}
                  >
                    {room.current_players >= room.max_players ? 'Full' : 'Join Battle'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
