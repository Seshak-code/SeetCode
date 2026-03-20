import express from 'express';
import cors from 'cors';
import problemRoutes from './routes/problemRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any localhost port in dev, or the configured CLIENT_URL in production
      const allowed = process.env.CLIENT_URL;
      if (allowed) return callback(null, allowed);
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'seetcode-api' });
});

app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);

export default app;
