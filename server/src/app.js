import express from 'express';
import cors from 'cors';
import problemRoutes from './routes/problemRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
);
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'seetcode-api' });
});

app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);

export default app;
