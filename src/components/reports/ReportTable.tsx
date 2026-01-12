import React, { useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { Skeleton } from '@/components/ui/skeleton';

export interface ReportRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  quantity?: number;
  status?: string;
  region?: string;
  dealer?: string;
  [key: string]: any;
}

interface ReportTableProps {
  data: ReportRow[];
  isLoading?: boolean;
  title?: string;
  columns?: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: ReportRow) => React.ReactNode;
  }>;
  onRowClick?: (row: ReportRow) => void;
  emptyMessage?: string;
}

const defaultColumns = [
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'description',
    label: 'Description',
    sortable: true,
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: (value: number) => `₹${(value / 1000).toFixed(1)}K`,
  },
  {
    key: 'quantity',
    label: 'Quantity',
    sortable: true,
    render: (value: any) => value || '-',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: any) => value || '-',
  },
];

export const ReportTable: React.FC<ReportTableProps> = ({
  data,
  isLoading = false,
  title = 'Report Data',
  columns = defaultColumns,
  onRowClick,
  emptyMessage = 'No report data available',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-lg" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 animate-fade-in">
      <DataTable
        title={title}
        data={paginatedData}
        columns={columns}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        searchable={true}
        searchPlaceholder="Search reports..."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{' '}
            {data.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
