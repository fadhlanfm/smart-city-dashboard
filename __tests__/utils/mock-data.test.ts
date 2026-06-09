import fs from 'fs';
import { getMockAssets, saveMockAssets } from '@/lib/mock-data';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

describe('mock-data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates new mock data if file read fails', () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    const result = getMockAssets();
    expect(result.length).toBe(300); // Because it generates 300 assets
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('saves mock assets', () => {
    saveMockAssets([{ id: '1' }]);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
