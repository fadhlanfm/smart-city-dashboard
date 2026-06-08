import { Client } from '@elastic/elasticsearch';
import { PrismaClient } from '@prisma/client';

const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
const prisma = new PrismaClient();
const indexName = process.env.ELASTICSEARCH_INDEX || 'smart_city_assets';

async function sync() {
  console.log(`Syncing assets to Elasticsearch index: ${indexName}...`);
  try {
    const assets: any[] = await prisma.$queryRaw`
      SELECT a.id, a.name, a.type, a.status, a."districtId", a.address, a.tags, a."updatedAt",
             d.name as district_name,
             ST_AsGeoJSON(a.geometry)::json as geometry_json
      FROM "Asset" a
      LEFT JOIN "District" d ON a."districtId" = d.id;
    `;

    if (assets.length === 0) {
      console.log('No assets to sync.');
      return;
    }

    const operations = assets.flatMap((asset) => {
      let lat = 0, lon = 0;
      if (asset.geometry_json && asset.geometry_json.type === 'Point') {
        [lon, lat] = asset.geometry_json.coordinates;
      }
      return [
        { index: { _index: indexName, _id: asset.id } },
        {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          status: asset.status,
          districtId: asset.districtId,
          district: asset.district_name,
          address: asset.address,
          tags: asset.tags,
          location: { lat, lon },
          updatedAt: asset.updatedAt,
        },
      ];
    });

    const bulkResponse = await esClient.bulk({ refresh: true, body: operations });

    if (bulkResponse.errors) {
      console.error('Bulk operation completed with errors.');
    } else {
      console.log(`Successfully synced ${assets.length} assets.`);
    }
  } catch (error) {
    console.error('Failed to sync to Elasticsearch:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

sync();
