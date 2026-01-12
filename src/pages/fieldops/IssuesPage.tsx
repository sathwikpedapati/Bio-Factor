import React, { useState, useMemo } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/useSupabaseQuery';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Issue {
  id: string;
  title: string;
  issue_type: string;
  reported_date: string;
  location: string;
  farmer_name: string;
  description: string;
  severity: string;
  status: string;
  assigned_to: string;
  resolution: string | null;
  created_at: string;
}

export default function IssuesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    issue_type: 'Crop Disease',
    reported_date: new Date().toISOString().split('T')[0],
    location: '',
    farmer_name: '',
    description: '',
    severity: 'medium',
    assigned_to: '',
  });

  const { data: issues = [], isLoading, refetch } = useSupabaseQuery<Issue>('issues', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const insertMutation = useSupabaseInsert<Issue>('issues');
  const updateMutation = useSupabaseUpdate<Issue>('issues');
  const deleteMutation = useSupabaseDelete('issues');
  const { user } = useAuth();

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           issue.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, statusFilter]);

  const handleAdd = async () => {
    if (!formData.title || !formData.location) {
      alert('Please fill in required fields');
      return;
    }

    await insertMutation.mutateAsync({
      id: crypto.randomUUID(),
      title: formData.title,
      issue_type: formData.issue_type,
      reported_date: formData.reported_date,
      location: formData.location,
      farmer_name: formData.farmer_name,
      description: formData.description,
      severity: formData.severity,
      status: 'open',
      assigned_to: formData.assigned_to,
      resolution: null,
      created_at: new Date().toISOString(),
      created_by: user?.id ?? null,
    });

    setIsDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleEdit = async () => {
    if (!editingIssue) return;

    await updateMutation.mutateAsync({
      ...editingIssue,
      title: formData.title,
      issue_type: formData.issue_type,
      reported_date: formData.reported_date,
      location: formData.location,
      farmer_name: formData.farmer_name,
      description: formData.description,
      severity: formData.severity,
      assigned_to: formData.assigned_to,
    });

    setIsDialogOpen(false);
    setEditingIssue(null);
    resetForm();
    refetch();
  };

  const handleDelete = async (issue: Issue) => {
    await deleteMutation.mutateAsync(issue.id);
    refetch();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issue_type: 'Crop Disease',
      reported_date: new Date().toISOString().split('T')[0],
      location: '',
      farmer_name: '',
      description: '',
      severity: 'medium',
      assigned_to: '',
    });
  };

  const onEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setFormData({
      title: issue.title,
      issue_type: issue.issue_type,
      reported_date: issue.reported_date,
      location: issue.location,
      farmer_name: issue.farmer_name,
      description: issue.description,
      severity: issue.severity,
      assigned_to: issue.assigned_to,
    });
    setIsDialogOpen(true);
  };

  const columns: Column[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'issue_type', label: 'Type', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'farmer_name', label: 'Farmer', sortable: true },
    {
      key: 'severity',
      label: 'Severity',
      render: (value: string) => {
        const color = value === 'high' ? 'error' : value === 'medium' ? 'warning' : 'info';
        return <StatusBadge status={color} label={value} dot />;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge
          status={value === 'resolved' ? 'success' : value === 'in_progress' ? 'info' : 'warning'}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          dot
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Field Issues</h1>
        <Button onClick={() => { resetForm(); setEditingIssue(null); setIsDialogOpen(true); }}>
          Add Issue
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by title, location or farmer..."
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
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <CrudPage
        title="Issues"
        data={filteredIssues}
        columns={columns}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIssue ? 'Edit Issue' : 'Add New Issue'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="issue_type">Issue Type</Label>
              <Select value={formData.issue_type} onValueChange={(value) => setFormData({ ...formData, issue_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crop Disease">Crop Disease</SelectItem>
                  <SelectItem value="Pest Infestation">Pest Infestation</SelectItem>
                  <SelectItem value="Weed Management">Weed Management</SelectItem>
                  <SelectItem value="Soil Issue">Soil Issue</SelectItem>
                  <SelectItem value="Water Management">Water Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reported_date">Reported Date</Label>
              <Input
                id="reported_date"
                type="date"
                value={formData.reported_date}
                onChange={(e) => setFormData({ ...formData, reported_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="farmer_name">Farmer Name</Label>
              <Input
                id="farmer_name"
                value={formData.farmer_name}
                onChange={(e) => setFormData({ ...formData, farmer_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              />
            </div>
            <Button onClick={editingIssue ? handleEdit : handleAdd} className="w-full">
              {editingIssue ? 'Update' : 'Add'} Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
