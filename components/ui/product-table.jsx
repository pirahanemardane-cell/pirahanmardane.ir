'use client';

import { DataTable } from '@/components/ui/data-table';

/** Re-export site DataTable as ProductTable entry (API-compatible name). */
export default function ProductTable(props) {
  return <DataTable searchPlaceholder="جستجو در جدول..." emptyMessage="موردی یافت نشد." {...props} />;
}

export { DataTable, ProductTable };
