import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CustomCategoryInputProps {
  onAdd: (category: string) => void;
  onCancel: () => void;
}

export function CustomCategoryInput({ onAdd, onCancel }: CustomCategoryInputProps) {
  const [value, setValue] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      // Pass the trimmed value to the parent component
      onAdd(value.trim());
      // Reset the input
      setValue('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter new category name"
          className="pr-8"
          autoFocus
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex gap-1">
        <Button 
          type="submit" 
          size="sm" 
          disabled={!value.trim()}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Add
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}