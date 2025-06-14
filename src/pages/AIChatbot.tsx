import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Moon, Sun, ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Input } from '@/components/ui/input';

// Define interface for a chat message
interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const DrSultanChat: React.FC = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { theme, setTheme } = useTheme();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get user profile data
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data;
        },
        enabled: !!user?.id
    });

    // Define plan color schemes
    const planColors = {
        'free': {
            light: 'bg-purple-100 text-purple-800 border-purple-300',
            dark: 'dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700'
        },
        'premium': {
            // New color for premium, aligned with main theme's pink/purple gradient feel
            light: 'bg-pink-100 text-pink-800 border-pink-300',
            dark: 'dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-700'
        },
        'pro': { // Keeping 'pro' here for now, although it's removed from text, in case it's used elsewhere
            light: 'bg-green-100 text-green-800 border-green-300',
            dark: 'dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
        },
        'iconic': { // Added iconic plan color scheme
            light: 'bg-blue-100 text-blue-800 border-blue-300',
            dark: 'dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700'
        },
        'default': { // Fallback for unknown plans
            light: 'bg-gray-100 text-gray-800 border-gray-300',
            dark: 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
        }
    };

    // Determine the user's plan and its display name
    const rawUserPlan = profile?.plan?.toLowerCase() || 'free'; // Ensure lowercase for lookup
    const userPlanDisplayName = rawUserPlan.charAt(0).toUpperCase() + rawUserPlan.slice(1) + ' Plan';

    // Get the color classes for the current plan
    const currentPlanColorClasses = planColors[rawUserPlan] || planColors['default'];

    // Check if the user has access to premium features (only premium plan)
    const hasPremiumAccess = rawUserPlan === 'premium'; // Changed to only 'premium'

    // Initial message from Dr. Sultan
    useEffect(() => {
        if (hasPremiumAccess) {
            setMessages([
                { sender: 'ai', text: "Hi, I am Dr Sultan, how can I help you today?" }
            ]);
        }
    }, [hasPremiumAccess]);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a message to the AI
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || loading) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: inputMessage.trim() };
        setMessages(prev => [...prev, newUserMessage]);
        setInputMessage('');
        setLoading(true);
        setError(null);

        try {
            const conversationHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            conversationHistory.push({ role: 'user', parts: [{ text: newUserMessage.text }] });

            const response = await fetch(`${API_BASE_BASE_URL}/chat-with-dr-sultan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_message: newUserMessage.text,
                    history: conversationHistory,
                    system_instruction: "You are Dr. Sultan, a medical AI assistant. Keep your responses concise, under 100 characters, and medically relevant without giving diagnoses."
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const aiResponseText = data.reply || "I'm sorry, I couldn't process that. Please try again.";

            setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);

        } catch (err) {
            console.error('Error sending message to Dr. Sultan:', err);
            setError(`Failed to get response: ${err instanceof Error ? err.message : String(err)}`);
            setMessages(prev => [...prev, { sender: 'ai', text: "I'm experiencing technical difficulties. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    // --- Authentication and Loading Fallback ---
    if (isAuthLoading || isProfileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 text-gray-900 dark:text-white">
                <p>Loading user session and profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 text-gray-900 dark:text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please sign in to access Dr. Sultan</h1>
                    <Link to="/login">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }
    // --- End Authentication and Loading Fallback ---

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
            {/* Header */}
            <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        {/* Back arrow button */}
                        <Link to="/dashboard" className="mr-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-9 h-9 p-0 hover:scale-110 transition-transform duration-200"
                                aria-label="Back to Dashboard"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-white" />
                            </Button>
                        </Link>
                        <img
                            src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png"
                            alt="Medistics Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Dr. Sultan Chat</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="w-9 h-9 p-0 hover:scale-110 transition-transform duration-200"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4 text-gray-700 dark:text-white" />
                            ) : (
                                <Moon className="h-4 w-4 text-gray-700 dark:text-white" />
                            )}
                        </Button>
                        {/* Dynamic Plan Badge with dynamic colors */}
                        <Badge
                            variant="secondary"
                            className={`${currentPlanColorClasses.light} ${currentPlanColorClasses.dark}`}
                        >
                            {userPlanDisplayName}
                        </Badge>
                        <ProfileDropdown />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 lg:px-8 py-8">
                {error && <div className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</div>}

                {!hasPremiumAccess ? (
                    <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 max-w-xl mx-auto my-16 border-2 border-purple-200 dark:border-purple-700 text-center">
                        <CardHeader className="mb-4 flex flex-col items-center">
                            <img
                                src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png"
                                alt="Medistics Logo"
                                className="w-32 h-32 object-contain mx-auto mb-6"
                            />
                            <CardTitle className="text-3xl font-extrabold text-purple-700 dark:text-purple-400">
                                Premium Feature
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                                Dr. Sultan Chat is a premium feature available only with the{' '}
                                <span className={`font-semibold ${planColors.premium.light.includes('text-') ? planColors.premium.light.split(' ').find(cls => cls.startsWith('text-')) : 'text-pink-800'} ${planColors.premium.dark.includes('text-') ? planColors.premium.dark.split(' ').find(cls => cls.startsWith('dark:text-')) : 'dark:text-pink-200'}`}>
                                    Premium
                                </span> plan.
                                Users with the{' '}
                                <span className={`font-semibold ${planColors.free.light.includes('text-') ? planColors.free.light.split(' ').find(cls => cls.startsWith('text-')) : 'text-purple-800'} ${planColors.free.dark.includes('text-') ? planColors.free.dark.split(' ').find(cls => cls.startsWith('dark:text-')) : 'dark:text-purple-200'}`}>
                                    Free
                                </span> or{' '}
                                <span className={`font-semibold ${planColors.iconic.light.includes('text-') ? planColors.iconic.light.split(' ').find(cls => cls.startsWith('text-')) : 'text-blue-800'} ${planColors.iconic.dark.includes('text-') ? planColors.iconic.dark.split(' ').find(cls => cls.startsWith('dark:text-')) : 'dark:text-blue-200'}`}>
                                    Iconic
                                </span> plan do not have access to this feature.
                                Upgrade your plan to unlock this and other exclusive benefits!
                            </p>
                            <div className="flex flex-col gap-4">
                                <Link to="/pricing">
                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 font-bold py-3 px-6 rounded-lg text-lg">
                                        Upgrade Your Plan
                                    </Button>
                                </Link>
                                <Link to="/dashboard">
                                    <Button variant="outline" className="w-full text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-300 dark:border-purple-300 dark:hover:bg-gray-700 py-3 px-6 rounded-lg text-lg">
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 max-w-2xl mx-auto my-16 border-2 border-purple-200 dark:border-purple-700 flex flex-col h-[70vh]">
                        <CardHeader className="text-center mb-4 pb-0">
                            <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                Chat with Dr. Sultan
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {/* Custom scrollbar style for better aesthetics */}
                            <style jsx>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 8px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: ${theme === 'dark' ? '#374151' : '#f1f1f1'};
                                    border-radius: 4px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: ${theme === 'dark' ? '#8B5CF6' : '#A78BFA'};
                                    border-radius: 4px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background: ${theme === 'dark' ? '#7C3AED' : '#9353ED'};
                                }
                            `}</style>
                            <div className="flex flex-col space-y-4">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                                                msg.sender === 'user'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] p-3 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                                            <div className="flex items-center">
                                                <span className="animate-pulse">Typing...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </CardContent>

                        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                            <Input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={loading}
                            >
                                Send
                            </Button>
                        </form>
                    </Card>
                )}
            </div>
            {/* Footer Text */}
            <div className="text-center mt-12 mb-4 text-gray-500 dark:text-gray-400 text-sm">
                <p>A Project by Educational Spot.</p>
                <p>&copy; 2025 Medistics. All rights reserved.</p>
            </div>
        </div>
    );
};

export default DrSultanChat;