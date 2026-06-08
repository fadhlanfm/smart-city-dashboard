import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssetDetailModal } from '@/components/assets/AssetDetailModal';

// Mock the fetch call
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      data: {
        id: '123',
        name: 'Central Park Point',
        status: 'ACTIVE',
        type: 'PARK',
        district: { name: 'Central District', code: 'CDT' },
        address: '123 Park Ave',
        description: 'Main park point',
        metadata: { key: 'value' }
      }
    }),
  })
) as jest.Mock;

describe('AssetDetailModal', () => {
  it('renders modal with asset data', async () => {
    render(<AssetDetailModal assetId="123" isOpen={true} onClose={() => {}} />);
    
    // Check loading state or directly wait for data
    await waitFor(() => {
      expect(screen.getByText('Central Park Point')).toBeInTheDocument();
    });

    // Check tabs
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Incidents')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();

    // Check overview content
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('PARK')).toBeInTheDocument();
    expect(screen.getByText('Central District (CDT)')).toBeInTheDocument();
    expect(screen.getByText('123 Park Ave')).toBeInTheDocument();
    expect(screen.getByText('Main park point')).toBeInTheDocument();
  });
});
