import React, { useState, useMemo } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/useSupabaseQuery';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Demo {
  id: string;
  title: string;
  demo_type: string;
  date: string;
  location: string;
  farmer_id: string;
  farmer_name: string;
  product: string;
  attendance: number;
  outcomes: string;
  status: string;
  created_at: string;
}

export default function DemosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState<Demo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    demo_type: 'Product Demo',
    date: new Date().toISOString().split('T')[0],
    location: '',
    farmer_name: '',
    product: '',
    attendance: 0,
    outcomes: '',
  });

  const { data: demos = [], isLoading, refetch } = useSupabaseQuery<Demo>('demos', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const insertMutation = useSupabaseInsert<Demo>('demos');
  const updateMutation = useSupabaseUpdate<Demo>('demos');
  const deleteMutation = useSupabaseDelete('demos');

  const filteredDemos = useMemo(() => {
    return demos.filter(demo => {
      const matchesSearch = demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           demo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           demo.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || demo.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [demos, searchQuery, statusFilter]);

  const handleAdd = async () => {
    if (!formData.title || !formData.location) {
      alert('Please fill in required fields');
      return;
    }

    await insertMutation.mutateAsync({
      id: crypto.randomUUID(),
      title: formData.title,
      demo_type: formData.demo_type,
      date: formData.date,
      location: formData.location,
      farmer_id: crypto.randomUUID(),
      farmer_name: formData.farmer_name,
      product: formData.product,
      attendance: formData.attendance,
      outcomes: formData.outcomes,
      status: 'completed',
      created_at: new Date().toISOString(),
    });

    setIsDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleEdit = async () => {
    if (!editingDemo) return;

    await updateMutation.mutateAsync({
      ...editingDemo,
      title: formData.title,
      demo_type: formData.demo_type,
      date: formData.date,
      location: formData.location,
      farmer_name: formData.farmer_name,
      product: formData.product,
      attendance: formData.attendance,
      outcomes: formData.outcomes,
    });

    setIsDialogOpen(false);
    setEditingDemo(null);
    resetForm();
    refetch();
  };

  const handleDelete = async (demo: Demo) => {
    await deleteMutation.mutateAsync(demo.id);
    refetch();
  };

  const handleRefresh = () => {
    refetch();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      demo_type: 'Product Demo',
      date: new Date().toISOString().split('T')[0],
      location: '',
      farmer_name: '',
      product: '',
      attendance: 0,
      outcomes: '',
    });
  };

  const onEdit = (demo: Demo) => {
    setEditingDemo(demo);
    setFormData({
      title: demo.title,
      demo_type: demo.demo_type,
      date: demo.date,
      location: demo.location,
      farmer_name: demo.farmer_name,
      product: demo.product,
      attendance: demo.attendance,
      outcomes: demo.outcomes,
    });
    setIsDialogOpen(true);
  };

  const columns: Column[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'demo_type', label: 'Type', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'farmer_name', label: 'Farmer', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'attendance', label: 'Attendance', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge
          status={value === 'completed' ? 'success' : 'warning'}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          dot
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Field Demonstrations</h1>
        <Button onClick={() => { resetForm(); setEditingDemo(null); setIsDialogOpen(true); }}>
          Add Demo
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
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <CrudPage
        title="Demonstrations"
        data={filteredDemos}
        columns={columns}
        isLoading={isLoading}
        onAdd={() => { resetForm(); setEditingDemo(null); setIsDialogOpen(true); }}
        onEdit={onEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        addLabel="New Demo"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDemo ? 'Edit Demo' : 'Add New Demo'}</DialogTitle>
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
              <Label htmlFor="demo_type">Demo Type</Label>
              <Select value={formData.demo_type} onValueChange={(value) => setFormData({ ...formData, demo_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Demo">Product Demo</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Field Trial">Field Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="attendance">Attendance</Label>
              <Input
                id="attendance"
                type="number"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="outcomes">Outcomes</Label>
              <Textarea
                id="outcomes"
                value={formData.outcomes}
                onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
              />
            </div>
            <Button onClick={editingDemo ? handleEdit : handleAdd} className="w-full">
              {editingDemo ? 'Update' : 'Add'} Demo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
