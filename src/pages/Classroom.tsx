import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Moon, Sun, PlusCircle, MessageCircle, Users, UserPlus, Mail, Check, X, Palette, Trash2, MoreVertical, User, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


const GROUP_MEMBER_LIMIT = 50; // Define the group member limit

// Define plan color schemes
const planColors = {
    'free': {
        light: 'bg-purple-100 text-purple-800 border-purple-300',
        dark: 'dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700'
    },
    'premium': {
        light: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        dark: 'dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700'
    },
    'iconic': {
        light: 'bg-green-100 text-green-800 border-green-300',
        dark: 'dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
    },
    // Add more plans as needed
    'default': { // Fallback for unknown plans
        light: 'bg-gray-100 text-gray-800 border-gray-300',
        dark: 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
    }
};

// Preset gradient colors for chat backdrop
const presetGradientColors = {
    'blue': 'from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50',
    'purple': 'from-purple-50/50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50',
    'green': 'from-green-50/50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50',
    'orange': 'from-orange-50/50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/50',
};

// Preset card background colors based on theme
const presetCardBackgrounds = {
    'blue': {
        light: 'bg-blue-50 border-blue-200',
        dark: 'dark:bg-blue-900/20 dark:border-blue-800'
    },
    'purple': {
        light: 'bg-purple-50 border-purple-200',
        dark: 'dark:bg-purple-900/20 dark:border-purple-800'
    },
    'green': {
        light: 'bg-green-50 border-green-200',
        dark: 'dark:bg-green-900/20 dark:border-green-800'
    },
    'orange': {
        light: 'bg-orange-50 border-orange-200',
        dark: 'dark:bg-orange-900/20 dark:border-orange-800'
    },
    'default': { // Fallback
        light: 'bg-gray-50 border-gray-200',
        dark: 'dark:bg-gray-800/20 dark:border-gray-700'
    }
};


