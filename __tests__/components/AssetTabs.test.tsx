import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssetIncidentsTab } from '@/components/assets/AssetIncidentsTab';
import { AssetMaintenanceTab } from '@/components/assets/AssetMaintenanceTab';

describe('AssetIncidentsTab', () => {
  it('returns null when no asset', () => {
    const { container } = render(<AssetIncidentsTab asset={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no recentIncidents', () => {
    const { container } = render(<AssetIncidentsTab asset={{} as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows empty state when no incidents', () => {
    render(<AssetIncidentsTab asset={{ recentIncidents: [] } as any} />);
    expect(screen.getByText('No recent incidents reported for this asset.')).toBeInTheDocument();
  });

  it('renders incidents list', () => {
    const asset = {
      recentIncidents: [
        { id: '1', type: 'ACCIDENT', severity: 'HIGH', status: 'OPEN', description: 'A crash', createdAt: '2024-01-15' },
        { id: '2', type: 'FLOOD', severity: 'LOW', status: 'RESOLVED', description: '', createdAt: null },
      ]
    } as any;
    render(<AssetIncidentsTab asset={asset} />);
    expect(screen.getByText('ACCIDENT')).toBeInTheDocument();
    expect(screen.getByText('A crash')).toBeInTheDocument();
    expect(screen.getByText('No description available.')).toBeInTheDocument();
    expect(screen.getByText('Unknown Date')).toBeInTheDocument();
  });
});

describe('AssetMaintenanceTab', () => {
  it('returns null when no asset', () => {
    const { container } = render(<AssetMaintenanceTab asset={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders maintenance placeholder message', () => {
    render(<AssetMaintenanceTab asset={{ id: '1' } as any} />);
    expect(screen.getByText('Maintenance history is not implemented in this version.')).toBeInTheDocument();
  });
});
