import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Menu, Wallet, Receipt, LineChart, PieChart, IndianRupee } from 'lucide-react';

// Define allowed icon types
type IconName = 'wallet' | 'receipt' | 'chart-line' | 'rupee-sign' | 'chart-pie';

interface SidebarItemProps {
  icon: IconName;
  label: string;
  href: string;
  active?: boolean;
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  // Map the icon string to the appropriate Lucide component
  const IconComponent = (() => {
    switch (icon) {
      case 'wallet': return Wallet;
      case 'receipt': return Receipt;
      case 'chart-line': return LineChart;
      case 'chart-pie': return PieChart;
      case 'rupee-sign': return IndianRupee;
      default: return Receipt;
    }
  })();

  return (
    <li>
      <Link 
        href={href}
        className={cn(
          "flex items-center px-5 py-3 text-white text-opacity-90 hover:text-white",
          "hover:bg-opacity-10 hover:bg-white transition-colors",
          active && "bg-white bg-opacity-20"
        )}
      >
        <IconComponent className="h-5 w-5 mr-3" />
        <span>{label}</span>
      </Link>
    </li>
  );
}

interface SidebarSectionProps {
  title: string;
  items: Array<{
    icon: IconName;
    label: string;
    href: string;
  }>;
  currentPath: string;
}

function SidebarSection({ title, items, currentPath }: SidebarSectionProps) {
  return (
    <div className="mb-4">
      <h2 className="text-white text-opacity-80 px-5 mb-2 font-medium">{title}</h2>
      <ul>
        {items.map((item, index) => (
          <SidebarItem 
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={currentPath === item.href}
          />
        ))}
      </ul>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Define menu items with proper typing
  const generalItems: Array<{
    icon: IconName;
    label: string;
    href: string;
  }> = [
    { icon: 'wallet', label: 'Salary', href: '/salary' },
    { icon: 'receipt', label: 'Expenses', href: '/' },
    { icon: 'chart-line', label: 'Dashboard', href: '/dashboard' }
  ];

  const indianFinanceItems: Array<{
    icon: IconName;
    label: string;
    href: string;
  }> = [
    { icon: 'rupee-sign', label: 'Expenses', href: '/indian-finance/expenses' },
    { icon: 'chart-pie', label: 'Dashboard', href: '/indian-finance/dashboard' }
  ];

  return (
    <>
      {/* Mobile navbar at the bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-purple-700 z-40 sm:hidden">
        <div className="flex justify-around items-center h-14 px-1">
          {generalItems.map((item, index) => {
            const IconComponent = (() => {
              switch (item.icon) {
                case 'wallet': return Wallet;
                case 'receipt': return Receipt;
                case 'chart-line': return LineChart;
                case 'chart-pie': return PieChart;
                case 'rupee-sign': return IndianRupee;
                default: return Receipt;
              }
            })();
            
            const isActive = location === item.href;
            
            return (
              <Link 
                key={index}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-1 text-white text-opacity-90",
                  "hover:text-white rounded-md",
                  isActive && "bg-white bg-opacity-20"
                )}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={toggleMobileMenu}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 text-white text-opacity-90",
              "hover:text-white rounded-md",
              isMobileMenuOpen && "bg-white bg-opacity-20"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu button for tablets */}
      <button 
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 hidden sm:block lg:hidden bg-purple-700 text-white p-2 rounded-md shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-purple-700 w-64 flex-shrink-0 h-full overflow-y-auto transition-all duration-300 ease-in-out",
          "fixed lg:relative z-40",
          // Full-width on mobile when open
          isMobileMenuOpen ? "translate-x-0 sm:w-64 w-full bottom-14 sm:bottom-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 sm:p-5 border-b border-purple-800 flex justify-between items-center">
          <h1 className="text-white text-xl font-semibold">Finance Tracker</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white sm:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="py-4">
          <SidebarSection 
            title="General"
            items={generalItems}
            currentPath={location}
          />
          
          <SidebarSection 
            title="Indian Finance"
            items={indianFinanceItems}
            currentPath={location}
          />
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
