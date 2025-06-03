import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, BookOpen, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import { CSVImporter } from '@/components/admin/CSVImporter';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center max-w-7xl">
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
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
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
              Admin
            </Badge>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.email?.substring(0, 2).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ⚙️ Admin Panel
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage the platform, import questions, and monitor system performance.
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="text-center bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <Users className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <BookOpen className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <BarChart3 className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Tests Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <Settings className="h-5 md:h-6 w-5 md:w-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <CardTitle className="text-xs md:text-sm text-gray-900 dark:text-white">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">0</div>
            </CardContent>
          </Card>
        </div>

        {/* CSV Importer */}
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Question Management</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Import MCQ questions from CSV files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CSVImporter />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
