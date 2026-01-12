import React, { useState } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { format } from 'date-fns';

interface Inward {
  id: string;
  inwardNumber: string;
  warehouseId: string;
  inwardDate: string;
  sourceType: 'production' | 'purchase' | 'transfer' | 'return';
  sourceRef: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  status: 'pending' | 'inspecting' | 'approved' | 'rejected';
  receivedBy: string;
  notes: string;
}

interface Warehouse { id: string; name: string; code: string; }

const initialInwards: Inward[] = [
  { id: '1', inwardNumber: 'INW-2024-001', warehouseId: '1', inwardDate: '2024-12-05', sourceType: 'production', sourceRef: 'BATCH-2024-089', productName: 'Bio-Fertilizer Pro', batchNumber: 'BT-001', quantity: 1000, status: 'approved', receivedBy: 'Ramesh K', notes: '' },
  { id: '2', inwardNumber: 'INW-2024-002', warehouseId: '1', inwardDate: '2024-12-06', sourceType: 'purchase', sourceRef: 'PO-2024-156', productName: 'Raw Material A', batchNumber: 'RM-A-001', quantity: 500, status: 'inspecting', receivedBy: 'Suresh P', notes: 'QC inspection pending' },
  { id: '3', inwardNumber: 'INW-2024-003', warehouseId: '2', inwardDate: '2024-12-07', sourceType: 'transfer', sourceRef: 'TRF-2024-001', productName: 'Organic Pesticide', batchNumber: 'OP-045', quantity: 300, status: 'approved', receivedBy: 'Manoj S', notes: '' },
  { id: '4', inwardNumber: 'INW-2024-004', warehouseId: '1', inwardDate: '2024-12-08', sourceType: 'return', sourceRef: 'RET-2024-012', productName: 'Growth Enhancer', batchNumber: 'GE-078', quantity: 50, status: 'pending', receivedBy: '', notes: 'Customer return - quality issue' },
];

export default function InwardPage() {
  const [inwards, setInwards] = useState<Inward[]>(initialInwards);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Inward | null>(null);
  const [formData, setFormData] = useState({
    inwardNumber: '',
    warehouseId: '',
    inwardDate: new Date().toISOString().split('T')[0],
    sourceType: 'production' as Inward['sourceType'],
    sourceRef: '',
    productName: '',
    batchNumber: '',
    quantity: 0,
    status: 'pending' as Inward['status'],
    receivedBy: '',
    notes: '',
  });

  const { data: warehouses = [] } = useSupabaseQuery<Warehouse>('warehouses', { select: 'id,name,code' });

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || `WH-${id}`;

  const columns: Column<Inward>[] = [
    { key: 'inwardNumber', label: 'Inward #', sortable: true },
    { key: 'warehouseId', label: 'Warehouse', render: (v) => getWarehouseName(v) },
    { key: 'inwardDate', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'sourceType', label: 'Source', sortable: true, render: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
    { key: 'productName', label: 'Product', sortable: true },
    { key: 'batchNumber', label: 'Batch #' },
    { key: 'quantity', label: 'Qty', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
          approved: 'success',
          inspecting: 'info',
          pending: 'warning',
          rejected: 'error',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value} dot />;
      },
    },
  ];

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      inwardNumber: `INW-${new Date().getFullYear()}-${String(inwards.length + 1).padStart(3, '0')}`,
      warehouseId: '',
      inwardDate: new Date().toISOString().split('T')[0],
      sourceType: 'production',
      sourceRef: '',
      productName: '',
      batchNumber: '',
      quantity: 0,
      status: 'pending',
      receivedBy: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Inward) => {
    setEditing(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Inward) => {
    setInwards(inwards.filter(i => i.id !== item.id));
  };

  const handleRefresh = () => {
    setInwards(initialInwards);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setInwards(inwards.map(i => i.id === editing.id ? { ...formData, id: editing.id } : i));
    } else {
      setInwards([...inwards, { ...formData, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Stock Inward"
        description="Record incoming stock entries"
        data={inwards}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        addLabel="New Inward"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Inward Entry' : 'Create New Inward'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inward Number</Label>
                <Input value={formData.inwardNumber} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Inward Date *</Label>
                <Input type="date" value={formData.inwardDate} onChange={e => setFormData({ ...formData, inwardDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Warehouse *</Label>
                <Select value={formData.warehouseId || 'none'} onValueChange={v => setFormData({ ...formData, warehouseId: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select warehouse</SelectItem>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source Type *</Label>
                <Select value={formData.sourceType} onValueChange={v => setFormData({ ...formData, sourceType: v as Inward['sourceType'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source Reference</Label>
                <Input value={formData.sourceRef} onChange={e => setFormData({ ...formData, sourceRef: e.target.value })} placeholder="e.g. PO-2024-001" />
              </div>
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Received By</Label>
                <Input value={formData.receivedBy} onChange={e => setFormData({ ...formData, receivedBy: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as Inward['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inspecting">Inspecting</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
