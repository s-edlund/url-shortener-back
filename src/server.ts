import Express  from 'express';
import { UrlShortener } from './utils/url-shortener';
import cors from 'cors';
import config from 'config';
import { getLogger } from './utils/logger';
//import dbAccess from './database/db-access';
import urlRepo from './repository/url-repository';
const app = Express()
const port = 3001

const urlShortener = new UrlShortener();

const logger = getLogger('server');



urlRepo.setupRepo().catch(err => {
   logger.error(`Error during database setup. Shutting down: ${err.message}`);
   process.exit(1); // force shutdown. 
}).then(() => logger.info(`URL Repo initialized successfully`));

// Should not be left open like this, TODO.
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is up')
})

app.get('/shorten', async (req, res) => {
   try {
      const passedURL = req.query.url as string;
      // should sanitise here

      const slug = await urlRepo.createOrReturnExistingSlugForUrl(passedURL);

      res.json({"shortenedUrl": slug});
      
   } catch(err) {
      const stat = err.status? err.status: 500;
      res.status(stat);
      res.json({err: err.message, status:stat});
   }
 })

 // Handle everything else with a redirect or 404
 app.get('/*', (req, res) => {
   try {
      let slug = req.originalUrl;
      // trim initial /
      while(slug.startsWith('/')) slug = slug.replace('/', '');
      logger.info(`slug ${slug}`);
      
      const storedUrl = urlShortener.lengthen(slug);
      if(storedUrl) {
         // redirect
         logger.info(`redirect ${storedUrl}`); 
         res.redirect(storedUrl);
      } else {
         res.status(404);
         res.send(`<h2 style="color: red">Unable to locate url slug: ${slug}</h2>`);
      }
   } catch(err) {
      const stat = err.status? err.status: 500;
      res.status(stat);
      res.json({err: err.message, status:stat});
   }
 });

app.listen(port, () => {
   const port = config.get<number>('port');
   logger.info(`URL shortening app available on port ${port}`)
})