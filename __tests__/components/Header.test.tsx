import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/assets',
  useRouter: () => ({ push: mockPush, refresh: jest.fn() }),
}));

jest.mock('@/lib/actions/auth.actions', () => ({
  handleSignOut: jest.fn(),
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders title and search input', () => {
    render(<Header />);
    expect(screen.getByText('Smart City Ops')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search assets by name/i)).toBeInTheDocument();
  });

  it('renders logout and tutorial buttons', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tutorial/i })).toBeInTheDocument();
  });

  it('dispatches start-tour event when tutorial button is clicked', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    render(<Header />);
    const tutorialBtn = screen.getByRole('button', { name: /tutorial/i });
    fireEvent.click(tutorialBtn);
    
    // Check if the custom event was dispatched
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    const eventArg = dispatchEventSpy.mock.calls[0][0] as Event;
    expect(eventArg.type).toBe('start-tour');
    
    dispatchEventSpy.mockRestore();
  });

  it('updates input value on change', () => {
    render(<Header />);
    const input = screen.getByPlaceholderText(/Search assets by name/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input).toHaveValue('test query');
  });

  it('does not open popover for short queries', () => {
    render(<Header />);
    const input = screen.getByPlaceholderText(/Search assets by name/i);
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
  });

  it('calls search API when query is 3+ chars after debounce', async () => {
    render(<Header />);
    const input = screen.getByPlaceholderText(/Search assets by name/i);
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Fast-forward the 300ms debounce timer
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/search?q=test');
    });
  });

  it('shows search results when API returns data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [{ id: '1', name: 'Test Asset', district: 'District 1', type: 'ROAD', status: 'ACTIVE' }]
      })
    });
    
    render(<Header />);
    const input = screen.getByPlaceholderText(/Search assets by name/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Asset')).toBeInTheDocument();
    });
  });

  it('navigates to map when a result is selected', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [{ id: '1', name: 'Test Asset', district: 'District 1', type: 'ROAD', status: 'ACTIVE' }]
      })
    });
    
    render(<Header />);
    const input = screen.getByPlaceholderText(/Search assets by name/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => screen.getByText('Test Asset'));
    fireEvent.click(screen.getByText('Test Asset'));
    
    expect(mockPush).toHaveBeenCalledWith('/map?assetId=1');
  });
});
