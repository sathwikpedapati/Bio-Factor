import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  Factory,
  Layers,
  Clock,
  AlertTriangle,
  Wrench,
  CheckCircle,
} from 'lucide-react';

// Mock data
const productionData = [
  { name: 'Mon', planned: 120, actual: 115 },
  { name: 'Tue', planned: 130, actual: 128 },
  { name: 'Wed', planned: 125, actual: 132 },
  { name: 'Thu', planned: 140, actual: 135 },
  { name: 'Fri', planned: 135, actual: 140 },
  { name: 'Sat', planned: 100, actual: 98 },
];

const batchStatusData = [
  { name: 'Completed', value: 45, color: 'hsl(142, 70%, 40%)' },
  { name: 'In Progress', value: 28, color: 'hsl(199, 89%, 48%)' },
  { name: 'QC Pending', value: 15, color: 'hsl(38, 92%, 50%)' },
  { name: 'On Hold', value: 12, color: 'hsl(0, 72%, 51%)' },
];

const batches = [
  { id: 'BT-2024-156', product: 'Bio-Fertilizer Pro', qty: '5000 kg', started: '02 Dec', eta: '05 Dec', status: 'in_progress' },
  { id: 'BT-2024-155', product: 'Organic Pesticide X', qty: '3000 L', started: '01 Dec', eta: '04 Dec', status: 'qc_pending' },
  { id: 'BT-2024-154', product: 'Growth Enhancer Plus', qty: '2500 kg', started: '30 Nov', eta: '03 Dec', status: 'completed' },
  { id: 'BT-2024-153', product: 'Soil Conditioner', qty: '4000 kg', started: '29 Nov', eta: '02 Dec', status: 'completed' },
  { id: 'BT-2024-152', product: 'Micro Nutrients Mix', qty: '1500 kg', started: '28 Nov', eta: '01 Dec', status: 'on_hold' },
];

const machines = [
  { id: 'M-001', name: 'Mixer Unit A', status: 'running', efficiency: 94, lastMaintenance: '15 Nov' },
  { id: 'M-002', name: 'Granulator B', status: 'running', efficiency: 88, lastMaintenance: '20 Nov' },
  { id: 'M-003', name: 'Dryer Unit C', status: 'maintenance', efficiency: 0, lastMaintenance: '05 Dec' },
  { id: 'M-004', name: 'Packaging Line D', status: 'running', efficiency: 92, lastMaintenance: '25 Nov' },
  { id: 'M-005', name: 'Quality Tester E', status: 'idle', efficiency: 0, lastMaintenance: '10 Nov' },
];

export const ManufacturingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredBatches = selectedFilter === 'all' ? batches : batches.filter(b => b.status === selectedFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Manufacturing Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor production plans, batch tracking, and machine health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Batches</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="qc_pending">QC Pending</option>
            <option value="on_hold">On Hold</option>
          </select>
          <button 
            onClick={() => navigate('/manufacturing/batches')}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
          >
            View Schedule
          </button>
          <button 
            onClick={() => navigate('/manufacturing/batches')}
            className="px-4 py-2 rounded-lg bg-department-manufacturing text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Batch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Production Today"
          value="748 units"
          change={8.2}
          changeLabel="vs plan"
          icon={Factory}
          variant="manufacturing"
        />
        <KPICard
          title="Active Batches"
          value="12"
          change={0}
          changeLabel="on track"
          icon={Layers}
          variant="manufacturing"
        />
        <KPICard
          title="Machine Efficiency"
          value="91.5%"
          change={2.3}
          changeLabel="vs last week"
          icon={Wrench}
          variant="manufacturing"
        />
        <KPICard
          title="QC Pending"
          value="5"
          change={-15}
          changeLabel="vs yesterday"
          icon={Clock}
          variant="manufacturing"
        />
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">45</p>
          <p className="text-sm text-muted-foreground">Batches Completed</p>
        </div>
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <Factory className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">28</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <Clock className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">15</p>
          <p className="text-sm text-muted-foreground">QC Pending</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">12</p>
          <p className="text-sm text-muted-foreground">On Hold</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Production Plan vs Actual"
          subtitle="Daily output this week"
          type="bar"
          data={productionData}
          xAxisKey="name"
          dataKeys={[
            { key: 'planned', color: 'hsl(var(--muted))', name: 'Planned' },
            { key: 'actual', color: 'hsl(262, 52%, 50%)', name: 'Actual' },
          ]}
        />
        <ChartCard
          title="Batch Status Distribution"
          subtitle="Current batch status breakdown"
          type="pie"
          data={batchStatusData}
          height={300}
        />
      </div>

      {/* Batch Tracking Table */}
      <DataTable
        title="Active Batches"
        data={filteredBatches}
        columns={[
          { key: 'id', label: 'Batch ID', sortable: true },
          { key: 'product', label: 'Product', sortable: true },
          { key: 'qty', label: 'Quantity', sortable: true },
          { key: 'started', label: 'Started', sortable: true },
          { key: 'eta', label: 'ETA', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (value: string) => {
              const statusConfig: Record<string, { status: 'success' | 'info' | 'warning' | 'error'; label: string }> = {
                completed: { status: 'success', label: 'Completed' },
                in_progress: { status: 'info', label: 'In Progress' },
                qc_pending: { status: 'warning', label: 'QC Pending' },
                on_hold: { status: 'error', label: 'On Hold' },
              };
              const config = statusConfig[value] || { status: 'default' as const, label: value };
              return <StatusBadge status={config.status} label={config.label} dot />;
            },
          },
        ]}
      />

      {/* Machine Health Table */}
      <DataTable
        title="Machine Health Summary"
        data={machines}
        columns={[
          { key: 'id', label: 'Machine ID', sortable: true },
          { key: 'name', label: 'Name', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (value: string) => {
              const statusConfig: Record<string, { status: 'success' | 'warning' | 'pending'; label: string }> = {
                running: { status: 'success', label: 'Running' },
                maintenance: { status: 'warning', label: 'Maintenance' },
                idle: { status: 'pending', label: 'Idle' },
              };
              const config = statusConfig[value] || { status: 'pending' as const, label: value };
              return <StatusBadge status={config.status} label={config.label} dot />;
            },
          },
          {
            key: 'efficiency',
            label: 'Efficiency',
            sortable: true,
            render: (value: number) => (
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      value >= 90 ? 'bg-success' : value >= 70 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-sm">{value > 0 ? `${value}%` : '-'}</span>
              </div>
            ),
          },
          { key: 'lastMaintenance', label: 'Last Maintenance', sortable: true },
        ]}
      />
    </div>
  );
};

export default ManufacturingDashboard;
