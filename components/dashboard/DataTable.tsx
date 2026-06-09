"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { useRouter, useSearchParams } from 'next/navigation';

interface DataTableProps<T> {
  columns: { accessorKey: string; header: string; cell?: (val: T) => React.ReactNode }[];
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, meta, onPageChange, onRowClick }: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div id="tour-asset-table" className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.accessorKey}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow 
                  key={(row.id as string) || i}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                >
                  {columns.map((col) => (
                    <TableCell key={col.accessorKey}>
                      {col.cell ? col.cell(row) : (row[col.accessorKey] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            Showing {((meta.page - 1) * meta.pageSize) + 1} to {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total} results
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              className="h-8 rounded-md border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={meta.pageSize}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('pageSize', e.target.value);
                params.set('page', '1'); // Reset to page 1
                router.push(`/?${params.toString()}`, { scroll: false });
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page <= 1}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
            .map((p, i, arr) => (
              <React.Fragment key={p}>
                {i > 0 && p - arr[i - 1] > 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={meta.page === p ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(p)}
                  className="h-8 w-8"
                >
                  {p}
                </Button>
              </React.Fragment>
            ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
