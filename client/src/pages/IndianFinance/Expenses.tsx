import { Layout } from '@/components/Layout';
import { IndianExpenseForm } from '@/components/IndianExpenseForm';
import { IndianExpenseList } from '@/components/IndianExpenseList';
import { Separator } from '@/components/ui/separator';

export default function IndianExpenses() {
  return (
    <Layout>
      <div className="max-w-5xl ml-0 pl-4">
        <h1 className="text-2xl font-semibold mb-6">Indian Finance - Expenses</h1>
        
        <div className="space-y-6">
          {/* Form Section */}
          <div className="w-full">
            <IndianExpenseForm />
          </div>
          
          <Separator className="my-4" />
          
          {/* List Section */}
          <div>
            <IndianExpenseList />
          </div>
        </div>
      </div>
    </Layout>
  );
}