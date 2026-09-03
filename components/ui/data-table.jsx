'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Reusable data table (tanstack) — site-wide table UI.
 * props:
 *  - columns: ColumnDef[]
 *  - data: any[]
 *  - searchPlaceholder?: string
 *  - pageSize?: number
 *  - showSearch?: boolean
 *  - showPagination?: boolean
 *  - className?: string
 */
export function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'جستجو...',
  pageSize = 10,
  showSearch = true,
  showPagination = true,
  className = '',
  emptyMessage = 'موردی یافت نشد.',
}) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnVisibility,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {showSearch && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const keys = table.getAllLeafColumns().map((col) => col.id);
              setColumnVisibility((prev) =>
                keys.reduce((acc, key) => {
                  acc[key] = prev[key] === false ? true : false;
                  return acc;
                }, {})
              );
            }}
          >
            نمایش/مخفی ستون‌ها
          </Button>
        </div>
      )}

      <div className="overflow-auto border border-primary-200 dark:border-white/15 rounded-xl bg-white dark:bg-black">
        <Table className="w-full table-fixed text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-l border-primary-100 dark:border-white/10 last:border-l-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="truncate border-l border-primary-50 dark:border-white/5 last:border-l-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length || 1} className="text-center py-8 text-primary-500 dark:text-white/60">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-primary-600 dark:text-white/70">
          <span>
            صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              قبلی
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              بعدی
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
