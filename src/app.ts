import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import proposalRoutes from './routes/proposalRoutes';

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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

export default app;
