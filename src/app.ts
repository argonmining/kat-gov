import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import proposalRoutes from './routes/proposalRoutes.js';
import electionRoutes from './routes/electionRoutes.js';
import proposalVoteRoutes from './routes/proposalVoteRoutes.js';
import electionVoteRoutes from './routes/electionVoteRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import proposalTypeRoutes from './routes/proposalTypeRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import burnRoutes from './routes/burnRoutes.js';
import { handleError } from './utils/errorHandler.js';
import pkg from 'websocket';

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

app.use('/api', proposalRoutes);
app.use('/api', electionRoutes);
app.use('/api', proposalVoteRoutes);
app.use('/api', electionVoteRoutes);
app.use('/api', candidateRoutes);
app.use('/api', positionRoutes);
app.use('/api', proposalTypeRoutes);
app.use('/api', statusRoutes);
app.use('/api', burnRoutes);

// Error handling middleware
app.use(handleError);

export default app;
