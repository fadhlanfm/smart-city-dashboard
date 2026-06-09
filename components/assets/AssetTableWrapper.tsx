"use client";

import React, { useState, useEffect } from 'react';
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
  const [tableData, setTableData] = useState<TableAsset[]>(data as TableAsset[]);

  useEffect(() => {
    try {
      const localStr = localStorage.getItem('mock_new_assets');
      const deletedStr = localStorage.getItem('mock_deleted_assets');
      
      const localAssets = localStr ? JSON.parse(localStr) : [];
      const deletedAssets = deletedStr ? JSON.parse(deletedStr) : [];
      
      const combined = [...localAssets, ...(data as TableAsset[])]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        .filter(v => !deletedAssets.includes(v.id));
        
      setTableData(combined);
    } catch (e) {
      setTableData(data as TableAsset[]);
    }
  }, [data]);

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
