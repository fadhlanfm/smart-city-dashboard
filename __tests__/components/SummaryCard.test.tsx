import { render, screen } from '@testing-library/react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';

describe('SummaryCard', () => {
  it('renders value and label', () => {
    render(<SummaryCard label="Total Assets" value={1234} />);
    expect(screen.getByText('Total Assets')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(<SummaryCard label="Total Assets" value={1234} isLoading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
