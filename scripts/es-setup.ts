import { Client } from '@elastic/elasticsearch';

const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
const indexName = process.env.ELASTICSEARCH_INDEX || 'smart_city_assets';

async function setup() {
  console.log(`Setting up Elasticsearch index: ${indexName}...`);
  try {
    const exists = await esClient.indices.exists({ index: indexName });
    if (exists) {
      console.log(`Index ${indexName} already exists. Deleting...`);
      await esClient.indices.delete({ index: indexName });
    }

    await esClient.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              asset_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'asset_analyzer',
              fields: { keyword: { type: 'keyword' } },
            },
            type: { type: 'keyword' },
            status: { type: 'keyword' },
            districtId: { type: 'keyword' },
            district: { type: 'keyword' },
            address: { type: 'text', analyzer: 'asset_analyzer' },
            tags: { type: 'keyword' },
            location: { type: 'geo_point' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });

    console.log(`Index ${indexName} created successfully.`);
  } catch (error) {
    console.error('Failed to setup Elasticsearch:', error);
    process.exit(1);
  }
}

setup();
