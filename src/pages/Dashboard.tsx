
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Brain, 
  Users, 
  Clock, 
  Star, 
  ArrowRight,
  MessageSquare,
  Award,
  Moon,
  Sun,
  Bot,
  Sword
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user statistics from user_answers and user_scores
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get user answers for accuracy calculation
      const { data: userAnswers, error: answersError } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', user.id);
      
      if (answersError) throw answersError;
      
      // Get user scores for test completion stats
      const { data: userScores, error: scoresError } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id);
      
      if (scoresError) throw scoresError;
      
      const totalQuestions = userAnswers?.length || 0;
      const totalCorrect = userAnswers?.filter(answer => answer.is_correct).length || 0;
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const testsCompleted = userScores?.length || 0;
      
      // Calculate streak (simplified - could be enhanced)
      const streak = Math.min(testsCompleted, 7);
      
      return {
        testsCompleted,
        accuracy,
        totalPoints: totalCorrect * 10,
        streak,
        studyTime: Math.round(testsCompleted * 0.5)
      };
    },
    enabled: !!user?.id
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: scores, error: scoresError } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (scoresError) throw scoresError;
      
      return scores?.map(score => ({
        id: score.id,
        type: 'test',
        subject: score.quiz_type || 'General',
        score: Math.round((score.score / score.total_questions) * 100),
        time: new Date(score.created_at || '').toLocaleDateString()
      })) || [];
    },
    enabled: !!user?.id
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return entries?.map((entry, index) => ({
        rank: index + 1,
        name: entry.username || 'Anonymous',
        score: entry.total_score || 0,
        avatar: entry.username?.substring(0, 2).toUpperCase() || 'AN',
        isUser: entry.user_id === user?.id
      })) || [];
    },
    enabled: !!user?.id
  });

  const stats = userStats || {
    testsCompleted: 0,
    accuracy: 0,
    totalPoints: 0,
    streak: 0,
    studyTime: 0
  };

  // Generate weekly progress data based on real user scores
  const { data: weeklyProgress } = useQuery({
    queryKey: ['weekly-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: scores, error } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by day and calculate averages
      const dayMap = new Map();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      scores?.forEach(score => {
        const date = new Date(score.created_at || '');
        const dayName = days[date.getDay()];
        const percentage = Math.round((score.score / score.total_questions) * 100);
        
        if (!dayMap.has(dayName)) {
          dayMap.set(dayName, { scores: [], tests: 0 });
        }
        
        dayMap.get(dayName).scores.push(percentage);
        dayMap.get(dayName).tests++;
      });
      
      return days.map(day => {
        const data = dayMap.get(day) || { scores: [], tests: 0 };
        const avgScore = data.scores.length > 0 
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) 
          : 0;
        
        return {
          day,
          score: avgScore,
          tests: data.tests
        };
      });
    },
    enabled: !!user?.id
  });

  // Subject distribution based on user activity
  const { data: subjectData } = useQuery({
    queryKey: ['subject-distribution', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: scores, error } = await supabase
        .from('user_scores')
        .select('quiz_type')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const subjects = scores?.reduce((acc, score) => {
        const subject = score.quiz_type || 'General';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
      return Object.entries(subjects).map(([subject, value], index) => ({
        subject,
        value,
        color: colors[index % colors.length]
      }));
    },
    enabled: !!user?.id
  });

  const chartConfig = {
    score: { label: "Score", color: "#8b5cf6" },
    tests: { label: "Tests", color: "#06b6d4" }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center max-w-7xl">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/161d7edb-aa7b-4383-a8e2-75b6685fc44f.png" 
              alt="Medistics Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Medistics</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/mcqs" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:scale-105">
              <Target className="w-5 h-5" />
            </Link>
            <Link to="/battle" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:scale-105">
              <Sword className="w-5 h-5" />
            </Link>
            <Link to="/ai" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:scale-105">
              <Bot className="w-5 h-5" />
            </Link>
            <Link to="/leaderboard" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:scale-105">
              <Trophy className="w-5 h-5" />
            </Link>
          </nav>

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
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-sm">
                {user?.email?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col min-h-[calc(100vh-73px)] w-full">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl flex-1">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Ready to beat your record? You're on a {stats.streak}-day streak!
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* Streak Card */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <div className="text-xl md:text-2xl animate-pulse">🔥</div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.streak} days</div>
                <p className="text-xs opacity-90">Keep it up!</p>
              </CardContent>
            </Card>

            {/* Tests Completed */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tests</CardTitle>
                <Target className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.testsCompleted}</div>
                <p className="text-xs opacity-90">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Completed
                </p>
              </CardContent>
            </Card>

            {/* Accuracy */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                <Brain className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.accuracy}%</div>
                <Progress value={stats.accuracy} className="mt-2 bg-white/20" />
              </CardContent>
            </Card>

            {/* Points */}
            <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points</CardTitle>
                <Trophy className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.totalPoints}</div>
                <p className="text-xs opacity-90">Points earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
            {/* Left Column - Quick Actions & Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Progress Chart */}
              {weeklyProgress && weeklyProgress.length > 0 && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Weekly Progress</CardTitle>
                    <CardDescription>Your performance over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-48 md:h-64">
                      <AreaChart data={weeklyProgress}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8b5cf6" 
                          fill="url(#colorScore)" 
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
                  <CardDescription>Jump into your studies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Link to="/mcqs">
                      <Button variant="outline" className="h-16 md:h-20 flex flex-col items-center justify-center space-y-2 w-full hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:scale-105 transition-all duration-200 border-purple-200 dark:border-purple-700">
                        <Target className="h-5 md:h-6 w-5 md:w-6 text-purple-600" />
                        <span className="text-xs md:text-sm">Practice MCQs</span>
                      </Button>
                    </Link>
                    
                    <Link to="/ai">
                      <Button variant="outline" className="h-16 md:h-20 flex flex-col items-center justify-center space-y-2 w-full hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:scale-105 transition-all duration-200 border-purple-200 dark:border-purple-700">
                        <Brain className="h-5 md:h-6 w-5 md:w-6 text-purple-600" />
                        <span className="text-xs md:text-sm">AI Test</span>
                      </Button>
                    </Link>
                    
                    <Link to="/battle">
                      <Button variant="outline" className="h-16 md:h-20 flex flex-col items-center justify-center space-y-2 w-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-105 transition-all duration-200 col-span-2 md:col-span-1">
                        <Users className="h-5 md:h-6 w-5 md:w-6 text-green-600" />
                        <span className="text-xs md:text-sm">Battle Arena</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                  <CardDescription>Your latest learning sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities && recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800/30 dark:to-pink-800/30 rounded-lg hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-700/30 dark:hover:to-pink-700/30 transition-all duration-200 hover:scale-102">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700">
                              <Target className="h-4 md:h-5 w-4 md:w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{activity.subject} Test</p>
                              <p className="text-xs text-gray-500">Score: {activity.score}%</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity</p>
                        <p className="text-sm mt-2">Start taking tests to see your progress here!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Leaderboard & Other Cards */}
            <div className="space-y-6">
              {/* Subject Distribution Chart */}
              {subjectData && subjectData.length > 0 && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Subject Distribution</CardTitle>
                    <CardDescription>Your focus areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-48">
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {subjectData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {subjectData.map((subject) => (
                        <div key={subject.subject} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{subject.subject}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mini Leaderboard */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Leaderboard</CardTitle>
                    <Link to="/leaderboard">
                      <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-200">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard && leaderboard.length > 0 ? (
                      leaderboard.slice(0, 5).map((player) => (
                        <div key={player.rank} className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:scale-102 ${
                          player.isUser ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800/40 dark:to-pink-800/40 border border-purple-300 dark:border-purple-600' : 'hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                              player.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                              player.rank === 2 ? 'bg-gray-100 text-gray-800' :
                              player.rank === 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {player.rank}
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">{player.avatar}</span>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${player.isUser ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                {player.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {player.score}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No leaderboard data yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Study Assistant */}
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>AI Study Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">Get Instant Help</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Ask any medical question and get detailed explanations from our AI tutor.
                  </p>
                  <Link to="/ai">
                    <Button variant="secondary" size="sm" className="w-full hover:scale-105 transition-transform duration-200">
                      <MessageSquare className="mr-2 h-3 w-3" />
                      Start Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Study Time */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Clock className="h-5 w-5" />
                    <span>Study Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.studyTime}h</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total time</p>
                    <div className="mt-4 bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.studyTime / 40) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Goal: 40h/month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
