import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 
  | 'super_admin'
  | 'sales_officer'
  | 'field_officer'
  | 'mdo'
  | 'regional_manager'
  | 'zonal_manager'
  | 'warehouse_manager'
  | 'manufacturing_manager'
  | 'qc_analyst'
  | 'finance_officer'
  | 'hr_manager'
  | 'rnd_manager'
  | 'executive';

export type Department = 
  | 'sales'
  | 'manufacturing'
  | 'qc'
  | 'warehouse'
  | 'finance'
  | 'hr'
  | 'fieldops'
  | 'rnd'
  | 'executive';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: Department;
  avatar?: string;
  region?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessDepartment: (department: Department) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions mapping
const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['*'],
  executive: ['view_all', 'view_reports', 'approve_high'],
  sales_officer: ['sales_view', 'sales_create', 'sales_edit', 'dealers_manage', 'orders_manage'],
  field_officer: ['field_view', 'field_create', 'farmer_manage', 'demos_manage'],
  mdo: ['sales_view', 'marketing_manage', 'campaigns_manage'],
  regional_manager: ['sales_view', 'sales_approve', 'team_view', 'reports_view'],
  zonal_manager: ['sales_view', 'sales_approve', 'team_manage', 'reports_view', 'targets_set'],
  warehouse_manager: ['warehouse_view', 'warehouse_manage', 'stock_manage', 'dispatch_manage'],
  manufacturing_manager: ['manufacturing_view', 'manufacturing_manage', 'batches_manage', 'production_plan'],
  qc_analyst: ['qc_view', 'qc_manage', 'tests_manage', 'batches_approve'],
  finance_officer: ['finance_view', 'finance_manage', 'invoices_manage', 'payments_manage'],
  hr_manager: ['hr_view', 'hr_manage', 'employees_manage', 'payroll_manage'],
  rnd_manager: ['rnd_view', 'rnd_manage', 'trials_manage', 'research_manage'],
};

// Role to department mapping
const roleDepartmentAccess: Record<UserRole, Department[]> = {
  super_admin: ['sales', 'manufacturing', 'qc', 'warehouse', 'finance', 'hr', 'fieldops', 'rnd', 'executive'],
  executive: ['sales', 'manufacturing', 'qc', 'warehouse', 'finance', 'hr', 'fieldops', 'rnd', 'executive'],
  sales_officer: ['sales'],
  field_officer: ['fieldops', 'sales'],
  mdo: ['sales'],
  regional_manager: ['sales', 'fieldops'],
  zonal_manager: ['sales', 'fieldops'],
  warehouse_manager: ['warehouse'],
  manufacturing_manager: ['manufacturing'],
  qc_analyst: ['qc'],
  finance_officer: ['finance'],
  hr_manager: ['hr'],
  rnd_manager: ['rnd'],
};

// Demo users for testing
const demoUsers: Record<string, { password: string; user: User }> = {
  'admin@biofactor.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@biofactor.com',
      name: 'Super Admin',
      role: 'super_admin',
      department: 'executive',
    },
  },
  'ceo@biofactor.com': {
    password: 'ceo123',
    user: {
      id: '2',
      email: 'ceo@biofactor.com',
      name: 'Rajesh Kumar',
      role: 'executive',
      department: 'executive',
    },
  },
  'sales@biofactor.com': {
    password: 'sales123',
    user: {
      id: '3',
      email: 'sales@biofactor.com',
      name: 'Priya Sharma',
      role: 'sales_officer',
      department: 'sales',
      region: 'North',
    },
  },
  'warehouse@biofactor.com': {
    password: 'warehouse123',
    user: {
      id: '4',
      email: 'warehouse@biofactor.com',
      name: 'Amit Patel',
      role: 'warehouse_manager',
      department: 'warehouse',
    },
  },
  'manufacturing@biofactor.com': {
    password: 'mfg123',
    user: {
      id: '5',
      email: 'manufacturing@biofactor.com',
      name: 'Suresh Reddy',
      role: 'manufacturing_manager',
      department: 'manufacturing',
    },
  },
  'qc@biofactor.com': {
    password: 'qc123',
    user: {
      id: '6',
      email: 'qc@biofactor.com',
      name: 'Dr. Meera Singh',
      role: 'qc_analyst',
      department: 'qc',
    },
  },
  'finance@biofactor.com': {
    password: 'finance123',
    user: {
      id: '7',
      email: 'finance@biofactor.com',
      name: 'Vikram Joshi',
      role: 'finance_officer',
      department: 'finance',
    },
  },
  'hr@biofactor.com': {
    password: 'hr123',
    user: {
      id: '8',
      email: 'hr@biofactor.com',
      name: 'Anita Desai',
      role: 'hr_manager',
      department: 'hr',
    },
  },
  'field@biofactor.com': {
    password: 'field123',
    user: {
      id: '9',
      email: 'field@biofactor.com',
      name: 'Kiran Rao',
      role: 'field_officer',
      department: 'fieldops',
      region: 'South',
    },
  },
  'rnd@biofactor.com': {
    password: 'rnd123',
    user: {
      id: '10',
      email: 'rnd@biofactor.com',
      name: 'Dr. Arun Gupta',
      role: 'rnd_manager',
      department: 'rnd',
    },
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('biofactor_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const demoUser = demoUsers[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem('biofactor_user', JSON.stringify(demoUser.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('biofactor_user');
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role];
    if (!permissions) return false;
    return permissions.includes('*') || permissions.includes(permission);
  }, [user]);

  const canAccessDepartment = useCallback((department: Department): boolean => {
    if (!user) return false;
    const accessibleDepts = roleDepartmentAccess[user.role];
    if (!accessibleDepts) return false;
    return accessibleDepts.includes(department);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        canAccessDepartment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
