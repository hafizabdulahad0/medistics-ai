import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Zap, Brain, FileText, Moon, Sun } from 'lucide-react';
import { AIStudyChat } from '@/components/ai/AIStudyChat';
import { AITestGenerator } from '@/components/ai/AITestGenerator';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

const AI = () => {
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
            <span className="text-xl font-bold text-gray-900 dark:text-white">AI Study Assistant</span>
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
            🤖 AI Study Assistant
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get personalized help with your medical studies. Chat with our AI tutor or generate custom practice tests.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="text-center">
              <Bot className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-gray-900 dark:text-white">AI Chat Tutor</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Get instant answers to your medical questions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-gray-900 dark:text-white">Custom Tests</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Generate personalized practice tests
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <CardTitle className="text-gray-900 dark:text-white">Smart Learning</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                AI adapts to your learning style
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* AI Tools */}
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>AI-Powered Study Tools</span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Choose your preferred AI study method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700">
                <TabsTrigger 
                  value="chat" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  Chat Tutor
                </TabsTrigger>
                <TabsTrigger 
                  value="test" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  Test Generator
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-6">
                <AIStudyChat />
              </TabsContent>
              
              <TabsContent value="test" className="mt-6">
                <AITestGenerator />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AI;
