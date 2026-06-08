import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

const elasticsearchClientSingleton = () => {
  return new Client({ node: ELASTICSEARCH_URL });
};

declare global {
  var esClientGlobal: undefined | ReturnType<typeof elasticsearchClientSingleton>;
}

export const esClient = globalThis.esClientGlobal ?? elasticsearchClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.esClientGlobal = esClient;
