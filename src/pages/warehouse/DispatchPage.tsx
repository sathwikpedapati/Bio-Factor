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

interface Dispatch {
  id: string;
  dispatchNumber: string;
  orderId: string;
  dealerName: string;
  warehouseId: string;
  dispatchDate: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  status: 'preparing' | 'dispatched' | 'in_transit' | 'delivered';
  items: number;
  totalWeight: number;
  destination: string;
  notes: string;
}

interface Warehouse { id: string; name: string; code: string; }

const initialDispatches: Dispatch[] = [
  { id: '1', dispatchNumber: 'DSP-2024-001', orderId: 'ORD-001', dealerName: 'Agro Traders Pvt Ltd', warehouseId: '1', dispatchDate: '2024-12-05', vehicleNumber: 'MH12AB1234', driverName: 'Ramesh Kumar', driverPhone: '9876543210', status: 'delivered', items: 50, totalWeight: 2500, destination: 'Pune, Maharashtra', notes: '' },
  { id: '2', dispatchNumber: 'DSP-2024-002', orderId: 'ORD-002', dealerName: 'Farm Solutions Ltd', warehouseId: '1', dispatchDate: '2024-12-06', vehicleNumber: 'KA05CD5678', driverName: 'Suresh Patil', driverPhone: '9876543211', status: 'in_transit', items: 30, totalWeight: 1500, destination: 'Bangalore, Karnataka', notes: '' },
  { id: '3', dispatchNumber: 'DSP-2024-003', orderId: 'ORD-003', dealerName: 'Kisaan Mart', warehouseId: '2', dispatchDate: '2024-12-07', vehicleNumber: 'GJ01EF9012', driverName: 'Manoj Singh', driverPhone: '9876543212', status: 'dispatched', items: 25, totalWeight: 1200, destination: 'Ahmedabad, Gujarat', notes: 'Handle with care' },
  { id: '4', dispatchNumber: 'DSP-2024-004', orderId: 'ORD-004', dealerName: 'Green Earth Supplies', warehouseId: '1', dispatchDate: '2024-12-08', vehicleNumber: '', driverName: '', driverPhone: '', status: 'preparing', items: 40, totalWeight: 2000, destination: 'Nashik, Maharashtra', notes: '' },
];

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>(initialDispatches);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dispatch | null>(null);
  const [formData, setFormData] = useState({
    dispatchNumber: '',
    orderId: '',
    dealerName: '',
    warehouseId: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    status: 'preparing' as Dispatch['status'],
    items: 0,
    totalWeight: 0,
    destination: '',
    notes: '',
  });

  const { data: warehouses = [] } = useSupabaseQuery<Warehouse>('warehouses', { select: 'id,name,code' });

  const columns: Column<Dispatch>[] = [
    { key: 'dispatchNumber', label: 'Dispatch #', sortable: true },
    { key: 'dealerName', label: 'Dealer', sortable: true },
    { key: 'dispatchDate', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'vehicleNumber', label: 'Vehicle', render: (v) => v || '-' },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'items', label: 'Items', sortable: true },
    { key: 'totalWeight', label: 'Weight (kg)', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'info' | 'warning' | 'pending'> = {
          delivered: 'success',
          in_transit: 'info',
          dispatched: 'warning',
          preparing: 'pending',
        };
        return <StatusBadge status={statusMap[value] || 'default'} label={value.replace('_', ' ')} dot />;
      },
    },
  ];

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      dispatchNumber: `DSP-${new Date().getFullYear()}-${String(dispatches.length + 1).padStart(3, '0')}`,
      orderId: '',
      dealerName: '',
      warehouseId: '',
      dispatchDate: new Date().toISOString().split('T')[0],
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      status: 'preparing',
      items: 0,
      totalWeight: 0,
      destination: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Dispatch) => {
    setEditing(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Dispatch) => {
    setDispatches(dispatches.filter(d => d.id !== item.id));
  };

  const handleRefresh = () => {
    setDispatches(initialDispatches);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setDispatches(dispatches.map(d => d.id === editing.id ? { ...formData, id: editing.id } : d));
    } else {
      setDispatches([...dispatches, { ...formData, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Dispatch Management"
        description="Track and manage product dispatches"
        data={dispatches}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="New Dispatch"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Dispatch' : 'Create New Dispatch'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dispatch Number</Label>
                <Input value={formData.dispatchNumber} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Order ID *</Label>
                <Input value={formData.orderId} onChange={e => setFormData({ ...formData, orderId: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Dealer Name *</Label>
                <Input value={formData.dealerName} onChange={e => setFormData({ ...formData, dealerName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={formData.warehouseId || 'none'} onValueChange={v => setFormData({ ...formData, warehouseId: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select warehouse</SelectItem>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dispatch Date *</Label>
                <Input type="date" value={formData.dispatchDate} onChange={e => setFormData({ ...formData, dispatchDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as Dispatch['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vehicle Number</Label>
                <Input value={formData.vehicleNumber} onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })} placeholder="e.g. MH12AB1234" />
              </div>
              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input value={formData.driverName} onChange={e => setFormData({ ...formData, driverName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Driver Phone</Label>
                <Input value={formData.driverPhone} onChange={e => setFormData({ ...formData, driverPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Destination *</Label>
                <Input value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Total Items</Label>
                <Input type="number" value={formData.items} onChange={e => setFormData({ ...formData, items: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Total Weight (kg)</Label>
                <Input type="number" value={formData.totalWeight} onChange={e => setFormData({ ...formData, totalWeight: Number(e.target.value) })} />
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
