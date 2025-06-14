
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { fetchSubjects, Subject } from '@/utils/mcqData';

interface SubjectSelectionScreenProps {
  onSubjectSelect: (subject: Subject) => void;
}

export const SubjectSelectionScreen = ({ onSubjectSelect }: SubjectSelectionScreenProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      const data = await fetchSubjects();
      setSubjects(data);
      setLoading(false);
    };

    loadSubjects();
  }, []);

  const handleContinue = () => {
    if (selectedSubject) {
      onSubjectSelect(selectedSubject);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 sm:py-16">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Choose Your Subject
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4 sm:px-0">
          Select the MDCAT subject you want to practice
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 ${selectedSubject?.id === subject.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
                } bg-gradient-to-br from-purple-100/70 via-purple-50/50 to-pink-50/30 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-pink-900/10 backdrop-blur-sm`}
              onClick={() => setSelectedSubject(subject)}
            >
              <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 bg-white/50 dark:bg-gray-800/50"
                  style={{ backgroundColor: subject.color ? `${subject.color}20` : '#9333ea20' }}
                >
                  {subject.icon || '📚'}
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">
                  {subject.name}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {subject.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedSubject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4 sm:px-0"
        >
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            size="lg"
          >
            Continue with {selectedSubject.name}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
