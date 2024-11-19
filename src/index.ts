import dotenv from 'dotenv';
import app from './app.js';

const envFile = process.env.NODE_ENV === 'katgov' ? '.env.katgov' : '.env.kdao';
dotenv.config({ path: envFile });

const PORT = process.env.PORT || 7215;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
