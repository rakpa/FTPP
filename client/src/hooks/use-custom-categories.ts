import { useState, useEffect } from 'react';

// Storage key for localStorage
const STORAGE_KEY = 'finance-tracker-custom-categories';

// Debug function
function logDebug(...args: any[]) {
  console.log('[Categories]', ...args);
}

export function useCustomCategories() {
  // Initialize from localStorage
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      // Try to get categories from localStorage
      const savedCategories = localStorage.getItem(STORAGE_KEY);
      logDebug('Initial load from localStorage:', savedCategories);
      
      // If no categories are found, return an empty array
      if (!savedCategories) return [];
      
      // Parse the saved categories
      const parsed = JSON.parse(savedCategories);
      logDebug('Parsed categories:', parsed);
      return parsed;
    } catch (error) {
      // If there's an error (e.g., invalid JSON), return an empty array
      console.error('Error loading custom categories:', error);
      return [];
    }
  });

  // Save to localStorage whenever categories change
  useEffect(() => {
    try {
      logDebug('Saving to localStorage:', categories);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      
      // Verify it was saved correctly
      const saved = localStorage.getItem(STORAGE_KEY);
      logDebug('Verification - saved in localStorage:', saved);
    } catch (error) {
      console.error('Error saving custom categories:', error);
    }
  }, [categories]);

  // Add a new category
  const addCategory = (category: string) => {
    // Format the category name (trim and capitalize first letter)
    const formattedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1);
    logDebug('Adding category (formatted):', formattedCategory);
    
    // Immediately check if the category exists to avoid race conditions
    if (categories.includes(formattedCategory)) {
      logDebug('Category already exists, not adding');
      return null;
    }
    
    // Update the categories state with the new category
    setCategories(prev => {
      const newCategories = [...prev, formattedCategory];
      logDebug('Updated categories state:', newCategories);
      return newCategories;
    });
    
    return formattedCategory;
  };

  // Remove a category
  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  return {
    categories,
    addCategory,
    removeCategory
  };
}