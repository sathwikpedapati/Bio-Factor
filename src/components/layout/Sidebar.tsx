import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth, Department } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  FlaskConical,
  Warehouse,
  DollarSign,
  Users,
  MapPin,
  Microscope,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  Menu,
  X,
  Bell,
  FileText,
  UserCircle,
  Shield,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  department?: Department;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Executive Dashboard',
    path: '/dashboard/executive',
    icon: LayoutDashboard,
    department: 'executive',
  },
  {
    label: 'Sales & Marketing',
    path: '/dashboard/sales',
    icon: ShoppingCart,
    department: 'sales',
    children: [
      { label: 'Dashboard', path: '/dashboard/sales' },
      { label: 'Dealers', path: '/sales/dealers' },
      { label: 'Farmers', path: '/sales/farmers' },
      { label: 'Orders', path: '/sales/orders' },
      { label: 'Campaigns', path: '/sales/campaigns' },
      { label: 'Reports', path: '/sales/reports' },
    ],
  },
  {
    label: 'Manufacturing',
    path: '/dashboard/manufacturing',
    icon: Factory,
    department: 'manufacturing',
    children: [
      { label: 'Dashboard', path: '/dashboard/manufacturing' },
      { label: 'Production Plan', path: '/manufacturing/production' },
      { label: 'Batches', path: '/manufacturing/batches' },
      { label: 'Machines', path: '/manufacturing/machines' },
    ],
  },
  {
    label: 'Quality Control',
    path: '/dashboard/qc',
    icon: FlaskConical,
    department: 'qc',
    children: [
      { label: 'Dashboard', path: '/dashboard/qc' },
      { label: 'Tests', path: '/qc/tests' },
      { label: 'Batches', path: '/qc/batches' },
      { label: 'Deviations', path: '/qc/deviations' },
    ],
  },
  {
    label: 'Warehouse',
    path: '/dashboard/warehouse',
    icon: Warehouse,
    department: 'warehouse',
    children: [
      { label: 'Dashboard', path: '/dashboard/warehouse' },
      { label: 'Inventory', path: '/warehouse/inventory' },
      { label: 'Inward', path: '/warehouse/inward' },
      { label: 'Dispatch', path: '/warehouse/dispatch' },
      { label: 'Transfers', path: '/warehouse/transfers' },
    ],
  },
  {
    label: 'Finance',
    path: '/dashboard/finance',
    icon: DollarSign,
    department: 'finance',
    children: [
      { label: 'Dashboard', path: '/dashboard/finance' },
      { label: 'Invoices', path: '/finance/invoices' },
      { label: 'Payments', path: '/finance/payments' },
      { label: 'Reports', path: '/finance/reports' },
    ],
  },
  {
    label: 'Human Resources',
    path: '/dashboard/hr',
    icon: Users,
    department: 'hr',
    children: [
      { label: 'Dashboard', path: '/dashboard/hr' },
      { label: 'Employees', path: '/hr/employees' },
      { label: 'Attendance', path: '/hr/attendance' },
      { label: 'Payroll', path: '/hr/payroll' },
      { label: 'Recruitment', path: '/hr/recruitment' },
    ],
  },
  {
    label: 'Field Operations',
    path: '/dashboard/fieldops',
    icon: MapPin,
    department: 'fieldops',
    children: [
      { label: 'Dashboard', path: '/dashboard/fieldops' },
      { label: 'Visits', path: '/fieldops/visits' },
      { label: 'Demos', path: '/fieldops/demos' },
      { label: 'Issues', path: '/fieldops/issues' },
    ],
  },
  {
    label: 'R&D',
    path: '/dashboard/rnd',
    icon: Microscope,
    department: 'rnd',
    children: [
      { label: 'Dashboard', path: '/dashboard/rnd' },
      { label: 'Trials', path: '/rnd/trials' },
      { label: 'Research', path: '/rnd/research' },
    ],
  },
];

const adminItems: NavItem[] = [
  {
    label: 'User Management',
    path: '/admin/users',
    icon: UserCircle,
  },
  {
    label: 'Roles & Permissions',
    path: '/admin/roles',
    icon: Shield,
  },
  {
    label: 'Audit Logs',
    path: '/admin/audit',
    icon: FileText,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, canAccessDepartment, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.department || canAccessDepartment(item.department)
  );

  const showAdminItems = user?.role === 'super_admin' || user?.role === 'executive';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col',
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className={cn('flex items-center gap-3', !isOpen && 'lg:justify-center lg:w-full')}>
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {isOpen && (
              <span className="font-bold text-lg tracking-tight">Biofactor</span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedItems.includes(item.label);
              const isActive = location.pathname.startsWith(item.path.split('/').slice(0, 3).join('/'));

              if (item.children) {
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {isOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    {isOpen && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive
                                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                              )
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      !isOpen && 'lg:justify-center'
                    )
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Admin Section */}
          {showAdminItems && (
            <div className="mt-6 pt-6 border-t border-sidebar-border">
              {isOpen && (
                <p className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Administration
                </p>
              )}
              <div className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                          !isOpen && 'lg:justify-center'
                        )
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {isOpen && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-sidebar-border">
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent',
              !isOpen && 'lg:justify-center'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold text-sm">
              {user?.name.charAt(0)}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
            )}
            {isOpen && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-sidebar-border transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
