
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  userId?: string;
}

export const ProgressTracker = ({ userId }: ProgressTrackerProps) => {
  const { data: progress } = useQuery({
    queryKey: ['user-progress', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  const totalQuestions = progress?.reduce((sum, p) => sum + (p.total_questions || 0), 0) || 0;
  const totalCorrect = progress?.reduce((sum, p) => sum + (p.correct_answers || 0), 0) || 0;
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="flex space-x-4">
      <Card className="min-w-[120px] bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Questions</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{totalQuestions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-[120px] bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Accuracy</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{overallAccuracy}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-[120px] bg-purple-100/70 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Chapters</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{progress?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
