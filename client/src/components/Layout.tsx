import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-4 sm:p-6 md:p-8 pb-16 sm:pb-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
