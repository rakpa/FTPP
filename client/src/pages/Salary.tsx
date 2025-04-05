import { Layout } from '@/components/Layout';
import { SalaryForm } from '@/components/SalaryForm';
import { SalaryList } from '@/components/SalaryList';

export default function Salary() {
  return (
    <Layout>
      <div className="max-w-4xl ml-0 pl-4">
        <h1 className="text-2xl font-semibold mb-6">Salary Tracker</h1>
        
        {/* Form and List */}
        <div className="space-y-6">
          <SalaryForm />
          <SalaryList />
        </div>
      </div>
    </Layout>
  );
}