// --- ChatBubble Component ---
const ChatBubble = ({ message, isSender, senderUsername, onUnsend, isOwnMessage }) => {
    const [showUnsend, setShowUnsend] = useState(false);

    const bubbleClass = isSender
        ? 'bg-purple-200 dark:bg-purple-700 text-gray-900 dark:text-white rounded-bl-xl rounded-tl-xl rounded-tr-sm self-end'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-br-xl rounded-tr-xl rounded-tl-sm self-start';

    const timeClass = isSender ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400';

    return (
        <div
            className={`relative max-w-[75%] px-4 py-2 ${bubbleClass} mb-2 group`}
            onMouseEnter={() => isOwnMessage && setShowUnsend(true)}
            onMouseLeave={() => isOwnMessage && setShowUnsend(false)}
        >
            <p className="font-bold text-sm mb-1">{senderUsername}</p>
            <p>{message.content}</p>
            <p className={`text-xs mt-1 text-right ${timeClass}`}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {/* Speech bubble tail using a pseudo-element for sender */}
            {isSender && (
                <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden">
                    <div className="absolute w-3 h-3 rounded-full bg-purple-200 dark:bg-purple-700" style={{ transform: 'translate(50%, 50%)' }}></div>
                </div>
            )}
            {/* Speech bubble tail using a pseudo-element for receiver */}
            {!isSender && (
                <div className="absolute bottom-0 left-0 w-3 h-3 overflow-hidden">
                    <div className="absolute w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" style={{ transform: 'translate(-50%, 50%)' }}></div>
                </div>
            )}

            {isOwnMessage && showUnsend && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                            title="Unsend message"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-purple-200 dark:border-purple-700">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your message for everyone in this chat.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onUnsend(message.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Unsend
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
};


const Classroom = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [newGroupName, setNewGroupName] = useState('');
    const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
    const [selectedChatGroup, setSelectedChatGroup] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [userToInvite, setUserToInvite] = useState('');
    const [isEditThemeDialogOpen, setIsEditThemeDialogOpen] = useState(false);
    const [selectedThemeColor, setSelectedThemeColor] = useState('blue'); // Default theme color for new groups
    const [isViewMembersDialogOpen, setIsViewMembersDialogOpen] = useState(false);


    const messagesEndRef = useRef(null); // Ref for auto-scrolling messages

    // --- Fetch User Profile (for plan) ---
    const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['userProfile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('plan')
                .eq('id', user.id)
                .single();
            if (error) {
                console.error("Error fetching user profile:", error);
                return null;
            }
            return data;
        },
        enabled: !!user?.id,
    });

    const userPlan = userProfile?.plan || 'default';
    const currentPlanColors = planColors[userPlan] || planColors['default'];

    // --- Fetch Chat Groups Query ---
    const { data: chatGroups, isLoading: isLoadingGroups } = useQuery({
        queryKey: ['chatGroups', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('group_members')
                .select('group_id, chat_groups(*)')
                .eq('user_id', user.id);

            if (error) {
                toast({
                    title: "Error fetching chat groups",
                    description: error.message,
                    variant: "destructive",
                });
                throw error;
            }
            return data.map(item => item.chat_groups);
        },
        enabled: !!user?.id,
    });

    // --- Fetch Messages for Selected Group Query ---
    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['chatMessages', selectedChatGroup?.id],
        queryFn: async () => {
            if (!selectedChatGroup?.id) return [];
            const { data, error } = await supabase
                .from('messages')
                .select('*, sender:profiles(username)')
                .eq('group_id', selectedChatGroup.id)
                .order('created_at', { ascending: true });

            if (error) {
                toast({
                    title: "Error fetching messages",
                    description: error.message,
                    variant: "destructive",
                });
                throw error;
            }
            return data;
        },
        enabled: !!selectedChatGroup?.id,
        refetchInterval: 3000,
    });

    // --- Fetch Group Members for Selected Group Query ---
    const { data: groupMembers, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['groupMembers', selectedChatGroup?.id],
        queryFn: async () => {
            if (!selectedChatGroup?.id) return [];
            const { data, error } = await supabase
                .from('group_members')
                .select('user_id, profiles(username, id)') // Added id to profiles
                .eq('group_id', selectedChatGroup.id);

            if (error) {
                toast({
                    title: "Error fetching group members",
                    description: error.message,
                    variant: "destructive",
                });
                throw error;
            }
            return data.map(item => item.profiles);
        },
        enabled: !!selectedChatGroup?.id && isViewMembersDialogOpen, // Only fetch when dialog is open
    });

    // --- Fetch Pending Invitations Query ---
    const { data: pendingInvitations, isLoading: isLoadingInvitations } = useQuery({
        queryKey: ['pendingInvitations', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('group_invitations')
                .select('*, chat_groups(name, id), invitedByUser:profiles!invited_by_user_id(username)') // Fetch inviting user's username
                .eq('invited_user_id', user.id)
                .eq('status', 'pending');

            if (error) {
                toast({
                    title: "Error fetching invitations",
                    description: error.message,
                    variant: "destructive",
                });
                throw error;
            }
            return data;
        },
        enabled: !!user?.id,
        refetchInterval: 5000,
    });

    // --- Create Chat Group Mutation ---
    const createGroupMutation = useMutation({
        mutationFn: async ({ groupName, themeColor }) => {
            const { data: groupData, error: groupError } = await supabase
                .from('chat_groups')
                .insert({
                    name: groupName,
                    created_by_user_id: user.id,
                    theme_color: themeColor, // Save the selected theme color
                })
                .select()
                .single();

            if (groupError) {
                throw groupError;
            }

            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupData.id,
                    user_id: user.id,
                });

            if (memberError) {
                await supabase.from('chat_groups').delete().eq('id', groupData.id);
                throw memberError;
            }

            return groupData;
        },
        onSuccess: () => {
            toast({
                title: "Group Created",
                description: `Chat group "${newGroupName}" successfully created.`,
                variant: "success",
            });
            queryClient.invalidateQueries(['chatGroups', user?.id]);
            setNewGroupName('');
            setSelectedThemeColor('blue'); // Reset to default
            setIsCreateGroupDialogOpen(false);
        },
        onError: (error) => {
            toast({
                title: "Failed to Create Group",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });

    // --- Update Group Theme Mutation ---
    const updateGroupThemeMutation = useMutation({
        mutationFn: async ({ groupId, newThemeColor }) => {
            const { data, error } = await supabase
                .from('chat_groups')
                .update({ theme_color: newThemeColor })
                .eq('id', groupId);

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            toast({
                title: "Theme Updated",
                description: "Group theme color has been updated.",
                variant: "success",
            });
            queryClient.invalidateQueries(['chatGroups', user?.id]);
            // Update the selectedChatGroup state to reflect the new theme immediately
            setSelectedChatGroup(prev => ({ ...prev, theme_color: selectedThemeColor }));
            setIsEditThemeDialogOpen(false);
        },
        onError: (error) => {
            toast({
                title: "Failed to Update Theme",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });


    // --- Send Message Mutation ---
    const sendMessageMutation = useMutation({
        mutationFn: async ({ groupId, messageContent }) => {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    group_id: groupId,
                    sender_id: user.id,
                    content: messageContent,
                });

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries(['chatMessages', selectedChatGroup.id]);
        },
        onError: (error) => {
            toast({
                title: "Failed to Send Message",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });

    // --- Unsend Message Mutation ---
    const unsendMessageMutation = useMutation({
        mutationFn: async (messageId) => {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId)
                .eq('sender_id', user.id); // Ensure only sender can delete their message

            if (error) {
                throw error;
            }
            return messageId;
        },
        onSuccess: (deletedMessageId) => {
            toast({
                title: "Message Unsent",
                description: "Your message has been unsent.",
                variant: "success",
            });
            queryClient.invalidateQueries(['chatMessages', selectedChatGroup.id]);
        },
        onError: (error) => {
            toast({
                title: "Failed to Unsend Message",
                description: error.message || "You can only unsend your own messages.",
                variant: "destructive",
            });
        },
    });

    // --- Invite User Mutation ---
    const inviteUserMutation = useMutation({
        mutationFn: async ({ groupId, invitedUsername }) => { // Changed to invitedUsername
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', invitedUsername); // Search by username only

            if (profileError || !profiles || profiles.length === 0) {
                throw new Error("Invited user not found.");
            }
            const invitedUserId = profiles[0].id;

            const { data: existingMember, error: memberError } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', invitedUserId)
                .single();

            if (existingMember) {
                throw new Error("User is already a member of this group.");
            }

            const { data: existingInvite, error: inviteCheckError } = await supabase
                .from('group_invitations')
                .select('id')
                .eq('group_id', groupId)
                .eq('invited_user_id', invitedUserId)
                .eq('status', 'pending')
                .single();

            if (existingInvite) {
                throw new Error("A pending invitation for this user already exists.");
            }

            const { count: memberCount, error: countError } = await supabase
                .from('group_members')
                .select('id', { count: 'exact' })
                .eq('group_id', groupId);

            if (countError) throw countError;

            if (memberCount >= GROUP_MEMBER_LIMIT) {
                throw new Error(`Group has reached its maximum limit of ${GROUP_MEMBER_LIMIT} members.`);
            }

            const { data, error } = await supabase
                .from('group_invitations')
                .insert({
                    group_id: groupId,
                    invited_user_id: invitedUserId,
                    invited_by_user_id: user.id,
                    status: 'pending',
                });

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            toast({
                title: "Invitation Sent",
                description: `An invitation has been sent to ${userToInvite}.`,
                variant: "success",
            });
            setUserToInvite('');
            setIsAddUserDialogOpen(false);
        },
        onError: (error) => {
            toast({
                title: "Failed to Send Invitation",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });

    // --- Accept Invitation Mutation ---
    const acceptInvitationMutation = useMutation({
        mutationFn: async (invitationId) => {
            const { data: invitation, error: fetchError } = await supabase
                .from('group_invitations')
                .select('*')
                .eq('id', invitationId)
                .single();

            if (fetchError || !invitation) {
                throw new Error("Invitation not found.");
            }

            const { error: memberAddError } = await supabase
                .from('group_members')
                .insert({
                    group_id: invitation.group_id,
                    user_id: user.id,
                });

            if (memberAddError) {
                if (memberAddError.code === '23505') {
                    // This error means the user is already a member, which is fine in this context.
                    // We can proceed to update the invitation status.
                } else {
                    throw memberAddError;
                }
            }

            const { data, error } = await supabase
                .from('group_invitations')
                .update({ status: 'accepted' })
                .eq('id', invitationId);

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            toast({
                title: "Invitation Accepted",
                description: "You have successfully joined the group.",
                variant: "success",
            });
            queryClient.invalidateQueries(['pendingInvitations', user?.id]);
            queryClient.invalidateQueries(['chatGroups', user?.id]);
        },
        onError: (error) => {
            toast({
                title: "Failed to Accept Invitation",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });

    // --- Reject Invitation Mutation ---
    const rejectInvitationMutation = useMutation({
        mutationFn: async (invitationId) => {
            const { data, error } = await supabase
                .from('group_invitations')
                .update({ status: 'rejected' })
                .eq('id', invitationId);

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            toast({
                title: "Invitation Rejected",
                description: "The group invitation has been rejected.",
                variant: "info",
            });
            queryClient.invalidateQueries(['pendingInvitations', user?.id]);
        },
        onError: (error) => {
            toast({
                title: "Failed to Reject Invitation",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });

    // --- Leave Group Mutation ---
    const leaveGroupMutation = useMutation({
        mutationFn: async (groupId) => {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', user.id);

            if (error) {
                throw error;
            }
            return true;
        },
        onSuccess: () => {
            toast({
                title: "Group Left",
                description: `You have successfully left "${selectedChatGroup?.name}".`,
                variant: "success",
            });
            setSelectedChatGroup(null); // Go back to group list
            queryClient.invalidateQueries(['chatGroups', user?.id]);
        },
        onError: (error) => {
            toast({
                title: "Failed to Leave Group",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        },
    });


    const handleCreateGroup = () => {
        if (!newGroupName.trim()) {
            toast({
                title: "Group Name Required",
                description: "Please enter a name for your chat group.",
                variant: "destructive",
            });
            return;
        }
        createGroupMutation.mutate({ groupName: newGroupName, themeColor: selectedThemeColor });
    };

    const handleUpdateGroupTheme = () => {
        if (!selectedChatGroup?.id || !selectedThemeColor) {
            toast({
                title: "Invalid Selection",
                description: "Please select a group and a theme color.",
                variant: "destructive",
            });
            return;
        }
        updateGroupThemeMutation.mutate({ groupId: selectedChatGroup.id, newThemeColor: selectedThemeColor });
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChatGroup?.id) {
            return;
        }
        sendMessageMutation.mutate({ groupId: selectedChatGroup.id, messageContent: newMessage });
    };

    const handleInviteUser = () => {
        if (!userToInvite.trim() || !selectedChatGroup?.id) {
            toast({
                title: "Username Required",
                description: "Please enter the username of the user you want to invite.",
                variant: "destructive",
            });
            return;
        }
        inviteUserMutation.mutate({ groupId: selectedChatGroup.id, invitedUsername: userToInvite });
    };

    const handleUnsendMessage = (messageId) => {
        unsendMessageMutation.mutate(messageId);
    };

    const handleLeaveGroup = () => {
        if (selectedChatGroup?.id) {
            leaveGroupMutation.mutate(selectedChatGroup.id);
        }
    };


    // Auto-scroll to the bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Listen for new messages and deletions in real-time
    useEffect(() => {
        if (!selectedChatGroup?.id) return;

        const channel = supabase
            .channel(`public:messages:group_id=eq.${selectedChatGroup.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `group_id=eq.${selectedChatGroup.id}` }, payload => {
                queryClient.invalidateQueries(['chatMessages', selectedChatGroup.id]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedChatGroup?.id, queryClient]);

    // Listen for new invitations and group member changes in real-time
    useEffect(() => {
        if (!user?.id) return;

        const invitationChannel = supabase
            .channel(`public:group_invitations:invited_user_id=eq.${user.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_invitations', filter: `invited_user_id=eq.${user.id}` }, payload => {
                queryClient.invalidateQueries(['pendingInvitations', user?.id]);
            })
            .subscribe();

        const groupMemberChannel = supabase
            .channel(`public:group_members:user_id=eq.${user.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `user_id=eq.${user.id}` }, payload => {
                queryClient.invalidateQueries(['chatGroups', user?.id]);
            })
            .subscribe();


        return () => {
            supabase.removeChannel(invitationChannel);
            supabase.removeChannel(groupMemberChannel);
        };
    }, [user?.id, queryClient]);


    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Access Denied</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Please sign in to view this page.</p>
                    <Link to="/login">
                        <Button>Go to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white dark:bg-gray-900">
            {/* Header - Consistent with Dashboard and other Admin pages */}
            <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center max-w-7xl">
                    <Link to="/dashboard" className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>

                    <div className="flex items-center space-x-3">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Classroom Chat</span>
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
                        <Badge
                            variant="secondary"
                            className={`${currentPlanColors.light} ${currentPlanColors.dark}`}
                        >
                            {isLoadingProfile ? 'Loading...' : userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
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
                        📚 Your Classroom Hub
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Create chat groups for your classes, collaborate with peers, and share knowledge.
                    </p>
                </div>

                {/* Conditional rendering based on selectedChatGroup */}
                {!selectedChatGroup ? (
                    /* Full-width Left Column: Consolidated Group List & Pending Requests */
                    <div className="w-full">
                        <Card className="h-[calc(100vh-250px)] bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up flex flex-col">
                            <CardHeader className="flex flex-row justify-between items-center pb-0">
                                <CardTitle className="text-gray-900 dark:text-white">Your Chat Groups</CardTitle>
                                {/* New Group button moved here */}
                                <Button variant="outline" size="sm" onClick={() => setIsCreateGroupDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-800 dark:hover:bg-purple-700">
                                    <PlusCircle className="w-4 h-4 mr-2" /> New Group
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-grow overflow-y-auto pr-2">
                                {isLoadingGroups && <p className="text-center text-gray-500 dark:text-gray-400">Loading groups...</p>}
                                {chatGroups && chatGroups.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"> {/* Grid layout */}
                                        {chatGroups.map((group) => {
                                            const groupCardColors = presetCardBackgrounds[group.theme_color] || presetCardBackgrounds['default'];
                                            return (
                                                <Card
                                                    key={group.id}
                                                    className={`p-3 cursor-pointer flex items-center justify-between transition-all duration-200 ${groupCardColors.light} ${groupCardColors.dark}
                                                    ${selectedChatGroup?.id === group.id ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-purple-400' : ''}`} // Added ring for selected state
                                                    onClick={() => setSelectedChatGroup(group)}
                                                >
                                                    <span className="font-medium text-gray-900 dark:text-white">{group.name}</span>
                                                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                </Card>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    !isLoadingGroups && <p className="text-center text-gray-500 dark:text-gray-400 pt-4">No chat groups found. Create one!</p>
                                )}
                            </CardContent>

                            <div className="border-t border-purple-200 dark:border-purple-800 mx-4 my-2" />

                            <CardHeader className="pt-0">
                                <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                    <Mail className="w-5 h-5 mr-2" /> Pending Invitations
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400">
                                    Join groups you've been invited to.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-4 overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                                {isLoadingInvitations && <p className="text-center text-gray-500 dark:text-gray-400">Loading invitations...</p>}
                                {pendingInvitations && pendingInvitations.length > 0 ? (
                                    <div className="space-y-3">
                                      
                                        {pendingInvitations.map((invite) => (
                                            <Card key={invite.id} className="p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        Invited to: <span className="font-bold">{invite.chat_groups.name}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        by <span className="font-medium">{invite.invitedByUser?.username || 'Unknown User'}</span>
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                                                        onClick={() => acceptInvitationMutation.mutate(invite.id)}
                                                        disabled={acceptInvitationMutation.isPending}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                        onClick={() => rejectInvitationMutation.mutate(invite.id)}
                                                        disabled={rejectInvitationMutation.isPending}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    !isLoadingInvitations && <p className="text-center text-gray-500 dark:text-gray-400">No pending invitations.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Full-width Chat Interface */
                    <div className="w-full">
                        <Card className="h-[calc(100vh-250px)] bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up flex flex-col">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedChatGroup(null)} // Go back to group list
                                        className="mr-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <div>
                                        <CardTitle className="text-gray-900 dark:text-white">
                                            Chat in "{selectedChatGroup.name}"
                                        </CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Start typing to send a message.
                                        </CardDescription>
                                    </div>
                                </div>
                                {selectedChatGroup && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            {selectedChatGroup.created_by_user_id === user.id && (
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedThemeColor(selectedChatGroup.theme_color || 'blue');
                                                    setIsEditThemeDialogOpen(true);
                                                }}>
                                                    <Palette className="mr-2 h-4 w-4" />
                                                    <span>Change Theme</span>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => setIsAddUserDialogOpen(true)}>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                <span>Add User</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setIsViewMembersDialogOpen(true)}>
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>View Members</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        <span>Leave Group</span>
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-purple-200 dark:border-purple-700">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure you want to leave this group?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. You will be removed from "{selectedChatGroup.name}" and will no longer receive messages.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleLeaveGroup}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            {leaveGroupMutation.isPending ? 'Leaving...' : 'Leave Group'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-between p-4">
                                {/* Message Display Area with Dynamic Gradient Backdrop */}
                                <div className={`flex-grow overflow-y-auto mb-4 p-2 rounded-md border border-gray-300 dark:border-gray-700 flex flex-col items-start message-scroll-area bg-gradient-to-b ${presetGradientColors[selectedChatGroup.theme_color] || presetGradientColors['blue']}`}>
                                    {isLoadingMessages && <p className="text-center text-gray-500 dark:text-gray-400 w-full">Loading messages...</p>}
                                    {messages && messages.length > 0 ? (
                                        <div className="flex flex-col w-full">
                                            {messages.map((msg) => (
                                                <ChatBubble
                                                    key={msg.id}
                                                    message={msg}
                                                    isSender={msg.sender_id === user.id}
                                                    senderUsername={msg.sender?.username || 'Unknown'}
                                                    isOwnMessage={msg.sender_id === user.id}
                                                    onUnsend={handleUnsendMessage}
                                                />
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    ) : (
                                        !isLoadingMessages && <p className="text-center text-gray-500 dark:text-gray-400 w-full">No messages yet. Be the first to say hello!</p>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="flex space-x-2">
                                    <Input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSendMessage();
                                            }
                                        }}
                                        className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        disabled={sendMessageMutation.isPending}
                                    />
                                    <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                                        <MessageCircle className="w-4 h-4 mr-2" /> Send
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Create Group Dialog */}
            <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-purple-200 dark:border-purple-700">
                    <DialogHeader>
                        <DialogTitle>Create New Chat Group</DialogTitle>
                        <DialogDescription>
                            Give your new classroom chat group a name and choose a theme.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="groupName" className="text-right">
                                Group Name
                            </Label>
                            <Input
                                id="groupName"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="e.g., 'Biology 101 Discussion'"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="themeColor" className="text-right">
                                Theme Color
                            </Label>
                            <Select onValueChange={setSelectedThemeColor} defaultValue={selectedThemeColor}>
                                <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <SelectValue placeholder="Select a theme color" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                    <SelectItem value="blue">Blue</SelectItem>
                                    <SelectItem value="purple">Purple</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="orange">Orange</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateGroupDialogOpen(false)} className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Cancel</Button>
                        <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending || !newGroupName.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Theme Dialog */}
            <Dialog open={isEditThemeDialogOpen} onOpenChange={setIsEditThemeDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-purple-200 dark:border-purple-700">
                    <DialogHeader>
                        <DialogTitle>Change Theme for "{selectedChatGroup?.name}"</DialogTitle>
                        <DialogDescription>
                            Select a new theme color for this chat group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="themeColor" className="text-right">
                                Theme Color
                            </Label>
                            <Select onValueChange={setSelectedThemeColor} value={selectedThemeColor}>
                                <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <SelectValue placeholder="Select a theme color" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                    <SelectItem value="blue">Blue</SelectItem>
                                    <SelectItem value="purple">Purple</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="orange">Orange</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditThemeDialogOpen(false)} className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Cancel</Button>
                        <Button onClick={handleUpdateGroupTheme} disabled={updateGroupThemeMutation.isPending} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                            {updateGroupThemeMutation.isPending ? 'Updating...' : 'Update Theme'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Add User Dialog */}
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-purple-200 dark:border-purple-700">
                    <DialogHeader>
                        <DialogTitle>Add User to {selectedChatGroup?.name}</DialogTitle>
                        <DialogDescription>
                            Enter the **username** of the user you want to invite.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="userToInvite" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="userToInvite"
                                value={userToInvite}
                                onChange={(e) => setUserToInvite(e.target.value)}
                                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="e.g., 'john_doe'"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Cancel</Button>
                        <Button onClick={handleInviteUser} disabled={inviteUserMutation.isPending || !userToInvite.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                            {inviteUserMutation.isPending ? 'Inviting...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Members Dialog */}
            <Dialog open={isViewMembersDialogOpen} onOpenChange={setIsViewMembersDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-purple-200 dark:border-purple-700">
                    <DialogHeader>
                        <DialogTitle>Members of "{selectedChatGroup?.name}"</DialogTitle>
                        <DialogDescription>
                            Current members in this chat group ({groupMembers?.length || 0}/{GROUP_MEMBER_LIMIT}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-80 overflow-y-auto">
                        {isLoadingMembers ? (
                            <p className="text-center text-gray-500 dark:text-gray-400">Loading members...</p>
                        ) : groupMembers && groupMembers.length > 0 ? (
                            <ul className="space-y-2">
                                {groupMembers.map((member, index) => (
                                    <li key={index} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-md border border-gray-100 dark:border-gray-600">
                                        <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                        <span className="font-medium text-gray-900 dark:text-white">{member.username}</span>
                                        {member.id === selectedChatGroup?.created_by_user_id && (
                                            <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">Admin</Badge>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No members found.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewMembersDialogOpen(false)} className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Classroom;