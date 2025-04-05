import { Layout } from '@/components/Layout';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';

export default function Expenses() {
  return (
    <Layout>
      <div className="ml-0 pl-4">
        <h1 className="text-2xl font-semibold mb-6">Expenses</h1>
        
        <div className="mb-8 max-w-3xl">
          <ExpenseForm />
        </div>
        
        <div className="max-w-5xl">
          <ExpenseList />
        </div>
      </div>
    </Layout>
  );
}