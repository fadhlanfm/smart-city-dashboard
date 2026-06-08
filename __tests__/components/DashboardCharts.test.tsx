import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartArea } from '@/components/dashboard/ChartArea';
import { ChartBar } from '@/components/dashboard/ChartBar';

// Recharts uses ResizeObserver internally; it's already mocked in jest.setup.ts
// Mock ResponsiveContainer to avoid dynamic sizing issues in jsdom
jest.mock('recharts', () => {
  const Original = jest.requireActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 300 }}>
        {children}
      </div>
    ),
  };
});

describe('ChartArea', () => {
  it('renders with title and data', () => {
    const data = [
      { date: '2024-01', incidents: 5 },
      { date: '2024-02', incidents: 10 },
    ];
    render(<ChartArea data={data} />);
    expect(screen.getByText('Incidents Over Time')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    render(<ChartArea data={[]} />);
    expect(screen.getByText('Incidents Over Time')).toBeInTheDocument();
  });
});

describe('ChartBar', () => {
  it('renders with title and data', () => {
    const data = [
      { type: 'ROAD', count: 20 },
      { type: 'PARK', count: 5 },
    ];
    render(<ChartBar data={data} />);
    expect(screen.getByText('Assets by Type')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    render(<ChartBar data={[]} />);
    expect(screen.getByText('Assets by Type')).toBeInTheDocument();
  });
});
