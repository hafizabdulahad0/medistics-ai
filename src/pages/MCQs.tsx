import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Target, Trophy, Clock, Moon, Sun } from 'lucide-react';
import { SubjectSelector } from '@/components/mcq/SubjectSelector';
import { ChapterSelector } from '@/components/mcq/ChapterSelector';
import { MCQDisplay } from '@/components/mcq/MCQDisplay';
import { ProgressTracker } from '@/components/mcq/ProgressTracker';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

const MCQs = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [showMCQs, setShowMCQs] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const handleStartQuiz = () => {
    if (selectedSubject && selectedChapter) {
      setShowMCQs(true);
    }
  };

  const handleBackToSelection = () => {
    setShowMCQs(false);
    setSelectedChapter(null);
  };

  if (showMCQs && selectedSubject && selectedChapter) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 p-4">
        <MCQDisplay 
          subject={selectedSubject} 
          chapter={selectedChapter}
          onBack={handleBackToSelection}
        />
      </div>
    );
  }

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
            <span className="text-xl font-bold text-gray-900 dark:text-white">Practice MCQs</span>
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
            📚 MCQ Practice
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master medical concepts with our comprehensive MCQ practice system. 
            Choose your subject and chapter to begin your learning journey.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <ProgressTracker userId={user?.id} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="text-center bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in backdrop-blur-sm">
            <CardHeader className="pb-2">
              <BookOpen className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Questions Practiced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in backdrop-blur-sm">
            <CardHeader className="pb-2">
              <Target className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Accuracy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">0%</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in backdrop-blur-sm">
            <CardHeader className="pb-2">
              <Trophy className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Best Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">0</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in backdrop-blur-sm">
            <CardHeader className="pb-2">
              <Clock className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Avg. Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">0s</div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Selection */}
        <div className="mb-8">
          <Card className="bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-scale-in backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Step 1: Choose Your Subject</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Select the medical subject you want to practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectSelector 
                selectedSubject={selectedSubject}
                onSubjectSelect={(subject) => {
                  setSelectedSubject(subject);
                  setSelectedChapter(null);
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Chapter Selection */}
        {selectedSubject && (
          <div className="mb-8">
            <Card className="bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Step 2: Select Chapter</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Choose the specific chapter you want to focus on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChapterSelector 
                  subject={selectedSubject}
                  selectedChapter={selectedChapter}
                  onChapterSelect={setSelectedChapter}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Start Quiz Button */}
        {selectedSubject && selectedChapter && (
          <div className="text-center animate-fade-in">
            <Button
              onClick={handleStartQuiz}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
              size="lg"
            >
              🚀 Start Quiz - {selectedChapter}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQs;
