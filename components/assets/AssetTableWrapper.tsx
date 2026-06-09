"use client";

import React from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { AssetRowActions } from './AssetRowActions';
import { ExtendedAsset } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AssetTableWrapperProps {
  data: ExtendedAsset[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export function AssetTableWrapper({ data, meta }: AssetTableWrapperProps) {
  type TableAsset = ExtendedAsset & Record<string, unknown>;
  const tableData = data as TableAsset[];

  const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'districtName', header: 'District' },
    { 
      accessorKey: 'actions', 
      header: 'Actions', 
      cell: (row: TableAsset) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AssetRowActions asset={row} />
        </div>
      ) 
    },
  ];

  const router = useRouter();

  return (
    <DataTable<TableAsset>
      columns={columns} 
      data={tableData} 
      meta={meta}
      onRowClick={(row) => router.push(`/map?assetId=${row.id}`)}
    />
  );
}
