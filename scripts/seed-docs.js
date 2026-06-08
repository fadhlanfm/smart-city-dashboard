const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_city';

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

const AssetDocument = mongoose.models.AssetDocument || mongoose.model('AssetDocument', AssetDocumentSchema);

const photoKeywords = ['street', 'infrastructure', 'traffic', 'equipment', 'city', 'building', 'bridge', 'construction'];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await AssetDocument.deleteMany({});
    console.log('Cleared existing AssetDocuments');

    const docs = [];
    
    // We have 500 assets in PostgreSQL: cuid-asset-1 to cuid-asset-500
    for (let i = 1; i <= 500; i++) {
      const assetId = `cuid-asset-${i}`;
      
      const numPhotos = Math.floor(Math.random() * 3) + 1; // 1 to 3 photos
      const photos = [];
      for(let p = 0; p < numPhotos; p++) {
        const keyword = photoKeywords[Math.floor(Math.random() * photoKeywords.length)];
        photos.push({
          url: `https://picsum.photos/seed/${i * 10 + p}/400/300`,
          caption: `Documentation photo ${p + 1} for ${assetId}`,
          takenAt: new Date(Date.now() - Math.random() * 10000000000)
        });
      }

      const hasDoc = Math.random() > 0.5;
      const documents = [];
      if (hasDoc) {
        documents.push({
          url: `https://dummy-file-hosting.com/manual-${assetId}.pdf`,
          title: `Maintenance Manual v1.2`,
          fileType: 'application/pdf',
          uploadedAt: new Date(Date.now() - Math.random() * 10000000000)
        });
      }

      docs.push({
        assetId,
        photos,
        documents,
        notes: [`Initial installation verified.`, `Routine check passed.`],
        metadata: {
          inspectorId: `user-${Math.floor(Math.random() * 100)}`
        }
      });
    }

    await AssetDocument.insertMany(docs);
    console.log(`Seeded ${docs.length} AssetDocument records`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
