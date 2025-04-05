import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { IndianCategorySelector } from "./ExpenseForm/IndianCategorySelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
  amount: z.string().min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  date: z.date({
    required_error: "Date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function IndianExpenseForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [categoryValue, setCategoryValue] = useState<string>("");

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      description: "",
      amount: "",
      date: new Date(),
    },
  });

  // Mutation for creating an expense
  const createMutation = useMutation({
    mutationFn: (data: FormValues) => 
      apiRequest("POST", "/api/indian-expenses", {
        ...data,
        amount: parseFloat(data.amount)
      }),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['indian-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['indian-salaries'] }); //Added this line

      // Show success message
      toast({
        title: "Success",
        description: "Indian expense has been added",
      });

      // Reset form
      form.reset({
        category: "",
        description: "",
        amount: "",
        date: new Date(),
      });
      setCategoryValue("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add Indian expense",
        variant: "destructive",
      });
      console.error("Error adding Indian expense:", error);
    }
  });

  function onSubmit(data: FormValues) {
    createMutation.mutate(data);
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-md space-y-4 w-full max-w-2xl">
      <h2 className="text-lg font-semibold">Add New Indian Expense</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* First row: Category and Amount side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <IndianCategorySelector 
                      value={categoryValue} 
                      onChange={(value) => {
                        setCategoryValue(value);
                        field.onChange(value);
                      }} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Second row: Description and Date side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 px-6"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Add Indian Expense"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}