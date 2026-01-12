import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import {
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
} from 'lucide-react';
import SalesFunnel from '@/components/dashboard/SalesFunnel';
import DistributorHeatmap from '@/components/dashboard/DistributorHeatmap';
import CampaignTracker from '@/components/dashboard/CampaignTracker';
import FeedbackPanel from '@/components/dashboard/FeedbackPanel';
import useSalesDashboardData from '@/hooks/useSalesDashboardData';

interface Order {
  id: string;
  order_number: string;
  dealer_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

interface Dealer {
  id: string;
  name: string;
  business_name?: string;
  region?: string;
}

interface Farmer {
  id: string;
  name: string;
  region: string;
}

// Mock data for charts
const salesTrendData = [
  { name: 'Week 1', actual: 125, target: 120 },
  { name: 'Week 2', actual: 148, target: 130 },
  { name: 'Week 3', actual: 132, target: 140 },
  { name: 'Week 4', actual: 165, target: 150 },
];

const regionData = [
  { name: 'North', value: 35, color: 'hsl(199, 89%, 48%)' },
  { name: 'South', value: 28, color: 'hsl(174, 62%, 40%)' },
  { name: 'East', value: 22, color: 'hsl(262, 52%, 50%)' },
  { name: 'West', value: 15, color: 'hsl(38, 92%, 50%)' },
];

const productPerformance = [
  { name: 'Bio-Fertilizer', sales: 450, revenue: 125 },
  { name: 'Pesticide', sales: 380, revenue: 98 },
  { name: 'Growth Enhancer', sales: 290, revenue: 72 },
  { name: 'Soil Conditioner', sales: 210, revenue: 54 },
  { name: 'Micro Nutrients', sales: 180, revenue: 41 },
];

export const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  // Fetch real data from Supabase
  const { data: orders = [] } = useSupabaseQuery<Order>('orders', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 100
  });
  
  const { data: dealers = [] } = useSupabaseQuery<Dealer>('dealers', {
    limit: 100
  });

  // Calculate statistics from real data
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  // Filter dealers by region
  const filteredDealers = useMemo(() => {
    if (selectedRegion === 'all') return dealers;
    return dealers.filter(d => d.region === selectedRegion);
  }, [dealers, selectedRegion]);

  const activeDeals = filteredDealers.filter(d => d.region).length;
  const pendingOrders = useMemo(() => {
    const dealerIds = filteredDealers.map(d => d.id);
    return orders.filter(o => o.status === 'pending' && dealerIds.includes(o.dealer_id)).length;
  }, [orders, filteredDealers]);

  // Calculate filtered revenue for regional distribution
  const filteredRevenue = useMemo(() => {
    const dealerIds = filteredDealers.map(d => d.id);
    return orders
      .filter(o => dealerIds.includes(o.dealer_id))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  }, [orders, filteredDealers]);

  // Compute dynamic region data based on filtered dealers
  const dynamicRegionData = useMemo(() => {
    if (selectedRegion !== 'all') {
      // When a specific region is selected, show its share
      return [{
        name: selectedRegion,
        value: 100,
        color: 'hsl(199, 89%, 48%)'
      }];
    }
    
    // Calculate actual distribution from filtered dealers
    const regionCounts: Record<string, number> = {};
    filteredDealers.forEach(dealer => {
      const region = dealer.region || 'N/A';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    const colors = {
      'North': 'hsl(199, 89%, 48%)',
      'South': 'hsl(174, 62%, 40%)',
      'East': 'hsl(262, 52%, 50%)',
      'West': 'hsl(38, 92%, 50%)',
      'N/A': 'hsl(0, 0%, 50%)',
    };

    const total = Object.values(regionCounts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(regionCounts).map(([region, count]) => ({
      name: region,
      value: Math.round((count / total) * 100),
      color: colors[region as keyof typeof colors] || 'hsl(0, 0%, 50%)',
    })).sort((a, b) => b.value - a.value);
  }, [selectedRegion, filteredDealers]);
  // Recent orders for table
  const recentOrders = useMemo(() => {
    const dealerIds = filteredDealers.map(d => d.id);
    return orders
      .filter(o => dealerIds.includes(o.dealer_id))
      .slice(0, 5)
      .map(order => ({
      id: order.order_number,
      dealer: dealers.find(d => d.id === order.dealer_id)?.name || 'Unknown',
      amount: `₹${(order.total_amount / 100000).toFixed(1)}L`,
      status: order.status,
    }));

  }, [orders, dealers, filteredDealers]);

  // Sales & Marketing specific mock data
  const { funnel, states, campaigns, feedback } = useSalesDashboardData();
  // Dealer performance data
  const dealerPerformance = filteredDealers.slice(0, 6).map((dealer, idx) => ({
    name: dealer.name || 'Unknown',
    region: dealer.region || 'N/A',
    orders: orders.filter(o => o.dealer_id === dealer.id).length,
    value: `₹${(orders
      .filter(o => o.dealer_id === dealer.id)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0) / 100000).toFixed(1)}L`,
    status: idx % 3 === 0 ? 'active' : idx % 3 === 1 ? 'warning' : 'inactive',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Sales & Marketing Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track sales performance, dealer activities, and marketing campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
          <button 
            onClick={() => navigate('/sales/orders')}
            className="px-4 py-2 rounded-lg bg-department-sales text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="MTD Sales"
          value={`₹${(totalRevenue / 10000000).toFixed(2)} Cr`}
          change={15.3}
          changeLabel="vs target"
          icon={DollarSign}
          variant="sales"
        />
        <KPICard
          title="Target Achievement"
          value="87%"
          change={5.2}
          changeLabel="vs last month"
          icon={Target}
          variant="sales"
        />
        <KPICard
          title="Order Volume"
          value={totalOrders.toString()}
          change={12.8}
          changeLabel="vs last month"
          icon={ShoppingCart}
          variant="sales"
        />
        <KPICard
          title="Avg Ticket Size"
          value={`₹${(totalRevenue / Math.max(totalOrders, 1) / 1000).toFixed(1)}K`}
          change={-2.4}
          changeLabel="vs last month"
          icon={TrendingUp}
          variant="sales"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-department-sales" />
            <span className="text-xs text-success font-medium">{selectedRegion !== 'all' ? 'Filtered' : `+${activeDeals}`}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{filteredDealers.length}</p>
          <p className="text-sm text-muted-foreground">Active Dealers</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-department-sales" />
            <span className="text-xs text-warning font-medium">{pendingOrders} pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
          <p className="text-sm text-muted-foreground">Pending Orders</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 text-department-sales" />
            <span className="text-xs text-muted-foreground">4 zones</span>
          </div>
          <p className="text-2xl font-bold text-foreground">4</p>
          <p className="text-sm text-muted-foreground">Active Regions</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-destructive" />
            <span className="text-xs text-destructive font-medium">Alert</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₹42L</p>
          <p className="text-sm text-muted-foreground">Outstanding</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Weekly Sales Trend"
          subtitle="Actual vs Target (₹ in Lakhs)"
          type="area"
          data={salesTrendData}
          xAxisKey="name"
          dataKeys={[
            { key: 'target', color: 'hsl(var(--muted-foreground))', name: 'Target' },
            { key: 'actual', color: 'hsl(199, 89%, 48%)', name: 'Actual' },
          ]}
        />
        <ChartCard
          title="Regional Distribution"
          subtitle="Sales by region %"
          type="pie"
          data={dynamicRegionData}
          height={300}
        />
      </div>

      {/* Product Performance */}
      <ChartCard
        title="Product Category Performance"
        subtitle="Sales volume and revenue by product"
        type="bar"
        data={productPerformance}
        xAxisKey="name"
        dataKeys={[
          { key: 'sales', color: 'hsl(199, 89%, 48%)', name: 'Units Sold' },
          { key: 'revenue', color: 'hsl(174, 62%, 40%)', name: 'Revenue (₹L)' },
        ]}
        height={280}
      />

      {/* Sales / Marketing Panels: Funnel, Map, Campaigns, Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div>
          <SalesFunnel data={funnel} />
        </div>
        <div>
          <DistributorHeatmap data={states} />
        </div>
        <div>
          <CampaignTracker data={campaigns} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <FeedbackPanel data={feedback} />
        <ChartCard
          title="Target vs Achievement"
          subtitle="Weekly targets vs actuals"
          type="bar"
          data={salesTrendData}
          xAxisKey="name"
          dataKeys={[{ key: 'target', color: 'hsl(var(--muted-foreground))', name: 'Target' }, { key: 'actual', color: 'hsl(199, 89%, 48%)', name: 'Actual' }]}
          height={260}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        {/* Dealer Performance */}
        <DataTable
          title="Top Dealers"
          data={dealerPerformance}
          columns={[
            { key: 'name', label: 'Dealer', sortable: true },
            { key: 'region', label: 'Region', sortable: true },
            { key: 'orders', label: 'Orders', sortable: true },
            { key: 'value', label: 'Value', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => (
                <StatusBadge
                  status={value === 'active' ? 'success' : value === 'warning' ? 'warning' : 'error'}
                  label={value.charAt(0).toUpperCase() + value.slice(1)}
                  dot
                />
              ),
            },
          ]}
        />

        {/* Recent Orders */}
        <DataTable
          title="Recent Orders"
          data={recentOrders}
          columns={[
            { key: 'id', label: 'Order ID', sortable: true },
            { key: 'dealer', label: 'Dealer', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => {
                const statusMap: Record<string, 'success' | 'info' | 'warning' | 'pending'> = {
                  delivered: 'success',
                  shipped: 'info',
                  processing: 'warning',
                  pending: 'pending',
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
      </div>
    </div>
  );
};

export default SalesDashboard;