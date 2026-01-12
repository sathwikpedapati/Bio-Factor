import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  dealer_id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  status: string;
}

interface Dealer {
  id: string;
  name: string;
  region?: string;
}

// Mock chart data
const revenueData = [
  { name: 'Jan', revenue: 42, expenses: 28 },
  { name: 'Feb', revenue: 48, expenses: 31 },
  { name: 'Mar', revenue: 55, expenses: 34 },
  { name: 'Apr', revenue: 51, expenses: 32 },
  { name: 'May', revenue: 62, expenses: 38 },
  { name: 'Jun', revenue: 58, expenses: 35 },
];

const expenseBreakdown = [
  { name: 'Raw Materials', value: 45, color: 'hsl(199, 89%, 48%)' },
  { name: 'Labor', value: 25, color: 'hsl(174, 62%, 40%)' },
  { name: 'Operations', value: 15, color: 'hsl(262, 52%, 50%)' },
  { name: 'Marketing', value: 10, color: 'hsl(38, 92%, 50%)' },
  { name: 'Others', value: 5, color: 'hsl(340, 82%, 52%)' },
];

export const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Fetch real data
  const { data: invoices = [] } = useSupabaseQuery<Invoice>('invoices', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 100
  });
  
  const { data: payments = [] } = useSupabaseQuery<Payment>('payments', {
    limit: 100
  });

  const { data: dealers = [] } = useSupabaseQuery<Dealer>('dealers', {
    limit: 100
  });

  // Calculate statistics
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'unpaid').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const outstanding = totalRevenue - totalPaid;

  // Outstanding receivables
  const outstandingReceivables = useMemo(() => {
    return invoices
      .filter(inv => inv.status !== 'paid')
      .slice(0, 5)
      .map((inv, idx) => {
        const dealer = dealers.find(d => d.id === inv.dealer_id);
        const days = Math.floor(Math.random() * 90);
        let aging = '0-30 days';
        let status: 'current' | 'overdue' | 'critical' = 'current';
        if (days > 60) {
          aging = '61-90 days';
          status = 'critical';
        } else if (days > 30) {
          aging = '31-60 days';
          status = 'overdue';
        }
        return {
          dealer: dealer?.name || 'Unknown',
          amount: `₹${(inv.amount / 100000).toFixed(1)}L`,
          aging,
          region: dealer?.region || 'N/A',
          status,
        };
      });
  }, [invoices, dealers]);

  // Recent invoices
  const recentInvoices = useMemo(() => {
    return invoices.slice(0, 5).map(inv => {
      const dealer = dealers.find(d => d.id === inv.dealer_id);
      return {
        id: inv.invoice_number,
        dealer: dealer?.name || 'Unknown',
        amount: `₹${(inv.amount / 100000).toFixed(1)}L`,
        date: new Date(inv.created_at).toLocaleDateString(),
        status: inv.status,
      };
    });
  }, [invoices, dealers]);

  // Region profitability mock (based on dealers)
  const regionProfitability = useMemo(() => {
    const regions = ['North', 'South', 'East', 'West'];
    return regions.map(region => {
      const regionInvoices = invoices.filter(inv => {
        const dealer = dealers.find(d => d.id === inv.dealer_id);
        return dealer?.region === region;
      });
      const regionRevenue = regionInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const regionExpenses = Math.floor(regionRevenue * 0.6);
      const profit = regionRevenue - regionExpenses;
      const margin = regionRevenue > 0 ? ((profit / regionRevenue) * 100).toFixed(1) : '0';
      return {
        region,
        revenue: `₹${(regionRevenue / 10000000).toFixed(2)}Cr`,
        expenses: `₹${(regionExpenses / 100000).toFixed(0)}L`,
        profit: `₹${(profit / 100000).toFixed(0)}L`,
        margin: `${margin}%`,
      };
    });
  }, [invoices, dealers]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Finance & Accounts Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track cash flow, receivables, invoices, and financial performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="month">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={() => navigate('/finance/reports')}
            className="px-4 py-2 rounded-lg bg-department-finance text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Net Cash Flow"
          value={`+₹${(totalPaid / 10000000).toFixed(2)} Cr`}
          change={18.5}
          changeLabel="vs last month"
          icon={TrendingUp}
          variant="finance"
        />
        <KPICard
          title="Outstanding Receivables"
          value={`₹${(outstanding / 100000).toFixed(1)}L`}
          change={-8.2}
          changeLabel="reduced"
          icon={CreditCard}
          variant="finance"
        />
        <KPICard
          title="Revenue (MTD)"
          value={`₹${(totalRevenue / 10000000).toFixed(2)} Cr`}
          change={12.3}
          changeLabel="vs target"
          icon={ArrowUpRight}
          variant="finance"
        />
        <KPICard
          title="Expenses (MTD)"
          value={`₹${(totalRevenue * 0.5 / 10000000).toFixed(2)} Cr`}
          change={5.1}
          changeLabel="vs budget"
          icon={ArrowDownRight}
          variant="finance"
        />
      </div>

      {/* Cash Flow Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <TrendingUp className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalInvoices}</p>
          <p className="text-sm text-muted-foreground">Total Invoices</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <TrendingDown className="w-5 h-5 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{overdueInvoices}</p>
          <p className="text-sm text-muted-foreground">Overdue Invoices</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <FileText className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingInvoices}</p>
          <p className="text-sm text-muted-foreground">Pending Invoices</p>
        </div>
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <PieChart className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">{paidInvoices}</p>
          <p className="text-sm text-muted-foreground">Paid Invoices</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue vs Expenses"
          subtitle="Monthly trend (₹ in Lakhs)"
          type="area"
          data={revenueData}
          xAxisKey="name"
          dataKeys={[
            { key: 'revenue', color: 'hsl(174, 62%, 40%)', name: 'Revenue' },
            { key: 'expenses', color: 'hsl(0, 72%, 51%)', name: 'Expenses' },
          ]}
        />
        <ChartCard
          title="Expense Breakdown"
          subtitle="Distribution by category"
          type="pie"
          data={expenseBreakdown}
          height={300}
        />
      </div>

      {/* Outstanding Receivables Table */}
      <DataTable
        title="Outstanding Receivables Aging"
        data={outstandingReceivables}
        columns={[
          { key: 'dealer', label: 'Dealer', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true },
          { key: 'aging', label: 'Aging', sortable: true },
          { key: 'region', label: 'Region', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (value: string) => {
              const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
                current: 'success',
                overdue: 'warning',
                critical: 'error',
              };
              return (
                <StatusBadge
                  status={statusMap[value] || 'default'}
                  label={value.charAt(0).toUpperCase() + value.slice(1)}
                  dot
                />
              );
            },
          },
        ]}
      />

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <DataTable
          title="Recent Invoices"
          data={recentInvoices}
          columns={[
            { key: 'id', label: 'Invoice ID', sortable: true },
            { key: 'dealer', label: 'Dealer', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
            { key: 'date', label: 'Date', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => {
                const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
                  paid: 'success',
                  pending: 'warning',
                  unpaid: 'warning',
                  overdue: 'error',
                };
                return (
                  <StatusBadge
                    status={statusMap[value] || 'default'}
                    label={value.charAt(0).toUpperCase() + value.slice(1)}
                    dot
                  />
                );
              },
            },
          ]}
        />

        {/* Region Profitability */}
        <DataTable
          title="Regional Profitability"
          data={regionProfitability}
          columns={[
            { key: 'region', label: 'Region', sortable: true },
            { key: 'revenue', label: 'Revenue', sortable: true },
            { key: 'expenses', label: 'Expenses', sortable: true },
            { key: 'profit', label: 'Profit', sortable: true },
            {
              key: 'margin',
              label: 'Margin',
              render: (value: string) => (
                <span className="font-semibold text-success">{value}</span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FinanceDashboard;