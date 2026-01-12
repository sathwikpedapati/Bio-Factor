import React, { useState } from 'react';
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

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string;
  designation: string | null;
  date_of_joining: string | null;
  salary: number | null;
  status: string;
  address: string | null;
  emergency_contact: string | null;
  bank_account: string | null;
  created_at: string;
}

const departments = [
  'Sales',
  'Manufacturing',
  'Quality Control',
  'Warehouse',
  'Finance',
  'HR',
  'Field Operations',
  'R&D',
  'Executive',
];

export default function EmployeesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    date_of_joining: '',
    salary: 0,
    status: 'active',
    address: '',
    emergency_contact: '',
    bank_account: '',
  });

  const { data: employees = [], isLoading, refetch } = useSupabaseQuery<Employee>('employees', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const insertMutation = useSupabaseInsert<Employee>('employees');
  const updateMutation = useSupabaseUpdate<Employee>('employees');
  const deleteMutation = useSupabaseDelete('employees');

  const columns: Column<Employee>[] = [
    { key: 'employee_code', label: 'Emp Code', sortable: true },
    { key: 'full_name', label: 'Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'date_of_joining',
      label: 'Joined',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge
          status={value === 'active' ? 'success' : value === 'on_leave' ? 'warning' : 'error'}
          label={value?.replace('_', ' ')}
          dot
        />
      ),
    },
    {
      key: 'salary',
      label: 'Salary',
      sortable: true,
      render: (value) => value ? `₹${value.toLocaleString()}` : '-',
    },
  ];

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employee_code: `EMP${String(employees.length + 1).padStart(4, '0')}`,
      full_name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      date_of_joining: '',
      salary: 0,
      status: 'active',
      address: '',
      emergency_contact: '',
      bank_account: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_code: employee.employee_code,
      full_name: employee.full_name,
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department,
      designation: employee.designation || '',
      date_of_joining: employee.date_of_joining || '',
      salary: employee.salary || 0,
      status: employee.status,
      address: employee.address || '',
      emergency_contact: employee.emergency_contact || '',
      bank_account: employee.bank_account || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    deleteMutation.mutate(employee.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      date_of_joining: formData.date_of_joining || null,
      salary: formData.salary || null,
    };

    if (editingEmployee) {
      await updateMutation.mutateAsync({ id: editingEmployee.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Employees"
        description="Manage employee records and information"
        data={employees}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Add Employee"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_code">Employee Code *</Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={v => setFormData({ ...formData, department: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input
                  id="date_of_joining"
                  type="date"
                  value={formData.date_of_joining}
                  onChange={e => setFormData({ ...formData, date_of_joining: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary (₹)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account">Bank Account Details</Label>
              <Input
                id="bank_account"
                value={formData.bank_account}
                onChange={e => setFormData({ ...formData, bank_account: e.target.value })}
                placeholder="Account number / IFSC"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingEmployee ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
