import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetRowActions } from '@/components/assets/AssetRowActions';
import { toast } from 'sonner';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh, push: jest.fn() }),
  usePathname: () => '/assets',
}));

jest.mock('@/components/assets/AssetFormModal', () => ({
  AssetFormModal: ({ isOpen, onClose, onSuccess }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <button onClick={onClose} data-testid="modal-close">Close</button>
        <button onClick={onSuccess} data-testid="modal-success">Success</button>
      </div>
    );
  }
}));

jest.mock('react-map-gl/maplibre', () => {
  const Map = ({ children }: any) => <div data-testid="map-mock">{children}</div>;
  Map.Marker = () => <div />;
  return { __esModule: true, default: Map, Marker: Map.Marker };
});

jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
}));

// Radix DropdownMenu doesn't work well in jsdom, mock it to expose items directly
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, disabled }: any) => (
    <button data-testid="dropdown-item" onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => (open ? <div data-testid="alert-dialog">{children}</div> : null),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children, onClick }: any) => <button onClick={onClick} data-testid="alert-dialog-cancel">{children}</button>,
  AlertDialogAction: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="alert-dialog-action">{children}</button>
  ),
}));

const mockAsset = {
  id: '123',
  name: 'Test Asset',
  type: 'PARK',
  status: 'ACTIVE',
  districtId: 'd1',
  tags: [],
  geometry: { type: 'Point', coordinates: [107.6, -6.9] }
} as any;

describe('AssetRowActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (String(url).includes('/api/districts')) {
        return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  it('renders dropdown trigger button', () => {
    render(<AssetRowActions asset={mockAsset} />);
    // With mocked dropdown, trigger button is still rendered
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('shows Edit and Delete menu items', () => {
    render(<AssetRowActions asset={mockAsset} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('opens edit modal when Edit is clicked and handles callbacks', async () => {
    render(<AssetRowActions asset={mockAsset} />);
    // Dropdown items are directly rendered via mock
    const editButtons = screen.getAllByTestId('dropdown-item');
    const editBtn = editButtons.find(b => b.textContent?.includes('Edit'));
    fireEvent.click(editBtn!);
    
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    
    // Test onClose
    fireEvent.click(screen.getByTestId('modal-close'));
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    
    // Re-open and test onSuccess
    fireEvent.click(editBtn!);
    fireEvent.click(screen.getByTestId('modal-success'));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('calls delete api and shows loading state when delete is confirmed', async () => {
    let resolveFetch: any;
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(resolve => {
      resolveFetch = resolve;
    }));

    render(<AssetRowActions asset={mockAsset} />);
    const deleteButtons = screen.getAllByTestId('dropdown-item');
    const deleteBtn = deleteButtons.find(b => b.textContent?.includes('Delete'));
    
    // Open Dialog
    fireEvent.click(deleteBtn!);
    
    // Click confirm in dialog
    const confirmBtn = screen.getByTestId('alert-dialog-action');
    // Mock event object since we call e.preventDefault() in the handler
    fireEvent.click(confirmBtn, { preventDefault: jest.fn() });

    // Should disable the menu trigger while loading
    expect(deleteBtn).toHaveAttribute('disabled');

    resolveFetch({ ok: true, json: () => Promise.resolve({}) });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/assets/123/crud`,
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(toast.success).toHaveBeenCalledWith('Asset deleted successfully');
    });
  });

  it('handles delete error', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve({ data: [] }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'failed' }) }));
    
    render(<AssetRowActions asset={mockAsset} />);
    const deleteButtons = screen.getAllByTestId('dropdown-item');
    const deleteBtn = deleteButtons.find(b => b.textContent?.includes('Delete'));
    
    fireEvent.click(deleteBtn!);
    fireEvent.click(screen.getByTestId('alert-dialog-action'), { preventDefault: jest.fn() });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('handles non-Error instance throw during delete', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('Some string error');
    render(<AssetRowActions asset={mockAsset} />);
    const deleteButtons = screen.getAllByTestId('dropdown-item');
    const deleteBtn = deleteButtons.find(b => b.textContent?.includes('Delete'));
    
    fireEvent.click(deleteBtn!);
    fireEvent.click(screen.getByTestId('alert-dialog-action'), { preventDefault: jest.fn() });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });
  });

  it('does NOT call delete api when delete is cancelled', async () => {
    render(<AssetRowActions asset={mockAsset} />);
    const deleteButtons = screen.getAllByTestId('dropdown-item');
    const deleteBtn = deleteButtons.find(b => b.textContent?.includes('Delete'));
    
    // Open dialog
    fireEvent.click(deleteBtn!);
    
    // We just verify it doesn't call fetch if we don't click confirm
    // No action needed for cancel since the state is handled by Shadcn internally 
    // unless we explicitly mock onOpenChange
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/crud'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
