"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { AssetRowActions } from './AssetRowActions';
import { ExtendedAsset } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AssetTableWrapperProps {
  data: ExtendedAsset[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export function AssetTableWrapper({ data, meta }: AssetTableWrapperProps) {
  type TableAsset = ExtendedAsset & Record<string, unknown>;
  const [tableData, setTableData] = useState<TableAsset[]>(data as TableAsset[]);
  const [localOffset, setLocalOffset] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsRefreshing(true);
    const timer = setTimeout(() => setIsRefreshing(false), 500);
    return () => clearTimeout(timer);
  }, [data]);

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
      setLocalOffset(localAssets.length - deletedAssets.length);
    } catch (e) {
      setTableData(data as TableAsset[]);
    }
  }, [data]);

  const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (row: any) => {
        const color = row.status === 'ACTIVE' ? 'bg-green-500' : row.status === 'MAINTENANCE' ? 'bg-yellow-500' : 'bg-red-500';
        return <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${color}`} />{row.status}</div>
      }
    },
    { 
      accessorKey: 'district', 
      header: 'District',
      cell: (row: any) => row.district?.name || 'Unknown'
    },
    { 
      accessorKey: 'actions', 
      header: '',
      cell: (row: any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AssetRowActions asset={row as ExtendedAsset} />
        </div>
      )
    },
  ];

  return (
    <div className="relative">
      {(isPending || isRefreshing) && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-md">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-medium">{isPending ? 'Loading Map View...' : 'Refreshing Table Data...'}</span>
          </div>
        </div>
      )}
      <DataTable<TableAsset>
        columns={columns} 
        data={tableData} 
        meta={{ ...meta, total: Math.max(0, meta.total + localOffset) }}
        onRowClick={(row) => {
          startTransition(() => {
            router.push(`/map?assetId=${row.id}`);
          });
        }}
      />
    </div>
  );
}
