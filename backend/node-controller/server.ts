import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// Core routes structure
import claimsRoutes from './routes/claims';
import iotRoutes from './routes/iot';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/claims', claimsRoutes);
app.use('/api/iot', iotRoutes);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campustrace';

mongoose.connect(mongoURI).then(() => {
  console.log('[Server] Successfully connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`[Server] Node Controller running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('[Server] Failed to connect to MongoDB', error);
  // Still start the server to allow fallback operations
  app.listen(PORT, () => {
    console.log(`[Server] Node Controller running on port ${PORT} (Without DB Connection)`);
  });
});
