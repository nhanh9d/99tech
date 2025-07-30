import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { resourceRouter } from './routes/resource.routes';
import { errorHandler } from './middleware/error.middleware';
import { initializeDatabase } from './database/connection';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/resources', resourceRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
export const startServer = async () => {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { app };
