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
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface QCTest {
  id: string;
  batch_id: string;
  test_type: string;
  test_date: string;
  result: string;
  passed: boolean | null;
  parameters: any;
  notes: string | null;
  created_at: string;
}

interface Batch {
  id: string;
  batch_number: string;
}

const testTypes = ['Raw Material', 'In-Process', 'Finished Product', 'Stability', 'Microbiological', 'Chemical'];

export default function QCTestsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<QCTest | null>(null);
  const [formData, setFormData] = useState({
    batch_id: '',
    test_type: '',
    test_date: new Date().toISOString().split('T')[0],
    result: 'pending',
    passed: false,
    notes: '',
  });

  const { data: tests = [], isLoading, refetch } = useSupabaseQuery<QCTest>('qc_tests', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const { data: batches = [] } = useSupabaseQuery<Batch>('production_batches', {
    select: 'id,batch_number'
  });

  const insertMutation = useSupabaseInsert<QCTest>('qc_tests');
  const updateMutation = useSupabaseUpdate<QCTest>('qc_tests');
  const deleteMutation = useSupabaseDelete('qc_tests');

  const getBatchNumber = (batchId: string) => {
    return batches.find(b => b.id === batchId)?.batch_number || 'Unknown';
  };

  const columns: Column<QCTest>[] = [
    {
      key: 'batch_id',
      label: 'Batch',
      sortable: true,
      render: (value) => getBatchNumber(value),
    },
    { key: 'test_type', label: 'Test Type', sortable: true },
    {
      key: 'test_date',
      label: 'Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-',
    },
    {
      key: 'result',
      label: 'Result',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error' | 'pending'> = {
          passed: 'success',
          pending: 'pending',
          failed: 'error',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value} dot />;
      },
    },
    {
      key: 'passed',
      label: 'Pass/Fail',
      render: (value) => value === null ? '-' : value ? '✓ Pass' : '✗ Fail',
    },
  ];

  const handleAdd = () => {
    setEditingTest(null);
    setFormData({
      batch_id: '',
      test_type: '',
      test_date: new Date().toISOString().split('T')[0],
      result: 'pending',
      passed: false,
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (test: QCTest) => {
    setEditingTest(test);
    setFormData({
      batch_id: test.batch_id,
      test_type: test.test_type,
      test_date: test.test_date?.split('T')[0] || '',
      result: test.result,
      passed: test.passed || false,
      notes: test.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (test: QCTest) => deleteMutation.mutate(test.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      passed: formData.result === 'passed' ? true : formData.result === 'failed' ? false : null,
    };

    if (editingTest) {
      await updateMutation.mutateAsync({ id: editingTest.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="QC Tests"
        description="Manage quality control tests and results"
        data={tests}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Test"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Test' : 'New QC Test'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch *</Label>
                <Select value={formData.batch_id} onValueChange={v => setFormData({ ...formData, batch_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>
                    {batches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id}>{batch.batch_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Test Type *</Label>
                <Select value={formData.test_type} onValueChange={v => setFormData({ ...formData, test_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {testTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Test Date</Label>
                <Input type="date" value={formData.test_date} onChange={e => setFormData({ ...formData, test_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Result</Label>
                <Select value={formData.result} onValueChange={v => setFormData({ ...formData, result: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
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
                {editingTest ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
