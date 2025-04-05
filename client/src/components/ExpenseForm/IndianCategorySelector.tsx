import { useState, useEffect } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomCategoryInput } from "../CustomCategoryInput";

import { EXPENSE_CATEGORIES } from '@/types';

// Default categories - cast as string[] to avoid type errors
const DEFAULT_CATEGORIES = EXPENSE_CATEGORIES as unknown as string[];

// Debug log function
function logDebug(...args: any[]) {
  console.log("[IndianCategorySelector]", ...args);
}

// Storage keys
const INDIAN_CUSTOM_CATEGORIES_KEY = 'indianCustomCategories';
const INDIAN_HIDDEN_CATEGORIES_KEY = 'indianHiddenCategories';

// Debug localStorage on load
console.log("IndianCategorySelector - All localStorage keys:", Object.keys(localStorage));
try {
  console.log("IndianCustomCategories value:", localStorage.getItem(INDIAN_CUSTOM_CATEGORIES_KEY));
  console.log("IndianHiddenCategories value:", localStorage.getItem(INDIAN_HIDDEN_CATEGORIES_KEY));
} catch (e) {
  console.error("Error reading localStorage:", e);
}

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function IndianCategorySelector({ value, onChange }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  
  // Load custom and hidden categories from localStorage
  useEffect(() => {
    try {
      const savedCustomCategories = localStorage.getItem(INDIAN_CUSTOM_CATEGORIES_KEY);
      const savedHiddenCategories = localStorage.getItem(INDIAN_HIDDEN_CATEGORIES_KEY);
      
      if (savedCustomCategories) {
        const parsedCategories = JSON.parse(savedCustomCategories);
        if (Array.isArray(parsedCategories)) {
          setCustomCategories(parsedCategories);
          logDebug("Loaded custom categories:", parsedCategories);
        }
      }
      
      if (savedHiddenCategories) {
        const parsedHiddenCategories = JSON.parse(savedHiddenCategories);
        if (Array.isArray(parsedHiddenCategories)) {
          setHiddenCategories(parsedHiddenCategories);
          logDebug("Loaded hidden categories:", parsedHiddenCategories);
        }
      }
    } catch (error) {
      console.error("Error loading categories from localStorage", error);
    }
  }, []);
  
  // Save to localStorage when categories change
  useEffect(() => {
    try {
      localStorage.setItem(INDIAN_CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
      logDebug("Saving custom categories:", customCategories);
    } catch (error) {
      console.error("Error saving custom categories to localStorage", error);
    }
  }, [customCategories]);
  
  useEffect(() => {
    try {
      localStorage.setItem(INDIAN_HIDDEN_CATEGORIES_KEY, JSON.stringify(hiddenCategories));
      logDebug("Saving hidden categories:", hiddenCategories);
    } catch (error) {
      console.error("Error saving hidden categories to localStorage", error);
    }
  }, [hiddenCategories]);
  
  // Combined active categories (defaults + custom - hidden)
  const allCategories = [
    ...DEFAULT_CATEGORIES.filter(cat => !hiddenCategories.includes(cat)),
    ...customCategories
  ].sort();
  
  // Add a new custom category
  const handleAddCategory = (category: string) => {
    if (
      category &&
      !customCategories.includes(category) &&
      !DEFAULT_CATEGORIES.some(c => c === category)
    ) {
      setCustomCategories([...customCategories, category]);
    }
    setIsAddingCategory(false);
  };
  
  // Remove a custom category
  const handleRemoveCustomCategory = (category: string) => {
    setCustomCategories(customCategories.filter(c => c !== category));
    
    // If the currently selected value is being removed, clear it
    if (value === category) {
      onChange("");
    }
  };
  
  // Hide a default category
  const handleHideDefaultCategory = (category: string) => {
    if (!hiddenCategories.includes(category)) {
      setHiddenCategories([...hiddenCategories, category]);
    }
    
    // If the currently selected value is being hidden, clear it
    if (value === category) {
      onChange("");
    }
  };
  
  // Restore a hidden default category
  const handleRestoreDefaultCategory = (category: string) => {
    setHiddenCategories(hiddenCategories.filter(c => c !== category));
  };
  
  // Filter function for search
  const filterCategories = (allCategories: string[], search: string) => {
    if (!search) return allCategories;
    
    const searchLower = search.toLowerCase();
    return allCategories.filter(category => 
      category.toLowerCase().includes(searchLower)
    );
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value : "Select category..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        {isManagingCategories ? (
          <div className="flex flex-col p-2 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-medium">Manage Categories</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsManagingCategories(false)}
              >
                Done
              </Button>
            </div>
            
            {/* Default categories */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Default Categories</h4>
              <ScrollArea className="h-[150px]">
                <div className="space-y-1">
                  {DEFAULT_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center justify-between p-1 rounded hover:bg-gray-100">
                      <span>{category}</span>
                      {hiddenCategories.includes(category) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreDefaultCategory(category)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHideDefaultCategory(category)}
                        >
                          Hide
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Custom categories */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Custom Categories</h4>
              <ScrollArea className="h-[150px]">
                <div className="space-y-1">
                  {customCategories.length > 0 ? (
                    customCategories.map(category => (
                      <div key={category} className="flex items-center justify-between p-1 rounded hover:bg-gray-100">
                        <span>{category}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomCategory(category)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No custom categories yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : isAddingCategory ? (
          <CustomCategoryInput 
            onAdd={handleAddCategory}
            onCancel={() => setIsAddingCategory(false)}
          />
        ) : (
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {allCategories.map(category => (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={(currentValue) => {
                        onChange(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          value === category ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {category}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
            <div className="flex items-center justify-between border-t p-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsManagingCategories(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Manage Categories
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAddingCategory(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add New
              </Button>
            </div>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}