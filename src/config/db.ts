import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

export default pool;
