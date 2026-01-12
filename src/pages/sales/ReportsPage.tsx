import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import SalesFunnel from '@/components/dashboard/SalesFunnel';
import DistributorHeatmap from '@/components/dashboard/DistributorHeatmap';
import CampaignTracker from '@/components/dashboard/CampaignTracker';
import FeedbackPanel from '@/components/dashboard/FeedbackPanel';
import useSalesDashboardData from '@/hooks/useSalesDashboardData';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { Download, Filter, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export';

interface Order {
  id: string;
  order_number: string;
  dealer_id: string;
  order_date: string;
  status: string;
  net_amount: number;
}

interface Dealer {
  id: string;
  name: string;
  business_name: string | null;
  city: string | null;
  state: string | null;
}

export default function SalesReportsPage() {
  const [dateRange, setDateRange] = useState('this_month');
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data: orders = [] } = useSupabaseQuery<Order>('orders');
  const { data: dealers = [] } = useSupabaseQuery<Dealer>('dealers');

  const { funnel, states, campaigns, feedback } = useSalesDashboardData();

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    const now = new Date();
    switch (value) {
      case 'this_month':
        setFromDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setToDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        setFromDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setToDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
      case 'last_3_months':
        setFromDate(format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'));
        setToDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!o.order_date) return false;
    const orderDate = new Date(o.order_date);
    return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.net_amount || 0), 0);
  const totalOrders = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Monthly sales data for chart
  const monthlyData = [
    { month: 'Jan', revenue: 4500000, orders: 145, target: 5000000 },
    { month: 'Feb', revenue: 5200000, orders: 168, target: 5500000 },
    { month: 'Mar', revenue: 6100000, orders: 192, target: 6000000 },
    { month: 'Apr', revenue: 5800000, orders: 178, target: 6200000 },
    { month: 'May', revenue: 7200000, orders: 215, target: 7000000 },
    { month: 'Jun', revenue: 6800000, orders: 198, target: 6800000 },
  ];

  // Top dealers
  const dealerSales = dealers.map(d => {
    const dealerOrders = filteredOrders.filter(o => o.dealer_id === d.id);
    return {
      ...d,
      orderCount: dealerOrders.length,
      totalSales: dealerOrders.reduce((sum, o) => sum + (o.net_amount || 0), 0),
    };
  }).sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);

  // Recent orders (most recent first)
  const recentOrdersBase = filteredOrders
    .slice()
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .map(o => ({
      ...o,
      dealer_name: dealers.find(d => d.id === o.dealer_id)?.name || 'Unknown',
    }));

  // Local UI state for Top Dealers and Recent Orders cards
  const [topMinSales, setTopMinSales] = useState<number | null>(null);
  const [showTopFilters, setShowTopFilters] = useState(false);
  const [topSearch, setTopSearch] = useState('');

  const [recentStatusFilter, setRecentStatusFilter] = useState<'all' | string>('all');
  const [showRecentFilters, setShowRecentFilters] = useState(false);
  const [recentSearch, setRecentSearch] = useState('');

  // Filters applied
  const dealerSalesFiltered = dealerSales.filter(d => (topMinSales ? d.totalSales >= topMinSales : true)).filter(d => (topSearch ? (d.name || '').toLowerCase().includes(topSearch.toLowerCase()) : true));

  const recentOrders = recentOrdersBase.filter(o => (recentStatusFilter === 'all' ? true : o.status === recentStatusFilter)).filter(o => (recentSearch ? (o.order_number || '').toLowerCase().includes(recentSearch.toLowerCase()) || (o.dealer_name || '').toLowerCase().includes(recentSearch.toLowerCase()) : true));


  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const columns = [
      { key: 'order_number' as const, label: 'Order #' },
      { key: 'order_date' as const, label: 'Date' },
      { key: 'status' as const, label: 'Status' },
      { key: 'net_amount' as const, label: 'Amount' },
    ];
    if (format === 'csv') exportToCSV(filteredOrders, 'sales_report', columns);
    else if (format === 'excel') exportToExcel(filteredOrders, 'sales_report', columns);
    else exportToPDF(filteredOrders, 'sales_report', columns, 'Sales Report');
  };

  // Component: order details (uses supabase to fetch order items)
  function OrderDetails({ orderId }: { orderId: string }) {
    const { data: items = [] } = useSupabaseQuery<any>('order_items', { filters: { order_id: orderId }, orderBy: { column: 'id', ascending: false } });
    const { data: products = [] } = useSupabaseQuery<any>('products', { select: 'id,name' });

    const productMap = Object.fromEntries((products || []).map((p: any) => [p.id, p.name]));

    if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">No items found for this order.</p>;

    return (
      <div>
        <h4 className="text-sm font-medium mb-2">Items</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any) => (
                <tr key={it.id} className="border-b border-border/50">
                  <td className="px-3 py-2">{productMap[it.product_id] || it.product_id}</td>
                  <td className="px-3 py-2">{it.quantity}</td>
                  <td className="px-3 py-2">₹{it.unit_price?.toLocaleString()}</td>
                  <td className="px-3 py-2">₹{it.total_price?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Sales Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze sales performance and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === 'custom' && (
            <>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-36" />
              <span className="text-muted-foreground">to</span>
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-36" />
            </>
          )}
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(2)}L</p>
              </div>
              <DollarSign className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered Orders</p>
                <p className="text-2xl font-bold">{deliveredOrders}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <Users className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top area: Top Dealers & Recent Orders as separate full-width cards */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Top Dealers by Sales</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Top 10 dealers by sales in the selected date range</p>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search dealers..." value={topSearch} onChange={(e) => setTopSearch(e.target.value)} className="w-48" />
              <Button variant="ghost" onClick={() => exportToCSV(dealerSalesFiltered, 'top_dealers', [
                { key: 'name' as const, label: 'Dealer' },
                { key: 'business_name' as const, label: 'Business' },
                { key: 'city' as const, label: 'City' },
                { key: 'orderCount' as const, label: 'Orders' },
                { key: 'totalSales' as const, label: 'Total Sales' },
              ])}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Button variant="outline" onClick={() => setShowTopFilters(s => !s)}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showTopFilters && (
              <div className="flex items-center gap-3 mb-4">
                <Input type="number" placeholder="Min total sales" value={topMinSales ?? ''} onChange={(e) => setTopMinSales(Number(e.target.value) || null)} className="w-48" />
                <Button onClick={() => setTopMinSales(null)}>Clear</Button>
              </div>
            )}

            <DataTable
              data={dealerSalesFiltered}
              expandable={true}
              rowSize="lg"
              renderExpanded={(d) => {
                const ordersForDealer = filteredOrders
                  .filter(o => o.dealer_id === d.id)
                  .slice()
                  .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
                  .map(o => ({ ...o, dealer_name: d.name }));
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{d.name} {d.business_name ? `(${d.business_name})` : ''}</p>
                      <p className="text-sm text-muted-foreground">{d.city}, {d.state}</p>
                      <p className="text-sm mt-2">Orders: {d.orderCount}</p>
                      <p className="text-sm">Total Sales: ₹{d.totalSales.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Recent Orders</h4>
                      <DataTable
                        data={ordersForDealer}
                        searchable={false}
                        showPagination={true}
                        initialPageSize={5}
                        expandable={true}
                        renderExpanded={(o) => <OrderDetails orderId={o.id} />}
                        columns={[
                          { key: 'order_number', label: 'Order #' },
                          { key: 'order_date', label: 'Date', render: (v) => format(new Date(v), 'yyyy-MM-dd') },
                          { key: 'status', label: 'Status' },
                          { key: 'net_amount', label: 'Amount', render: (v) => `₹${Number(v).toLocaleString()}` },
                        ]}
                      />
                    </div>
                  </div>
                );
              }}
              columns={[
                { key: 'name', label: 'Dealer Name', sortable: true },
                { key: 'business_name', label: 'Business', sortable: true, render: (v) => v || '-' },
                { key: 'city', label: 'City', sortable: true },
                { key: 'orderCount', label: 'Orders', sortable: true },
                {
                  key: 'totalSales',
                  label: 'Total Sales',
                  sortable: true,
                  render: (v) => `₹${(v / 1000).toFixed(1)}K`,
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Most recent orders in the selected date range</p>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search orders..." value={recentSearch} onChange={(e) => setRecentSearch(e.target.value)} className="w-48" />
              <Select value={recentStatusFilter} onValueChange={(v: any) => setRecentStatusFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={() => exportToCSV(recentOrders, 'recent_orders', [
                { key: 'order_number' as const, label: 'Order #' },
                { key: 'dealer_name' as const, label: 'Dealer' },
                { key: 'order_date' as const, label: 'Date' },
                { key: 'status' as const, label: 'Status' },
                { key: 'net_amount' as const, label: 'Amount' },
              ])}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Button variant="outline" onClick={() => setShowRecentFilters(s => !s)}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showRecentFilters && (
              <div className="flex items-center gap-3 mb-4">
                <p className="text-sm text-muted-foreground mr-2">Filter by status:</p>
                <Select value={recentStatusFilter} onValueChange={(v: any) => setRecentStatusFilter(v)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => { setRecentStatusFilter('all'); setRecentSearch(''); }}>Clear</Button>
              </div>
            )}

            <DataTable
              data={recentOrders}
              enableLoadMore={true}
              initialPageSize={10}
              expandable={true}
              rowSize="lg"
              renderExpanded={(o) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Order {o.order_number}</p>
                    <p className="text-sm text-muted-foreground">Dealer: {o.dealer_name}</p>
                    <p className="text-sm">Date: {format(new Date(o.order_date), 'yyyy-MM-dd')}</p>
                    <p className="text-sm">Amount: ₹{Number(o.net_amount).toLocaleString()}</p>
                    <p className="text-sm">Status: {o.status}</p>
                  </div>
                  <div>
                    <OrderDetails orderId={o.id} />
                  </div>
                </div>
              )}
              columns={[
                { key: 'order_number', label: 'Order #' },
                { key: 'dealer_name', label: 'Dealer' },
                { key: 'order_date', label: 'Date', render: (v) => format(new Date(v), 'yyyy-MM-dd') },
                {
                  key: 'status',
                  label: 'Status',
                  render: (v) => {
                    const mapping: Record<string, {status: any; label: string}> = {
                      delivered: { status: 'success', label: 'Delivered' },
                      pending: { status: 'pending', label: 'Pending' },
                      cancelled: { status: 'error', label: 'Cancelled' },
                      processing: { status: 'info', label: 'Processing' },
                    };
                    const badge = mapping[v] || { status: 'default', label: v || 'Unknown' };
                    return <StatusBadge status={badge.status} label={badge.label} />;
                  },
                },
                { key: 'net_amount', label: 'Amount', render: (v) => `₹${Number(v).toLocaleString()}` },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Revenue Trend"
          subtitle="Revenue in Lakhs"
          type="area"
          data={monthlyData}
          xAxisKey="month"
          dataKeys={[{ key: 'revenue', color: 'hsl(var(--success))', name: 'Revenue' }]}
        />
        <ChartCard
          title="Order Volume"
          subtitle="Number of orders per month"
          type="bar"
          data={monthlyData}
          xAxisKey="month"
          dataKeys={[{ key: 'orders', color: 'hsl(var(--info))', name: 'Orders' }]}
        />
      </div>

      {/* Sales Funnel, Map, Targets, Campaigns, Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Sales Funnel */}
          {/* Using hook data */}
          <SalesFunnel data={useSalesDashboardData().funnel} />
        </div>
        <div className="lg:col-span-1">
          {/* Distributor heatmap */}
          <DistributorHeatmap data={useSalesDashboardData().states} />
        </div>
        <div className="lg:col-span-1">
          {/* Target vs Achievement */}
          <ChartCard
            title="Target vs Achievement"
            subtitle="Monthly targets vs actuals"
            type="bar"
            data={monthlyData}
            xAxisKey="month"
            dataKeys={[{ key: 'target', color: 'hsl(var(--accent))', name: 'Target' }, { key: 'revenue', color: 'hsl(var(--success))', name: 'Achievement' }]}
            height={260}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CampaignTracker data={campaigns} />

        <FeedbackPanel data={feedback} />
      </div>


    </div>
  );
}
