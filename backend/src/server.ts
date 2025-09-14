import app from './app';
import logger from './utils/logger/logger';

const PORT = process.env.PORT || 8000;

// Add error handling for unhandled exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { source: 'server', error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { source: 'server', reason, promise });
  process.exit(1);
});

// Add error handling for SIGINT
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully', { source: 'server' });
  process.exit(0);
});

try {
  const server = app.listen(PORT, () => {
    logger.info(`Backend server started successfully`, { 
      source: 'server', 
      method: 'startup',
      port: PORT,
      url: `http://localhost:${PORT}`,
      environment: process.env.NODE_ENV || 'development'
    });
    logger.info(`API endpoints available:`, { 
      source: 'server', 
      method: 'startup',
      endpoints: {
        health: `http://localhost:${PORT}/api/health`,
        users: `http://localhost:${PORT}/api/users`,
        auth: `http://localhost:${PORT}/api/auth`
      }
    });
  });

  server.on('error', (error: any) => {
    console.error('Server error:', error);
    logger.error('Server error:', { source: 'server', error: error.message, stack: error.stack });
  });

} catch (error) {
  console.error('Failed to start server:', error);
  logger.error('Failed to start server:', { source: 'server', error: error instanceof Error ? error.message : error });
  process.exit(1);
}