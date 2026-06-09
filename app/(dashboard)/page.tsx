import React from 'react';
import { Asset, District } from '@prisma/client';
import { getFilteredAssets, getAssetSummary } from '@/lib/services/asset.service';
import { getAllDistricts } from '@/lib/services/district.service';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { AssetTableActions } from '@/components/assets/AssetTableActions';
import { AssetTableWrapper } from '@/components/assets/AssetTableWrapper';
import { GlobalFilters } from '@/components/dashboard/GlobalFilters';
import { ChartBar } from '@/components/dashboard/ChartBar';
import { ChartArea } from '@/components/dashboard/ChartArea';
import { Activity, Box, Map, AlertTriangle } from 'lucide-react';
import { filterSchema } from '@/lib/validators/filter.schema';
import type { BaseResponse, ExtendedAsset } from '@/lib/types';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const parsedParams = filterSchema.safeParse(searchParams);
  const filters = parsedParams.success ? parsedParams.data : { page: 1, pageSize: 10, sort: 'updatedAt', order: 'desc' as const };

  let assetsResponse: BaseResponse<ExtendedAsset[]> = { data: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 } };
  let summary: { total: number; byType: any[]; byStatus: any[] } = { total: 0, byType: [], byStatus: [] };
  let districts: District[] = [];

  try {
    [assetsResponse, summary, districts] = await Promise.all([
      getFilteredAssets(filters),
      getAssetSummary(filters),
      getAllDistricts(),
    ]);
  } catch (error) {
    console.warn('Database unavailable, rendering with empty state:', error);
  }


  const formattedAssets = assetsResponse.data.map((asset: Asset) => ({
    ...asset,
    districtName: districts.find((d: District) => d.id === asset.districtId)?.name || asset.districtId
  }));

  // Mock area chart data since we don't have historical incident data yet
  const areaData = [
    { date: 'Mon', incidents: 4 },
    { date: 'Tue', incidents: 3 },
    { date: 'Wed', incidents: 7 },
    { date: 'Thu', incidents: 2 },
    { date: 'Fri', incidents: 5 },
    { date: 'Sat', incidents: 8 },
    { date: 'Sun', incidents: 4 },
  ];

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <GlobalFilters 
        districts={districts} 
        initialFilters={filters} 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          label="Total Assets" 
          value={summary.total} 
          icon={<Box className="h-4 w-4" />} 
          trend={{ value: 12, label: 'from last month', isPositive: true }}
          info="Everything the city owns and monitors, like cameras, streetlights, and parks."
        />
        <SummaryCard 
          label="Active Incidents" 
          value={districts.reduce((acc: number, d: any) => acc + d.activeIncidents, 0)} 
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={{ value: 4, label: 'from last week', isPositive: false }}
          info="Current problems or reports from citizens that need our immediate attention."
        />
        <SummaryCard 
          label="Districts Covered" 
          value={districts.length} 
          icon={<Map className="h-4 w-4" />} 
          info="The total number of administrative areas or neighborhoods we are monitoring."
        />
        <SummaryCard 
          label="System Health" 
          value="98.9%" 
          icon={<Activity className="h-4 w-4" />} 
          trend={{ value: 0.2, label: 'from yesterday', isPositive: true }}
          info="How smoothly all the smart city sensors and networks are running right now."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartBar data={summary.byType.map((t: any) => ({ type: t.type, count: Number(t.count) }))} />
        <ChartArea data={areaData} />
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Asset Directory</h2>
          <AssetTableActions searchParams={searchParams as Record<string, string>} />
        </div>
        <AssetTableWrapper 
          data={formattedAssets} 
          meta={assetsResponse.meta}
        />
      </div>
    </div>
  );
}
