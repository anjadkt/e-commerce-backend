import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`API Base URL: http://localhost:${env.PORT}/api/v1`);
      console.log(`Health Check: http://localhost:${env.PORT}/api/v1/health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
