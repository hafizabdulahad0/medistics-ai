import React, { useState } from 'react'; // Import useState for local state
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Moon, Sun, Upload, Loader2 } from 'lucide-react'; // Added Upload, Loader2 icons
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Card components for consistent styling
import { Input } from '@/components/ui/input'; // Input for file selection
import { Label } from '@/components/ui/label'; // Label for input
import { useToast } from '@/components/ui/use-toast'; // Toast for user feedback
import { supabase } from '@/integrations/supabase/client'; // Supabase client
import Papa from 'papaparse'; // PapaParse for CSV parsing

const Admin2 = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast(); // Initialize toast

  // State for CSV import functionality
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle file selection for CSV import
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  // Handle CSV upload and Supabase insertion
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    Papa.parse(file, {
      header: true, // Assumes the first row contains headers
      skipEmptyLines: true,
      complete: async (results) => {
        const questionsToInsert = [];
        const errors = [];

        results.data.forEach((row, index) => {
          // Clean up column names (e.g., remove spaces, make lowercase)
          const cleanedRow = {};
          for (const key in row) {
            cleanedRow[key.toLowerCase().replace(/\s/g, '_')] = row[key];
          }

          // Map CSV columns to your Supabase table columns
          // Adjust these keys based on your actual CSV headers
          const questionData = {
            question: cleanedRow.question,
            option_a: cleanedRow.option_a || cleanedRow.option_1, // Allow variations
            option_b: cleanedRow.option_b || cleanedRow.option_2,
            option_c: cleanedRow.option_c || cleanedRow.option_3,
            option_d: cleanedRow.option_d || cleanedRow.option_4,
            correct_answer: cleanedRow.correct_answer || cleanedRow.answer, // Allow variations
          };

          // Basic validation for required fields
          if (
            !questionData.question ||
            !questionData.option_a ||
            !questionData.option_b ||
            !questionData.option_c ||
            !questionData.option_d ||
            !questionData.correct_answer
          ) {
            errors.push(`Row ${index + 2}: Missing required fields.`); // +2 for header and 0-index
          } else if (![
              questionData.option_a,
              questionData.option_b,
              questionData.option_c,
              questionData.option_d
            ].includes(questionData.correct_answer)) {
            errors.push(`Row ${index + 2}: Correct answer '${questionData.correct_answer}' not found in options.`);
          } else {
            questionsToInsert.push(questionData);
          }
        });

        if (errors.length > 0) {
          toast({
            title: "CSV Import Warnings/Errors",
            description: (
              <div>
                <p>Some rows had issues and were skipped:</p>
                <ul className="list-disc pl-5 mt-2 max-h-40 overflow-y-auto">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            ),
            variant: "destructive",
            duration: 9000,
          });
        }

        if (questionsToInsert.length === 0) {
          toast({
            title: "No valid questions to import",
            description: "Please check your CSV file for correct formatting and data.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        try {
          // Perform batch insert into 'mock_test_questions'
          const { error: insertError } = await supabase
            .from('mock_test_questions')
            .insert(questionsToInsert);

          if (insertError) {
            console.error('Supabase insert error:', insertError.message);
            toast({
              title: "Import Failed",
              description: `Error inserting questions: ${insertError.message}`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Import Successful!",
              description: `${questionsToInsert.length} questions imported successfully.`,
              variant: "success",
            });
            setFile(null); // Clear selected file
          }
        } catch (err) {
          console.error('Unexpected error during Supabase insert:', err.message);
          toast({
            title: "Error",
            description: `An unexpected error occurred: ${err.message}`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      error: (err) => {
        console.error('PapaParse error:', err);
        toast({
          title: "CSV Parsing Error",
          description: `Failed to parse CSV file: ${err.message}`,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    });
  };

  // Basic check for authenticated user.
  // In a production environment, you should implement proper role-based access control
  // to ensure only authorized administrators can access this page.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Please sign in as an administrator to view this page.</p>
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
            <img 
              src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png" 
              alt="Medistics Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Mock Test Importer</span>
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
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
              Admin
            </Badge>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.email?.substring(0, 2).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Upload Mock Test Questions
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Use this panel to import large sets of mock test questions via CSV.
          </p>
        </div>

        {/* Built-in CSV Importer functionality */}
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Upload Mock Test CSV</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Select a CSV file containing your mock test questions to upload them directly to Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Choose CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="dark:file:text-white dark:file:bg-gray-700 dark:bg-gray-800 dark:border-gray-700"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expected columns: `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`.
                  (Variations like `option_1`, `answer` are also supported.)
                </p>
              </div>
              <Button
                onClick={handleUpload}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 transition-all duration-300"
                disabled={isLoading || !file}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Questions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Admin2;
