// mongoose.test.ts
// We must mock mongoose BEFORE importing the module under test
// because mongoose.ts creates schemas at module-load time

jest.mock('mongoose', () => {
  const mockConnect = jest.fn().mockResolvedValue({ conn: 'ok' });
  const mockSchemaInstance = {
    index: jest.fn(),
    add: jest.fn(),
  };

  const mockSchema = jest.fn().mockReturnValue(mockSchemaInstance);
  mockSchema.Types = {
    Mixed: 'Mixed',
    ObjectId: 'ObjectId',
    String: String,
    Number: Number,
    Boolean: Boolean,
  };

  const mockConnection = { readyState: 0 };
  const mockModels: Record<string, any> = {};

  return {
    __esModule: true,
    default: {
      connect: mockConnect,
      connection: mockConnection,
      Schema: mockSchema,
      model: jest.fn((name: string) => ({ name })),
      models: mockModels,
    },
    connect: mockConnect,
    connection: mockConnection,
    Schema: mockSchema,
    model: jest.fn(),
    models: mockModels,
  };
});

import mongoose from 'mongoose';
import { connectMongoDB } from '@/lib/db/mongoose';

describe('MongoDB Connection (connectMongoDB)', () => {
  it('calls mongoose.connect and returns a connection', async () => {
    // Reset global cache for fresh call
    global.mongoose = { conn: null, promise: null };
    const result = await connectMongoDB();
    expect(mongoose.connect).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('returns cached connection on subsequent calls without reconnecting', async () => {
    // Already connected from previous test, so a new call should use cache
    const callsBefore = (mongoose.connect as jest.Mock).mock.calls.length;
    await connectMongoDB();
    expect((mongoose.connect as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});

describe('Mongoose Schema creation', () => {
  it('Schema constructor was called for AssetDocument and Incident', () => {
    // The schemas are created at module load time; just verify Schema was called
    expect(mongoose.Schema).toHaveBeenCalled();
  });

  it('model was created for AssetDocument', () => {
    expect(mongoose.model).toHaveBeenCalled();
  });
});
