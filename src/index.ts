import app from './app.js';
import process from 'process';
import { createModuleLogger } from './utils/logger.js';
import { config } from './config/env.js';
import { initializeScheduledTasks } from './scheduler/index.js';

const logger = createModuleLogger('server');

logger.info({ 
  environment: config.nodeEnv,
  port: config.port,
  dbHost: config.db.host,
  dbName: config.db.name
}, 'Starting server');

// Initialize scheduled tasks
initializeScheduledTasks()
  .then(() => {
    logger.info('Scheduled tasks initialized successfully');
  })
  .catch(error => {
    logger.error({ error }, 'Failed to initialize scheduled tasks');
  });

app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Server running');
});
