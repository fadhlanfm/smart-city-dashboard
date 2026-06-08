import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { connectMongoDB } from '@/lib/db/mongoose';
import { redis } from '@/lib/db/redis';
import { esClient } from '@/lib/db/elasticsearch';

export async function GET() {
  const start = Date.now();
  const services: any = {};
  let status = 'ok';

  // 1. Postgres
  try {
    const pgStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    services.postgres = { status: 'up', latencyMs: Date.now() - pgStart };
  } catch (e) {
    services.postgres = { status: 'down' };
    status = 'degraded';
  }

  // 2. MongoDB
  try {
    const mongoStart = Date.now();
    await connectMongoDB();
    services.mongodb = { status: 'up', latencyMs: Date.now() - mongoStart };
  } catch (e) {
    services.mongodb = { status: 'down' };
    status = 'degraded';
  }

  // 3. Redis
  try {
    const redisStart = Date.now();
    if (redis) {
      await redis.ping();
      services.redis = { status: 'up', latencyMs: Date.now() - redisStart };
    } else {
      throw new Error('No redis client');
    }
  } catch (e) {
    services.redis = { status: 'down' };
    status = 'degraded';
  }

  // 4. Elasticsearch
  try {
    const esStart = Date.now();
    await esClient.ping();
    services.elasticsearch = { status: 'up', latencyMs: Date.now() - esStart };
  } catch (e) {
    services.elasticsearch = { status: 'down' };
    status = 'degraded';
  }

  return NextResponse.json(
    { status, services, timestamp: new Date().toISOString() },
    { status: status === 'ok' ? 200 : 503 }
  );
}
