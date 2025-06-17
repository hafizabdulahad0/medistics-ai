import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster'; // Assuming Toaster is still used elsewhere
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import MCQs from '@/pages/MCQs';
import Battle from '@/pages/Battle';
import AI from '@/pages/AI';
import AITestGeneratorPage from '@/pages/AITestGenerator';
import AIChatbotPage from '@/pages/AIChatbot';
import Leaderboard from '@/pages/Leaderboard';
import Admin from '@/pages/Admin';
import Admin2 from '@/pages/Admin2';
import Admin3 from '@/pages/Admin3';
import Profile from '@/pages/Profile';
import Pricing from '@/pages/Pricing';
import Checkout from '@/pages/Checkout';
import NotFound from '@/pages/NotFound';
import ChangePassword from '@/pages/ChangePassword';
import MockTest from '@/pages/MockTest';
import TestCompletionPage from '@/pages/TestCompletion'; // Import the new TestCompletionPage
import Classroom from '@/pages/Classroom'; // Import the new TestCompletionPage
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        themes={['light', 'dark']}
        forcedTheme={undefined}
      >
        <Router>
          <div className="App min-h-screen w-full bg-background text-foreground">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mcqs" element={<MCQs />} />
              <Route path="/battle" element={<Battle />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/ai/test-generator" element={<AITestGeneratorPage />} />
              <Route path="/ai/chatbot" element={<AIChatbotPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin2" element={<Admin2 />} />
              <Route path="/admin3" element={<Admin3 />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/password" element={<ChangePassword />} />
              <Route path="/profile/upgrade" element={<Profile />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/mock-test" element={<MockTest />} />
              <Route path="/test-completed" element={<TestCompletionPage />} /> {/* New route for TestCompletionPage */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/classroom" element={<Classroom />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
