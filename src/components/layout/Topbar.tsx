import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Menu, ChevronRight, Settings } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';

interface TopbarProps {
  onMenuToggle: () => void;
}

const pathTitles: Record<string, string> = {
  '/dashboard/executive': 'Executive Dashboard',
  '/dashboard/sales': 'Sales & Marketing',
  '/dashboard/manufacturing': 'Manufacturing',
  '/dashboard/qc': 'Quality Control',
  '/dashboard/warehouse': 'Warehouse & Logistics',
  '/dashboard/finance': 'Finance & Accounts',
  '/dashboard/hr': 'Human Resources',
  '/dashboard/fieldops': 'Field Operations',
  '/dashboard/rnd': 'R&D',
  '/admin/users': 'User Management',
  '/admin/roles': 'Roles & Permissions',
  '/admin/audit': 'Audit Logs',
  '/admin/settings': 'Settings',
  '/sales/dealers': 'Dealers',
  '/sales/orders': 'Orders',
  '/sales/farmers': 'Farmers',
  '/sales/campaigns': 'Campaigns',
  '/manufacturing/batches': 'Production Batches',
  '/hr/employees': 'Employees',
  '/qc/tests': 'QC Tests',
  '/warehouse/inventory': 'Inventory',
  '/finance/invoices': 'Invoices',
  '/finance/payments': 'Payments',
  '/fieldops/visits': 'Field Visits',
  '/rnd/trials': 'R&D Trials',
};

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const title = pathTitles[currentPath] || path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({ label: title, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const pageTitle = pathTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Mobile Title */}
        <h1 className="md:hidden font-semibold text-lg">{pageTitle}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="hidden xl:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Search Button (Mobile) */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Settings */}
        <Link to="/admin/settings" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </Link>

        {/* User Avatar */}
        <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
