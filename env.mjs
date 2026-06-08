import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  DATABASE_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  ELASTICSEARCH_URL: z.string().url(),
  ELASTICSEARCH_INDEX: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_MAPTILER_KEY: z.string().min(1),
});

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  REDIS_URL: process.env.REDIS_URL,
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
  ELASTICSEARCH_INDEX: process.env.ELASTICSEARCH_INDEX,
  NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
};

const parsedServer = serverSchema.safeParse(processEnv);
const parsedClient = clientSchema.safeParse(processEnv);

if (!parsedServer.success || !parsedClient.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(
      {
        ...(parsedServer.success ? {} : parsedServer.error.format()),
        ...(parsedClient.success ? {} : parsedClient.error.format()),
      },
      null,
      2
    )
  );
  throw new Error('Invalid environment variables');
}

export const env = {
  ...parsedServer.data,
  ...parsedClient.data,
};
