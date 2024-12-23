import { execSync } from 'child_process';
import { config } from '../src/config/env.js';

// Construct database URL
const getDatabaseUrl = () => {
  const { user, password, host, port, name } = config.db;
  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
};

// Set DATABASE_URL environment variable and run prisma db pull
try {
  const dbUrl = getDatabaseUrl();
  console.log('Running prisma db pull...');
  execSync('bunx prisma db pull', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      DATABASE_URL: dbUrl 
    }
  });
  console.log('Schema pulled successfully!');
} catch (error) {
  console.error('Error pulling schema:', error);
  process.exit(1);
} 