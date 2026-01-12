import React, { useState } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate } from '@/hooks/useSupabaseQuery';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Employee { id: string; full_name: string; employee_code: string; }

export default function AttendancePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    status: 'present',
    notes: '',
  });

  const { data: attendance = [], isLoading, refetch } = useSupabaseQuery<Attendance>('attendance', {
    orderBy: { column: 'date', ascending: false }
  });
  const { data: employees = [] } = useSupabaseQuery<Employee>('employees', { select: 'id,full_name,employee_code' });

  const insertMutation = useSupabaseInsert<Attendance>('attendance');
  const updateMutation = useSupabaseUpdate<Attendance>('attendance');

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.full_name} (${emp.employee_code})` : '-';
  };

  const columns: Column<Attendance>[] = [
    { key: 'date', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'employee_id', label: 'Employee', sortable: true, render: (v) => getEmployeeName(v) },
    { key: 'check_in', label: 'Check In', render: (v) => v || '-' },
    { key: 'check_out', label: 'Check Out', render: (v) => v || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
          present: 'success',
          absent: 'error',
          half_day: 'warning',
          late: 'warning',
          leave: 'info',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value?.replace('_', ' ')} dot />;
      },
    },
    { key: 'notes', label: 'Notes' },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({ employee_id: '', date: new Date().toISOString().split('T')[0], check_in: '', check_out: '', status: 'present', notes: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (record: Attendance) => {
    setEditingRecord(record);
    setFormData({
      employee_id: record.employee_id,
      date: record.date,
      check_in: record.check_in || '',
      check_out: record.check_out || '',
      status: record.status,
      notes: record.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      check_in: formData.check_in || null,
      check_out: formData.check_out || null,
      notes: formData.notes || null,
    };
    if (editingRecord) {
      await updateMutation.mutateAsync({ id: editingRecord.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Attendance"
        description="Track employee attendance records"
        data={attendance}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onRefresh={() => refetch()}
        addLabel="Mark Attendance"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Attendance' : 'Mark Attendance'}</DialogTitle>
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
                <Label>Date *</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Check In</Label>
                <Input type="time" value={formData.check_in} onChange={e => setFormData({ ...formData, check_in: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Check Out</Label>
                <Input type="time" value={formData.check_out} onChange={e => setFormData({ ...formData, check_out: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingRecord ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
