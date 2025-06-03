import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Trophy, Brain, Target, Moon, Sun, Bot, Sword } from 'lucide-react';
import { useTheme } from 'next-themes';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized MCQs and adaptive testing with GPT integration"
    },
    {
      icon: Users,
      title: "Battle Arena",
      description: "Compete with peers in real-time 1v1, 2v2, and 4-player battles"
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description: "Track your progress and compete regionally and globally"
    },
    {
      icon: Target,
      title: "Practice MCQs",
      description: "Access comprehensive MCQ database for exam preparation"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "0",
      features: ["Static MCQs", "Basic Dashboard", "Limited Access"],
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    },
    {
      name: "Basic",
      price: "299",
      features: ["AI Test Generator", "Practice MCQs", "Battle Arena", "Analytics"],
      color: "bg-purple-100 dark:bg-purple-800/30 border-purple-300 dark:border-purple-700",
      popular: true
    },
    {
      name: "Premium",
      price: "599",
      features: ["AI Chatbot", "Voice Input", "Unlimited Battles", "Priority Support"],
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    }
  ];

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
              src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" 
              alt="Medistics Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Medistics</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/leaderboard" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <Trophy className="w-5 h-5" />
              <span className="hidden lg:inline">Leaderboard</span>
            </Link>
            <Link to="/battle" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <Sword className="w-5 h-5" />
              <span className="hidden lg:inline">Battle</span>
            </Link>
            <Link to="/mcqs" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <Target className="w-5 h-5" />
              <span className="hidden lg:inline">Practice</span>
            </Link>
            <Link to="/ai" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <Bot className="w-5 h-5" />
              <span className="hidden lg:inline">AI Chat</span>
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
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-purple-100 dark:hover:bg-purple-900/30">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transition-transform duration-200">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`container mx-auto px-4 lg:px-8 py-12 lg:py-20 text-center max-w-7xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Badge className="mb-6 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50 border-purple-300 dark:border-purple-700">
          🚀 Pakistan's First AI-Powered Medical Learning Platform
        </Badge>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Master Medical Sciences with
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> AI Intelligence</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Join thousands of medical students across Pakistan. Practice MCQs, battle peers, and ace your exams with our AI-powered platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-3 hover:scale-105 transition-transform duration-200">
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-105 transition-all duration-200">
              View Demo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">1000+</div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Students</div>
          </div>
          <div className="text-center animate-fade-in">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5K+</div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">MCQs Solved</div>
          </div>
          <div className="text-center animate-fade-in">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">85%</div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
          <div className="text-center animate-fade-in">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">24/7</div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">AI Support</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From AI-generated tests to competitive battles, we've got your medical education covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg md:text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Flexible plans designed for every stage of your medical journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.color} ${plan.popular ? 'border-purple-500 dark:border-purple-400 scale-105' : ''} transition-all duration-300 hover:shadow-xl hover:scale-105 animate-scale-in`} style={{ animationDelay: `${index * 0.2}s` }}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-white">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">PKR {plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className={`w-full hover:scale-105 transition-transform duration-200 ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'}`}>
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-7xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Medical Studies?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of medical students who are already acing their exams with Medistics.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3 bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 transition-transform duration-200">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" 
                  alt="Medistics Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold">Medistics</span>
              </div>
              <p className="text-gray-400">
                Empowering medical students across Pakistan with AI-powered learning.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/mcqs" className="hover:text-white transition-colors">MCQ Practice</Link></li>
                <li><Link to="/battle" className="hover:text-white transition-colors">Battle Arena</Link></li>
                <li><Link to="/ai" className="hover:text-white transition-colors">AI Chat</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>help@medistics.com</li>
                <li>+92 300 1234567</li>
                <li>Karachi, Pakistan</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Medistics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
