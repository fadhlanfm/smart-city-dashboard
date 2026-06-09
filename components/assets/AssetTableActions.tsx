"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { AssetFormModal } from './AssetFormModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AssetTableActionsProps {
  searchParams: Record<string, string>;
}

export function AssetTableActions({ searchParams }: AssetTableActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingGeoJSON, setIsExportingGeoJSON] = useState(false);
  const router = useRouter();

  const handleExport = async (format: 'csv' | 'geojson') => {
    if (format === 'csv') setIsExportingCSV(true);
    else setIsExportingGeoJSON(true);

    try {
      const res = await fetch(`/api/export?format=${format}&${new URLSearchParams(searchParams).toString()}`);
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(`Exported ${format.toUpperCase()} successfully`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      if (format === 'csv') setIsExportingCSV(false);
      else setIsExportingGeoJSON(false);
    }
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div id="tour-add-asset" className="flex gap-2">
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Asset
        </Button>
        <Button 
          variant="outline"
          disabled={isExportingCSV}
          onClick={() => handleExport('csv')}
        >
          {isExportingCSV ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isExportingCSV ? 'Exporting...' : 'Export CSV'}
        </Button>
        <Button 
          variant="outline"
          disabled={isExportingGeoJSON}
          onClick={() => handleExport('geojson')}
        >
          {isExportingGeoJSON ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isExportingGeoJSON ? 'Exporting...' : 'Export GeoJSON'}
        </Button>
      </div>

      <AssetFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </>
  );
}
