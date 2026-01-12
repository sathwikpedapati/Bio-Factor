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

interface FieldVisit {
  id: string;
  visit_type: string;
  visit_date: string;
  location: string | null;
  farmer_id: string | null;
  employee_id: string | null;
  purpose: string | null;
  outcome: string | null;
  issues_reported: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
}

interface Farmer { id: string; name: string; }
interface Employee { id: string; full_name: string; }

const visitTypes = ['Demo', 'Follow-up', 'Complaint Resolution', 'Sales Visit', 'Training', 'Survey'];

export default function VisitsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<FieldVisit | null>(null);
  const [formData, setFormData] = useState({
    visit_type: '',
    visit_date: new Date().toISOString().split('T')[0],
    location: '',
    farmer_id: '',
    purpose: '',
    outcome: '',
    issues_reported: '',
  });

  const { data: visits = [], isLoading, refetch } = useSupabaseQuery<FieldVisit>('field_visits', {
    orderBy: { column: 'visit_date', ascending: false }
  });
  const { data: farmers = [] } = useSupabaseQuery<Farmer>('farmers', { select: 'id,name' });

  const insertMutation = useSupabaseInsert<FieldVisit>('field_visits');
  const updateMutation = useSupabaseUpdate<FieldVisit>('field_visits');
  const deleteMutation = useSupabaseDelete('field_visits');

  const getFarmerName = (id: string | null) => farmers.find(f => f.id === id)?.name || '-';

  const columns: Column<FieldVisit>[] = [
    { key: 'visit_type', label: 'Type', sortable: true },
    { key: 'visit_date', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'farmer_id', label: 'Farmer', render: (v) => getFarmerName(v) },
    { key: 'purpose', label: 'Purpose' },
    {
      key: 'outcome',
      label: 'Outcome',
      render: (value) => {
        if (!value) return '-';
        const statusMap: Record<string, 'success' | 'warning' | 'info'> = {
          successful: 'success',
          pending: 'warning',
          follow_up_needed: 'info',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value?.replace('_', ' ')} dot />;
      },
    },
  ];

  const handleAdd = () => {
    setEditingVisit(null);
    setFormData({
      visit_type: '',
      visit_date: new Date().toISOString().split('T')[0],
      location: '',
      farmer_id: '',
      purpose: '',
      outcome: '',
      issues_reported: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (visit: FieldVisit) => {
    setEditingVisit(visit);
    setFormData({
      visit_type: visit.visit_type,
      visit_date: visit.visit_date,
      location: visit.location || '',
      farmer_id: visit.farmer_id || '',
      purpose: visit.purpose || '',
      outcome: visit.outcome || '',
      issues_reported: visit.issues_reported || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (visit: FieldVisit) => {
    await deleteMutation.mutateAsync(visit.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      farmer_id: formData.farmer_id || null,
      location: formData.location || null,
      purpose: formData.purpose || null,
      outcome: formData.outcome || null,
      issues_reported: formData.issues_reported || null,
    };
    if (editingVisit) {
      await updateMutation.mutateAsync({ id: editingVisit.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Field Visits"
        description="Track field activities and farmer visits"
        data={visits}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Log Visit"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingVisit ? 'Edit Visit' : 'Log Field Visit'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visit Type *</Label>
                <Select value={formData.visit_type} onValueChange={v => setFormData({ ...formData, visit_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {visitTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visit Date *</Label>
                <Input type="date" value={formData.visit_date} onChange={e => setFormData({ ...formData, visit_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Farmer</Label>
                <Select value={formData.farmer_id || "none"} onValueChange={v => setFormData({ ...formData, farmer_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select farmer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {farmers.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Purpose</Label>
                <Input value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Outcome</Label>
                <Select value={formData.outcome || "none"} onValueChange={v => setFormData({ ...formData, outcome: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Pending</SelectItem>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Issues Reported</Label>
              <Textarea value={formData.issues_reported} onChange={e => setFormData({ ...formData, issues_reported: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingVisit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
