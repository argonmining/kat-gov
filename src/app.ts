import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import proposalRoutes from './routes/proposalRoutes';
import electionRoutes from './routes/electionRoutes';
import proposalVoteRoutes from './routes/proposalVoteRoutes';
import electionVoteRoutes from './routes/electionVoteRoutes';
import candidateRoutes from './routes/candidateRoutes';
import positionRoutes from './routes/positionRoutes';
import proposalTypeRoutes from './routes/proposalTypeRoutes';
import statusRoutes from './routes/statusRoutes';
import { handleError } from './utils/errorHandler'; // Import error handler

const app = express();

// Middleware
app.use(cors());
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

// Error handling middleware
app.use(handleError);

export default app;
