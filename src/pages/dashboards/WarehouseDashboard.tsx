import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  Warehouse,
  Package,
  TrendingUp,
  TrendingDown,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

// Mock data
const stockMovementData = [
  { name: 'Mon', inward: 450, outward: 380 },
  { name: 'Tue', inward: 520, outward: 420 },
  { name: 'Wed', inward: 380, outward: 510 },
  { name: 'Thu', inward: 610, outward: 450 },
  { name: 'Fri', inward: 480, outward: 560 },
  { name: 'Sat', inward: 320, outward: 290 },
];

const warehouseCapacity = [
  { name: 'Main Warehouse', value: 72, color: 'hsl(199, 89%, 48%)' },
  { name: 'Cold Storage', value: 45, color: 'hsl(174, 62%, 40%)' },
  { name: 'Raw Materials', value: 85, color: 'hsl(38, 92%, 50%)' },
  { name: 'Finished Goods', value: 58, color: 'hsl(262, 52%, 50%)' },
];

const lowStockItems = [
  { sku: 'SKU-4521', product: 'Bio-Fertilizer Pro', current: 150, minimum: 500, status: 'critical' },
  { sku: 'SKU-3892', product: 'Growth Enhancer Plus', current: 280, minimum: 400, status: 'low' },
  { sku: 'SKU-2741', product: 'Micro Nutrients Mix', current: 320, minimum: 450, status: 'low' },
  { sku: 'SKU-1956', product: 'Soil Conditioner', current: 180, minimum: 350, status: 'critical' },
];

const pendingDispatch = [
  { orderId: 'ORD-2024-1847', dealer: 'Agri Solutions Ltd', items: 12, value: '₹2.4L', eta: '05 Dec', status: 'ready' },
  { orderId: 'ORD-2024-1846', dealer: 'Green Farms Corp', items: 8, value: '₹1.8L', eta: '05 Dec', status: 'packing' },
  { orderId: 'ORD-2024-1845', dealer: 'Harvest King', items: 15, value: '₹3.2L', eta: '06 Dec', status: 'picking' },
  { orderId: 'ORD-2024-1844', dealer: 'FarmTech India', items: 6, value: '₹1.5L', eta: '06 Dec', status: 'pending' },
];

const recentActivity = [
  { id: 'IN-2024-892', type: 'inward', product: 'Bio-Fertilizer Pro', qty: '2000 kg', source: 'Manufacturing', time: '2 hrs ago' },
  { id: 'OUT-2024-456', type: 'outward', product: 'Organic Pesticide X', qty: '500 L', dest: 'Agri Solutions', time: '3 hrs ago' },
  { id: 'TR-2024-123', type: 'transfer', product: 'Growth Enhancer Plus', qty: '800 kg', dest: 'Cold Storage', time: '5 hrs ago' },
  { id: 'IN-2024-891', type: 'inward', product: 'Soil Conditioner', qty: '1500 kg', source: 'Manufacturing', time: '6 hrs ago' },
];

