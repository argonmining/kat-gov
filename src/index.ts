import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 7215;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
