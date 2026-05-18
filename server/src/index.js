import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './utils/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`IssuePilot API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start IssuePilot API:', error.message);
    process.exit(1);
  });
