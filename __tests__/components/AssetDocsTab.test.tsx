import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetDocsTab } from '@/components/assets/AssetDocsTab';

const mockJsPDF = {
  setFontSize: jest.fn(),
  text: jest.fn(),
  line: jest.fn(),
  save: jest.fn(),
};

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => mockJsPDF);
});

describe('AssetDocsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty states when no photos or documents', () => {
    const asset = { id: '1', name: 'Test', photos: [], documents: [] } as any;
    render(<AssetDocsTab asset={asset} />);
    expect(screen.getByText('No photos available for this asset.')).toBeInTheDocument();
    expect(screen.getByText('No documents attached.')).toBeInTheDocument();
  });

  it('renders photos correctly', () => {
    const asset = {
      id: '1',
      name: 'Test',
      photos: [{ url: 'https://example.com/photo.jpg', caption: 'Front view' }],
      documents: [],
    } as any;
    render(<AssetDocsTab asset={asset} />);
    expect(screen.getByAltText('Front view')).toBeInTheDocument();
  });

  it('renders photos as plain strings', () => {
    const asset = {
      id: '1',
      name: 'Test',
      photos: ['https://example.com/photo.jpg'],
      documents: [],
    } as any;
    render(<AssetDocsTab asset={asset} />);
    expect(screen.getByAltText('Photo 1')).toBeInTheDocument();
  });

  it('renders documents and generates PDF on download', () => {
    const asset = {
      id: '1',
      name: 'Test Asset',
      photos: [],
      documents: [{ title: 'Maintenance Manual', url: 'https://example.com/doc.pdf', fileType: 'PDF', uploadedAt: '2023-01-01' }],
    } as any;
    render(<AssetDocsTab asset={asset} />);
    expect(screen.getByText('Maintenance Manual')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Generate PDF Report'));
    expect(mockJsPDF.save).toHaveBeenCalledWith(`Asset_Report_1.pdf`);
  });

  it('renders document without fileType defaults to PDF', () => {
    const asset = {
      id: '1',
      name: 'Test',
      photos: [],
      documents: [{ title: 'Doc', url: '', uploadedAt: '2023-01-01' }],
    } as any;
    render(<AssetDocsTab asset={asset} />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });
});
