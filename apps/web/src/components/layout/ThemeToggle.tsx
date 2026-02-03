"use client";

import React from 'react';
import { useTheme } from '../../store/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-8 right-8 z-50 p-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:scale-110"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-6 h-6" />
            ) : (
                <Sun className="w-6 h-6" />
            )}
        </button>
    );
};

export default ThemeToggle;
