import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  MapPin,
  Users,
  FileText,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Target,
  TrendingUp,
} from 'lucide-react';

// Mock data
const visitData = [
  { name: 'Mon', visits: 45, demos: 12 },
  { name: 'Tue', visits: 52, demos: 15 },
  { name: 'Wed', visits: 48, demos: 10 },
  { name: 'Thu', visits: 56, demos: 18 },
  { name: 'Fri', visits: 42, demos: 14 },
  { name: 'Sat', visits: 28, demos: 8 },
];

const regionCoverage = [
  { name: 'North', value: 82, color: 'hsl(199, 89%, 48%)' },
  { name: 'South', value: 75, color: 'hsl(174, 62%, 40%)' },
  { name: 'East', value: 68, color: 'hsl(262, 52%, 50%)' },
  { name: 'West', value: 58, color: 'hsl(38, 92%, 50%)' },
];

const fieldStaff = [
  { name: 'Kiran Rao', region: 'South', visits: 28, demos: 8, conversions: 5, score: 92 },
  { name: 'Raj Verma', region: 'North', visits: 32, demos: 12, conversions: 7, score: 88 },
  { name: 'Sunita Devi', region: 'East', visits: 24, demos: 6, conversions: 4, score: 85 },
  { name: 'Manoj Singh', region: 'West', visits: 26, demos: 9, conversions: 5, score: 82 },
  { name: 'Anita Kumari', region: 'North', visits: 22, demos: 7, conversions: 3, score: 78 },
];

const recentVisits = [
  { id: 'V-2024-1245', officer: 'Kiran Rao', farmer: 'Ramesh Kumar', village: 'Vijayapura', purpose: 'Demo', status: 'completed' },
  { id: 'V-2024-1244', officer: 'Raj Verma', farmer: 'Suresh Patel', village: 'Amravati', purpose: 'Follow-up', status: 'completed' },
  { id: 'V-2024-1243', officer: 'Sunita Devi', farmer: 'Lakshmi Devi', village: 'Karimnagar', purpose: 'Issue Resolution', status: 'pending' },
  { id: 'V-2024-1242', officer: 'Manoj Singh', farmer: 'Prakash Joshi', village: 'Bhilwara', purpose: 'Demo', status: 'scheduled' },
];

const farmerIssues = [
  { id: 'ISS-2024-089', farmer: 'Ramesh Kumar', crop: 'Cotton', issue: 'Pest infestation after application', severity: 'high', status: 'open' },
  { id: 'ISS-2024-088', farmer: 'Suresh Patel', crop: 'Wheat', issue: 'Product not dissolving properly', severity: 'medium', status: 'investigating' },
  { id: 'ISS-2024-087', farmer: 'Lakshmi Devi', crop: 'Rice', issue: 'Delayed delivery of order', severity: 'low', status: 'resolved' },
  { id: 'ISS-2024-086', farmer: 'Prakash Joshi', crop: 'Soybean', issue: 'Yellowing of leaves post spray', severity: 'high', status: 'open' },
];

export const FieldOpsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredFieldStaff = selectedFilter === 'all' ? fieldStaff : fieldStaff.filter(s => s.region.toLowerCase() === selectedFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Field Operations Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track field visits, demos, farmer issues, and staff performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Regions</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
          <button 
            onClick={() => navigate('/fieldops/visits')}
            className="px-4 py-2 rounded-lg bg-department-fieldops text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Log Visit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Field Visits (MTD)"
          value="271"
          change={15.2}
          changeLabel="vs last month"
          icon={MapPin}
          variant="fieldops"
        />
        <KPICard
          title="Demos Conducted"
          value="77"
          change={22.4}
          changeLabel="vs last month"
          icon={Target}
          variant="fieldops"
        />
        <KPICard
          title="Issues Reported"
          value="18"
          change={-12}
          changeLabel="reduced"
          icon={AlertTriangle}
          variant="fieldops"
        />
        <KPICard
          title="Coverage Rate"
          value="72%"
          change={5.8}
          changeLabel="improved"
          icon={TrendingUp}
          variant="fieldops"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">156</p>
          <p className="text-sm text-muted-foreground">Visits Completed</p>
        </div>
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <Calendar className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">45</p>
          <p className="text-sm text-muted-foreground">Scheduled Today</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">8</p>
          <p className="text-sm text-muted-foreground">Open Issues</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <Users className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">28</p>
          <p className="text-sm text-muted-foreground">Active Field Staff</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Weekly Activity"
          subtitle="Visits and demos this week"
          type="bar"
          data={visitData}
          xAxisKey="name"
          dataKeys={[
            { key: 'visits', color: 'hsl(25, 95%, 53%)', name: 'Visits' },
            { key: 'demos', color: 'hsl(174, 62%, 40%)', name: 'Demos' },
          ]}
        />
        <ChartCard
          title="Region Coverage"
          subtitle="Farmer coverage by region %"
          type="pie"
          data={regionCoverage}
          height={300}
        />
      </div>

      {/* Field Staff Performance */}
      <DataTable
        title="Field Staff Performance"
        data={filteredFieldStaff}
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'region', label: 'Region', sortable: true },
          { key: 'visits', label: 'Visits', sortable: true },
          { key: 'demos', label: 'Demos', sortable: true },
          { key: 'conversions', label: 'Conversions', sortable: true },
          {
            key: 'score',
            label: 'Score',
            sortable: true,
            render: (value: number) => (
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      value >= 85 ? 'bg-success' : value >= 70 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ),
          },
        ]}
      />

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visits */}
        <DataTable
          title="Recent Visits"
          data={recentVisits}
          columns={[
            { key: 'id', label: 'Visit ID', sortable: true },
            { key: 'officer', label: 'Officer', sortable: true },
            { key: 'farmer', label: 'Farmer', sortable: true },
            { key: 'purpose', label: 'Purpose', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => {
                const statusMap: Record<string, 'success' | 'warning' | 'info'> = {
                  completed: 'success',
                  pending: 'warning',
                  scheduled: 'info',
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

        {/* Farmer Issues */}
        <DataTable
          title="Farmer Issues"
          data={farmerIssues}
          columns={[
            { key: 'id', label: 'Issue ID', sortable: true },
            { key: 'farmer', label: 'Farmer', sortable: true },
            { key: 'crop', label: 'Crop', sortable: true },
            {
              key: 'severity',
              label: 'Severity',
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
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => {
                const statusMap: Record<string, 'error' | 'warning' | 'success'> = {
                  open: 'error',
                  investigating: 'warning',
                  resolved: 'success',
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

export default FieldOpsDashboard;
