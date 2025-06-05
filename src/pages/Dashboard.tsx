import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Calendar,
  Brain,
  Users,
  Sword,
  Bot,
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { LeaderboardPreview } from '@/components/dashboard/LeaderboardPreview';
import { StudyAnalytics } from '@/components/dashboard/StudyAnalytics';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user answers
      const { data: answers } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', user.id);

      // Get user's battle results
      const { data: battles } = await supabase
        .from('battle_results')
        .select('*')
        .eq('user_id', user.id);

      // Get AI tests
      const { data: aiTests } = await supabase
        .from('ai_generated_tests')
        .select('*')
        .eq('user_id', user.id);

      const totalQuestions = answers?.length || 0;
      const correctAnswers = answers?.filter(a => a.is_correct)?.length || 0;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const battlesPlayed = battles?.length || 0;
      const testsGenerated = aiTests?.length || 0;

      return {
        totalQuestions,
        correctAnswers,
        accuracy,
        battlesPlayed,
        testsGenerated
      };
    },
    enabled: !!user?.id
  });

  const features = [
    {
      title: "AI Test Generator",
      description: "Create personalized tests with AI",
      icon: Brain,
      link: "/ai/test-generator",
      gradient: "from-purple-500 to-indigo-500",
      stats: `${userStats?.testsGenerated || 0} tests generated`
    },
    {
      title: "Practice MCQs",
      description: "Master medical concepts with targeted practice",
      icon: Target,
      link: "/mcqs",
      gradient: "from-blue-500 to-cyan-500",
      stats: `${userStats?.totalQuestions || 0} questions answered`
    },
    {
      title: "Battle Arena",
      description: "Compete with peers in real-time",
      icon: Sword,
      link: "/battle",
      gradient: "from-red-500 to-pink-500",
      stats: `${userStats?.battlesPlayed || 0} battles played`
    },
    {
      title: "AI Study Chat",
      description: "Get instant help from AI tutor",
      icon: Bot,
      link: "/ai/chatbot",
      gradient: "from-green-500 to-emerald-500",
      stats: "24/7 available"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" 
              alt="Medistics Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</span>
          </Link>
          
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
            <Badge variant="secondary" className="hidden sm:block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
              Free Plan
            </Badge>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}! 👋
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
            Ready to continue your medical learning journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
                    {userStats?.accuracy || 0}%
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                    {userStats?.totalQuestions || 0}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Sword className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
                    {userStats?.battlesPlayed || 0}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Battles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400 truncate">
                    {userStats?.correctAnswers || 0}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Correct</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {features.map((feature, index) => (
            <Link key={index} to={feature.link}>
              <Card className="h-full bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-fade-in-up group overflow-hidden relative cursor-pointer" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <CardHeader className="relative z-10 p-4 lg:p-6">
                  <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                    <div className={`w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg lg:text-xl text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 truncate">
                        {feature.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {feature.stats}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 p-4 lg:p-6 pt-0">
                  <CardDescription className="text-sm lg:text-base text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Analytics and Leaderboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Study Analytics - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <StudyAnalytics />
          </div>
          
          {/* Leaderboard Preview - Takes 1 column */}
          <div className="lg:col-span-1">
            <LeaderboardPreview />
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-lg lg:text-xl">Weekly Progress</span>
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">Your learning activity this week</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <div className="space-y-3 lg:space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Questions Answered</span>
                    <span className="font-medium text-gray-900 dark:text-white">{userStats?.totalQuestions || 0}/100</span>
                  </div>
                  <Progress 
                    value={Math.min((userStats?.totalQuestions || 0) / 100 * 100, 100)} 
                    className="h-2 bg-gray-200 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">{userStats?.accuracy || 0}%</span>
                  </div>
                  <Progress 
                    value={userStats?.accuracy || 0} 
                    className="h-2 bg-gray-200 dark:bg-gray-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-lg lg:text-xl">Quick Actions</span>
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">Jump right into learning</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 space-y-3">
              <Link to="/leaderboard">
                <Button variant="outline" className="w-full justify-start border-purple-300 dark:border-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:scale-105">
                  <Trophy className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  View Leaderboard
                </Button>
              </Link>
              <Link to="/ai/test-generator">
                <Button variant="outline" className="w-full justify-start border-purple-300 dark:border-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:scale-105">
                  <Brain className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Generate AI Test
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="w-full justify-start border-purple-300 dark:border-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:scale-105">
                  <Users className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Profile Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
