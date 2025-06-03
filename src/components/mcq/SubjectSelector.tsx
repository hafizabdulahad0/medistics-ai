
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const mockSubjects = [
  {
    id: 'biology',
    name: 'Biology',
    icon: '🧬',
    color: '#10B981',
    description: 'Study of life and living organisms'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪',
    color: '#3B82F6',
    description: 'Study of matter and chemical reactions'
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    color: '#8B5CF6',
    description: 'Study of matter, energy and motion'
  }
];

interface SubjectSelectorProps {
  selectedSubject: string | null;
  onSubjectSelect: (subjectId: string) => void;
}

export const SubjectSelector = ({ selectedSubject, onSubjectSelect }: SubjectSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockSubjects.map((subject, index) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 ${
              selectedSubject === subject.id 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                : 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
            } bg-purple-100/70 dark:bg-purple-900/30 backdrop-blur-sm`}
            onClick={() => onSubjectSelect(subject.id)}
          >
            <CardHeader className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl mb-4 bg-white/50 dark:bg-gray-800/50"
                style={{ backgroundColor: `${subject.color}20` }}
              >
                {subject.icon}
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white" style={{ color: selectedSubject === subject.id ? subject.color : undefined }}>
                {subject.name}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {subject.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>5 Chapters</span>
                <span>~50 Questions</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
