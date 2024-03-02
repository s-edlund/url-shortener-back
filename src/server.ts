import ExpressServer  from 'express';
import config from 'config';
import { getLogger } from './utils/logger';
import urlRepo from './repository/url-repository';
import { setupMiddlewareAndRoutes } from './middleware_and_routes/setup-middleware-and-routes';
const app = ExpressServer()

const logger = getLogger('server');

const port = config.get<number>('port');

app.listen(port, () => {
   const port = config.get<number>('port');

   // Setup backend database
   urlRepo.setupRepo().catch(err => {
      logger.error(`Error during repo setup. Shutting down: ${err.message}`);
      process.exit(1); // force shutdown. 
   }).then(() => logger.info(`URL Repo initialized successfully`));

   // setupp middleware and routes
   setupMiddlewareAndRoutes(app);

   logger.info(`URL shortening app available on port ${port}`)
});

