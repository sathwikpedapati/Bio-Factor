import React from 'react';
import { CrudPage, Column } from '@/components/crud/CrudPage';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  created_at: string;
}

export default function AuditLogsPage() {
  const { data: logs = [], isLoading, refetch } = useSupabaseQuery<AuditLog>('audit_logs', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 100
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'created_at',
      label: 'Timestamp',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy HH:mm:ss'),
    },
    {
      key: 'action',
      label: 'Action',
      render: (value) => {
        const colors: Record<string, string> = {
          INSERT: 'bg-success/10 text-success',
          UPDATE: 'bg-info/10 text-info',
          DELETE: 'bg-destructive/10 text-destructive',
        };
        return <Badge className={colors[value] || ''}>{value}</Badge>;
      },
    },
    { key: 'table_name', label: 'Table', sortable: true },
    { key: 'record_id', label: 'Record ID' },
    { key: 'ip_address', label: 'IP Address' },
  ];

  return (
    <CrudPage
      title="Audit Logs"
      description="View system activity and changes"
      data={logs}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      exportable={true}
    />
  );
}
