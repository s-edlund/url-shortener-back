
import { Express } from 'express-serve-static-core';
import cors from 'cors';
import urlRepo from '../repository/url-repository';
import { getLogger } from '../utils/logger';
import { UrlShortener } from '../utils/url-shortener';
import { rateLimit } from 'express-rate-limit'

const logger = getLogger('setup-middleware-and-routes');

const urlShortener = new UrlShortener();

export const setupMiddlewareAndRoutes = (app: Express) => {


   // Rate limiting (extra credit). TODO: tests in stress tests
   const limiter = rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      limit: 100, // 100 request in 5 mins
      standardHeaders: 'draft-7',
      legacyHeaders: false
   });

   app.use(limiter)

   // Should not be left open like this, TODO.
   app.use(cors());

   app.get('/', (req, res) => {
   res.send('Server is up')
   })

   app.get('/shorten', async (req, res) => {
      try {
         const passedURL = req.query.url as string;
         // should sanitise here

         const {slug, url, id, user} = await urlRepo.createOrReturnExistingSlugForUrl(passedURL);


         // Very basic JSONAPI used here:

         res.contentType('application/vnd.api+json');

         const jsonApiResponse = {
            "data": [{
               "type":"urlmapping",
               "id":id,
               "attributes" : {
                  "slug": slug,
                  "url":url,
                  "id":id,
                  "user":user
               }
            }]
         }
         res.json(jsonApiResponse);
         
      } catch(err) {
         const stat = err.status? err.status: 500;

         const jsonApiError = {
            "errors": [{
               "status":stat,
               "title": `Error shortening URL`,
               "detail": err.message
            }
            ]
            }
         res.status(stat);
         res.contentType('application/vnd.api+json');
         res.json(jsonApiError);
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