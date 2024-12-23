import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import proposalRoutes from './routes/proposalRoutes.js';
import electionRoutes from './routes/electionRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import burnRoutes from './routes/burnRoutes.js';
import nominationFeeRoutes from './routes/nominationFeeRoutes.js';
import { handleError } from './utils/errorHandler.js';
import pkg from 'websocket';
import './scheduler/deleteOldDraftProposals.js';

const { w3cwebsocket: W3CWebSocket } = pkg;

globalThis.WebSocket = W3CWebSocket as any;

const app = express();

// Middleware
app.use(cors({
  origin: '*'
}));
app.use(json());
app.use(urlencoded({ extended: true }));

// Placeholder route (update as needed)
app.get('/', (req, res) => {
  res.send('Welcome to Kat Gov Backend');
});

app.use('/api/elections', electionRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api', burnRoutes);
app.use('/api', nominationFeeRoutes);

// Error handling middleware
app.use(handleError);

export default app;
