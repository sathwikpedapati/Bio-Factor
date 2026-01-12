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

interface Transfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  transferDate: string;
  status: 'pending' | 'approved' | 'in_transit' | 'received' | 'cancelled';
  items: { productName: string; quantity: number }[];
  totalQuantity: number;
  requestedBy: string;
  approvedBy: string;
  notes: string;
}

interface Warehouse { id: string; name: string; code: string; }

const initialTransfers: Transfer[] = [
  { id: '1', transferNumber: 'TRF-2024-001', fromWarehouseId: '1', toWarehouseId: '2', transferDate: '2024-12-05', status: 'received', items: [{ productName: 'Bio-Fertilizer Pro', quantity: 500 }], totalQuantity: 500, requestedBy: 'Suresh Kumar', approvedBy: 'Manager A', notes: '' },
  { id: '2', transferNumber: 'TRF-2024-002', fromWarehouseId: '2', toWarehouseId: '1', transferDate: '2024-12-06', status: 'in_transit', items: [{ productName: 'Organic Pesticide X', quantity: 300 }], totalQuantity: 300, requestedBy: 'Ramesh Singh', approvedBy: 'Manager B', notes: 'Urgent transfer' },
  { id: '3', transferNumber: 'TRF-2024-003', fromWarehouseId: '1', toWarehouseId: '3', transferDate: '2024-12-07', status: 'approved', items: [{ productName: 'Growth Enhancer', quantity: 200 }], totalQuantity: 200, requestedBy: 'Manoj Patil', approvedBy: '', notes: '' },
  { id: '4', transferNumber: 'TRF-2024-004', fromWarehouseId: '3', toWarehouseId: '1', transferDate: '2024-12-08', status: 'pending', items: [{ productName: 'Soil Conditioner', quantity: 150 }], totalQuantity: 150, requestedBy: 'Priya Sharma', approvedBy: '', notes: 'Awaiting approval' },
];

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [formData, setFormData] = useState({
    transferNumber: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    transferDate: new Date().toISOString().split('T')[0],
    status: 'pending' as Transfer['status'],
    productName: '',
    quantity: 0,
    requestedBy: '',
    notes: '',
  });

  const { data: warehouses = [] } = useSupabaseQuery<Warehouse>('warehouses', { select: 'id,name,code' });

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || `WH-${id}`;

  const columns: Column<Transfer>[] = [
    { key: 'transferNumber', label: 'Transfer #', sortable: true },
    { key: 'fromWarehouseId', label: 'From', render: (v) => getWarehouseName(v) },
    { key: 'toWarehouseId', label: 'To', render: (v) => getWarehouseName(v) },
    { key: 'transferDate', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'totalQuantity', label: 'Qty', sortable: true },
    { key: 'requestedBy', label: 'Requested By' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'info' | 'warning' | 'pending' | 'error'> = {
          received: 'success',
          in_transit: 'info',
          approved: 'warning',
          pending: 'pending',
          cancelled: 'error',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value.replace('_', ' ')} dot />;
      },
    },
  ];

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      transferNumber: `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(3, '0')}`,
      fromWarehouseId: '',
      toWarehouseId: '',
      transferDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      productName: '',
      quantity: 0,
      requestedBy: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Transfer) => {
    setEditing(item);
    setFormData({
      transferNumber: item.transferNumber,
      fromWarehouseId: item.fromWarehouseId,
      toWarehouseId: item.toWarehouseId,
      transferDate: item.transferDate,
      status: item.status,
      productName: item.items[0]?.productName || '',
      quantity: item.totalQuantity,
      requestedBy: item.requestedBy,
      notes: item.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Transfer) => {
    setTransfers(transfers.filter(t => t.id !== item.id));
  };

  const handleRefresh = () => {
    // Refetch from Supabase if available, otherwise reset from initial data
    setTransfers(initialTransfers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransfer: Transfer = {
      id: editing?.id || Date.now().toString(),
      transferNumber: formData.transferNumber,
      fromWarehouseId: formData.fromWarehouseId,
      toWarehouseId: formData.toWarehouseId,
      transferDate: formData.transferDate,
      status: formData.status,
      items: [{ productName: formData.productName, quantity: formData.quantity }],
      totalQuantity: formData.quantity,
      requestedBy: formData.requestedBy,
      approvedBy: editing?.approvedBy || '',
      notes: formData.notes,
    };
    if (editing) {
      setTransfers(transfers.map(t => t.id === editing.id ? newTransfer : t));
    } else {
      setTransfers([...transfers, newTransfer]);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Stock Transfers"
        description="Manage inter-warehouse stock transfers"
        data={transfers}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        addLabel="New Transfer"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Transfer' : 'Create New Transfer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Number</Label>
                <Input value={formData.transferNumber} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Transfer Date *</Label>
                <Input type="date" value={formData.transferDate} onChange={e => setFormData({ ...formData, transferDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>From Warehouse *</Label>
                <Select value={formData.fromWarehouseId || 'none'} onValueChange={v => setFormData({ ...formData, fromWarehouseId: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select warehouse</SelectItem>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Warehouse *</Label>
                <Select value={formData.toWarehouseId || 'none'} onValueChange={v => setFormData({ ...formData, toWarehouseId: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select warehouse</SelectItem>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Requested By</Label>
                <Input value={formData.requestedBy} onChange={e => setFormData({ ...formData, requestedBy: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as Transfer['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
