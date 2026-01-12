import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Calendar,
  DollarSign,
  Award,
  TrendingDown,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
}

interface Leave {
  id: string;
  employee_id: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  status: string;
}

// Mock chart data
const attendanceData = [
  { name: 'Mon', present: 312, absent: 18, leave: 12 },
  { name: 'Tue', present: 318, absent: 14, leave: 10 },
  { name: 'Wed', present: 305, absent: 22, leave: 15 },
  { name: 'Thu', present: 320, absent: 12, leave: 10 },
  { name: 'Fri', present: 308, absent: 20, leave: 14 },
];

const departmentStrength = [
  { name: 'Sales', value: 85, color: 'hsl(199, 89%, 48%)' },
  { name: 'Manufacturing', value: 120, color: 'hsl(262, 52%, 50%)' },
  { name: 'QC', value: 25, color: 'hsl(142, 70%, 40%)' },
  { name: 'Warehouse', value: 45, color: 'hsl(38, 92%, 50%)' },
  { name: 'Finance', value: 18, color: 'hsl(174, 62%, 40%)' },
  { name: 'HR', value: 12, color: 'hsl(340, 82%, 52%)' },
  { name: 'Field Ops', value: 28, color: 'hsl(25, 95%, 53%)' },
  { name: 'R&D', value: 9, color: 'hsl(215, 70%, 25%)' },
];

const openPositions = [
  { role: 'Sales Executive', department: 'Sales', location: 'North', applicants: 24, status: 'interviewing' },
  { role: 'QC Analyst', department: 'QC', location: 'HQ', applicants: 12, status: 'screening' },
  { role: 'Machine Operator', department: 'Manufacturing', location: 'Plant', applicants: 38, status: 'interviewing' },
  { role: 'Field Officer', department: 'Field Ops', location: 'South', applicants: 18, status: 'offer' },
];

export const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch real data
  const { data: employees = [] } = useSupabaseQuery<Employee>('employees', {
    limit: 100
  });
  
  const { data: leaves = [] } = useSupabaseQuery<Leave>('leaves', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 50
  });

  // Calculate statistics
  const totalEmployees = employees.length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
  const presentToday = Math.floor(totalEmployees * 0.94);
  const absentToday = Math.floor(totalEmployees * 0.04);
  const onLeaveToday = Math.floor(totalEmployees * 0.02);

  // Leave requests table data
  const leaveRequests = useMemo(() => {
    return leaves.slice(0, 5).map(leave => {
      const employee = employees.find(e => e.id === leave.employee_id);
      const days = Math.ceil((new Date(leave.to_date).getTime() - new Date(leave.from_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return {
        employee: employee?.name || 'Unknown',
        department: employee?.department || 'N/A',
        type: leave.leave_type,
        from: new Date(leave.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        days,
        status: leave.status,
      };
    });
  }, [leaves, employees]);

  // Payroll summary mock
  const payrollSummary = [
    { department: 'Sales', employees: 85, gross: '₹42.5L', deductions: '₹8.5L', net: '₹34.0L' },
    { department: 'Manufacturing', employees: 120, gross: '₹48.0L', deductions: '₹9.6L', net: '₹38.4L' },
    { department: 'QC', employees: 25, gross: '₹15.0L', deductions: '₹3.0L', net: '₹12.0L' },
    { department: 'Warehouse', employees: 45, gross: '₹18.0L', deductions: '₹3.6L', net: '₹14.4L' },
    { department: 'Others', employees: 67, gross: '₹38.5L', deductions: '₹7.7L', net: '₹30.8L' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Human Resources Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track attendance, payroll, recruitment, and employee management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/hr/recruitment')}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
          >
            View Reports
          </button>
          <button 
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 rounded-lg bg-department-hr text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Employees"
          value={totalEmployees.toString()}
          change={2.4}
          changeLabel="this month"
          icon={Users}
          variant="hr"
        />
        <KPICard
          title="Attendance Today"
          value="94.2%"
          change={1.2}
          changeLabel="vs avg"
          icon={Clock}
          variant="hr"
        />
        <KPICard
          title="Attrition Rate"
          value="4.8%"
          change={-0.5}
          changeLabel="improved"
          icon={TrendingDown}
          variant="hr"
        />
        <KPICard
          title="Open Positions"
          value={openPositions.length.toString()}
          change={3}
          changeLabel="new"
          icon={UserPlus}
          variant="hr"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <Users className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{presentToday}</p>
          <p className="text-sm text-muted-foreground">Present Today</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <Calendar className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{onLeaveToday}</p>
          <p className="text-sm text-muted-foreground">On Leave</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <UserMinus className="w-5 h-5 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{absentToday}</p>
          <p className="text-sm text-muted-foreground">Absent</p>
        </div>
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <Award className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">78%</p>
          <p className="text-sm text-muted-foreground">Training Complete</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Weekly Attendance"
          subtitle="Present vs Absent vs Leave"
          type="bar"
          data={attendanceData}
          xAxisKey="name"
          dataKeys={[
            { key: 'present', color: 'hsl(142, 70%, 40%)', name: 'Present' },
            { key: 'absent', color: 'hsl(0, 72%, 51%)', name: 'Absent' },
            { key: 'leave', color: 'hsl(38, 92%, 50%)', name: 'Leave' },
          ]}
        />
        <ChartCard
          title="Department Strength"
          subtitle="Employees by department"
          type="pie"
          data={departmentStrength}
          height={300}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Requests */}
        <DataTable
          title="Pending Leave Requests"
          data={leaveRequests}
          columns={[
            { key: 'employee', label: 'Employee', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'from', label: 'From', sortable: true },
            { key: 'days', label: 'Days', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => {
                const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
                  approved: 'success',
                  pending: 'warning',
                  rejected: 'error',
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

        {/* Open Positions */}
        <DataTable
          title="Open Positions"
          data={openPositions}
          columns={[
            { key: 'role', label: 'Role', sortable: true },
            { key: 'department', label: 'Dept', sortable: true },
            { key: 'applicants', label: 'Applicants', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => {
                const statusMap: Record<string, 'success' | 'info' | 'warning'> = {
                  offer: 'success',
                  interviewing: 'info',
                  screening: 'warning',
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

      {/* Payroll Summary */}
      <DataTable
        title="Payroll Summary (December)"
        data={payrollSummary}
        columns={[
          { key: 'department', label: 'Department', sortable: true },
          { key: 'employees', label: 'Employees', sortable: true },
          { key: 'gross', label: 'Gross Salary', sortable: true },
          { key: 'deductions', label: 'Deductions', sortable: true },
          {
            key: 'net',
            label: 'Net Payable',
            render: (value: string) => (
              <span className="font-semibold text-foreground">{value}</span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default HRDashboard;
