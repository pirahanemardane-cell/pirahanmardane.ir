'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Modern data table shell — soft card, hairline dividers, readable hover.
 * Used across PDP specs, size guide, and product compare.
 */
const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div
      className={cn(
        'relative w-full overflow-auto app-data-table-wrap',
        'rounded-2xl border border-black/5 dark:border-white/10',
        'bg-white dark:bg-[#121214]',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none'
      )}
    >
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm text-primary-900 dark:text-white border-collapse',
          className
        )}
        {...props}
      />
    </div>
  );
});
Table.displayName = 'Table';

const TableHeader = React.forwardRef(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={cn(
        'bg-[#F7F7F8] dark:bg-[#1A1C20]',
        '[&_tr]:border-b [&_tr]:border-black/5 dark:[&_tr]:border-white/10',
        className
      )}
      {...props}
    />
  );
});
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      ref={ref}
      className={cn(
        '[&_tr:last-child]:border-0',
        '[&_tr:nth-child(even)]:bg-[#FAFAFB] dark:[&_tr:nth-child(even)]:bg-white/[0.02]',
        className
      )}
      {...props}
    />
  );
});
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-black/5 dark:border-white/10',
        'bg-[#F7F7F8] dark:bg-[#1A1C20] font-medium',
        '[&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
});
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-black/[0.06] dark:border-white/[0.08]',
        'transition-colors duration-150',
        'hover:bg-[#F3F4F6] dark:hover:bg-white/[0.04]',
        'data-[state=selected]:bg-[#4CCD99]/8 dark:data-[state=selected]:bg-[#4CCD99]/15',
        className
      )}
      {...props}
    />
  );
});
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-12 px-3 py-3 text-right align-middle',
        'text-xs sm:text-sm font-semibold tracking-tight',
        'text-primary-600 dark:text-white/70',
        'whitespace-nowrap',
        className
      )}
      {...props}
    />
  );
});
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef(function TableCell({ className, ...props }, ref) {
  return (
    <td
      ref={ref}
      className={cn(
        'px-3 py-3 align-middle',
        'text-sm text-primary-800 dark:text-white/90',
        className
      )}
      {...props}
    />
  );
});
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={cn('mt-3 text-sm text-primary-500 dark:text-white/50', className)}
      {...props}
    />
  );
});
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
