import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react';

// Mock data
const passFailData = [
  { name: 'Week 1', passed: 42, failed: 3 },
  { name: 'Week 2', passed: 38, failed: 5 },
  { name: 'Week 3', passed: 45, failed: 2 },
  { name: 'Week 4', passed: 40, failed: 4 },
];

const testTypeData = [
  { name: 'Chemical', value: 35, color: 'hsl(142, 70%, 40%)' },
  { name: 'Physical', value: 28, color: 'hsl(199, 89%, 48%)' },
  { name: 'Microbiological', value: 22, color: 'hsl(262, 52%, 50%)' },
  { name: 'Stability', value: 15, color: 'hsl(38, 92%, 50%)' },
];

const pendingTests = [
  { batchId: 'BT-2024-156', product: 'Bio-Fertilizer Pro', testType: 'Chemical', priority: 'high', dueDate: '05 Dec' },
  { batchId: 'BT-2024-155', product: 'Organic Pesticide X', testType: 'Microbiological', priority: 'high', dueDate: '04 Dec' },
  { batchId: 'BT-2024-154', product: 'Growth Enhancer Plus', testType: 'Physical', priority: 'medium', dueDate: '06 Dec' },
  { batchId: 'BT-2024-153', product: 'Soil Conditioner', testType: 'Stability', priority: 'low', dueDate: '08 Dec' },
];

const recentResults = [
  { batchId: 'BT-2024-152', product: 'Micro Nutrients Mix', testType: 'Chemical', result: 'passed', date: '03 Dec', analyst: 'Dr. Meera' },
  { batchId: 'BT-2024-151', product: 'Bio-Fertilizer Pro', testType: 'Physical', result: 'passed', date: '02 Dec', analyst: 'Rahul S.' },
  { batchId: 'BT-2024-150', product: 'Organic Pesticide X', testType: 'Microbiological', result: 'failed', date: '02 Dec', analyst: 'Dr. Meera' },
  { batchId: 'BT-2024-149', product: 'Growth Enhancer Plus', testType: 'Chemical', result: 'passed', date: '01 Dec', analyst: 'Priya K.' },
  { batchId: 'BT-2024-148', product: 'Soil Conditioner', testType: 'Stability', result: 'passed', date: '01 Dec', analyst: 'Rahul S.' },
];

const deviations = [
  { id: 'DEV-045', batch: 'BT-2024-150', type: 'pH Level', deviation: '+0.8', severity: 'major', status: 'open' },
  { id: 'DEV-044', batch: 'BT-2024-147', type: 'Moisture Content', deviation: '-2.1%', severity: 'minor', status: 'resolved' },
  { id: 'DEV-043', batch: 'BT-2024-142', type: 'Particle Size', deviation: '+15μm', severity: 'minor', status: 'resolved' },
];

export const QCDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredPendingTests = selectedFilter === 'all'
    ? pendingTests
    : pendingTests.filter(pt => pt.status === selectedFilter || pt.testType.toLowerCase() === selectedFilter);

  const filteredRecentResults = selectedFilter === 'all'
    ? recentResults
    : recentResults.filter(rr => rr.result === selectedFilter || rr.testType.toLowerCase() === selectedFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Quality Control Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor testing status, pass/fail rates, and quality deviations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Tests</option>
            <option value="pending">Pending</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
          <button 
            onClick={() => navigate('/qc/tests')}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
          >
            View Reports
          </button>
          <button 
            onClick={() => navigate('/qc/tests')}
            className="px-4 py-2 rounded-lg bg-department-qc text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Test
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Pass Rate (MTD)"
          value="96.2%"
          change={1.8}
          changeLabel="vs last month"
          icon={CheckCircle}
          variant="qc"
        />
        <KPICard
          title="Pending Tests"
          value="15"
          change={-20}
          changeLabel="vs yesterday"
          icon={Clock}
          variant="qc"
        />
        <KPICard
          title="Avg TAT"
          value="4.2 hrs"
          change={-12}
          changeLabel="improved"
          icon={FlaskConical}
          variant="qc"
        />
        <KPICard
          title="Open Deviations"
          value="3"
          change={50}
          changeLabel="vs last week"
          icon={AlertTriangle}
          variant="qc"
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">165</p>
          <p className="text-sm text-muted-foreground">Tests Passed</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <XCircle className="w-5 h-5 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">14</p>
          <p className="text-sm text-muted-foreground">Tests Failed</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <Clock className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">15</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <FileText className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">42</p>
          <p className="text-sm text-muted-foreground">Reports Generated</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Pass/Fail Trend"
          subtitle="Weekly test results"
          type="bar"
          data={passFailData}
          xAxisKey="name"
          dataKeys={[
            { key: 'passed', color: 'hsl(142, 70%, 40%)', name: 'Passed' },
            { key: 'failed', color: 'hsl(0, 72%, 51%)', name: 'Failed' },
          ]}
        />
        <ChartCard
          title="Test Type Distribution"
          subtitle="Tests by category"
          type="pie"
          data={testTypeData}
          height={300}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tests */}
        <DataTable
          title="Pending Tests"
          data={filteredPendingTests}
          columns={[
            { key: 'batchId', label: 'Batch', sortable: true },
            { key: 'product', label: 'Product', sortable: true },
            { key: 'testType', label: 'Test Type', sortable: true },
            {
              key: 'priority',
              label: 'Priority',
              render: (value: string) => {
                const statusMap: Record<string, 'error' | 'warning' | 'info'> = {
                  high: 'error',
                  medium: 'warning',
                  low: 'info',
                };
                return (
                  <StatusBadge
                    status={statusMap[value] || 'default'}
                    label={value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                );
              },
            },
            { key: 'dueDate', label: 'Due Date', sortable: true },
          ]}
        />

        {/* Recent Results */}
        <DataTable
          title="Recent Results"
          data={filteredRecentResults}
          columns={[
            { key: 'batchId', label: 'Batch', sortable: true },
            { key: 'testType', label: 'Test', sortable: true },
            {
              key: 'result',
              label: 'Result',
              render: (value: string) => (
                <StatusBadge
                  status={value === 'passed' ? 'success' : 'error'}
                  label={value.charAt(0).toUpperCase() + value.slice(1)}
                  dot
                />
              ),
            },
            { key: 'date', label: 'Date', sortable: true },
            { key: 'analyst', label: 'Analyst', sortable: true },
          ]}
        />
      </div>

      {/* Deviations Log */}
      <DataTable
        title="Deviation Log"
        data={deviations}
        columns={[
          { key: 'id', label: 'Deviation ID', sortable: true },
          { key: 'batch', label: 'Batch', sortable: true },
          { key: 'type', label: 'Type', sortable: true },
          { key: 'deviation', label: 'Deviation', sortable: true },
          {
            key: 'severity',
            label: 'Severity',
            render: (value: string) => (
              <StatusBadge
                status={value === 'major' ? 'error' : 'warning'}
                label={value.charAt(0).toUpperCase() + value.slice(1)}
              />
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (value: string) => (
              <StatusBadge
                status={value === 'resolved' ? 'success' : 'warning'}
                label={value.charAt(0).toUpperCase() + value.slice(1)}
                dot
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default QCDashboard;
