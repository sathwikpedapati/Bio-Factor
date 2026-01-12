import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Wrench, Settings, AlertTriangle, CheckCircle, Clock, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Machine {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance' | 'breakdown';
  capacity: number;
  currentLoad: number;
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
}

const initialMachines: Machine[] = [
  { id: '1', name: 'Mixing Tank A1', code: 'MT-A1', type: 'Mixer', status: 'running', capacity: 5000, currentLoad: 3500, lastMaintenance: '2024-11-15', nextMaintenance: '2025-02-15', location: 'Plant 1 - Section A' },
  { id: '2', name: 'Granulator G1', code: 'GR-G1', type: 'Granulator', status: 'running', capacity: 2000, currentLoad: 1800, lastMaintenance: '2024-10-20', nextMaintenance: '2025-01-20', location: 'Plant 1 - Section B' },
  { id: '3', name: 'Dryer D2', code: 'DR-D2', type: 'Dryer', status: 'idle', capacity: 3000, currentLoad: 0, lastMaintenance: '2024-12-01', nextMaintenance: '2025-03-01', location: 'Plant 1 - Section C' },
  { id: '4', name: 'Packing Line P1', code: 'PK-P1', type: 'Packing', status: 'maintenance', capacity: 10000, currentLoad: 0, lastMaintenance: '2024-12-05', nextMaintenance: '2025-03-05', location: 'Plant 2 - Packing Hall' },
  { id: '5', name: 'Mixer M3', code: 'MX-M3', type: 'Mixer', status: 'breakdown', capacity: 4000, currentLoad: 0, lastMaintenance: '2024-09-10', nextMaintenance: '2024-12-10', location: 'Plant 1 - Section A' },
];

const machineTypes = ['Mixer', 'Granulator', 'Dryer', 'Packing', 'Conveyor', 'Crusher', 'Fermenter'];

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [deleteItem, setDeleteItem] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    status: 'idle' as Machine['status'],
    capacity: 0,
    currentLoad: 0,
    lastMaintenance: '',
    nextMaintenance: '',
    location: '',
  });

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'running': return 'bg-success/10 text-success border-success/20';
      case 'idle': return 'bg-info/10 text-info border-info/20';
      case 'maintenance': return 'bg-warning/10 text-warning border-warning/20';
      case 'breakdown': return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getStatusIcon = (status: Machine['status']) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4" />;
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'breakdown': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditing(null);
    setFormData({ name: '', code: '', type: '', status: 'idle', capacity: 0, currentLoad: 0, lastMaintenance: '', nextMaintenance: '', location: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (machine: Machine) => {
    setEditing(machine);
    setFormData(machine);
    setIsDialogOpen(true);
  };

  const handleDelete = (machine: Machine) => {
    setDeleteItem(machine);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      setMachines(machines.filter(m => m.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setMachines(machines.map(m => m.id === editing.id ? { ...formData, id: editing.id } : m));
    } else {
      setMachines([...machines, { ...formData, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
  };

  const stats = {
    total: machines.length,
    running: machines.filter(m => m.status === 'running').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
    breakdown: machines.filter(m => m.status === 'breakdown').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Machine Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage production machinery</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Machine
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Machines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.running}</p>
                <p className="text-sm text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{stats.breakdown}</p>
                <p className="text-sm text-muted-foreground">Breakdown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search machines..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="breakdown">Breakdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Machine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map(machine => (
          <Card key={machine.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{machine.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{machine.code}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(machine)}>
                      <Pencil className="w-4 h-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(machine)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(machine.status)}>
                  {getStatusIcon(machine.status)}
                  <span className="ml-1 capitalize">{machine.status}</span>
                </Badge>
                <Badge variant="outline">{machine.type}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span>{machine.currentLoad}/{machine.capacity} kg</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${(machine.currentLoad / machine.capacity) * 100}%` }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>{machine.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Maintenance</span>
                  <span>{machine.nextMaintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Machine' : 'Add New Machine'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Machine Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Machine Code *</Label>
                <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {machineTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as Machine['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity (kg)</Label>
                <Input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Current Load (kg)</Label>
                <Input type="number" value={formData.currentLoad} onChange={e => setFormData({ ...formData, currentLoad: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Last Maintenance</Label>
                <Input type="date" value={formData.lastMaintenance} onChange={e => setFormData({ ...formData, lastMaintenance: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Next Maintenance</Label>
                <Input type="date" value={formData.nextMaintenance} onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Machine?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the machine record.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
