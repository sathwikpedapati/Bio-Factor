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

interface Research {
  id: string;
  title: string;
  description: string | null;
  research_type: string;
  principal_investigator: string | null;
  start_date: string;
  end_date: string | null;
  budget: number | null;
  status: string;
  research_area: string | null;
  methodology: string | null;
  created_at: string;
}

const researchTypes = ['Product Development', 'Process Improvement', 'Quality Enhancement', 'Sustainability', 'Market Research'];
const researchAreas = ['Crop Science', 'Soil Science', 'Pest Management', 'Agronomy', 'Nutrition', 'Biotechnology'];
const researchStatuses = ['Planning', 'Active', 'On Hold', 'Completed', 'Published'];

export default function ResearchPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResearch, setEditingResearch] = useState<Research | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    research_type: '',
    principal_investigator: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget: 0,
    status: 'Planning',
    research_area: '',
    methodology: '',
  });

  const { data: research = [], isLoading, refetch } = useSupabaseQuery<Research>('research', {
    orderBy: { column: 'start_date', ascending: false }
  });

  const insertMutation = useSupabaseInsert<Research>('research');
  const updateMutation = useSupabaseUpdate<Research>('research');
  const deleteMutation = useSupabaseDelete('research');

  const columns: Column<Research>[] = [
    { key: 'title', label: 'Research Title', sortable: true },
    { key: 'research_type', label: 'Type', sortable: true },
    { key: 'research_area', label: 'Area', sortable: true },
    { key: 'principal_investigator', label: 'PI', sortable: true },
    { key: 'start_date', label: 'Start Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'end_date', label: 'End Date', sortable: true, render: (v) => v ? format(new Date(v), 'dd MMM yyyy') : '-' },
    { key: 'budget', label: 'Budget', sortable: true, render: (v) => v ? `₹${(v || 0).toLocaleString()}` : '-' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'info' | 'warning' | 'error' | 'pending'> = {
          Completed: 'success',
          Published: 'success',
          Active: 'info',
          Planning: 'warning',
          'On Hold': 'error',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value} dot />;
      },
    },
  ];

  const handleAdd = () => {
    setEditingResearch(null);
    setFormData({
      title: '',
      description: '',
      research_type: '',
      principal_investigator: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      budget: 0,
      status: 'Planning',
      research_area: '',
      methodology: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Research) => {
    setEditingResearch(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      research_type: item.research_type,
      principal_investigator: item.principal_investigator || '',
      start_date: item.start_date,
      end_date: item.end_date || '',
      budget: item.budget || 0,
      status: item.status,
      research_area: item.research_area || '',
      methodology: item.methodology || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Research) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      end_date: formData.end_date || null,
      budget: formData.budget || null,
    };

    if (editingResearch) {
      await updateMutation.mutateAsync({ id: editingResearch.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Research Projects"
        description="Manage R&D research projects and innovations"
        data={research}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Research"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingResearch ? 'Edit Research' : 'New Research Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Research Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="research_type">Type *</Label>
                <Select value={formData.research_type} onValueChange={v => setFormData({ ...formData, research_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="research_area">Research Area</Label>
                <Select value={formData.research_area} onValueChange={v => setFormData({ ...formData, research_area: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchAreas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="principal_investigator">Principal Investigator</Label>
                <Input
                  id="principal_investigator"
                  value={formData.principal_investigator}
                  onChange={e => setFormData({ ...formData, principal_investigator: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {researchStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Research objectives and overview"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="methodology">Methodology</Label>
              <Textarea
                id="methodology"
                placeholder="Research methodology and approach"
                value={formData.methodology}
                onChange={e => setFormData({ ...formData, methodology: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingResearch ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
