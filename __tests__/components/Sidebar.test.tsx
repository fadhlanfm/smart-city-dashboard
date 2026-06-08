import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('Sidebar', () => {
  it('renders brand and nav links correctly', () => {
    render(<Sidebar />);
    expect(screen.getByText('Smart City')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });

  it('has correct href for Dashboard', () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink?.href).toBe('http://localhost/');
  });

  it('has correct href for Map View', () => {
    render(<Sidebar />);
    const mapLink = screen.getByText('Map View').closest('a');
    expect(mapLink?.href).toBe('http://localhost/map');
  });
});
