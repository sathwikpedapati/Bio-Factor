import React, { useState, useMemo } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/useSupabaseQuery';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface Payroll {
  id: string;
  employee_id: string;
  employee_name: string;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
}

export default function PayrollPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().toISOString().slice(0, 7),
    basic_salary: 0,
    allowances: 0,
    deductions: 0,
    notes: '',
  });

  const { data: payrolls = [], isLoading, refetch } = useSupabaseQuery<Payroll>('payroll', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const { data: employees = [] } = useSupabaseQuery<Employee>('employees', {
    limit: 1000
  });

  const insertMutation = useSupabaseInsert<Payroll>('payroll');
  const updateMutation = useSupabaseUpdate<Payroll>('payroll');
  const deleteMutation = useSupabaseDelete('payroll');

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(payroll => {
      const matchesSearch = payroll.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payroll.month.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payrolls, searchQuery, statusFilter]);

  const handleAdd = async () => {
    if (!formData.employee_id) {
      alert('Please select an employee');
      return;
    }

    const employee = employees.find(e => e.id === formData.employee_id);
    
    await insertMutation.mutateAsync({
      id: crypto.randomUUID(),
      employee_id: formData.employee_id,
      employee_name: employee?.name || '',
      month: formData.month,
      basic_salary: formData.basic_salary,
      allowances: formData.allowances,
      deductions: formData.deductions,
      net_salary: formData.basic_salary + formData.allowances - formData.deductions,
      status: 'pending',
      payment_date: null,
      notes: formData.notes || null,
      created_at: new Date().toISOString(),
    });

    setIsDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleEdit = async () => {
    if (!editingPayroll) return;

    const employee = employees.find(e => e.id === formData.employee_id);
    
    await updateMutation.mutateAsync({
      ...editingPayroll,
      employee_id: formData.employee_id,
      employee_name: employee?.name || editingPayroll.employee_name,
      month: formData.month,
      basic_salary: formData.basic_salary,
      allowances: formData.allowances,
      deductions: formData.deductions,
      net_salary: formData.basic_salary + formData.allowances - formData.deductions,
      notes: formData.notes || null,
    });

    setIsDialogOpen(false);
    setEditingPayroll(null);
    resetForm();
    refetch();
  };

  const handleDelete = async (payroll: Payroll) => {
    await deleteMutation.mutateAsync(payroll.id);
    refetch();
  };

  const handleRefresh = () => {
    refetch();
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      month: new Date().toISOString().slice(0, 7),
      basic_salary: 0,
      allowances: 0,
      deductions: 0,
      notes: '',
    });
  };

  const onEdit = (payroll: Payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      employee_id: payroll.employee_id,
      month: payroll.month,
      basic_salary: payroll.basic_salary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      notes: payroll.notes || '',
    });
    setIsDialogOpen(true);
  };

  const columns: Column[] = [
    { key: 'employee_name', label: 'Employee Name', sortable: true },
    { key: 'month', label: 'Month', sortable: true },
    { key: 'basic_salary', label: 'Basic Salary', sortable: true, render: (value) => `₹${value?.toLocaleString()}` },
    { key: 'allowances', label: 'Allowances', sortable: true, render: (value) => `₹${value?.toLocaleString()}` },
    { key: 'deductions', label: 'Deductions', sortable: true, render: (value) => `₹${value?.toLocaleString()}` },
    { key: 'net_salary', label: 'Net Salary', sortable: true, render: (value) => `₹${value?.toLocaleString()}` },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge
          status={value === 'paid' ? 'success' : value === 'pending' ? 'warning' : 'error'}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          dot
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Payroll Management</h1>
        <Button onClick={() => { resetForm(); setEditingPayroll(null); setIsDialogOpen(true); }}>
          Add Payroll
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by employee name or month..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <CrudPage
        title="Payroll Records"
        data={filteredPayrolls}
        columns={columns}
        isLoading={isLoading}
        onAdd={() => { resetForm(); setEditingPayroll(null); setIsDialogOpen(true); }}
        onEdit={onEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        addLabel="New Payroll Entry"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPayroll ? 'Edit Payroll' : 'Add New Payroll'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="basic_salary">Basic Salary</Label>
              <Input
                id="basic_salary"
                type="number"
                value={formData.basic_salary}
                onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="allowances">Allowances</Label>
              <Input
                id="allowances"
                type="number"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="deductions">Deductions</Label>
              <Input
                id="deductions"
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
            <Button onClick={editingPayroll ? handleEdit : handleAdd} className="w-full">
              {editingPayroll ? 'Update' : 'Add'} Payroll
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
