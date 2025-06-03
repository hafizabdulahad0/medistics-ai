import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Medal, Award, Crown, Star, Target, Zap, Users, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Leaderboard = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  // Fetch leaderboard data
  const { data: leaderboardData = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user's rank
  const { data: userRank } = useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-purple-500" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
             rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
             'bg-gradient-to-r from-amber-400 to-amber-600';
    }
    return 'bg-gradient-to-r from-purple-500 to-pink-500';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center max-w-full">
          <Link to="/dashboard" className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" 
              alt="Medistics Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</span>
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

      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-full">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 Leaderboard
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See how you rank against the best medical students in Pakistan. 
            Climb the ladder and prove your expertise!
          </p>
        </div>

        {/* User's Current Rank */}
        {userRank && (
          <Card className="mb-8 bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-scale-in backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Your Current Rank</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">You</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Score: {userRank.total_score}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    #{leaderboardData.findIndex(entry => entry.user_id === user?.id) + 1 || 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboardData.slice(0, 3).map((entry, index) => (
            <Card 
              key={entry.id} 
              className={`relative overflow-hidden hover:scale-105 transition-all duration-300 animate-fade-in bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 backdrop-blur-sm ${
                index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute top-0 left-0 right-0 h-2 ${getRankBadge(index + 1)}`}></div>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  {getRankIcon(index + 1)}
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  #{index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">
                    {entry.username?.substring(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {entry.username || 'Anonymous'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  @{entry.username || 'user'}
                </p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {entry.total_score}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Score</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rest of the Leaderboard */}
        <Card className="bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Top Students</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
                    </div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboardData.slice(3).map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-white/60 dark:bg-gray-800/50 hover:bg-purple-200/50 dark:hover:bg-purple-900/40 transition-all duration-300 border border-purple-100 dark:border-purple-800 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                        #{index + 4}
                      </span>
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {entry.username?.substring(0, 2).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.username || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{entry.username || 'user'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          {entry.total_score}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                      </div>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
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

export default Leaderboard;
