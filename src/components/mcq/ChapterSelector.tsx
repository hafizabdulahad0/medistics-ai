
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, BookOpen } from 'lucide-react';

const mockChapters = {
  biology: [
    { id: 'acellular-life', name: 'Acellular Life', chapter_number: 1, description: 'Study of viruses, viroids, and prions' },
    { id: 'cell-biology', name: 'Cell Biology', chapter_number: 2, description: 'Structure and function of cells' },
    { id: 'genetics', name: 'Genetics', chapter_number: 3, description: 'Heredity and genetic variation' },
    { id: 'evolution', name: 'Evolution', chapter_number: 4, description: 'Changes in species over time' },
    { id: 'ecology', name: 'Ecology', chapter_number: 5, description: 'Interactions between organisms and environment' },
  ],
  chemistry: [
    { id: 'atomic-structure', name: 'Atomic Structure', chapter_number: 1, description: 'Structure of atoms and elements' },
    { id: 'chemical-bonding', name: 'Chemical Bonding', chapter_number: 2, description: 'How atoms bond together' },
    { id: 'organic-chemistry', name: 'Organic Chemistry', chapter_number: 3, description: 'Chemistry of carbon compounds' },
    { id: 'acids-bases', name: 'Acids and Bases', chapter_number: 4, description: 'Properties of acids and bases' },
    { id: 'thermodynamics', name: 'Thermodynamics', chapter_number: 5, description: 'Energy changes in reactions' },
  ],
  physics: [
    { id: 'mechanics', name: 'Mechanics', chapter_number: 1, description: 'Motion and forces' },
    { id: 'waves', name: 'Waves', chapter_number: 2, description: 'Wave properties and behavior' },
    { id: 'electricity', name: 'Electricity', chapter_number: 3, description: 'Electric charges and circuits' },
    { id: 'magnetism', name: 'Magnetism', chapter_number: 4, description: 'Magnetic fields and forces' },
    { id: 'modern-physics', name: 'Modern Physics', chapter_number: 5, description: 'Quantum mechanics and relativity' },
  ]
};

interface ChapterSelectorProps {
  subject: string;
  selectedChapter: string | null;
  onChapterSelect: (chapterId: string) => void;
}

export const ChapterSelector = ({ subject, selectedChapter, onChapterSelect }: ChapterSelectorProps) => {
  const chapters = mockChapters[subject as keyof typeof mockChapters] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chapters.map((chapter, index) => (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 ${
              selectedChapter === chapter.id 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                : 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
            } bg-purple-100/70 dark:bg-purple-900/30 backdrop-blur-sm`}
            onClick={() => onChapterSelect(chapter.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      Chapter {chapter.chapter_number}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                      {chapter.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400">~10 Questions</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{chapter.description}</p>
              {selectedChapter === chapter.id && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                    <Play className="w-3 h-3" />
                    <span>Selected</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
