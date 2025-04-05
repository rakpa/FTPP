import { Trash2, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Salary {
  id: number;
  amount: number;
  month: string;
  year: number;
  notes?: string;
  date: string | Date;
  createdAt?: string | Date;
}

interface SalaryItemProps {
  salary: Salary;
}

// Form schema for editing a salary
const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  month: z.string().min(1, "Month is required"),
  year: z.coerce.number().int().min(2000, "Year must be at least 2000"),
});

type FormValues = z.infer<typeof formSchema>;

// Available months for the dropdown
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function SalaryItem({ salary }: SalaryItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Set up the form with default values from the current salary
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: salary.amount,
      month: salary.month,
      year: salary.year,
    },
  });
  
  // Delete mutation
  const deleteSalaryMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/salaries/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary record deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete salary record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateSalaryMutation = useMutation({
    mutationFn: (data: FormValues) => 
      apiRequest('PATCH', `/api/salaries/${salary.id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary record updated successfully",
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update salary record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteSalaryMutation.mutate(salary.id);
  };
  
  const handleEdit = () => {
    setIsDialogOpen(true);
    form.reset({
      amount: salary.amount,
      month: salary.month,
      year: salary.year,
    });
  };

  const onSubmit = (data: FormValues) => {
    updateSalaryMutation.mutate(data);
  };

  // Just use the amount directly
  const amount = Number(salary.amount);

  return (
    <div className="bg-white border border-gray-200 p-3 animate-fadeIn">
      {/* Mobile-optimized view */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center mb-1">
          <div>
            <span className="text-sm font-medium">{salary.month}</span>
            <span className="text-sm text-gray-500 ml-2">{salary.year}</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">{formatCurrency(amount)} zł</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          {salary.notes && (
            <div className="flex-1">
              <p className="text-xs bg-yellow-100 inline-block px-2 py-1 rounded">{salary.notes}</p>
            </div>
          )}
          <div className="flex space-x-2">
            <button 
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
              onClick={handleEdit}
              disabled={updateSalaryMutation.isPending}
            >
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </button>
            <button 
              className="text-xs text-red-500 hover:text-red-700 flex items-center"
              onClick={handleDelete}
              disabled={deleteSalaryMutation.isPending}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:grid grid-cols-4 items-center">
        {/* Month column */}
        <div className="col-span-1 pl-1">
          <p className="text-sm text-gray-700">{salary.month}</p>
        </div>
        
        {/* Year column */}
        <div className="col-span-1">
          <p className="text-sm text-gray-700">{salary.year}</p>
        </div>
        
        {/* Amount column */}
        <div className="col-span-1">
          <div className="font-semibold text-gray-900">{formatCurrency(amount)} zł</div>
        </div>
        
        {/* Actions column */}
        <div className="col-span-1 text-right pr-2 flex items-center justify-end space-x-2">
          <button 
            className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
            onClick={handleEdit}
            disabled={updateSalaryMutation.isPending}
          >
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </button>
          <button 
            className="text-xs text-red-500 hover:text-red-700 flex items-center"
            onClick={handleDelete}
            disabled={deleteSalaryMutation.isPending}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </button>
        </div>
      </div>
      
      {/* Notes row for desktop view, only displayed if there are notes */}
      {salary.notes && (
        <div className="hidden sm:block mt-2 pl-2">
          <p className="text-xs bg-yellow-100 inline-block px-2 py-1 rounded">{salary.notes}</p>
        </div>
      )}
      
      {/* Edit Salary Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Salary Record</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              {/* Month Field */}
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map(month => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              {/* Year Field */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min="2000" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (zł)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateSalaryMutation.isPending}
                >
                  {updateSalaryMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}