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
import { useQueryClient } from '@tanstack/react-query';

interface Dealer {
  id: string;
  name: string;
  business_name: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string;
  kyc_status: string;
  credit_limit: number;
  outstanding_balance: number;
  created_at: string;
}

const initialFormData = {
  name: '',
  business_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  status: 'active',
  kyc_status: 'pending',
  credit_limit: 0,
};

export default function DealersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  
  const queryClient = useQueryClient();
  const { data: dealers = [], isLoading, refetch } = useSupabaseQuery<Dealer>('dealers', {
    orderBy: { column: 'created_at', ascending: false }
  });
  
  const insertMutation = useSupabaseInsert<Dealer>('dealers');
  const updateMutation = useSupabaseUpdate<Dealer>('dealers');
  const deleteMutation = useSupabaseDelete('dealers');

  const columns: Column<Dealer>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'business_name', label: 'Business Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge
          status={value === 'active' ? 'success' : value === 'inactive' ? 'error' : 'warning'}
          label={value}
          dot
        />
      ),
    },
    {
      key: 'kyc_status',
      label: 'KYC',
      render: (value) => (
        <StatusBadge
          status={value === 'verified' ? 'success' : value === 'pending' ? 'warning' : 'error'}
          label={value}
          dot
        />
      ),
    },
    {
      key: 'credit_limit',
      label: 'Credit Limit',
      sortable: true,
      render: (value) => `₹${(value || 0).toLocaleString()}`,
    },
    {
      key: 'outstanding_balance',
      label: 'Outstanding',
      sortable: true,
      render: (value) => (
        <span className={value > 0 ? 'text-destructive' : ''}>
          ₹{(value || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDealer(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setFormData({
      name: dealer.name,
      business_name: dealer.business_name || '',
      phone: dealer.phone,
      email: dealer.email || '',
      address: dealer.address || '',
      city: dealer.city || '',
      state: dealer.state || '',
      status: dealer.status,
      kyc_status: dealer.kyc_status,
      credit_limit: dealer.credit_limit,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (dealer: Dealer) => {
    deleteMutation.mutate(dealer.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDealer) {
      await updateMutation.mutateAsync({ id: editingDealer.id, data: formData });
    } else {
      await insertMutation.mutateAsync(formData);
    }
    
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Dealers"
        description="Manage dealer network and accounts"
        data={dealers}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Add Dealer"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDealer ? 'Edit Dealer' : 'Add New Dealer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kyc_status">KYC Status</Label>
                <Select value={formData.kyc_status} onValueChange={v => setFormData({ ...formData, kyc_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  value={formData.credit_limit}
                  onChange={e => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingDealer ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
