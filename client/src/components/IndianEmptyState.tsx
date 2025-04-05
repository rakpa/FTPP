import { ReceiptText } from 'lucide-react';

export function IndianEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <ReceiptText className="text-purple-700 h-10 w-10" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">No expenses yet</h3>
      <p className="text-gray-500">Add your first expense using the form above.</p>
    </div>
  );
}