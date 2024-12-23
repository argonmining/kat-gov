import { config } from './env.js';
import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('prisma-config');

// Construct database URL from config
const getDatabaseUrl = () => {
  const { user, password, host, port, name } = config.db;
  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
};

// Create Prisma client with dynamic database URL
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
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