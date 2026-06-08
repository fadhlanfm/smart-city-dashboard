import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalFilters } from '@/components/dashboard/GlobalFilters';

const mockPush = jest.fn();
const mockSearchParams = {
  toString: () => 'districtId=d1',
  get: jest.fn(),
  entries: jest.fn().mockReturnValue([]),
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '',
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select data-testid="select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
}));

describe('GlobalFilters', () => {
  const mockOnChange = jest.fn();
  const districts = [{ id: 'd1', name: 'District 1' }, { id: 'd2', name: 'District 2' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all dropdowns and clear button', () => {
    render(<GlobalFilters onChange={mockOnChange} districts={districts} />);
    expect(screen.getAllByTestId('select')).toHaveLength(3);
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    expect(screen.getByText('District 1')).toBeInTheDocument();
    expect(screen.getByText('District 2')).toBeInTheDocument();
  });

  it('calls onChange and router.push when district filter changes', () => {
    render(<GlobalFilters onChange={mockOnChange} districts={districts} />);
    const selects = screen.getAllByTestId('select');
    fireEvent.change(selects[0], { target: { value: 'd1' } });
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ districtId: 'd1' }));
    expect(mockPush).toHaveBeenCalled();
  });

  it('calls onChange with empty when ALL is selected', () => {
    render(<GlobalFilters onChange={mockOnChange} districts={districts} />);
    const selects = screen.getAllByTestId('select');
    fireEvent.change(selects[0], { target: { value: 'ALL' } });
    expect(mockOnChange).toHaveBeenCalledWith(expect.not.objectContaining({ districtId: expect.anything() }));
  });

  it('calls onChange and router.push when type filter changes', () => {
    render(<GlobalFilters onChange={mockOnChange} districts={districts} />);
    const selects = screen.getAllByTestId('select');
    fireEvent.change(selects[1], { target: { value: 'ROAD' } });
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'ROAD' }));
    expect(mockPush).toHaveBeenCalled();
  });

  it('calls onChange and router.push when status filter changes', () => {
    render(<GlobalFilters onChange={mockOnChange} districts={districts} />);
    const selects = screen.getAllByTestId('select');
    fireEvent.change(selects[2], { target: { value: 'ACTIVE' } });
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'ACTIVE' }));
    expect(mockPush).toHaveBeenCalled();
  });

  it('clears all filters when Clear Filters is clicked', () => {
    render(<GlobalFilters onChange={mockOnChange} districts={districts} initialFilters={{ districtId: 'd1' }} />);
    fireEvent.click(screen.getByText('Clear Filters'));
    expect(mockOnChange).toHaveBeenCalledWith({});
    expect(mockPush).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('works without onChange callback', () => {
    render(<GlobalFilters districts={districts} />);
    const selects = screen.getAllByTestId('select');
    // Should not throw even without onChange
    fireEvent.change(selects[0], { target: { value: 'd1' } });
    fireEvent.click(screen.getByText('Clear Filters'));
  });
});
