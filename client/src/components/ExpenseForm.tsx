import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CategorySelector } from './ExpenseForm/CategorySelector';

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  category: z.string({
    required_error: "Category is required",
  }),
  amount: z.coerce.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ExpenseForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      category: 'Rent',
      amount: undefined,
      description: '',
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('POST', '/api/expenses', data)
        .then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      
      // Reset form
      form.reset({
        date: new Date(),
        category: 'Rent',
        amount: undefined,
        description: '',
      });
      
      // Invalidate expenses query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormValues) {
    // Convert JS Date to ISO string for the API
    const formattedData = {
      ...data,
      date: data.date.toISOString(),
      amount: data.amount.toString() // Convert number to string as expected by the API
    };
    
    addExpenseMutation.mutate(formattedData);
  }

  return (
    <div>
      <div className="bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4 sm:mb-6">Add Expense</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 w-full max-w-2xl mx-0">
              {/* First row: Date and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <div>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full pl-3 text-left font-normal h-10"
                              >
                                {field.value ? (
                                  format(field.value, 'dd-MM-yyyy')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsDatePickerOpen(false);
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <div>
                        {/* Use our self-contained CategorySelector component */}
                        <CategorySelector
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            form.setValue('category', value, { shouldValidate: true });
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Second row: Amount and Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (PLN)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0" 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter expense description" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="bg-green-500 hover:bg-green-600 px-6"
                disabled={addExpenseMutation.isPending}
              >
                {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
