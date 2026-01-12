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

interface ProductionBatch {
  id: string;
  batch_number: string;
  product_id: string;
  planned_quantity: number;
  actual_quantity: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  machine_id: string | null;
  cost_per_unit: number | null;
  total_cost: number | null;
  notes: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function BatchesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  const [formData, setFormData] = useState({
    batch_number: '',
    product_id: '',
    planned_quantity: 0,
    actual_quantity: 0,
    status: 'planned',
    start_date: '',
    end_date: '',
    machine_id: '',
    cost_per_unit: 0,
    notes: '',
  });

  const { data: batches = [], isLoading, refetch } = useSupabaseQuery<ProductionBatch>('production_batches', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const { data: products = [] } = useSupabaseQuery<Product>('products', {
    select: 'id,name,sku'
  });

  const insertMutation = useSupabaseInsert<ProductionBatch>('production_batches');
  const updateMutation = useSupabaseUpdate<ProductionBatch>('production_batches');
  const deleteMutation = useSupabaseDelete('production_batches');

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown';
  };

  const columns: Column<ProductionBatch>[] = [
    { key: 'batch_number', label: 'Batch #', sortable: true },
    {
      key: 'product_id',
      label: 'Product',
      sortable: true,
      render: (value) => getProductName(value),
    },
    { key: 'planned_quantity', label: 'Planned', sortable: true },
    { key: 'actual_quantity', label: 'Actual', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'info' | 'warning' | 'pending' | 'error'> = {
          completed: 'success',
          in_progress: 'info',
          planned: 'pending',
          on_hold: 'warning',
          cancelled: 'error',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value?.replace('_', ' ')} dot />;
      },
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-',
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-',
    },
    {
      key: 'total_cost',
      label: 'Total Cost',
      sortable: true,
      render: (value) => value ? `₹${value.toLocaleString()}` : '-',
    },
  ];

  const handleAdd = () => {
    setEditingBatch(null);
    setFormData({
      batch_number: `BATCH-${Date.now()}`,
      product_id: '',
      planned_quantity: 0,
      actual_quantity: 0,
      status: 'planned',
      start_date: '',
      end_date: '',
      machine_id: '',
      cost_per_unit: 0,
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (batch: ProductionBatch) => {
    setEditingBatch(batch);
    setFormData({
      batch_number: batch.batch_number,
      product_id: batch.product_id,
      planned_quantity: batch.planned_quantity,
      actual_quantity: batch.actual_quantity,
      status: batch.status,
      start_date: batch.start_date || '',
      end_date: batch.end_date || '',
      machine_id: batch.machine_id || '',
      cost_per_unit: batch.cost_per_unit || 0,
      notes: batch.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (batch: ProductionBatch) => {
    deleteMutation.mutate(batch.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalCost = formData.actual_quantity * formData.cost_per_unit;
    const submitData = {
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      machine_id: formData.machine_id || null,
      cost_per_unit: formData.cost_per_unit || null,
      total_cost: totalCost || null,
    };

    if (editingBatch) {
      await updateMutation.mutateAsync({ id: editingBatch.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Production Batches"
        description="Manage manufacturing batches and track production"
        data={batches}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Batch"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch_number">Batch Number *</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_id">Product *</Label>
                <Select value={formData.product_id} onValueChange={v => setFormData({ ...formData, product_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planned_quantity">Planned Quantity *</Label>
                <Input
                  id="planned_quantity"
                  type="number"
                  value={formData.planned_quantity}
                  onChange={e => setFormData({ ...formData, planned_quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_quantity">Actual Quantity</Label>
                <Input
                  id="actual_quantity"
                  type="number"
                  value={formData.actual_quantity}
                  onChange={e => setFormData({ ...formData, actual_quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine_id">Machine ID</Label>
                <Input
                  id="machine_id"
                  value={formData.machine_id}
                  onChange={e => setFormData({ ...formData, machine_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
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
                <Label htmlFor="cost_per_unit">Cost per Unit (₹)</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_unit}
                  onChange={e => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <div className="px-3 py-2 bg-muted rounded-md font-semibold">
                  ₹{(formData.actual_quantity * formData.cost_per_unit).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingBatch ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
