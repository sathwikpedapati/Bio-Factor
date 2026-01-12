import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Factory,
  Warehouse,
  FlaskConical,
  MapPin,
  Microscope,
  AlertTriangle,
} from 'lucide-react';

// Mock data
const revenueData = [
  { month: 'Jan', actual: 45, target: 50 },
  { month: 'Feb', actual: 52, target: 55 },
  { month: 'Mar', actual: 61, target: 60 },
  { month: 'Apr', actual: 58, target: 65 },
  { month: 'May', actual: 72, target: 70 },
  { month: 'Jun', actual: 68, target: 75 },
];

const departmentPerformance = [
  { name: 'Sales', value: 87, color: 'hsl(199, 89%, 48%)' },
  { name: 'Manufacturing', value: 92, color: 'hsl(262, 52%, 50%)' },
  { name: 'QC', value: 96, color: 'hsl(142, 70%, 40%)' },
  { name: 'Warehouse', value: 78, color: 'hsl(38, 92%, 50%)' },
  { name: 'Finance', value: 85, color: 'hsl(174, 62%, 40%)' },
];

const alerts = [
  { id: 1, type: 'warning', department: 'Warehouse', message: 'Low stock alert: Product SKU-4521', time: '10 min ago' },
  { id: 2, type: 'error', department: 'QC', message: 'Batch #BT-2024-089 failed quality test', time: '25 min ago' },
  { id: 3, type: 'info', department: 'Sales', message: 'New dealer registration pending approval', time: '1 hour ago' },
  { id: 4, type: 'success', department: 'Manufacturing', message: 'Production target achieved for Q2', time: '2 hours ago' },
];

const topProducts = [
  { product: 'Bio-Fertilizer Pro', revenue: '₹12.5L', units: 2450, growth: 15 },
  { product: 'Organic Pesticide X', revenue: '₹9.8L', units: 1890, growth: 8 },
  { product: 'Growth Enhancer Plus', revenue: '₹7.2L', units: 1650, growth: 22 },
  { product: 'Soil Conditioner', revenue: '₹5.4L', units: 1200, growth: -3 },
  { product: 'Micro Nutrients Mix', revenue: '₹4.1L', units: 980, growth: 12 },
];

export const ExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Company-wide performance overview for December 2024
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards - Company Wide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue (MTD)"
          value="₹4.2 Cr"
          change={12.5}
          changeLabel="vs last month"
          icon={DollarSign}
          variant="finance"
        />
        <KPICard
          title="Orders Processed"
          value="1,847"
          change={8.3}
          changeLabel="vs last month"
          icon={Package}
          variant="sales"
        />
        <KPICard
          title="Production Batches"
          value="156"
          change={-2.1}
          changeLabel="vs last month"
          icon={Factory}
          variant="manufacturing"
        />
        <KPICard
          title="Active Employees"
          value="342"
          change={3.2}
          changeLabel="vs last month"
          icon={Users}
          variant="hr"
        />
      </div>

      {/* Department KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Sales Target', value: '87%', icon: TrendingUp, color: 'bg-department-sales' },
          { label: 'Production', value: '92%', icon: Factory, color: 'bg-department-manufacturing' },
          { label: 'QC Pass Rate', value: '96%', icon: FlaskConical, color: 'bg-department-qc' },
          { label: 'Stock Health', value: '78%', icon: Warehouse, color: 'bg-department-warehouse' },
          { label: 'Cash Flow', value: '+₹1.2Cr', icon: DollarSign, color: 'bg-department-finance' },
          { label: 'Attendance', value: '94%', icon: Users, color: 'bg-department-hr' },
          { label: 'Field Coverage', value: '72%', icon: MapPin, color: 'bg-department-fieldops' },
          { label: 'R&D Pipeline', value: '8 Active', icon: Microscope, color: 'bg-department-rnd' },
        ].map((item) => (
          <div key={item.label} className="bg-card rounded-lg p-3 border border-border/50">
            <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center mb-2`}>
              <item.icon className="w-4 h-4 text-primary-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue vs Target"
          subtitle="Monthly performance (₹ in Lakhs)"
          type="bar"
          data={revenueData}
          xAxisKey="month"
          dataKeys={[
            { key: 'target', color: 'hsl(var(--muted))', name: 'Target' },
            { key: 'actual', color: 'hsl(174, 62%, 40%)', name: 'Actual' },
          ]}
        />
        <ChartCard
          title="Department Performance"
          subtitle="Current month achievement %"
          type="pie"
          data={departmentPerformance}
          height={300}
        />
      </div>

      {/* Alerts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <div className="dashboard-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Critical Alerts</h3>
            <span className="text-sm text-muted-foreground">{alerts.length} active</span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`p-1.5 rounded-lg ${
                  alert.type === 'error' ? 'bg-destructive/10 text-destructive' :
                  alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                  alert.type === 'success' ? 'bg-success/10 text-success' :
                  'bg-info/10 text-info'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {alert.department}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <DataTable
          title="Top Performing Products"
          data={topProducts}
          searchable={false}
          columns={[
            { key: 'product', label: 'Product', sortable: true },
            { key: 'revenue', label: 'Revenue', sortable: true },
            { key: 'units', label: 'Units', sortable: true },
            {
              key: 'growth',
              label: 'Growth',
              sortable: true,
              render: (value: number) => (
                <StatusBadge
                  status={value >= 0 ? 'success' : 'error'}
                  label={`${value >= 0 ? '+' : ''}${value}%`}
                />
              ),
            },
          ]}
        />
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'View Sales Report', icon: TrendingUp, path: '/sales/orders' },
            { label: 'Approve Orders', icon: Package, path: '/sales/orders' },
            { label: 'Check Inventory', icon: Warehouse, path: '/warehouse/inventory' },
            { label: 'Review Batches', icon: Factory, path: '/manufacturing/batches' },
            { label: 'Finance Summary', icon: DollarSign, path: '/finance/reports' },
            { label: 'HR Overview', icon: Users, path: '/hr/employees' },
            { label: 'Field Ops', icon: MapPin, path: '/fieldops/visits' },
            { label: 'Quality Control', icon: FlaskConical, path: '/qc/tests' },
            { label: 'Farmers', icon: Users, path: '/sales/farmers' },
            { label: 'Employees', icon: Users, path: '/hr/employees' },
            { label: 'Recruitment', icon: Users, path: '/hr/recruitment' },
            { label: 'Research', icon: Microscope, path: '/rnd/research' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-accent hover:shadow-md transition-all duration-200"
            >
              <action.icon className="w-6 h-6 text-accent" />
              <span className="text-sm text-center text-foreground font-medium">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
