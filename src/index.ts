import app from './app.js';
import process from 'process';
import { createModuleLogger } from './utils/logger.js';
import { config } from './config/env.js';

const logger = createModuleLogger('server');

logger.info({ 
  environment: config.nodeEnv,
  port: config.port,
  dbHost: config.db.host,
  dbName: config.db.name
}, 'Starting server');

app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Server running');
});
