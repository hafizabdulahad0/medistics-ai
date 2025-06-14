import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes'; // Assuming next-themes is installed and configured
import { Wrench, Instagram, Sun, Moon } from 'lucide-react'; // Using Lucide icons for a sleek look
import { Button } from '@/components/ui/button'; // Assuming your button component path

const MaintenancePage = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect to ensure the theme is correctly applied client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent rendering before theme is mounted to avoid hydration mismatches
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 sm:p-12 max-w-lg w-full transform transition-all duration-500 scale-95 opacity-0 animate-scale-in-fade-in">
        <Wrench className="w-20 h-20 text-blue-500 dark:text-blue-400 mx-auto mb-6 animate-pulse" />
        
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Technical Issues
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8">
          This section is currently experiencing some technical difficulties. Our team is actively working to resolve them!
        </p>
        
        <p className="text-md sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
          It will be available soon.
        </p>

        <a 
          href="https://www.instagram.com/medistics.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <Instagram className="w-5 h-5" />
          <span>Follow us on Instagram for updates</span>
        </a>

        {/* Optional: Theme Toggle for demonstration or user preference */}
        <div className="mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:scale-105 transition-transform duration-200"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            Toggle Theme
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;

