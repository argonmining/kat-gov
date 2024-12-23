import pkg from 'pg';
const { Pool } = pkg;
import { createModuleLogger } from '../utils/logger.js';
import { config } from './env.js';

const logger = createModuleLogger('database');

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
});

pool.on('connect', () => {
  logger.info('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error({ error: err }, 'Database connection error');
  process.exit(-1);
});

logger.debug({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  port: config.db.port
}, 'Database configuration loaded');

export default pool;
