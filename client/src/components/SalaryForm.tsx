import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate last 5 years and current year
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

const formSchema = z.object({
  month: z.string({
    required_error: "Month is required",
  }),
  year: z.coerce.number({
    required_error: "Year is required",
  }),
  amount: z.coerce.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).min(0.01, "Amount must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export function SalaryForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear(),
      amount: undefined,
    },
  });

  const addSalaryMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('POST', '/api/salaries', data)
        .then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary record added successfully",
      });

      // Reset form
      form.reset({
        month: MONTHS[new Date().getMonth()],
        year: new Date().getFullYear(),
        amount: undefined,
      });

      // Invalidate and refetch immediately
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add salary record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormValues) {
    addSalaryMutation.mutate({
      ...data,
      // Add empty notes field for back compatibility
      notes: '',
      // Add date
      date: new Date().toISOString()
    });
  }

  return (
    <div>
      <div className="bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4 sm:mb-6">Add Salary</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full max-w-md mx-0">
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
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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




            </div>

            <div className="pt-2 max-w-md mx-0">
              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={addSalaryMutation.isPending}
              >
                {addSalaryMutation.isPending ? 'Adding...' : 'Add Salary'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}