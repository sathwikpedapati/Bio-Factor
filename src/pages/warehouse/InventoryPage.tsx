import React, { useState } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/useSupabaseQuery';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface Stock {
  id: string;
  product_id: string;
  warehouse_id: string;
  batch_number: string | null;
  quantity: number;
  status: string;
  expiry_date: string | null;
  created_at: string;
}

interface Product { id: string; name: string; sku: string; }
interface Warehouse { id: string; name: string; code: string; }

export default function InventoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    batch_number: '',
    quantity: 0,
    status: 'available',
    expiry_date: '',
  });

  const { data: stocks = [], isLoading, refetch } = useSupabaseQuery<Stock>('stocks', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: products = [] } = useSupabaseQuery<Product>('products', { select: 'id,name,sku' });
  const { data: warehouses = [] } = useSupabaseQuery<Warehouse>('warehouses', { select: 'id,name,code' });

  const insertMutation = useSupabaseInsert<Stock>('stocks');
  const updateMutation = useSupabaseUpdate<Stock>('stocks');
  const deleteMutation = useSupabaseDelete('stocks');

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || '-';
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '-';

  const columns: Column<Stock>[] = [
    { key: 'product_id', label: 'Product', sortable: true, render: (v) => getProductName(v) },
    { key: 'warehouse_id', label: 'Warehouse', sortable: true, render: (v) => getWarehouseName(v) },
    { key: 'batch_number', label: 'Batch #', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge
          status={value === 'available' ? 'success' : value === 'reserved' ? 'warning' : 'error'}
          label={value}
          dot
        />
      ),
    },
    {
      key: 'expiry_date',
      label: 'Expiry',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-',
    },
  ];

  const handleAdd = () => {
    setEditingStock(null);
    setFormData({ product_id: '', warehouse_id: '', batch_number: '', quantity: 0, status: 'available', expiry_date: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      product_id: stock.product_id,
      warehouse_id: stock.warehouse_id,
      batch_number: stock.batch_number || '',
      quantity: stock.quantity,
      status: stock.status,
      expiry_date: stock.expiry_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (stock: Stock) => deleteMutation.mutate(stock.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData, expiry_date: formData.expiry_date || null, batch_number: formData.batch_number || null };
    if (editingStock) {
      await updateMutation.mutateAsync({ id: editingStock.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Inventory"
        description="Manage warehouse inventory and stock levels"
        data={stocks}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Add Stock"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStock ? 'Edit Stock' : 'Add Stock Entry'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select value={formData.product_id} onValueChange={v => setFormData({ ...formData, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Warehouse *</Label>
                <Select value={formData.warehouse_id} onValueChange={v => setFormData({ ...formData, warehouse_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input value={formData.batch_number} onChange={e => setFormData({ ...formData, batch_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingStock ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
