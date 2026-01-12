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
import { format, differenceInDays } from 'date-fns';

interface Leave {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
}

interface Employee { id: string; full_name: string; employee_code: string; }

const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

export default function LeavesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Leave | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending',
  });

  const { data: leaves = [], isLoading, refetch } = useSupabaseQuery<Leave>('leaves', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: employees = [] } = useSupabaseQuery<Employee>('employees', { select: 'id,full_name,employee_code' });

  const insertMutation = useSupabaseInsert<Leave>('leaves');
  const updateMutation = useSupabaseUpdate<Leave>('leaves');
  const deleteMutation = useSupabaseDelete('leaves');

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.full_name : '-';
  };

  const columns: Column<Leave>[] = [
    { key: 'employee_id', label: 'Employee', sortable: true, render: (v) => getEmployeeName(v) },
    { key: 'leave_type', label: 'Type', sortable: true },
    { key: 'start_date', label: 'From', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'end_date', label: 'To', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    {
      key: 'start_date',
      label: 'Days',
      render: (_, row) => `${differenceInDays(new Date(row.end_date), new Date(row.start_date)) + 1} days`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error' | 'pending'> = {
          approved: 'success',
          pending: 'pending',
          rejected: 'error',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value} dot />;
      },
    },
  ];

  const handleAdd = () => {
    setEditing(null);
    setFormData({ employee_id: '', leave_type: '', start_date: '', end_date: '', reason: '', status: 'pending' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Leave) => {
    setEditing(item);
    setFormData({
      employee_id: item.employee_id,
      leave_type: item.leave_type,
      start_date: item.start_date,
      end_date: item.end_date,
      reason: item.reason || '',
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Leave) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData, reason: formData.reason || null };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Leave Management"
        description="Manage employee leave requests"
        data={leaves}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Apply Leave"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Leave' : 'Apply for Leave'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={v => setFormData({ ...formData, employee_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Select value={formData.leave_type} onValueChange={v => setFormData({ ...formData, leave_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From Date *</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>To Date *</Label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editing ? 'Update' : 'Submit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
