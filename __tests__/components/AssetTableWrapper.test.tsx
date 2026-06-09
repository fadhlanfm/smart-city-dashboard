import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssetTableWrapper } from '@/components/assets/AssetTableWrapper';

// Mock DataTable
jest.mock('@/components/dashboard/DataTable', () => ({
  DataTable: ({ data }: any) => <div data-testid="data-table">Rows: {data.length}</div>
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

describe('AssetTableWrapper', () => {
  it('renders correctly with transformed data', () => {
    const mockAssets = [
      { id: '1', name: 'Asset 1', district: { name: 'District 1' } },
      { id: '2', name: 'Asset 2' },
    ] as any;

    const mockMeta = { total: 2, page: 1, pageSize: 10, totalPages: 1 };
    render(<AssetTableWrapper data={mockAssets} meta={mockMeta} onEdit={jest.fn()} onDeleteSuccess={jest.fn()} />);
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Rows: 2');
  });
});
