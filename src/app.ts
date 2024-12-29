import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import govRoutes from './routes/govRoutes.js';
import { handleError } from './utils/errorHandler.js';
import pkg from 'websocket';
import './scheduler/deleteOldDraftProposals.js';
import './scheduler/getTreasuryTransactions.js';
import { config } from './config/env.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const { w3cwebsocket: W3CWebSocket } = pkg;

globalThis.WebSocket = W3CWebSocket as any;

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(json());
app.use(urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Placeholder route (update as needed)
app.get('/', (req, res) => {
  res.send('Welcome to Kat Gov Backend');
});

// Frontend-specific routes
app.use('/api', govRoutes);

// Error handling middleware
app.use(handleError);

export default app;
