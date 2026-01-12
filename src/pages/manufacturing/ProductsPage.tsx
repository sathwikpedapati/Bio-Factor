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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string | null;
  price: number;
  cost: number | null;
  unit: string;
  min_stock_level: number;
  status: string;
  created_at: string;
}

const categories = ['Bio-Fertilizer', 'Pesticide', 'Growth Enhancer', 'Soil Conditioner', 'Micro Nutrients', 'Seeds'];
const units = ['kg', 'litre', 'piece', 'packet', 'bag'];

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    price: 0,
    cost: 0,
    unit: 'kg',
    min_stock_level: 0,
    status: 'active',
  });

  const { data: products = [], isLoading, refetch } = useSupabaseQuery<Product>('products', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const insertMutation = useSupabaseInsert<Product>('products');
  const updateMutation = useSupabaseUpdate<Product>('products');
  const deleteMutation = useSupabaseDelete('products');

  const columns: Column<Product>[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true, render: (v) => `₹${(v || 0).toLocaleString()}` },
    { key: 'cost', label: 'Cost', sortable: true, render: (v) => v ? `₹${v.toLocaleString()}` : '-' },
    { key: 'unit', label: 'Unit' },
    { key: 'min_stock_level', label: 'Min Stock', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge status={value === 'active' ? 'success' : 'error'} label={value} dot />
      ),
    },
  ];

  const handleAdd = () => {
    setEditing(null);
    setFormData({ name: '', sku: '', category: '', description: '', price: 0, cost: 0, unit: 'kg', min_stock_level: 0, status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Product) => {
    setEditing(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      description: item.description || '',
      price: item.price,
      cost: item.cost || 0,
      unit: item.unit,
      min_stock_level: item.min_stock_level,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Product) => deleteMutation.mutate(item.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData, description: formData.description || null, cost: formData.cost || null };
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
        title="Products"
        description="Manage product catalog"
        data={products}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Add Product"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={formData.unit} onValueChange={v => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Cost (₹)</Label>
                <Input type="number" value={formData.cost} onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Min Stock Level</Label>
                <Input type="number" value={formData.min_stock_level} onChange={e => setFormData({ ...formData, min_stock_level: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
