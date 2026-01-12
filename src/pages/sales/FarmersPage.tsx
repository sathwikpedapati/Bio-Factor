import React, { useState } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/useSupabaseQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Farmer {
  id: string;
  name: string;
  phone: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  farm_size_acres: number | null;
  crops: any;
  dealer_id: string | null;
  created_at: string;
}

interface Dealer {
  id: string;
  name: string;
  business_name: string | null;
}

export default function FarmersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    farm_size_acres: 0,
    crops: [],
    dealer_id: '',
  });

  const { data: farmers = [], isLoading, refetch } = useSupabaseQuery<Farmer>('farmers', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const { data: dealers = [] } = useSupabaseQuery<Dealer>('dealers', {
    select: 'id,name,business_name'
  });

  const insertMutation = useSupabaseInsert<Farmer>('farmers');
  const updateMutation = useSupabaseUpdate<Farmer>('farmers');
  const deleteMutation = useSupabaseDelete('farmers');

  const getDealerName = (dealerId: string | null) => {
    if (!dealerId) return '-';
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer?.business_name || dealer?.name || '-';
  };

  const columns: Column<Farmer>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'village', label: 'Village', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    {
      key: 'farm_size_acres',
      label: 'Farm Size',
      sortable: true,
      render: (value) => value ? `${value} acres` : '-',
    },
    {
      key: 'dealer_id',
      label: 'Dealer',
      render: (value) => getDealerName(value),
    },
  ];

  const handleAdd = () => {
    setEditingFarmer(null);
    setFormData({
      name: '',
      phone: '',
      village: '',
      district: '',
      state: '',
      farm_size_acres: 0,
      crops: [],
      dealer_id: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      phone: farmer.phone || '',
      village: farmer.village || '',
      district: farmer.district || '',
      state: farmer.state || '',
      farm_size_acres: farmer.farm_size_acres || 0,
      crops: farmer.crops || [],
      dealer_id: farmer.dealer_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (farmer: Farmer) => {
    await deleteMutation.mutateAsync(farmer.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      dealer_id: formData.dealer_id || null,
      farm_size_acres: formData.farm_size_acres || null,
    };

    if (editingFarmer) {
      await updateMutation.mutateAsync({ id: editingFarmer.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Farmers"
        description="Manage farmer database and track relationships"
        data={farmers}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Add Farmer"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}</DialogTitle>
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
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
                <Label htmlFor="farm_size_acres">Farm Size (acres)</Label>
                <Input
                  id="farm_size_acres"
                  type="number"
                  step="0.1"
                  value={formData.farm_size_acres}
                  onChange={e => setFormData({ ...formData, farm_size_acres: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="dealer_id">Associated Dealer</Label>
                <Select value={formData.dealer_id || "none"} onValueChange={v => setFormData({ ...formData, dealer_id: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dealer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {dealers.map(dealer => (
                      <SelectItem key={dealer.id} value={dealer.id}>
                        {dealer.business_name || dealer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingFarmer ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
