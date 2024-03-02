import dbAccess from '../database/db-access';
import { getLogger } from '../utils/logger';
import { UrlShortener } from '../utils/url-shortener';

const logger = getLogger('url-repo');

class UrlRepository {
   async setupRepo() {
      try {
         logger.info('Setting up URL repository');
         await dbAccess.setupDatabase();
      } catch(err) {
         logger.error(`error setting up url repo ${err.message}`);
         throw err;
      }
   }

   async getSlugForURL(url: string): Promise<string|undefined> {
      try {
         return await dbAccess.getSlugForURL(url);
      } catch(err) {
         logger.error(`Cannto retrieve slug for URL ${url}: ${err.message}`);
         throw err;
      }
   }

   async createNewMappingAndReturnID(url: string):Promise<number> {
      try {
         return await dbAccess.createNewMapping({url,slug:'',user:''}); // will get updated
      } catch(err) {
         logger.error(`Cannot creqte new mapping: ${err.message}`);
         throw err;
      }
   }

   async updateMapping(id: number, slug: string, user: string):Promise<void> {
      try {
         return await dbAccess.updateMapping(id, {slug,user}); 
      } catch(err) {
         logger.error(`Cannot update mapping  ${err.message}`);
         throw err;
      }
   }

   async createOrReturnExistingSlugForUrl(passedURL): Promise<string> {
      try {
         const existingSlug = await this.getSlugForURL(passedURL);
         logger.info(`existing slug: ${existingSlug}`);
         if(existingSlug) {
            return existingSlug;
         }
         
         const newMappingId = await this.createNewMappingAndReturnID(passedURL);

         const urlShortener = new UrlShortener();
         const slug = urlShortener.numberToUniqueString(newMappingId, '');

         await this.updateMapping(newMappingId, slug, '');

         return slug;
      } catch(err) {
         logger.error(`Cannot create or return mapping for ${passedURL}: ${err.message}`);
         throw err;
      }
   }
}

export default new UrlRepository();