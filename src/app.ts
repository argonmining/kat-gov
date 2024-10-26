import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Placeholder route (update as needed)
app.get('/', (req, res) => {
  res.send('Welcome to Kat Gov Backend');
});

export default app;
