import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Moon, Sun, X, ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Input } from '@/components/ui/input'; // Assuming you have a reusable Input component

// Define interfaces for better type safety
interface Question {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

interface TestGenerationFormProps {
    onGenerate: (data: { topic: string; difficulty: string; questionCount: number; customPrompt: string; requestedTotalQuestions: number }) => void;
    loading: boolean;
}

const TestGenerationForm: React.FC<TestGenerationFormProps> = ({ onGenerate, loading }) => {
    const [topic, setTopic] = useState('');
    const [requestedTotalQuestions, setRequestedTotalQuestions] = useState(10);
    const [customPrompt, setCustomPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCustomPrompt = "Strictly adhere to the MDCAT syllabus. " + customPrompt; // MDCAT syllabus is always included

        onGenerate({
            topic,
            difficulty: 'medium', // Hardcoded to medium
            questionCount: 3, // Batch size for initial questions
            customPrompt: finalCustomPrompt,
            requestedTotalQuestions
        });
    };

    return (
        <div className="flex flex-col items-center p-10 bg-white dark:bg-gray-800 shadow-xl rounded-lg max-w-3xl mx-auto my-16 border-2 border-purple-200 dark:border-purple-700">
            <h1 className="text-3xl font-bold mb-6 text-purple-700 dark:text-purple-400">AI Test Generator</h1>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Topic:</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Viruses, Force and motion etc..."
                        required
                    />
                </div>

                <div>
                    <label htmlFor="requestedTotalQuestions" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Total Questions Desired (up to 50):</label>
                    <input
                        type="number"
                        id="requestedTotalQuestions"
                        value={requestedTotalQuestions}
                        onChange={(e) => setRequestedTotalQuestions(parseInt(e.target.value))}
                        min="1"
                        max="50"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="customPrompt" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Custom Prompt (Optional):</label>
                    <textarea
                        id="customPrompt"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={3}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="e.g., Include questions about specific researchers, focus on clinical applications."
                    ></textarea>
                </div>

                <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Test'}
                </Button>
            </form>
        </div>
    );
};

// Main AITestGenerator component
const AITestGenerator: React.FC = () => {
    // Auth and Theme hooks from Dashboard
    const { user, isLoading: isAuthLoading } = useAuth();
    const { theme, setTheme } = useTheme();

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
            light: 'bg-pink-100 text-pink-800 border-pink-300', // Adjusted to pink for premium
            dark: 'dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-700'
        },
        'pro': { // Keeping 'pro' for potential future use or consistency with backend, but not in UI text
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

    // Check if the user has access to this feature
    // Available for 'premium' and 'iconic' users
    const hasAccess = rawUserPlan === 'premium' || rawUserPlan === 'iconic';


    // State for generated questions and test flow
    const [allGeneratedQuestions, setAllGeneratedQuestions] = useState<Question[] | null>(null);
    const [currentQuestionDisplayIndex, setCurrentQuestionDisplayIndex] = useState(0);
    const [requestedTotalQuestions, setRequestedTotalQuestions] = useState(0);
    const [currentBatchSize] = useState(3);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [testSubmitted, setTestSubmitted] = useState(false); // Renamed from showResults for clarity

    // State for cooldown and loading more questions
    const [cooldownTimer, setCooldownTimer] = useState(0);
    const [isCooldownActive, setIsCooldownActive] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial parameters from the form for subsequent calls
    const [initialParams, setInitialParams] = useState({ topic: '', difficulty: '', baseCustomPrompt: '' });

    // State for AI Warning visibility - only show when test has started
    const [showAiWarning, setShowAiWarning] = useState(false); // Initial state is false

    // --- Authentication Fallback ---
    if (isAuthLoading || isProfileLoading) { // Include profile loading in this check
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
                    <h1 className="text-2xl font-bold mb-4">Please sign in to access the AI Test Generator</h1>
                    <Link to="/login">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }
    // --- End Authentication Fallback ---


    // Function to handle fetching questions (can be called for initial and subsequent batches)
    const fetchQuestions = async (params: { topic: string; difficulty: string; questionCount: number; customPrompt: string }) => {
        setLoading(true);
        setError(null);
        setIsLoadingMore(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/generate-ai-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error code: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            if (data.questions && Array.isArray(data.questions)) {
                setAllGeneratedQuestions(prev => [...(prev || []), ...data.questions]);
            } else {
                throw new Error("API response did not contain a 'questions' array.");
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError(`Error fetching questions: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Handler for the initial test generation from the form
    const handleGenerateTest = async (formData: { topic: string; difficulty: string; questionCount: number; customPrompt: string; requestedTotalQuestions: number }) => {
        // Reset all states for a new test
        setAllGeneratedQuestions(null);
        setCurrentQuestionDisplayIndex(0);
        setUserAnswers({});
        setTestSubmitted(false); // Reset test submission status
        setError(null);
        setCooldownTimer(0);
        setIsCooldownActive(false);
        setIsLoadingMore(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setInitialParams({
            topic: formData.topic,
            difficulty: formData.difficulty,
            baseCustomPrompt: formData.customPrompt
        });
        setRequestedTotalQuestions(formData.requestedTotalQuestions);

        await fetchQuestions(formData);
        setShowAiWarning(true); // Show warning after test starts
    };

    // Handler for loading more questions after cooldown
    const handleLoadMoreQuestions = () => {
        setIsCooldownActive(true);
        setCooldownTimer(15);

        timerRef.current = setInterval(() => {
            setCooldownTimer(prev => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setIsCooldownActive(false);

                    const existingQnA = (allGeneratedQuestions || [])
                        .map(q => `${q.question} (Answer: ${q.answer})`).join('\n');
                    const newCustomPrompt = `${initialParams.baseCustomPrompt}\nGenerate ${currentBatchSize} more distinct questions, different from these previously generated:\n${existingQnA}`;

                    fetchQuestions({
                        topic: initialParams.topic,
                        difficulty: initialParams.difficulty,
                        questionCount: currentBatchSize,
                        customPrompt: newCustomPrompt
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAnswerChange = (questionIndex: number, selectedOption: string) => {
        // Only allow answering if the question hasn't been answered yet
        if (!userAnswers[questionIndex]) {
            setUserAnswers(prev => ({
                ...prev,
                [questionIndex]: selectedOption
            }));
        }
    };

    // Navigation functions
    const goToNextQuestion = () => {
        // Only allow going to next if not on the last requested question
        if (currentQuestionDisplayIndex < requestedTotalQuestions - 1) {
            setCurrentQuestionDisplayIndex(prev => prev + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionDisplayIndex > 0) {
            setCurrentQuestionDisplayIndex(prev => prev - 1);
        }
    };

    const handleSubmitTest = () => {
        setTestSubmitted(true); // Mark the entire test as submitted
    };

    const handleGenerateNewTest = () => {
        setAllGeneratedQuestions(null);
        setCurrentQuestionDisplayIndex(0);
        setRequestedTotalQuestions(0);
        setUserAnswers({});
        setTestSubmitted(false); // Reset test submission status
        setError(null);
        setCooldownTimer(0);
        setIsCooldownActive(false);
        setIsLoadingMore(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setInitialParams({ topic: '', difficulty: '', baseCustomPrompt: '' });
        setShowAiWarning(false); // Hide warning when going back to form
    };

    // Determine if "Load More" button should be visible
    const shouldShowLoadMore =
        allGeneratedQuestions &&
        allGeneratedQuestions.length < requestedTotalQuestions &&
        !isCooldownActive &&
        !isLoadingMore &&
        !testSubmitted && // Do not show if test is submitted
        currentQuestionDisplayIndex >= allGeneratedQuestions.length - 1;

    // Determine if "Submit Test" button should be visible
    // It should be visible only if we are on the last requested question AND
    // all requested questions have been loaded, AND test is not submitted yet.
    const shouldShowSubmitTest =
        allGeneratedQuestions &&
        !testSubmitted && // Don't show if test is already submitted
        currentQuestionDisplayIndex === requestedTotalQuestions - 1 &&
        allGeneratedQuestions.length === requestedTotalQuestions;


    const currentQuestion = allGeneratedQuestions ? allGeneratedQuestions[currentQuestionDisplayIndex] : null;

    // Check if the current question has been answered (for immediate feedback)
    const isCurrentQuestionAnswered = !!userAnswers[currentQuestionDisplayIndex];

    // Calculate score for display in results
    const score = allGeneratedQuestions && testSubmitted
        ? allGeneratedQuestions.filter((q, index) => userAnswers[index] === q.answer).length
        : 0;

    // Maximum length for displayed explanation (strictly less than 70 means max 69 chars.
    // If we add '...', the substring must be 66 chars to make total 69)
    const MAX_DISPLAY_EXPLANATION_LENGTH = 69;
    const EXPLANATION_SUBSTRING_LENGTH = MAX_DISPLAY_EXPLANATION_LENGTH - 3; // For '...'

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
            {/* Header - Copied from Dashboard.tsx */}
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
                        <span className="text-xl font-bold text-gray-900 dark:text-white">AI Test Generator</span>
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

                {/* Conditional rendering based on user plan */}
                {!hasAccess ? (
                    <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 max-w-xl mx-auto my-16 border-2 border-purple-200 dark:border-purple-700 text-center">
                        <CardHeader className="mb-4 flex flex-col items-center">
                            <img
                                src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png"
                                alt="Medistics Logo"
                                className="w-32 h-32 object-contain mx-auto mb-6"
                            />
                            <CardTitle className="text-3xl font-extrabold text-purple-700 dark:text-purple-400">
                                Exclusive Feature
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                                The AI Test Generator is an exclusive feature available only with the{' '}
                                <span className={`font-semibold ${planColors.premium.light.includes('text-') ? planColors.premium.light.split(' ').find(cls => cls.startsWith('text-')) : 'text-pink-800'} ${planColors.premium.dark.includes('text-') ? planColors.premium.dark.split(' ').find(cls => cls.startsWith('dark:text-')) : 'dark:text-pink-200'}`}>
                                    Premium
                                </span> or{' '}
                                <span className={`font-semibold ${planColors.iconic.light.includes('text-') ? planColors.iconic.light.split(' ').find(cls => cls.startsWith('text-')) : 'text-blue-800'} ${planColors.iconic.dark.includes('text-') ? planColors.iconic.dark.split(' ').find(cls => cls.startsWith('dark:text-')) : 'dark:text-blue-200'}`}>
                                    Iconic
                                </span> plan.
                                Users with the{' '}
                                <span className={`font-semibold ${planColors.free.light.includes('text-') ? planColors.free.light.split(' ').find(cls => cls.startsWith('text-')) : 'text-purple-800'} ${planColors.free.dark.includes('text-') ? planColors.free.dark.split(' ').find(cls => cls.startsWith('dark:text-')) : 'dark:text-purple-200'}`}>
                                    Free
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
                    <>
                        {/* AI can make mistakes warning - Only show when a test has started */}
                        {(showAiWarning && allGeneratedQuestions) && (
                            <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center justify-between space-x-3">
                                <div className="flex items-center space-x-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 flex-shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.174 3.35 1.9 3.35h13.713c1.726 0 2.766-1.85 1.9-3.35L13.723 3.545c-.892-1.547-3.033-1.547-3.925 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                    <p className="text-sm font-medium">
                                        Please be advised: While our AI aims for accuracy, content generated by artificial intelligence may occasionally contain inaccuracies or omissions. We recommend cross-referencing information for critical study.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAiWarning(false)}
                                    className="w-8 h-8 p-0 flex-shrink-0 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200/50 dark:hover:bg-yellow-800/50"
                                    aria-label="Close warning"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}


                        {!allGeneratedQuestions ? (
                            <TestGenerationForm onGenerate={handleGenerateTest} loading={loading} />
                        ) : (
                            <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-10 max-w-4xl mx-auto my-16 border-2 border-purple-200 dark:border-purple-700">
                                <CardHeader className="text-center mb-6">
                                    <CardTitle className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                                        Question {currentQuestionDisplayIndex + 1} of {requestedTotalQuestions}
                                    </CardTitle>
                                </CardHeader>

                                {currentQuestion && (
                                    <CardContent className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                                        <p className="font-bold text-xl mb-3 text-gray-900 dark:text-white">
                                            {currentQuestionDisplayIndex + 1}. {currentQuestion.question}
                                        </p>
                                        <div className="space-y-2">
                                            {currentQuestion.options.map((option, optIndex) => {
                                                const isSelected = userAnswers[currentQuestionDisplayIndex] === option;
                                                const isCorrect = option === currentQuestion.answer;
                                                const hasAnswered = isCurrentQuestionAnswered; // Using the new derived state for per-question check

                                                let optionClassName = `flex items-center p-2 rounded cursor-pointer transition-colors duration-200 `;

                                                if (hasAnswered) {
                                                    if (isSelected && isCorrect) {
                                                        optionClassName += 'bg-green-100 dark:bg-green-900/30 font-bold text-green-800 dark:text-green-200';
                                                    } else if (isSelected && !isCorrect) {
                                                        optionClassName += 'bg-red-100 dark:bg-red-900/30 font-bold text-red-800 dark:text-red-200';
                                                    } else if (isCorrect) {
                                                        optionClassName += 'bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600';
                                                    } else {
                                                        optionClassName += 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600';
                                                    }
                                                } else {
                                                    // Before answering, only highlight on hover/selection
                                                    optionClassName += `${isSelected ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-400 dark:border-purple-600' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600`;
                                                }

                                                return (
                                                    <label key={optIndex} className={optionClassName}>
                                                        <input
                                                            type="radio"
                                                            name={`question-${currentQuestionDisplayIndex}`}
                                                            value={option}
                                                            checked={isSelected}
                                                            onChange={() => handleAnswerChange(currentQuestionDisplayIndex, option)}
                                                            className="mr-2 accent-purple-600 dark:accent-purple-400"
                                                            disabled={hasAnswered || testSubmitted} // Disable once answered or test submitted
                                                        />
                                                        <span className={`text-gray-800 dark:text-gray-200 ${hasAnswered && isCorrect ? 'font-bold' : ''}`}>
                                                            {option}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {isCurrentQuestionAnswered && ( // Show explanation immediately after answering
                                            <div className="mt-4 text-base bg-gray-100 dark:bg-gray-600 p-3 rounded-md border border-gray-200 dark:border-gray-500">
                                                <p className="font-semibold text-green-700 dark:text-green-300">Correct Answer: {currentQuestion.answer}</p>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    Explanation: {
                                                        currentQuestion.explanation.length > EXPLANATION_SUBSTRING_LENGTH
                                                            ? currentQuestion.explanation.substring(0, EXPLANATION_SUBSTRING_LENGTH) + '...'
                                                            : currentQuestion.explanation
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                )}

                                {/* Navigation and Action Buttons */}
                                <div className="flex flex-col gap-4 mt-8">
                                    {/* Only show navigation buttons if test is not submitted */}
                                    {!testSubmitted && (
                                        <div className="flex justify-between items-center gap-4">
                                            <Button
                                                onClick={goToPreviousQuestion}
                                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                                                disabled={currentQuestionDisplayIndex === 0 || loading || isLoadingMore || isCooldownActive}
                                            >
                                                Previous
                                            </Button>

                                            {currentQuestionDisplayIndex < requestedTotalQuestions - 1 ? (
                                                // Not on the last requested question, show Next
                                                <Button
                                                    onClick={goToNextQuestion}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                                                    // Disable if loading, cooldown, or no more loaded questions to go to.
                                                    disabled={loading || isLoadingMore || isCooldownActive || (currentQuestionDisplayIndex >= (allGeneratedQuestions?.length || 0) - 1)}
                                                >
                                                    Next
                                                </Button>
                                            ) : (
                                                // On the last requested question (currentQuestionDisplayIndex === requestedTotalQuestions - 1)
                                                <>
                                                    {shouldShowSubmitTest && ( // Show Submit Test if all questions are loaded
                                                        <Button
                                                            onClick={handleSubmitTest}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                                                            disabled={loading || isLoadingMore || isCooldownActive}
                                                        >
                                                            Submit Test
                                                        </Button>
                                                    )}
                                                    {/* "Start New Test" button always present on the last question, alongside Submit if applicable */}
                                                    <Button
                                                        onClick={handleGenerateNewTest}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                                                        disabled={loading || isLoadingMore || isCooldownActive}
                                                    >
                                                        Start New Test
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Load More Button Logic */}
                                    {shouldShowLoadMore && (
                                        <Button
                                            onClick={handleLoadMoreQuestions}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                                            disabled={loading || isLoadingMore || isCooldownActive}
                                        >
                                            Load More Questions
                                        </Button>
                                    )}
                                    {isCooldownActive && (
                                        <div className="text-center text-gray-600 dark:text-gray-400 font-semibold w-full py-2 px-4 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                            Generating next batch in {cooldownTimer} seconds...
                                        </div>
                                    )}
                                    {isLoadingMore && (
                                        <div className="text-center text-gray-600 dark:text-gray-400 font-semibold w-full py-2 px-4 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                            Loading more questions...
                                        </div>
                                    )}

                                    {/* Results Display */}
                                    {testSubmitted && (
                                        <>
                                            <div className="text-center text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
                                                Your Score: {score} / {allGeneratedQuestions?.length}
                                            </div>
                                            <Button
                                                onClick={handleGenerateNewTest}
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                                            >
                                                Generate New Test
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}
                    </>
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

export default AITestGenerator;