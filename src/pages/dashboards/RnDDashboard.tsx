import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  Microscope,
  Lightbulb,
  FlaskConical,
  FileCheck,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';

// Mock data
const pipelineData = [
  { stage: 'Idea', count: 12 },
  { stage: 'Lab Trial', count: 8 },
  { stage: 'Field Trial', count: 5 },
  { stage: 'Validation', count: 3 },
  { stage: 'Approved', count: 2 },
];

const budgetData = [
  { name: 'Lab Equipment', value: 35, color: 'hsl(199, 89%, 48%)' },
  { name: 'Field Trials', value: 28, color: 'hsl(174, 62%, 40%)' },
  { name: 'Materials', value: 22, color: 'hsl(262, 52%, 50%)' },
  { name: 'Personnel', value: 15, color: 'hsl(38, 92%, 50%)' },
];

const activeTrials = [
  { id: 'TR-2024-018', name: 'Bio-Stimulant V2', stage: 'field_trial', progress: 75, lead: 'Dr. Arun Gupta', eta: 'Feb 2025' },
  { id: 'TR-2024-017', name: 'Nano-Fertilizer', stage: 'lab_trial', progress: 45, lead: 'Dr. Sneha M.', eta: 'Apr 2025' },
  { id: 'TR-2024-016', name: 'Organic Pest Control', stage: 'validation', progress: 90, lead: 'Dr. Arun Gupta', eta: 'Jan 2025' },
  { id: 'TR-2024-015', name: 'Soil Microbiome', stage: 'field_trial', progress: 60, lead: 'Dr. Rahul K.', eta: 'Mar 2025' },
  { id: 'TR-2024-014', name: 'Growth Hormone X', stage: 'idea', progress: 10, lead: 'Dr. Sneha M.', eta: 'Jun 2025' },
];

const trialResults = [
  { trial: 'Bio-Stimulant V2', metric: 'Yield Increase', control: '12%', test: '28%', improvement: '+133%' },
  { trial: 'Bio-Stimulant V2', metric: 'Root Growth', control: '15cm', test: '24cm', improvement: '+60%' },
  { trial: 'Organic Pest Control', metric: 'Pest Reduction', control: '45%', test: '82%', improvement: '+82%' },
  { trial: 'Soil Microbiome', metric: 'Nutrient Absorption', control: '35%', test: '58%', improvement: '+66%' },
];

const ipSummary = [
  { type: 'Patents Filed', count: 8, status: 'pending' },
  { type: 'Patents Granted', count: 12, status: 'approved' },
  { type: 'Trademarks', count: 15, status: 'approved' },
  { type: 'Research Papers', count: 6, status: 'published' },
];

export const RnDDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            R&D Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track research trials, innovation pipeline, and IP portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Trials</option>
            <option value="idea">Idea</option>
            <option value="lab_trial">Lab Trial</option>
            <option value="field_trial">Field Trial</option>
            <option value="validation">Validation</option>
          </select>
          <button 
            onClick={() => navigate('/rnd/research')}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
          >
            View Reports
          </button>
          <button 
            onClick={() => navigate('/rnd/trials')}
            className="px-4 py-2 rounded-lg bg-department-rnd text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Trial
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Trials"
          value="8"
          change={2}
          changeLabel="new this quarter"
          icon={Microscope}
          variant="rnd"
        />
        <KPICard
          title="Pipeline Ideas"
          value="12"
          change={25}
          changeLabel="vs last quarter"
          icon={Lightbulb}
          variant="rnd"
        />
        <KPICard
          title="Budget Utilized"
          value="68%"
          change={-5}
          changeLabel="under budget"
          icon={DollarSign}
          variant="rnd"
        />
        <KPICard
          title="Patents Pending"
          value="8"
          change={3}
          changeLabel="new filed"
          icon={Award}
          variant="rnd"
        />
      </div>

      {/* Pipeline Stages */}
      <div className="dashboard-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">Trial Pipeline</h3>
        <div className="flex flex-wrap gap-4">
          {pipelineData.map((stage, index) => (
            <div
              key={stage.stage}
              className="flex-1 min-w-[120px] relative"
            >
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{stage.count}</p>
                <p className="text-sm text-muted-foreground mt-1">{stage.stage}</p>
              </div>
              {index < pipelineData.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-muted-foreground">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* IP Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ipSummary.map((item) => (
          <div key={item.type} className="bg-card rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-department-rnd" />
              <StatusBadge
                status={item.status === 'approved' || item.status === 'published' ? 'success' : 'warning'}
                label={item.status}
              />
            </div>
            <p className="text-2xl font-bold text-foreground">{item.count}</p>
            <p className="text-sm text-muted-foreground">{item.type}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Pipeline Distribution"
          subtitle="Trials by stage"
          type="bar"
          data={pipelineData}
          xAxisKey="stage"
          dataKeys={[
            { key: 'count', color: 'hsl(215, 70%, 25%)', name: 'Trials' },
          ]}
          height={280}
        />
        <ChartCard
          title="Budget Allocation"
          subtitle="R&D spend by category"
          type="pie"
          data={budgetData}
          height={300}
        />
      </div>

      {/* Active Trials Table */}
      <DataTable
        title="Active Trials"
        data={activeTrials}
        columns={[
          { key: 'id', label: 'Trial ID', sortable: true },
          { key: 'name', label: 'Name', sortable: true },
          {
            key: 'stage',
            label: 'Stage',
            render: (value: string) => {
              const stageConfig: Record<string, { status: 'info' | 'warning' | 'success' | 'pending'; label: string }> = {
                idea: { status: 'pending', label: 'Idea' },
                lab_trial: { status: 'info', label: 'Lab Trial' },
                field_trial: { status: 'warning', label: 'Field Trial' },
                validation: { status: 'success', label: 'Validation' },
              };
              const config = stageConfig[value] || { status: 'pending' as const, label: value };
              return <StatusBadge status={config.status} label={config.label} />;
            },
          },
          {
            key: 'progress',
            label: 'Progress',
            sortable: true,
            render: (value: number) => (
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-department-rnd rounded-full"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-sm">{value}%</span>
              </div>
            ),
          },
          { key: 'lead', label: 'Lead', sortable: true },
          { key: 'eta', label: 'ETA', sortable: true },
        ]}
      />

      {/* Trial Results */}
      <DataTable
        title="Recent Trial Results"
        data={trialResults}
        columns={[
          { key: 'trial', label: 'Trial', sortable: true },
          { key: 'metric', label: 'Metric', sortable: true },
          { key: 'control', label: 'Control', sortable: true },
          { key: 'test', label: 'Test', sortable: true },
          {
            key: 'improvement',
            label: 'Improvement',
            render: (value: string) => (
              <span className="font-semibold text-success">{value}</span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default RnDDashboard;
