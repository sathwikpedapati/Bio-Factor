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

interface Recruitment {
  id: string;
  job_title: string;
  department: string;
  location: string | null;
  no_of_positions: number;
  experience_required: string | null;
  skills_required: string | null;
  status: string;
  posted_date: string;
  closing_date: string | null;
  applications_count: number | null;
  created_at: string;
}

const departments = ['Sales', 'Manufacturing', 'QC', 'Warehouse', 'Finance', 'HR', 'Field Ops', 'R&D', 'Admin'];
const jobStatuses = ['Open', 'Closed', 'On Hold', 'Filled'];

export default function RecruitmentPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Recruitment | null>(null);
  const [formData, setFormData] = useState({
    job_title: '',
    department: '',
    location: '',
    no_of_positions: 1,
    experience_required: '',
    skills_required: '',
    status: 'Open',
    posted_date: new Date().toISOString().split('T')[0],
    closing_date: '',
  });

  const { data: jobs = [], isLoading, refetch } = useSupabaseQuery<Recruitment>('recruitment', {
    orderBy: { column: 'posted_date', ascending: false }
  });

  const insertMutation = useSupabaseInsert<Recruitment>('recruitment');
  const updateMutation = useSupabaseUpdate<Recruitment>('recruitment');
  const deleteMutation = useSupabaseDelete('recruitment');

  const columns: Column<Recruitment>[] = [
    { key: 'job_title', label: 'Job Title', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'no_of_positions', label: 'Positions', sortable: true },
    { key: 'experience_required', label: 'Experience', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
          Open: 'success',
          Closed: 'error',
          'On Hold': 'warning',
          Filled: 'info',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value} dot />;
      },
    },
    {
      key: 'posted_date',
      label: 'Posted',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy'),
    },
  ];

  const handleAdd = () => {
    setEditingJob(null);
    setFormData({
      job_title: '',
      department: '',
      location: '',
      no_of_positions: 1,
      experience_required: '',
      skills_required: '',
      status: 'Open',
      posted_date: new Date().toISOString().split('T')[0],
      closing_date: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (job: Recruitment) => {
    setEditingJob(job);
    setFormData({
      job_title: job.job_title,
      department: job.department,
      location: job.location || '',
      no_of_positions: job.no_of_positions,
      experience_required: job.experience_required || '',
      skills_required: job.skills_required || '',
      status: job.status,
      posted_date: job.posted_date,
      closing_date: job.closing_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (job: Recruitment) => {
    await deleteMutation.mutateAsync(job.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      closing_date: formData.closing_date || null,
    };

    if (editingJob) {
      await updateMutation.mutateAsync({ id: editingJob.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Recruitment"
        description="Manage job postings and recruitment process"
        data={jobs}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Job Opening"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job Opening' : 'Create Job Opening'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                  required
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_of_positions">Number of Positions</Label>
                <Input
                  id="no_of_positions"
                  type="number"
                  min="1"
                  value={formData.no_of_positions}
                  onChange={e => setFormData({ ...formData, no_of_positions: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience_required">Experience Required</Label>
                <Input
                  id="experience_required"
                  placeholder="e.g., 2-3 years"
                  value={formData.experience_required}
                  onChange={e => setFormData({ ...formData, experience_required: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="posted_date">Posted Date *</Label>
                <Input
                  id="posted_date"
                  type="date"
                  value={formData.posted_date}
                  onChange={e => setFormData({ ...formData, posted_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing_date">Closing Date</Label>
                <Input
                  id="closing_date"
                  type="date"
                  value={formData.closing_date}
                  onChange={e => setFormData({ ...formData, closing_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills_required">Skills Required</Label>
              <Textarea
                id="skills_required"
                placeholder="List required skills (one per line or comma-separated)"
                value={formData.skills_required}
                onChange={e => setFormData({ ...formData, skills_required: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingJob ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
