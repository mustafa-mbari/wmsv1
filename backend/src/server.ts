import app from './app';
import logger from './utils/logger/logger';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`Backend server started successfully`, { 
    source: 'server', 
    method: 'startup',
    port: PORT,
    url: `http://localhost:${PORT}`
  });
  logger.info(`API documentation available`, { 
    source: 'server', 
    method: 'startup',
    docsUrl: `http://localhost:${PORT}/api`
  });
});