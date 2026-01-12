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

interface FieldDemo {
  id: string;
  demo_type: string;
  title: string;
  description: string | null;
  demo_date: string;
  location: string | null;
  farmer_id: string | null;
  product_id: string | null;
  outcome: string | null;
  attendance: number | null;
  status: string;
  created_at: string;
}

interface Farmer { id: string; name: string; }
interface Product { id: string; name: string; }

const demoTypes = ['Product Demo', 'Training', 'Workshop', 'Field Trial', 'Awareness Campaign'];
const demoStatuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

export default function DemosAndIssuesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState<FieldDemo | null>(null);
  const [formData, setFormData] = useState({
    demo_type: '',
    title: '',
    description: '',
    demo_date: new Date().toISOString().split('T')[0],
    location: '',
    farmer_id: '',
    product_id: '',
    outcome: '',
    attendance: 0,
    status: 'Scheduled',
  });

  const { data: demos = [], isLoading, refetch } = useSupabaseQuery<FieldDemo>('field_demos', {
    orderBy: { column: 'demo_date', ascending: false }
  });
  const { data: farmers = [] } = useSupabaseQuery<Farmer>('farmers', { select: 'id,name' });
  const { data: products = [] } = useSupabaseQuery<Product>('products', { select: 'id,name' });

  const insertMutation = useSupabaseInsert<FieldDemo>('field_demos');
  const updateMutation = useSupabaseUpdate<FieldDemo>('field_demos');
  const deleteMutation = useSupabaseDelete('field_demos');

  const getFarmerName = (id: string | null) => farmers.find(f => f.id === id)?.name || '-';
  const getProductName = (id: string | null) => products.find(p => p.id === id)?.name || '-';

  const columns: Column<FieldDemo>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'demo_type', label: 'Type', sortable: true },
    { key: 'demo_date', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'farmer_id', label: 'Farmer', render: (v) => getFarmerName(v) },
    { key: 'product_id', label: 'Product', render: (v) => getProductName(v) },
    { key: 'attendance', label: 'Attendance', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
          Completed: 'success',
          'In Progress': 'info',
          Scheduled: 'warning',
          Cancelled: 'error',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value} dot />;
      },
    },
  ];

  const handleAdd = () => {
    setEditingDemo(null);
    setFormData({
      demo_type: '',
      title: '',
      description: '',
      demo_date: new Date().toISOString().split('T')[0],
      location: '',
      farmer_id: '',
      product_id: '',
      outcome: '',
      attendance: 0,
      status: 'Scheduled',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (demo: FieldDemo) => {
    setEditingDemo(demo);
    setFormData({
      demo_type: demo.demo_type,
      title: demo.title,
      description: demo.description || '',
      demo_date: demo.demo_date,
      location: demo.location || '',
      farmer_id: demo.farmer_id || '',
      product_id: demo.product_id || '',
      outcome: demo.outcome || '',
      attendance: demo.attendance || 0,
      status: demo.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (demo: FieldDemo) => {
    await deleteMutation.mutateAsync(demo.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      farmer_id: formData.farmer_id || null,
      product_id: formData.product_id || null,
      outcome: formData.outcome || null,
    };

    if (editingDemo) {
      await updateMutation.mutateAsync({ id: editingDemo.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Field Demonstrations & Issues"
        description="Manage field demos, trials, and farmer issues"
        data={demos}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Demo"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDemo ? 'Edit Demonstration' : 'Create Demonstration'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo_type">Type *</Label>
                <Select value={formData.demo_type} onValueChange={v => setFormData({ ...formData, demo_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo_date">Date *</Label>
                <Input
                  id="demo_date"
                  type="date"
                  value={formData.demo_date}
                  onChange={e => setFormData({ ...formData, demo_date: e.target.value })}
                  required
                />
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
                <Label htmlFor="farmer_id">Farmer</Label>
                <Select value={formData.farmer_id} onValueChange={v => setFormData({ ...formData, farmer_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map(farmer => (
                      <SelectItem key={farmer.id} value={farmer.id}>{farmer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_id">Product</Label>
                <Select value={formData.product_id} onValueChange={v => setFormData({ ...formData, product_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance">Attendance</Label>
                <Input
                  id="attendance"
                  type="number"
                  min="0"
                  value={formData.attendance}
                  onChange={e => setFormData({ ...formData, attendance: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {demoStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Event description and details"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome / Feedback</Label>
              <Textarea
                id="outcome"
                placeholder="Results and feedback from demo"
                value={formData.outcome}
                onChange={e => setFormData({ ...formData, outcome: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingDemo ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
