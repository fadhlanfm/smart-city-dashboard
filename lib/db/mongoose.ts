import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Mongoose Schemas defined here for convenience per T029
const AssetDocumentSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, index: true },
    schemaVersion: { type: Number, default: 1 },
    photos: [
      {
        url: { type: String, required: true },
        caption: String,
        takenAt: Date,
      },
    ],
    documents: [
      {
        url: { type: String, required: true },
        title: { type: String, required: true },
        fileType: String,
        uploadedAt: Date,
      },
    ],
    notes: [String],
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, versionKey: '__v' }
);

AssetDocumentSchema.index({ updatedAt: -1 });

export const AssetDocument =
  mongoose.models.AssetDocument || mongoose.model('AssetDocument', AssetDocumentSchema);

const IncidentSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true },
    schemaVersion: { type: Number, default: 1 },
    type: { type: String, required: true },
    severity: { type: String, required: true },
    description: { type: String },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    reportedBy: String,
  },
  { timestamps: true, versionKey: '__v' }
);

IncidentSchema.index({ assetId: 1, createdAt: -1 });
IncidentSchema.index({ resolved: 1, createdAt: -1 });
IncidentSchema.index({ location: '2dsphere' });
IncidentSchema.index({ type: 1, severity: 1 });

export const Incident = mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
