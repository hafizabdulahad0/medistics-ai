
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Moon, Sun } from 'lucide-react';
import { AIStudyChat } from '@/components/ai/AIStudyChat';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

const AIChatbotPage = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center max-w-7xl">
          <Link to="/dashboard" className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" alt="Medistics Logo" className="w-8 h-8 object-contain" />
            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">AI Study Chatbot</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-9 h-9 p-0 hover:scale-110 transition-transform duration-200">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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

      <div className="container mx-auto px-4 lg:px-8 py-6 md:py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            💬 AI Study Chatbot
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Get instant help with your medical studies. Ask questions, request explanations, or get study guidance.
          </p>
        </div>

        {/* Main Content */}
        <div className="mb-8 md:mb-12">
          <AIStudyChat />
        </div>

        {/* Features Section */}
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">How AI Chatbot Helps You Study</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center pb-3">
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-gray-900 dark:text-white text-base md:text-lg">Instant Answers</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Get immediate responses to your medical questions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center pb-3">
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <CardTitle className="text-gray-900 dark:text-white text-base md:text-lg">Detailed Explanations</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Complex topics broken down into understandable parts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center pb-3">
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-gray-900 dark:text-white text-base md:text-lg">24/7 Availability</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Study support available whenever you need it
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbotPage;
