import React, { useState } from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/useSupabaseQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface Payment {
  id: string;
  dealer_id: string;
  invoice_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

interface Dealer { id: string; name: string; business_name: string | null; }
interface Invoice { id: string; invoice_number: string; }

export default function PaymentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    dealer_id: '',
    invoice_id: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: '',
  });

  const { data: payments = [], isLoading, refetch } = useSupabaseQuery<Payment>('payments', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: dealers = [] } = useSupabaseQuery<Dealer>('dealers', { select: 'id,name,business_name' });
  const { data: invoices = [] } = useSupabaseQuery<Invoice>('invoices', { select: 'id,invoice_number' });

  const insertMutation = useSupabaseInsert<Payment>('payments');
  const updateMutation = useSupabaseUpdate<Payment>('payments');
  const deleteMutation = useSupabaseDelete('payments');

  const getDealerName = (id: string) => {
    const dealer = dealers.find(d => d.id === id);
    return dealer?.business_name || dealer?.name || '-';
  };

  const columns: Column<Payment>[] = [
    { key: 'dealer_id', label: 'Dealer', sortable: true, render: (v) => getDealerName(v) },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => `₹${(v || 0).toLocaleString()}` },
    { key: 'payment_date', label: 'Date', sortable: true, render: (v) => format(new Date(v), 'dd MMM yyyy') },
    { key: 'payment_method', label: 'Method', render: (v) => v?.replace('_', ' ') || '-' },
    { key: 'reference_number', label: 'Reference' },
  ];

  const handleAdd = () => {
    setEditingPayment(null);
    setFormData({
      dealer_id: '',
      invoice_id: '',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      reference_number: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      dealer_id: payment.dealer_id,
      invoice_id: payment.invoice_id || '',
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method || 'bank_transfer',
      reference_number: payment.reference_number || '',
      notes: payment.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (payment: Payment) => {
    await deleteMutation.mutateAsync(payment.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      invoice_id: formData.invoice_id || null,
      reference_number: formData.reference_number || null,
      notes: formData.notes || null,
    };
    if (editingPayment) {
      await updateMutation.mutateAsync({ id: editingPayment.id, data: submitData });
    } else {
      await insertMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <CrudPage
        title="Payments"
        description="Track and manage payment records"
        data={payments}
        columns={columns}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        addLabel="Record Payment"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPayment ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Invoice</Label>
                <Select value={formData.invoice_id || "none"} onValueChange={v => setFormData({ ...formData, invoice_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {invoices.map(i => <SelectItem key={i.id} value={i.id}>{i.invoice_number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹) *</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" value={formData.payment_date} onChange={e => setFormData({ ...formData, payment_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={v => setFormData({ ...formData, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input value={formData.reference_number} onChange={e => setFormData({ ...formData, reference_number: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingPayment ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
