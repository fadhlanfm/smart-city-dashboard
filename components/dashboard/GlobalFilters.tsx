"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FilterParamsDTO } from '@/lib/validators/filter.schema';
import { AssetType, AssetStatus } from '@prisma/client';

interface GlobalFiltersProps {
  districts: { id: string; name: string }[];
  onChange?: (filters: Partial<FilterParamsDTO>) => void;
  initialFilters?: Partial<FilterParamsDTO>;
}

export function GlobalFilters({ districts, onChange, initialFilters = {} }: GlobalFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Partial<FilterParamsDTO>>(initialFilters);

  const updateFilter = (key: keyof FilterParamsDTO, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value === 'ALL' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value as never;
    }
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL' || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.set('page', '1'); // Reset pagination on filter change
    router.push(`/?${params.toString()}`, { scroll: false });
    
    if (onChange) onChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    router.push('/', { scroll: false });
    if (onChange) onChange({});
  };

  return (
    <div id="tour-filters" className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg shadow-sm border">
      <div className="w-48">
        <Select value={filters.districtId || 'ALL'} onValueChange={(val) => updateFilter('districtId', val)}>
          <SelectTrigger>
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Districts</SelectItem>
            {districts.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <Select value={filters.type || 'ALL'} onValueChange={(val) => updateFilter('type', val)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.values(AssetType).map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <Select value={filters.status || 'ALL'} onValueChange={(val) => updateFilter('status', val)}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(AssetStatus).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
    </div>
  );
}
