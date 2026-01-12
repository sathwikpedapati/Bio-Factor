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

interface Trial {
  id: string;
  trial_code: string;
  name: string;
  product_id: string | null;
  stage: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  spent: number;
  objectives: string | null;
  results: string | null;
  created_at: string;
}

interface Product { id: string; name: string; }

const stages = ['Idea', 'Research', 'Development', 'Testing', 'Pilot', 'Scale-up', 'Complete'];

export default function TrialsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null);
  const [formData, setFormData] = useState({
    trial_code: '',
    name: '',
    product_id: '',
    stage: 'idea',
    status: 'active',
    start_date: '',
    end_date: '',
    budget: 0,
    spent: 0,
    objectives: '',
    results: '',
  });

  const { data: trials = [], isLoading, refetch } = useSupabaseQuery<Trial>('trials', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: products = [] } = useSupabaseQuery<Product>('products', { select: 'id,name' });

  const insertMutation = useSupabaseInsert<Trial>('trials');
  const updateMutation = useSupabaseUpdate<Trial>('trials');
  const deleteMutation = useSupabaseDelete('trials');

  const columns: Column<Trial>[] = [
    { key: 'trial_code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'stage',
      label: 'Stage',
      sortable: true,
      render: (value) => {
        const colors: Record<string, 'info' | 'warning' | 'success' | 'pending'> = {
          idea: 'pending',
          research: 'info',
          development: 'info',
          testing: 'warning',
          pilot: 'warning',
          'scale-up': 'success',
          complete: 'success',
        };
        return <StatusBadge status={colors[value] || 'default'} label={value} dot />;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge
          status={value === 'active' ? 'success' : value === 'on_hold' ? 'warning' : 'error'}
          label={value}
          dot
        />
      ),
    },
    { key: 'start_date', label: 'Start', sortable: true, render: (v) => v ? format(new Date(v), 'dd MMM yyyy') : '-' },
    { key: 'budget', label: 'Budget', sortable: true, render: (v) => v ? `₹${(v / 1000).toFixed(0)}K` : '-' },
    {
      key: 'spent',
      label: 'Spent',
      sortable: true,
      render: (value, row) => {
        const percent = row.budget ? ((value / row.budget) * 100).toFixed(0) : 0;
        return `₹${(value / 1000).toFixed(0)}K (${percent}%)`;
      },
    },
  ];

  const handleAdd = () => {
    setEditingTrial(null);
    setFormData({
      trial_code: `TR-${Date.now().toString().slice(-6)}`,
      name: '',
      product_id: '',
      stage: 'idea',
      status: 'active',
      start_date: '',
      end_date: '',
      budget: 0,
      spent: 0,
      objectives: '',
      results: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (trial: Trial) => {
    setEditingTrial(trial);
    setFormData({
      trial_code: trial.trial_code,
      name: trial.name,
      product_id: trial.product_id || '',
      stage: trial.stage,
      status: trial.status,
      start_date: trial.start_date || '',
      end_date: trial.end_date || '',
      budget: trial.budget || 0,
      spent: trial.spent,
      objectives: trial.objectives || '',
      results: trial.results || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (trial: Trial) => deleteMutation.mutate(trial.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      product_id: formData.product_id || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      budget: formData.budget || null,
      objectives: formData.objectives || null,
      results: formData.results || null,
    };
    if (editingTrial) {
      await updateMutation.mutateAsync({ id: editingTrial.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="R&D Trials"
        description="Manage research trials and development projects"
        data={trials}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Trial"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTrial ? 'Edit Trial' : 'Create New Trial'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trial Code *</Label>
                <Input value={formData.trial_code} onChange={e => setFormData({ ...formData, trial_code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={formData.product_id || "none"} onValueChange={v => setFormData({ ...formData, product_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={formData.stage} onValueChange={v => setFormData({ ...formData, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stages.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget (₹)</Label>
                <Input type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Objectives</Label>
              <Textarea value={formData.objectives} onChange={e => setFormData({ ...formData, objectives: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Results</Label>
              <Textarea value={formData.results} onChange={e => setFormData({ ...formData, results: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingTrial ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
