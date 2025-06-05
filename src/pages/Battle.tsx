import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Sword, 
  Users, 
  Timer, 
  Trophy, 
  Zap, 
  Target,
  Crown,
  Moon,
  Sun,
  Plus,
  Search,
  Gamepad2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { BattleLobby } from '@/components/battle/BattleLobby';
import { BattleRoom } from '@/components/battle/BattleRoom';

const Battle = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useState<'lobby' | 'room' | 'battle'>('lobby');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [battleSettings, setBattleSettings] = useState({
    battleType: '1v1',
    timePerQuestion: 15,
    totalQuestions: 10,
    subject: 'Biology'
  });

  // Fetch active battle rooms
  const { data: battleRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['battleRooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_rooms')
        .select(`
          *,
          battle_participants(*)
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 2000 // Refresh every 2 seconds
  });

  // Create battle room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (settings: typeof battleSettings) => {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const maxPlayers = settings.battleType === '1v1' ? 2 : 
                        settings.battleType === '2v2' ? 4 : 4;
      
      const { data, error } = await supabase
        .from('battle_rooms')
        .insert({
          room_code: roomCode,
          battle_type: settings.battleType,
          max_players: maxPlayers,
          time_per_question: settings.timePerQuestion,
          total_questions: settings.totalQuestions,
          status: 'waiting'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (room) => {
      setCurrentRoomId(room.id);
      setCurrentView('room');
      queryClient.invalidateQueries({ queryKey: ['battleRooms'] });
      toast({
        title: "Room Created!",
        description: `Room code: ${room.room_code}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: async (roomCode: string) => {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();
      
      if (roomError) throw new Error('Room not found or already started');
      
      // Check if room is full
      const { data: participants } = await supabase
        .from('battle_participants')
        .select('id')
        .eq('battle_room_id', room.id);
      
      if (participants && participants.length >= room.max_players) {
        throw new Error('Room is full');
      }
      
      return room;
    },
    onSuccess: (room) => {
      setCurrentRoomId(room.id);
      setCurrentView('room');
      toast({
        title: "Joined Room!",
        description: `Welcome to ${room.room_code}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const battleTypes = [
    { value: '1v1', label: '1 vs 1', icon: Users, max: 2 },
    { value: '2v2', label: '2 vs 2', icon: Users, max: 4 },
    { value: 'ffa', label: 'Free for All', icon: Crown, max: 4 }
  ];

  const subjects = ['Biology', 'Chemistry', 'Physics'];

  if (currentView === 'room' && currentRoomId) {
    return (
      <BattleRoom 
        roomId={currentRoomId}
        onLeave={() => {
          setCurrentView('lobby');
          setCurrentRoomId(null);
        }}
        onBattleStart={() => setCurrentView('battle')}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-red-50/30 to-pink-50/30 dark:from-gray-900 dark:via-red-900/10 dark:to-pink-900/10">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-red-200 dark:border-red-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center max-w-full">
          <Link to="/dashboard" className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" 
              alt="Medistics Logo" 
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
            />
            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Battle Arena</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 p-0 hover:scale-110 transition-transform duration-200"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Badge variant="secondary" className="hidden sm:block bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 text-xs">
              Free Plan
            </Badge>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 max-w-full">
        {/* Hero Section */}
        <div className="text-center mb-6 lg:mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ⚔️ Battle Arena
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Challenge your peers in real-time medical knowledge battles. 
            Test your skills and climb the ranks!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Create Battle Room */}
          <Card className="bg-gradient-to-br from-white to-red-50/50 dark:from-gray-800 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-lg md:text-xl">
                <Plus className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>Create Battle Room</span>
              </CardTitle>
              <CardDescription className="text-sm md:text-base">Set up a new battle and invite friends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6 pt-0">
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Battle Type</Label>
                <Select 
                  value={battleSettings.battleType} 
                  onValueChange={(value) => setBattleSettings({...battleSettings, battleType: value})}
                >
                  <SelectTrigger className="h-10 md:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {battleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base">Subject</Label>
                <Select 
                  value={battleSettings.subject} 
                  onValueChange={(value) => setBattleSettings({...battleSettings, subject: value})}
                >
                  <SelectTrigger className="h-10 md:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm md:text-base">Time per Question</Label>
                  <Select 
                    value={battleSettings.timePerQuestion.toString()} 
                    onValueChange={(value) => setBattleSettings({...battleSettings, timePerQuestion: parseInt(value)})}
                  >
                    <SelectTrigger className="h-10 md:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="20">20 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm md:text-base">Total Questions</Label>
                  <Select 
                    value={battleSettings.totalQuestions.toString()} 
                    onValueChange={(value) => setBattleSettings({...battleSettings, totalQuestions: parseInt(value)})}
                  >
                    <SelectTrigger className="h-10 md:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => createRoomMutation.mutate(battleSettings)}
                disabled={createRoomMutation.isPending}
                className="w-full h-10 md:h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                {createRoomMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Sword className="w-4 h-4 mr-2" />
                    Create Battle Room
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Battle Room */}
          <Card className="bg-gradient-to-br from-white to-red-50/50 dark:from-gray-800 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-lg md:text-xl">
                <Search className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>Join Battle Room</span>
              </CardTitle>
              <CardDescription className="text-sm md:text-base">Enter a room code to join an existing battle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6 pt-0">
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Room Code</Label>
                <Input 
                  placeholder="Enter 6-character room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="h-10 md:h-12 text-center font-mono text-lg tracking-wider"
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={() => joinRoomMutation.mutate(roomCode)}
                disabled={joinRoomMutation.isPending || roomCode.length !== 6}
                className="w-full h-10 md:h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                {joinRoomMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Join Battle Room
                  </>
                )}
              </Button>

              {/* Quick Stats */}
              <div className="bg-red-100/50 dark:bg-red-900/20 p-3 md:p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm md:text-base">Quick Tips</h4>
                <ul className="text-xs md:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Room codes are case-insensitive</li>
                  <li>• Battles start when room is full</li>
                  <li>• Points are awarded for speed & accuracy</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Battle Rooms */}
        <Card className="mt-6 lg:mt-8 bg-gradient-to-br from-white to-red-50/50 dark:from-gray-800 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 animate-slide-up">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-lg md:text-xl">
              <Gamepad2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Active Battle Rooms</span>
            </CardTitle>
            <CardDescription className="text-sm md:text-base">Join any available battle room</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            {roomsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 md:p-4 border border-red-200 dark:border-red-800 rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : battleRooms.length === 0 ? (
              <div className="text-center py-8">
                <Sword className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">No active battle rooms. Create one to start!</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {battleRooms.map((room: any) => (
                  <div 
                    key={room.id}
                    className="flex items-center justify-between p-3 md:p-4 border border-red-200 dark:border-red-800 rounded-lg bg-white/60 dark:bg-gray-800/50 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sword className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono font-bold text-red-600 dark:text-red-400 text-sm md:text-base">
                            {room.room_code}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {room.battle_type}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {room.battle_participants?.length || 0}/{room.max_players} players • 
                          {room.time_per_question}s per question • 
                          {room.total_questions} questions
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => joinRoomMutation.mutate(room.room_code)}
                      disabled={joinRoomMutation.isPending || (room.battle_participants?.length || 0) >= room.max_players}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm px-3 md:px-4 h-8 md:h-9"
                    >
                      {(room.battle_participants?.length || 0) >= room.max_players ? 'Full' : 'Join'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Battle;
