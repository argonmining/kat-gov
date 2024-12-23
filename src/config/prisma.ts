import { config } from './env.js';
import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('prisma-config');

// Construct database URL from config
const getDatabaseUrl = () => {
  const { user, password, host, port, name } = config.db;
  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
};

// Add near the top, after creating logger
const dbUrl = getDatabaseUrl();
logger.info({
  nodeEnv: config.nodeEnv,
  dbName: config.db.name,
  dbUrl
}, 'Prisma configuration');

// Create Prisma client with dynamic database URL
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// Add connection test
prisma.$connect()
  .then(() => {
    logger.info('Successfully connected to database');
    return prisma.proposals.findMany({
      take: 1,
      select: { id: true }
    });
  })
  .then((result) => {
    logger.info({ result }, 'Test query result');
  })
  .catch((error) => {
    logger.error({ error }, 'Database connection/query error');
  });

// Add logging to Prisma client
prisma.$on('query', (e) => {
  logger.debug(e, 'Prisma Query');
});

prisma.$on('error', (e) => {
  logger.error(e, 'Prisma Error');
});

prisma.$on('info', (e) => {
  logger.info(e, 'Prisma Info');
});

prisma.$on('warn', (e) => {
  logger.warn(e, 'Prisma Warning');
}); 