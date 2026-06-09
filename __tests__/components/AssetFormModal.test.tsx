import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetFormModal } from '@/components/assets/AssetFormModal';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('react-map-gl/maplibre', () => {
  const Map = ({ children, onClick }: any) => (
    <div data-testid="map-mock" onClick={() => onClick({ lngLat: { lng: 107.6, lat: -6.9 } })}>
      {children}
    </div>
  );
  Map.Marker = () => <div data-testid="marker-mock" />;
  return {
    __esModule: true,
    default: Map,
    Marker: Map.Marker,
  };
});

// Mock UI Select to easily trigger onValueChange
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select data-testid="select-mock" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
      <option value="ROAD">Road</option>
      <option value="ACTIVE">Active</option>
      <option value="d1">Downtown</option>
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
}));

describe('AssetFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url === '/api/districts') {
        return Promise.resolve({
          json: () => Promise.resolve({ data: [{ id: 'd1', name: 'Downtown' }] }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as jest.Mock;
  });

  it('renders correctly for creating a new asset', async () => {
    render(<AssetFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Add New Asset')).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/districts'));
  });

  it('renders correctly for editing an existing asset', async () => {
    const mockAsset = {
      id: 'a1', name: 'Existing Park', type: 'PARK', status: 'ACTIVE', districtId: 'd1', tags: [],
      geometry: { type: 'Point', coordinates: [107.6, -6.9] }
    } as any;
    
    render(<AssetFormModal isOpen={true} onClose={mockOnClose} asset={mockAsset} onSuccess={mockOnSuccess} />);
    expect(screen.getByDisplayValue('Existing Park')).toBeInTheDocument();
  });

  it('shows error toast when required fields are missing', async () => {
    render(<AssetFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Instead of clicking the button which triggers HTML5 validation that prevents submit, we fire submit on the form directly
    const form = screen.getByRole('button', { name: /Create Asset/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields (Name, Type, Status, District).');
    });
  });

  it('submits successfully when fields are filled for create', async () => {
    render(<AssetFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/Asset Name/i), { target: { value: 'New Asset' } });
    
    const selects = screen.getAllByTestId('select-mock');
    fireEvent.change(selects[0], { target: { value: 'ROAD' } }); // Type
    fireEvent.change(selects[1], { target: { value: 'ACTIVE' } }); // Status
    fireEvent.change(selects[2], { target: { value: 'd1' } }); // District

    // Click map
    fireEvent.click(screen.getByTestId('map-mock'));

    fireEvent.click(screen.getByRole('button', { name: /Create Asset/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/assets/crud', expect.objectContaining({
        method: 'POST',
      }));
      expect(toast.success).toHaveBeenCalledWith('Asset created successfully');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('submits successfully for edit', async () => {
    const mockAsset = {
      id: 'a1', name: 'Existing Park', type: 'PARK', status: 'ACTIVE', districtId: 'd1', tags: [],
      geometry: { type: 'Point', coordinates: [107.6, -6.9] }
    } as any;

    render(<AssetFormModal isOpen={true} onClose={mockOnClose} asset={mockAsset} onSuccess={mockOnSuccess} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/assets/a1/crud', expect.objectContaining({
        method: 'PUT',
      }));
      expect(toast.success).toHaveBeenCalledWith('Asset updated successfully');
    });
  });

  it('handles fetch error on submit', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve({ data: [] })
    })).mockImplementationOnce(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to save asset' })
    }));

    const mockAsset = {
      id: 'a1', name: 'Existing Park', type: 'PARK', status: 'ACTIVE', districtId: 'd1', tags: [],
      geometry: { type: 'Point', coordinates: [107.6, -6.9] }
    } as any;

    render(<AssetFormModal isOpen={true} onClose={mockOnClose} asset={mockAsset} onSuccess={mockOnSuccess} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save asset');
    });
  });
});
