import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Input } from '@/components/ui/input'; // Assuming you have a reusable Input component

// Define interface for a chat message
interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

// =========================================================================
// MODIFICATION START: Define API_BASE_URL using environment variables
// =========================================================================

// For Vite projects: import.meta.env
// In development, it falls back to your local Flask server.
// In production (on Vercel), it will use the URL you set in Vercel's environment variables.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// If you are using Create React App (CRA), use this instead:
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

// =========================================================================
// MODIFICATION END
// =========================================================================


const DrSultanChat: React.FC = () => {
    // Auth and Theme hooks - same as AITestGenerator
    const { user, isLoading: isAuthLoading } = useAuth();
    const { theme, setTheme } = useTheme();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

    // Initial message from Dr. Sultan
    useEffect(() => {
        setMessages([
            { sender: 'ai', text: "Hi, I am Dr Sultan, how can I help you today?" }
        ]);
    }, []);

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
            // Construct conversation history for context (optional, but good for chatbots)
            const conversationHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model', // AI models often use 'model' for AI
                parts: [{ text: msg.text }]
            }));

            // Add the new user message to history for the API call
            conversationHistory.push({ role: 'user', parts: [{ text: newUserMessage.text }] });

            // =========================================================================
            // MODIFICATION START: Use API_BASE_URL for fetch call
            // =========================================================================
            const response = await fetch(`${API_BASE_URL}/chat-with-dr-sultan`, {
            // =========================================================================
            // MODIFICATION END
            // =========================================================================
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_message: newUserMessage.text,
                    history: conversationHistory, // Send history for contextual responses
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

    // --- Authentication Fallback (copied from AITestGenerator) ---
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 text-gray-900 dark:text-white">
                <p>Loading user session...</p>
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
    // --- End Authentication Fallback ---

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
            {/* Header - Copied from AITestGenerator */}
            <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
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
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                            Free Plan
                        </Badge>
                        <ProfileDropdown />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 lg:px-8 py-8">
                {error && <div className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</div>}

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
                            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
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
            </div>
            {/* Footer Text - Copied from AITestGenerator */}
            <div className="text-center mt-12 mb-4 text-gray-500 dark:text-gray-400 text-sm">
                <p>A Project by Educational Spot.</p>
                <p>&copy; 2025 Medistics. All rights reserved.</p>
            </div>
        </div>
    );
};

export default DrSultanChat;