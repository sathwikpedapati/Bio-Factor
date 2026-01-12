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

interface Invoice {
  id: string;
  invoice_number: string;
  dealer_id: string;
  order_id: string | null;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
}

interface Dealer { id: string; name: string; business_name: string | null; }

export default function InvoicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    invoice_number: '',
    dealer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    paid_amount: 0,
    status: 'unpaid',
  });

  const { data: invoices = [], isLoading, refetch } = useSupabaseQuery<Invoice>('invoices', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: dealers = [] } = useSupabaseQuery<Dealer>('dealers', { select: 'id,name,business_name' });

  const insertMutation = useSupabaseInsert<Invoice>('invoices');
  const updateMutation = useSupabaseUpdate<Invoice>('invoices');
  const deleteMutation = useSupabaseDelete('invoices');

  const getDealerName = (id: string) => {
    const dealer = dealers.find(d => d.id === id);
    return dealer?.business_name || dealer?.name || '-';
  };

  const columns: Column<Invoice>[] = [
    { key: 'invoice_number', label: 'Invoice #', sortable: true },
    { key: 'dealer_id', label: 'Dealer', sortable: true, render: (v) => getDealerName(v) },
    { key: 'invoice_date', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'due_date', label: 'Due Date', sortable: true, render: (v) => v ? format(new Date(v), 'dd MMM yyyy') : '-' },
    { key: 'total_amount', label: 'Total', sortable: true, render: (v) => `₹${(v || 0).toLocaleString()}` },
    { key: 'paid_amount', label: 'Paid', sortable: true, render: (v) => `₹${(v || 0).toLocaleString()}` },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge
          status={value === 'paid' ? 'success' : value === 'partial' ? 'warning' : value === 'overdue' ? 'error' : 'pending'}
          label={value}
          dot
        />
      ),
    },
  ];

  const handleAdd = () => {
    setEditingInvoice(null);
    setFormData({
      invoice_number: `INV-${Date.now()}`,
      dealer_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      paid_amount: 0,
      status: 'unpaid',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      dealer_id: invoice.dealer_id,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date || '',
      subtotal: invoice.subtotal,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      paid_amount: invoice.paid_amount,
      status: invoice.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    await deleteMutation.mutateAsync(invoice.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = formData.subtotal + formData.tax_amount;
    const submitData = {
      ...formData,
      total_amount: total,
      due_date: formData.due_date || null,
    };
    if (editingInvoice) {
      await updateMutation.mutateAsync({ id: editingInvoice.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Invoices"
        description="Manage invoices and billing"
        data={invoices}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="New Invoice"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input value={formData.invoice_number} onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Dealer *</Label>
                <Select value={formData.dealer_id} onValueChange={v => setFormData({ ...formData, dealer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select dealer" /></SelectTrigger>
                  <SelectContent>
                    {dealers.map(d => <SelectItem key={d.id} value={d.id}>{d.business_name || d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input type="date" value={formData.invoice_date} onChange={e => setFormData({ ...formData, invoice_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtotal (₹)</Label>
                <Input type="number" value={formData.subtotal} onChange={e => setFormData({ ...formData, subtotal: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Tax (₹)</Label>
                <Input type="number" value={formData.tax_amount} onChange={e => setFormData({ ...formData, tax_amount: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Paid Amount (₹)</Label>
                <Input type="number" value={formData.paid_amount} onChange={e => setFormData({ ...formData, paid_amount: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">₹{(formData.subtotal + formData.tax_amount).toLocaleString()}</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingInvoice ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
