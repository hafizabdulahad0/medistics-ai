
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { fetchChaptersBySubject, fetchMCQsByChapter, Chapter, Subject } from '@/utils/mcqData';

interface ChapterSelectionScreenProps {
  subject: Subject;
  onChapterSelect: (chapter: Chapter) => void;
  onBack: () => void;
}

export const ChapterSelectionScreen = ({ subject, onChapterSelect, onBack }: ChapterSelectionScreenProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadChapters = async () => {
      setLoading(true);
      const data = await fetchChaptersBySubject(subject.id);
      setChapters(data);
      
      // Fetch question counts for each chapter
      const counts: Record<string, number> = {};
      for (const chapter of data) {
        const mcqs = await fetchMCQsByChapter(chapter.id);
        counts[chapter.id] = mcqs.length;
      }
      setQuestionCounts(counts);
      setLoading(false);
    };

    loadChapters();
  }, [subject.id]);

  const handleContinue = () => {
    if (selectedChapter) {
      onChapterSelect(selectedChapter);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 sm:py-16">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading chapters...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-4 sm:mb-6 flex items-center space-x-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-sm sm:text-base"
      >
        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>Back to Subjects</span>
      </Button>

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Select Chapter - {subject.name}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4 sm:px-0">
          Choose the specific chapter you want to practice
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {chapters.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Card 
              className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 h-full ${
                selectedChapter?.id === chapter.id 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                  : 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
              } bg-gradient-to-br from-purple-100/70 via-purple-50/50 to-pink-50/30 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-pink-900/10 backdrop-blur-sm`}
              onClick={() => setSelectedChapter(chapter)}
            >
              <CardHeader className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white leading-tight">
                        Chapter {chapter.chapter_number}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {chapter.name}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {questionCounts[chapter.id] || 0} Qs
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 pt-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {chapter.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedChapter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4 sm:px-0"
        >
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            size="lg"
          >
            Continue with {selectedChapter.name}
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
