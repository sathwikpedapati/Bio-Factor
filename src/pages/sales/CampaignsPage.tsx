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
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  type: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  spent: number | null;
  target: number | null;
  achieved: number | null;
  reach: number | null;
  created_at: string;
}

const campaignTypes = ['Product Launch', 'Dealer Incentive', 'Farmer Demo', 'Brand Awareness', 'Seasonal Promotion', 'Digital Marketing'];

export default function CampaignsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    status: 'planned',
    start_date: '',
    end_date: '',
    budget: 0,
    spent: 0,
    target: 0,
    achieved: 0,
    reach: 0,
  });

  const { data: campaigns = [], isLoading, refetch } = useSupabaseQuery<Campaign>('campaigns', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const insertMutation = useSupabaseInsert<Campaign>('campaigns');
  const updateMutation = useSupabaseUpdate<Campaign>('campaigns');
  const deleteMutation = useSupabaseDelete('campaigns');

  const columns: Column<Campaign>[] = [
    { key: 'name', label: 'Campaign Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'info' | 'warning' | 'pending'> = {
          active: 'success',
          completed: 'info',
          planned: 'warning',
          paused: 'pending',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value} dot />;
      },
    },
    {
      key: 'start_date',
      label: 'Duration',
      render: (_, row) => {
        const start = row.start_date ? format(new Date(row.start_date), 'dd MMM') : '-';
        const end = row.end_date ? format(new Date(row.end_date), 'dd MMM yyyy') : '-';
        return `${start} - ${end}`;
      },
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      render: (value) => `₹${((value || 0) / 100000).toFixed(1)}L`,
    },
    {
      key: 'spent',
      label: 'Progress',
      render: (_, row) => {
        const progress = row.budget ? ((row.spent || 0) / row.budget) * 100 : 0;
        return (
          <div className="w-24">
            <Progress value={progress} className="h-2" />
            <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
          </div>
        );
      },
    },
    {
      key: 'achieved',
      label: 'Achievement',
      render: (_, row) => {
        const progress = row.target ? ((row.achieved || 0) / row.target) * 100 : 0;
        return `${row.achieved || 0}/${row.target || 0} (${progress.toFixed(0)}%)`;
      },
    },
  ];

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      name: '',
      type: '',
      description: '',
      status: 'planned',
      start_date: '',
      end_date: '',
      budget: 0,
      spent: 0,
      target: 0,
      achieved: 0,
      reach: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Campaign) => {
    setEditing(item);
    setFormData({
      name: item.name,
      type: item.type,
      description: item.description || '',
      status: item.status || 'planned',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      budget: item.budget || 0,
      spent: item.spent || 0,
      target: item.target || 0,
      achieved: item.achieved || 0,
      reach: item.reach || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Campaign) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      description: formData.description || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };
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
        title="Marketing Campaigns"
        description="Manage marketing campaigns and track performance"
        data={campaigns}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Campaign"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {campaignTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
              <div className="space-y-2">
                <Label>Spent (₹)</Label>
                <Input type="number" value={formData.spent} onChange={e => setFormData({ ...formData, spent: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Input type="number" value={formData.target} onChange={e => setFormData({ ...formData, target: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Achieved</Label>
                <Input type="number" value={formData.achieved} onChange={e => setFormData({ ...formData, achieved: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Reach</Label>
                <Input type="number" value={formData.reach} onChange={e => setFormData({ ...formData, reach: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
