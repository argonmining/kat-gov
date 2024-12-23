import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import proposalRoutes from './routes/proposalsRoutes.js';
import proposalSnapshotsRoutes from './routes/proposalSnapshotsRoutes.js';
import electionsRoutes from './routes/electionsRoutes.js';
import proposalVotesRoutes from './routes/proposalVotesRoutes.js';
import candidateVoteRoutes from './routes/candidateVoteRoutes.js';
import electionCandidateRoutes from './routes/electionCandidateRoutes.js';
import electionPositionRoutes from './routes/electionPositionRoutes.js';
import proposalTypesRoutes from './routes/proposalTypesRoutes.js';
import proposalStatusesRoutes from './routes/proposalStatusesRoutes.js';
import burnRoutes from './routes/burnRoutes.js';
import electionTypesRoutes from './routes/electionTypesRoutes.js';
import electionStatusesRoutes from './routes/electionStatusesRoutes.js';
import candidateWalletsRoutes from './routes/candidateWalletsRoutes.js';
import proposalYesVotesRoutes from './routes/proposalYesVotesRoutes.js';
import proposalNoVotesRoutes from './routes/proposalNoVotesRoutes.js';
import proposalNominationsRoutes from './routes/proposalNominationsRoutes.js';
import candidateNominationsRoutes from './routes/candidateNominationsRoutes.js';
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

app.use('/api', proposalRoutes);
app.use('/api', proposalSnapshotsRoutes);
app.use('/api', electionsRoutes);
app.use('/api', proposalVotesRoutes);
app.use('/api', candidateVoteRoutes);
app.use('/api', electionCandidateRoutes);
app.use('/api', electionPositionRoutes);
app.use('/api', proposalTypesRoutes);
app.use('/api', proposalStatusesRoutes);
app.use('/api', burnRoutes);
app.use('/api', electionTypesRoutes);
app.use('/api', electionStatusesRoutes);
app.use('/api', candidateWalletsRoutes);
app.use('/api', proposalYesVotesRoutes);
app.use('/api', proposalNoVotesRoutes);
app.use('/api', proposalNominationsRoutes);
app.use('/api', candidateNominationsRoutes);
app.use('/api', nominationFeeRoutes);

// Error handling middleware
app.use(handleError);

export default app;
