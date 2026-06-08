import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '@/components/dashboard/DataTable';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ toString: () => '', set: jest.fn(), delete: jest.fn() }),
  usePathname: () => '',
}));

describe('DataTable', () => {
  const mockColumns = [{ accessorKey: 'name', header: 'Name' }];
  const mockData = Array.from({ length: 25 }).map((_, i) => ({ id: i, name: `Item ${i}` }));

  it('renders rows from props', () => {
    render(<DataTable columns={mockColumns} data={mockData.slice(0, 10)} meta={{ page: 1, pageSize: 10, total: 25, totalPages: 3 }} />);
    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('shows pagination controls for >20 items', () => {
    render(<DataTable columns={mockColumns} data={mockData.slice(0, 10)} meta={{ page: 1, pageSize: 10, total: 25, totalPages: 3 }} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('calls onPageChange when Next is clicked', () => {
    const mockOnPageChange = jest.fn();
    render(<DataTable columns={mockColumns} data={mockData.slice(0, 10)} meta={{ page: 1, pageSize: 10, total: 25, totalPages: 3 }} onPageChange={mockOnPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls router.push when Next is clicked and no onPageChange provided', () => {
    mockPush.mockClear();
    render(<DataTable columns={mockColumns} data={mockData.slice(0, 10)} meta={{ page: 1, pageSize: 10, total: 25, totalPages: 3 }} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockPush).toHaveBeenCalledWith('/?page=2', { scroll: false });
  });

  it('disables Previous button on first page', () => {
    render(<DataTable columns={mockColumns} data={mockData.slice(0, 10)} meta={{ page: 1, pageSize: 10, total: 25, totalPages: 3 }} />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<DataTable columns={mockColumns} data={mockData.slice(20, 25)} meta={{ page: 3, pageSize: 10, total: 25, totalPages: 3 }} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('shows empty state when data is empty', () => {
    render(<DataTable columns={mockColumns} data={[]} meta={{ page: 1, pageSize: 10, total: 0, totalPages: 0 }} />);
    expect(screen.getByText('No results.')).toBeInTheDocument();
  });
});
