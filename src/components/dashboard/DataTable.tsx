import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Search,
  Filter,
  Download,
} from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  rowSize?: 'md' | 'lg';
  initialPageSize?: number;
  expandable?: boolean;
  renderExpanded?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  rowSize = 'lg',
  initialPageSize = 6,
  expandable = false,
  renderExpanded,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const filtered = data.filter((row) =>
    search
      ? Object.values(row).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      : true
  );

  const start = (page - 1) * initialPageSize;
  const visible = filtered.slice(start, start + initialPageSize);

  return (
    <div className={cn('bg-background border rounded-xl p-6', className)}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
            />
          </div>
          <button className="p-2 border rounded-lg">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 border rounded-lg">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {expandable && <th className="w-10"></th>}
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  className="px-6 py-4 text-left text-base font-semibold"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-16 text-center text-muted-foreground"
                >
                  No data available
                </td>
              </tr>
            ) : (
              visible.map((row, i) => {
                const idx = start + i;
                const open = expanded[idx];

                return (
                  <React.Fragment key={idx}>
                    <tr
                      onClick={() =>
                        expandable &&
                        setExpanded((p) => ({ ...p, [idx]: !p[idx] }))
                      }
                      className="border-b hover:bg-muted/50 cursor-pointer"
                    >
                      {expandable && (
                        <td className="px-4 py-5">
                          <ChevronDown
                            className={cn(
                              'w-5 h-5 transition-transform',
                              open && 'rotate-180'
                            )}
                          />
                        </td>
                      )}

                      {columns.map((c) => (
                        <td
                          key={String(c.key)}
                          className={cn(
                            rowSize === 'lg'
                              ? 'px-6 py-5 text-lg'
                              : 'px-4 py-3 text-sm',
                            c.className
                          )}
                        >
                          {c.render
                            ? c.render(row[c.key], row)
                            : row[c.key]}
                        </td>
                      ))}
                    </tr>

                    {open && (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="px-8 py-6 bg-muted/5"
                        >
                          {renderExpanded?.(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-muted-foreground">
          Showing {visible.length} of {filtered.length}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={page >= Math.ceil(filtered.length / initialPageSize)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
