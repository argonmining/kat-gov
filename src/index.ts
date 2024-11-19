import dotenv from 'dotenv';
import app from './app.js';
import process from 'process';

const envFile = process.env.NODE_ENV === 'katgov' ? '.env.katgov' : '.env.kdao';
dotenv.config({ path: envFile });

const PORT = process.env.PORT || 7215;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;

console.log('Environment:', process.env.NODE_ENV);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
