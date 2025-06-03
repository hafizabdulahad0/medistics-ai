import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Zap, Trophy, Clock, Target, Moon, Sun } from 'lucide-react';
import { BattleLobby } from '@/components/battle/BattleLobby';
import { BattleRoom } from '@/components/battle/BattleRoom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Battle = () => {
  const [currentView, setCurrentView] = useState<'lobby' | 'room'>('lobby');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  // Fetch user battle stats
  const { data: battleStats } = useQuery({
    queryKey: ['battle-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: leaderboardEntry, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return leaderboardEntry || {
        battles_won: 0,
        total_battles: 0,
        win_rate: 0,
        best_streak: 0
      };
    },
    enabled: !!user?.id
  });

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setCurrentView('lobby');
  };

  if (currentView === 'room' && currentRoomId) {
    return <BattleRoom roomId={currentRoomId} onLeaveRoom={handleLeaveRoom} />;
  }

  const stats = battleStats || {
    battles_won: 0,
    total_battles: 0,
    win_rate: 0,
    best_streak: 0
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center max-w-7xl">
          <Link to="/dashboard" className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" 
              alt="Medistics Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Battle Arena</span>
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
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
              Basic Plan
            </Badge>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.email?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ⚔️ Battle Arena
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test your medical knowledge against other students in real-time battles. 
            Prove you're the smartest student in Pakistan!
          </p>
        </div>

        {/* Battle Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <Trophy className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2" />
              <CardTitle className="text-xs md:text-sm">Battles Won</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.battles_won}</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <Target className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2" />
              <CardTitle className="text-xs md:text-sm">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{Math.round(stats.win_rate)}%</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <Zap className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2" />
              <CardTitle className="text-xs md:text-sm">Best Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.best_streak}</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <Users className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2" />
              <CardTitle className="text-xs md:text-sm">Total Battles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.total_battles}</div>
            </CardContent>
          </Card>
        </div>

        {/* Battle Lobby */}
        <BattleLobby onJoinBattle={handleJoinRoom} />
      </div>
    </div>
  );
};

export default Battle;
