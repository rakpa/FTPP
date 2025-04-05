import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES as DEFAULT_CATEGORIES } from '@/types';
import { PlusCircle, X, Trash2, AlertCircle, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// Storage keys
const CUSTOM_CATEGORIES_KEY = 'finance-tracker-custom-categories';
const HIDDEN_CATEGORIES_KEY = 'finance-tracker-hidden-categories';

// Debug helper
const log = (...args: any[]) => console.log('[CategorySelector]', ...args);

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const { toast } = useToast();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Get all visible categories (standard + custom - hidden)
  const allCategories = [...DEFAULT_CATEGORIES.filter(cat => !hiddenCategories.includes(cat)), ...customCategories];
  
  // Load categories and hidden categories from localStorage on mount
  useEffect(() => {
    try {
      // Load custom categories
      const savedCustom = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (savedCustom) {
        const parsedCustom = JSON.parse(savedCustom);
        log('Loaded custom categories:', parsedCustom);
        setCustomCategories(parsedCustom);
      }
      
      // Load hidden standard categories
      const savedHidden = localStorage.getItem(HIDDEN_CATEGORIES_KEY);
      if (savedHidden) {
        const parsedHidden = JSON.parse(savedHidden);
        log('Loaded hidden categories:', parsedHidden);
        setHiddenCategories(parsedHidden);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);
  
  // Save custom categories to localStorage whenever they change
  useEffect(() => {
    try {
      log('Saving custom categories:', customCategories);
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
    } catch (error) {
      console.error('Error saving custom categories:', error);
    }
  }, [customCategories]);
  
  // Save hidden categories to localStorage whenever they change
  useEffect(() => {
    try {
      log('Saving hidden categories:', hiddenCategories);
      localStorage.setItem(HIDDEN_CATEGORIES_KEY, JSON.stringify(hiddenCategories));
    } catch (error) {
      console.error('Error saving hidden categories:', error);
    }
  }, [hiddenCategories]);
  
  // Add a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // Format the category (capitalize first letter)
    const formattedCategory = newCategoryName.trim().charAt(0).toUpperCase() + newCategoryName.trim().slice(1);
    log('Adding category:', formattedCategory);
    
    // Check if category already exists in custom or default categories
    if (customCategories.includes(formattedCategory) || 
        DEFAULT_CATEGORIES.includes(formattedCategory as any)) {
      toast({
        title: "Category Exists",
        description: `The category "${formattedCategory}" already exists.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // First reset UI elements to avoid any race conditions
      setNewCategoryName('');
      setIsAddingCategory(false);
      
      // Add the new category
      setCustomCategories(prev => [...prev, formattedCategory]);
      
      // Select the new category immediately - we need to make sure this becomes selected
      onChange(formattedCategory);
      
      // Force update the selection after a small delay to ensure UI updates properly
      setTimeout(() => {
        log('Setting delayed category selection:', formattedCategory);
        onChange(formattedCategory);
      }, 100);
      
      // Show success message
      toast({
        title: "Category Added",
        description: `Added "${formattedCategory}" to your categories.`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Cancel adding a new category
  const handleCancelAdd = () => {
    setNewCategoryName('');
    setIsAddingCategory(false);
  };
  
  // Toggle category visibility (hide/show standard category)
  const toggleCategoryVisibility = (category: string) => {
    // Only standard categories can be hidden/shown
    if (!DEFAULT_CATEGORIES.includes(category as any)) return;
    
    if (hiddenCategories.includes(category)) {
      // Show the category
      setHiddenCategories(prev => prev.filter(cat => cat !== category));
      toast({
        title: "Category Shown",
        description: `"${category}" is now visible in the category list.`,
      });
    } else {
      // Hide the category
      setHiddenCategories(prev => [...prev, category]);
      
      // If we're hiding the currently selected category, select another one
      if (value === category) {
        // Find the first visible category to select
        const firstVisible = allCategories.filter(c => c !== category)[0] || customCategories[0] || 'Other';
        onChange(firstVisible);
      }
      
      toast({
        title: "Category Hidden",
        description: `"${category}" is now hidden from the category list.`,
      });
    }
  };
  
  // Delete a custom category
  const handleDeleteCategory = (category: string) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };
  
  // Confirm deletion of a category
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    
    try {
      log('Deleting category:', categoryToDelete);
      
      const isDefaultCategory = DEFAULT_CATEGORIES.includes(categoryToDelete as any);
      const isCurrentlySelected = value === categoryToDelete;
      
      if (isDefaultCategory) {
        // For standard categories, we just hide them
        toggleCategoryVisibility(categoryToDelete);
      } else {
        // For custom categories, we remove them completely
        setCustomCategories(prev => prev.filter(cat => cat !== categoryToDelete));
        
        // If the deleted category was selected, select a default category
        if (isCurrentlySelected) {
          // Find first available category
          const firstAvailable = allCategories.filter(c => c !== categoryToDelete)[0] || 'Other';
          onChange(firstAvailable);
        }
        
        toast({
          title: "Category Deleted",
          description: `Removed "${categoryToDelete}" from your categories.`,
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Reset state
      setCategoryToDelete(null);
      setShowDeleteDialog(false);
      setIsManagingCategories(false);
    }
  };
  
  return (
    <>
      {!isAddingCategory && !isManagingCategories ? (
        <div className="flex items-center gap-2">
          <Select 
            value={value} 
            onValueChange={onChange}
          >
            <FormControl>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {/* All categories in one list */}
              <div className="pb-1">
                <p className="px-2 text-xs text-gray-500 font-medium">Categories</p>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </div>
              
              {/* Category management option */}
              <div className="py-1 border-t border-gray-100">
                <button
                  type="button"
                  className="px-2 py-1.5 w-full text-left text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center rounded"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsManagingCategories(true);
                  }}
                >
                  <Tag className="h-3.5 w-3.5 mr-2" />
                  Manage Categories
                </button>
              </div>
            </SelectContent>
          </Select>
          
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={() => setIsAddingCategory(true)}
            className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      ) : isAddingCategory ? (
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter new category name"
              className="pr-8 w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                } else if (e.key === 'Escape') {
                  handleCancelAdd();
                }
              }}
            />
            {newCategoryName && (
              <button
                type="button"
                onClick={() => setNewCategoryName('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              type="button" 
              size="sm" 
              disabled={!newCategoryName.trim()}
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleAddCategory}
            >
              Add
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleCancelAdd}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // Manage categories view
        <div className="border border-gray-200 rounded-md p-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Manage Categories</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsManagingCategories(false)}
            >
              Done
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Standard categories section */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-gray-500 mb-2">Default Categories</h4>
              <div className="space-y-2">
                {DEFAULT_CATEGORIES.map((category) => (
                  <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span>{category}</span>
                      {hiddenCategories.includes(category) && (
                        <Badge variant="outline" className="text-gray-400 border-gray-300 text-[10px] px-1">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryVisibility(category)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      {hiddenCategories.includes(category) ? (
                        <span className="text-xs">Show</span>
                      ) : (
                        <span className="text-xs">Hide</span>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Custom categories section */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-gray-500 mb-2">Custom Categories</h4>
              {customCategories.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-2">No custom categories yet.</p>
              ) : (
                <div className="space-y-2">
                  {customCategories.map((category) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>{category}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {DEFAULT_CATEGORIES.includes(categoryToDelete as any) 
                ? "Hide Category" 
                : "Delete Category"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {DEFAULT_CATEGORIES.includes(categoryToDelete as any) ? (
                <>
                  Are you sure you want to hide the standard category "{categoryToDelete}"? 
                  You can show it again later if needed.
                </>
              ) : (
                <>
                  Are you sure you want to delete the custom category "{categoryToDelete}"? 
                  This action cannot be undone.
                </>
              )}
              
              {value === categoryToDelete && (
                <p className="mt-2 text-red-500 font-medium">
                  Warning: This category is currently selected. 
                  {DEFAULT_CATEGORIES.includes(categoryToDelete as any)
                    ? " Hiding it will switch to another category."
                    : " Deleting it will reset the selection to a default category."}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCategory}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {DEFAULT_CATEGORIES.includes(categoryToDelete as any) ? "Hide" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}