export const WarehouseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterMap: Record<string, string> = {
    main: 'main',
    cold_storage: 'cold',
    raw_materials: 'raw',
  };

  const filterKeyword = selectedFilter === 'all' ? '' : filterMap[selectedFilter] || selectedFilter;

  const filteredPendingDispatch = filterKeyword === ''
    ? pendingDispatch
    : pendingDispatch.filter(item =>
        Object.values(item).some(v => String(v).toLowerCase().includes(filterKeyword))
      );

  const filteredRecentActivity = filterKeyword === ''
    ? recentActivity
    : recentActivity.filter(item =>
        Object.values(item).some(v => String(v).toLowerCase().includes(filterKeyword))
      );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Warehouse & Logistics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor inventory levels, stock movements, and dispatch status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Warehouses</option>
            <option value="main">Main Warehouse</option>
            <option value="cold_storage">Cold Storage</option>
            <option value="raw_materials">Raw Materials</option>
          </select>
          <button 
            onClick={() => navigate('/warehouse/inventory')}
            className="px-4 py-2 rounded-lg bg-department-warehouse text-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Inward
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Stock Value"
          value="₹8.5 Cr"
          change={5.2}
          changeLabel="vs last month"
          icon={Warehouse}
          variant="warehouse"
        />
        <KPICard
          title="SKUs in Stock"
          value="1,247"
          change={3.8}
          changeLabel="new items"
          icon={Package}
          variant="warehouse"
        />
        <KPICard
          title="Inward (Today)"
          value="2,850 units"
          change={12.5}
          changeLabel="vs avg"
          icon={ArrowDownLeft}
          variant="warehouse"
        />
        <KPICard
          title="Outward (Today)"
          value="2,110 units"
          change={8.3}
          changeLabel="vs avg"
          icon={ArrowUpRight}
          variant="warehouse"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">4</p>
          <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <Package className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">12</p>
          <p className="text-sm text-muted-foreground">Expiring Soon</p>
        </div>
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <Truck className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">28</p>
          <p className="text-sm text-muted-foreground">Pending Dispatch</p>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <TrendingUp className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">94%</p>
          <p className="text-sm text-muted-foreground">Order Fulfillment</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Stock Movement"
          subtitle="Daily inward vs outward (units)"
          type="area"
          data={stockMovementData}
          xAxisKey="name"
          dataKeys={[
            { key: 'inward', color: 'hsl(142, 70%, 40%)', name: 'Inward' },
            { key: 'outward', color: 'hsl(38, 92%, 50%)', name: 'Outward' },
          ]}
        />
        <ChartCard
          title="Warehouse Capacity"
          subtitle="Current utilization %"
          type="pie"
          data={warehouseCapacity}
          height={300}
        />
      </div>

      {/* Low Stock Alert Table */}
      <DataTable
        title="Low Stock Alerts"
        data={lowStockItems}
        columns={[
          { key: 'sku', label: 'SKU', sortable: true },
          { key: 'product', label: 'Product', sortable: true },
          { key: 'current', label: 'Current Stock', sortable: true },
          { key: 'minimum', label: 'Min Required', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (value: string) => (
              <StatusBadge
                status={value === 'critical' ? 'error' : 'warning'}
                label={value.charAt(0).toUpperCase() + value.slice(1)}
                dot
              />
            ),
          },
        ]}
      />

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Dispatch */}
        <DataTable
          title="Pending Dispatch"
          data={filteredPendingDispatch}
          columns={[
            { key: 'orderId', label: 'Order ID', sortable: true },
            { key: 'dealer', label: 'Dealer', sortable: true },
            { key: 'items', label: 'Items', sortable: true },
            { key: 'value', label: 'Value', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => {
                const statusMap: Record<string, 'success' | 'info' | 'warning' | 'pending'> = {
                  ready: 'success',
                  packing: 'info',
                  picking: 'warning',
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

        {/* Recent Activity */}
        <DataTable
          title="Recent Activity"
          data={filteredRecentActivity}
          columns={[
            { key: 'id', label: 'ID', sortable: true },
            {
              key: 'type',
              label: 'Type',
              render: (value: string) => {
                const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
                  inward: { icon: ArrowDownLeft, color: 'text-success' },
                  outward: { icon: ArrowUpRight, color: 'text-warning' },
                  transfer: { icon: Truck, color: 'text-info' },
                };
                const config = typeConfig[value];
                return (
                  <div className="flex items-center gap-2">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <span className="capitalize">{value}</span>
                  </div>
                );
              },
            },
            { key: 'product', label: 'Product', sortable: true },
            { key: 'qty', label: 'Qty', sortable: true },
            { key: 'time', label: 'Time', sortable: true },
          ]}
        />
      </div>
    </div>
  );
};

export default WarehouseDashboard;
