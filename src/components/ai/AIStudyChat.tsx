
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, MessageSquare, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Message, ChatSession, ChatSessionInsert, ChatSessionUpdate } from '@/types/ai';

export const AIStudyChat = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedSessions: ChatSession[] = data.map(session => ({
        ...session,
        messages: Array.isArray(session.messages) 
          ? session.messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp
            }))
          : []
      }));

      setSessions(formattedSessions);
      
      if (formattedSessions.length > 0) {
        const latestSession = formattedSessions[0];
        setCurrentSession(latestSession);
        setMessages(latestSession.messages);
      }
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const createNewSession = async () => {
    try {
      const newSession: ChatSessionInsert = {
        user_id: user?.id!,
        session_name: `Study Session ${new Date().toLocaleDateString()}`,
        messages: [],
      };

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert([newSession])
        .select()
        .single();

      if (error) throw error;

      const formattedSession: ChatSession = {
        ...data,
        messages: []
      };

      setCurrentSession(formattedSession);
      setMessages([]);
      setSessions(prev => [formattedSession, ...prev]);

      toast({
        title: "New Session",
        description: "Started a new study session",
      });
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive",
      });
    }
  };

  const saveSession = async (sessionMessages: Message[]) => {
    if (!currentSession) return;

    try {
      const updateData: ChatSessionUpdate = {
        messages: sessionMessages,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_chat_sessions')
        .update(updateData)
        .eq('id', currentSession.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentSession) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10);

      const response = await supabase.functions.invoke('ai-study-chat', {
        body: {
          message: userMessage.content,
          conversationHistory: conversationHistory,
        },
      });

      if (response.error) throw response.error;

      const aiMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      await saveSession(finalMessages);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
  };

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading chat sessions...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Session Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Study Sessions</CardTitle>
            <Button onClick={createNewSession} size="sm" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={currentSession?.id === session.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => selectSession(session)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <div className="truncate">
                    {session.session_name || 'Unnamed Session'}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>AI Medical Study Assistant</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[500px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with your AI study assistant!</p>
                    <p className="text-sm mt-2">Ask questions about medical topics, request explanations, or get study help.</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.timestamp && (
                          <p className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a medical question..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading || !currentSession}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !input.trim() || !currentSession}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
