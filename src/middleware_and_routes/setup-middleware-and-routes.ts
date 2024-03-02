
import { Express } from 'express-serve-static-core';
import cors from 'cors';
import urlRepo from '../repository/url-repository';
import { getLogger } from '../utils/logger';
import { UrlShortener } from '../utils/url-shortener';

const logger = getLogger('setup-middleware-and-routes');

const urlShortener = new UrlShortener();

export const setupMiddlewareAndRoutes = (app: Express) => {

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
   app.get('/*', async (req, res) => {
      try {
         let slug = req.originalUrl;
         // trim initial /
         while(slug.startsWith('/')) slug = slug.replace('/', '');
         logger.info(`slug ${slug}`);
         
         // const storedUrl = urlShortener.lengthen(slug);
         const storedUrl = await urlRepo.getURLForSlug(slug);
         
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


}