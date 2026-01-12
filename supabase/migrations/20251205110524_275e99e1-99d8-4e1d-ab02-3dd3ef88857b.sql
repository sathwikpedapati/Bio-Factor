-- Create app_role enum
CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'sales_officer',
  'field_officer',
  'mdo',
  'regional_manager',
  'zonal_manager',
  'warehouse_manager',
  'manufacturing_manager',
  'qc_analyst',
  'finance_officer',
  'hr_manager',
  'rnd_manager',
  'executive'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  zone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Create dealers table
CREATE TABLE public.dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  region_id UUID REFERENCES public.regions(id),
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  kyc_status TEXT DEFAULT 'pending',
  kyc_documents JSONB DEFAULT '[]',
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  outstanding_balance DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

-- Create farmers table
CREATE TABLE public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  district TEXT,
  state TEXT,
  farm_size_acres DECIMAL(10, 2),
  crops JSONB DEFAULT '[]',
  dealer_id UUID REFERENCES public.dealers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'kg',
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  min_stock_level INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  dealer_id UUID REFERENCES public.dealers(id) NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_delivery DATE,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create warehouses table
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  region_id UUID REFERENCES public.regions(id),
  manager_id UUID REFERENCES auth.users(id),
  capacity INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- Create stocks table
CREATE TABLE public.stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID REFERENCES public.warehouses(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  batch_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- Create production_batches table
CREATE TABLE public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  planned_quantity INTEGER NOT NULL,
  actual_quantity INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planned',
  machine_id TEXT,
  raw_materials JSONB DEFAULT '[]',
  cost_per_unit DECIMAL(10, 2),
  total_cost DECIMAL(12, 2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

-- Create qc_tests table
CREATE TABLE public.qc_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.production_batches(id) NOT NULL,
  test_type TEXT NOT NULL,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  parameters JSONB DEFAULT '{}',
  result TEXT DEFAULT 'pending',
  passed BOOLEAN,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  tested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.qc_tests ENABLE ROW LEVEL SECURITY;

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  employee_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT NOT NULL,
  designation TEXT,
  date_of_joining DATE,
  salary DECIMAL(12, 2),
  bank_account TEXT,
  address TEXT,
  emergency_contact TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status TEXT DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create leaves table
CREATE TABLE public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Create field_visits table
CREATE TABLE public.field_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id),
  farmer_id UUID REFERENCES public.farmers(id),
  visit_date DATE NOT NULL,
  visit_type TEXT NOT NULL,
  location TEXT,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  purpose TEXT,
  outcome TEXT,
  issues_reported TEXT,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.field_visits ENABLE ROW LEVEL SECURITY;

-- Create trials table (R&D)
CREATE TABLE public.trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  stage TEXT DEFAULT 'idea',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  spent DECIMAL(12, 2) DEFAULT 0,
  objectives TEXT,
  results TEXT,
  documents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  dealer_id UUID REFERENCES public.dealers(id) NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id),
  dealer_id UUID REFERENCES public.dealers(id) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can view all, update own
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles: only admins can manage, users can view own
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Regions: all authenticated can view
CREATE POLICY "Authenticated can view regions" ON public.regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage regions" ON public.regions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Dealers: sales team can manage
CREATE POLICY "Authenticated can view dealers" ON public.dealers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales can manage dealers" ON public.dealers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Sales can update dealers" ON public.dealers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete dealers" ON public.dealers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Farmers
CREATE POLICY "Authenticated can view farmers" ON public.farmers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage farmers" ON public.farmers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update farmers" ON public.farmers FOR UPDATE TO authenticated USING (true);

-- Products
CREATE POLICY "Authenticated can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'manufacturing_manager'));

-- Orders
CREATE POLICY "Authenticated can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Sales can update orders" ON public.orders FOR UPDATE TO authenticated USING (true);

-- Order items
CREATE POLICY "Authenticated can view order items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales can manage order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Sales can update order items" ON public.order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Sales can delete order items" ON public.order_items FOR DELETE TO authenticated USING (true);

-- Warehouses
CREATE POLICY "Authenticated can view warehouses" ON public.warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Warehouse managers can manage" ON public.warehouses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'warehouse_manager'));

-- Stocks
CREATE POLICY "Authenticated can view stocks" ON public.stocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Warehouse can manage stocks" ON public.stocks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'warehouse_manager'));

-- Production batches
CREATE POLICY "Authenticated can view batches" ON public.production_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manufacturing can manage batches" ON public.production_batches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'manufacturing_manager'));

-- QC Tests
CREATE POLICY "Authenticated can view qc tests" ON public.qc_tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "QC can manage tests" ON public.qc_tests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'qc_analyst'));

-- Employees
CREATE POLICY "Authenticated can view employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR can manage employees" ON public.employees FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Attendance
CREATE POLICY "Authenticated can view attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR can manage attendance" ON public.attendance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Leaves
CREATE POLICY "Authenticated can view leaves" ON public.leaves FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create leaves" ON public.leaves FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "HR can manage leaves" ON public.leaves FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Field visits
CREATE POLICY "Authenticated can view field visits" ON public.field_visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Field staff can manage visits" ON public.field_visits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Field staff can update visits" ON public.field_visits FOR UPDATE TO authenticated USING (true);

-- Trials
CREATE POLICY "Authenticated can view trials" ON public.trials FOR SELECT TO authenticated USING (true);
CREATE POLICY "RnD can manage trials" ON public.trials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'rnd_manager'));

-- Invoices
CREATE POLICY "Authenticated can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance can manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'finance_officer'));

-- Payments
CREATE POLICY "Authenticated can view payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance can manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'finance_officer'));

-- Notifications: users see own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Audit logs: admins only
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "System can create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(order_number FROM 14) AS INTEGER)), 0) + 1::INTEGER, 4, '0')
  INTO new_number
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  RETURN new_number;
END;
$$;