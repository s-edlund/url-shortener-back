
import { Express } from 'express-serve-static-core';
import cors from 'cors';
import urlRepo from '../repository/url-repository';
import { getLogger } from '../utils/logger';
import { UrlShortener } from '../utils/url-shortener';
import { rateLimit } from 'express-rate-limit'
import globals from '../globals/globals';
import {json} from 'body-parser';

const logger = getLogger('setup-middleware-and-routes');

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

   // Parse JSON bodies
   app.use(json())

   // Make sure user is passed in all requests

   app.use((req, res, next) => {
      // sanitation needed herer:
      let user = req.query['user'] as string;
      if(!user) {
         logger.warn('no user found, using dummy user');
         user = 'panda';
      }
      globals.username = user;
      next();
   });

   app.get('/', (req, res) => {
      res.send('Server is up')
   })

   // use _ to ensure it's never part of our alphabet
   app.get('/_shorten', async (req, res) => {
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

   app.get('/_geturls', async (req, res) => {
      try {
         
         globals.username;
         const urls = await urlRepo.getURLsForUser(globals.username);

         const data = []
         urls.forEach(u => {
            data.push({
               "type":"urlmapping",
               "id":u.id,
               "attributes" : {
                  "slug": u.slug,
                  "url":u.url,
                  "id":u.id,
                  "user":u.user,
                  "visits":u.visits
               }
            });
         })
         res.contentType('application/vnd.api+json');
         const jsonApiResponse = {data};

         logger.debug(`api response ${JSON.stringify(jsonApiResponse)}`)
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

   app.put('/_updateslug', async (req, res) => {
      try {
         globals.username;
         const data = req.body;

         logger.debug(`body: ${JSON.stringify(data)}`);
         // simple validation
         if(!data || !data.data || data.data.length ===0 || !data.data[0].id || !data.data[0].attributes?.slug) {
            const err = new Error(`Invalid input in request`);
            (err as any).status = 400;
            throw err;
         }
         const urlId = data.data[0]?.id
         const newSlugName = data.data[0]?.attributes.slug;

         await urlRepo.updateNameForSlug(urlId, newSlugName);
         const updatedUrl = await urlRepo.getURLByID(urlId);
         // Respond with update value from database

         const jsonApiResponse = {
            "data": [{
               "type":"urlmapping",
               "id":updatedUrl.id,
               "attributes" : {
                  "slug": updatedUrl.slug,
                  "url":updatedUrl.url,
                  "id":updatedUrl.id,
                  "user":updatedUrl.user
               }
            }]
         }

         res.contentType('application/vnd.api+json');
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
         const result = await urlRepo.getURLForSlug(slug);

         if(result) {
            const url  = result.url;
            const id = result.id;
            await urlRepo.updateVisitsForURLId(id);
            // redirect
            logger.info(`redirect ${url}`); 
            res.redirect(url);
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

   app._router.stack.forEach(function(r){
      if (r.route && r.route.path){
        console.log(`path: ${r.route.path}`)
      }
    })

}