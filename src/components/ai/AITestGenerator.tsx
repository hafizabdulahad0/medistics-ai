
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Wand2, BookOpen, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AITestGeneratorProps {
  onTestGenerated?: (testId: string) => void;
}

export const AITestGenerator = ({ onTestGenerated }: AITestGeneratorProps) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTest, setGeneratedTest] = useState<any>(null);

  const handleGenerateTest = async () => {
    if (!user || !topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      // Call the AI test generation edge function
      const { data, error } = await supabase.functions.invoke('generate-ai-test', {
        body: {
          topic: topic.trim(),
          difficulty,
          questionCount,
          customPrompt: customPrompt.trim()
        }
      });

      if (error) throw error;

      if (!data?.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response from AI service');
      }

      // Save the generated test to the database
      const { data: savedTest, error: saveError } = await supabase
        .from('ai_generated_tests')
        .insert({
          user_id: user.id,
          topic,
          difficulty,
          questions: data.questions,
          total_questions: data.questions.length
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setGeneratedTest(savedTest);
      toast.success(`Generated ${data.questions.length} questions successfully!`);
      
      if (onTestGenerated) {
        onTestGenerated(savedTest.id);
      }
    } catch (error) {
      console.error('Error generating test:', error);
      toast.error('Failed to generate test. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartTest = () => {
    if (generatedTest) {
      // Navigate to test taking interface or show test questions
      toast.success('Test is ready! You can now take the test.');
      // In a real implementation, you would navigate to a test-taking page
    }
  };

  const predefinedTopics = [
    'Cardiovascular System',
    'Respiratory System',
    'Nervous System',
    'Digestive System',
    'Musculoskeletal System',
    'Endocrine System',
    'Immune System',
    'Pharmacology Basics',
    'Medical Ethics',
    'Pathophysiology'
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span>AI Test Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!generatedTest ? (
          <>
            {/* Topic Selection */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <div className="space-y-2">
                <Input
                  id="topic"
                  placeholder="Enter a medical topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">Quick select:</div>
                <div className="flex flex-wrap gap-2">
                  {predefinedTopics.map((predefinedTopic) => (
                    <Button
                      key={predefinedTopic}
                      variant="outline"
                      size="sm"
                      onClick={() => setTopic(predefinedTopic)}
                      className="text-xs"
                    >
                      {predefinedTopic}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy - Basic concepts</SelectItem>
                  <SelectItem value="medium">Medium - Standard level</SelectItem>
                  <SelectItem value="hard">Hard - Advanced concepts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="count">Number of Questions</Label>
              <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Add specific requirements for your test..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateTest}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Test...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5" />
                  <span>Generate AI Test</span>
                </div>
              )}
            </Button>
          </>
        ) : (
          // Show generated test info
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Test Generated Successfully!</h3>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <p><strong>Topic:</strong> {generatedTest.topic}</p>
                <p><strong>Difficulty:</strong> {generatedTest.difficulty}</p>
                <p><strong>Questions:</strong> {generatedTest.total_questions}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleStartTest}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </Button>
              <Button
                onClick={() => setGeneratedTest(null)}
                variant="outline"
                className="flex-1"
              >
                Generate New Test
              </Button>
            </div>
          </div>
        )}

        {!generatedTest && (
          /* Info */
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-2">
              <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">How it works:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• AI generates unique questions based on your topic</li>
                  <li>• Questions include explanations for better learning</li>
                  <li>• Difficulty adjusts question complexity automatically</li>
                  <li>• Results are saved to track your progress</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
