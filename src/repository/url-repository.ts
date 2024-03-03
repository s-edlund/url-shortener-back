import dbAccess from '../database/db-access';
import globals from '../globals/globals';
import { getLogger } from '../utils/logger';
import { UrlShortener } from '../utils/url-shortener';
import {uuid} from 'uuidv4';

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

   async getSlugForURL(url: string): Promise<{slug:string, url:string, id:number, user:string}|undefined>  {
      try {
         return await dbAccess.getSlugForURL(url);
      } catch(err) {
         logger.error(`Cannto retrieve slug for URL ${url}: ${err.message}`);
         throw err;
      }
   }

   async getURLForSlug(slug: string): Promise<string|undefined> {
      try {
         return await dbAccess.getURLForSlug(slug);
      } catch(err) {
         logger.error(`Cannto retrieve URL for slug ${slug}: ${err.message}`);
         throw err;
      }
   }

   async getURLsForUser(user: string): Promise<Array<{slug:string, url:string, id:number, user:string}>> {
      try {
         return await dbAccess.getURLsForUser(user);
      } catch(err) {
         logger.error(`Cannto retrieve URLs for user ${user}: ${err.message}`);
         throw err;
      }
   }

   async getURLByID(id: number) {
      try {
         return await dbAccess.getURLByID(id);
      } catch(err) {
         logger.error(`Cannto retrieve slug by ID ${id}: ${err.message}`);
         throw err;
      }
   }
   async createNewMappingAndReturnID(url: string):Promise<number> {
      try {
         // Create something tha'ts guaranteed unique for temporary value. A better way would be
         // to use tx and tx isolation here
         const temporarySlugVal = uuid();
         return await dbAccess.createNewMapping({url,slug:temporarySlugVal,user: globals.username}); // will get updated
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

   async createOrReturnExistingSlugForUrl(passedURL): Promise<{slug:string, url:string, id:number, user:string}> {
      try {
         const result = await this.getSlugForURL(passedURL);
         if(result) {
            const {slug, url, id, user} = result;
            logger.info(`existing slug: ${slug}`);
            return {slug, url, id, user};
         }
         
         const newMappingId = await this.createNewMappingAndReturnID(passedURL);

         const urlShortener = new UrlShortener();
         const newSlug = urlShortener.numberToUniqueString(newMappingId);

         await this.updateMapping(newMappingId, newSlug, globals.username);

         return {slug: newSlug, url: passedURL, id: newMappingId, user:''};
      } catch(err) {
         logger.error(`Cannot create or return mapping for ${passedURL}: ${err.message}`);
         throw err;
      }
   }

   async updateNameForSlug(id: number, newName: string) {
      try {
         return await this.updateMapping(id, newName, globals.username); 
      } catch(err) {
         logger.error(`Cannot update mapping  ${err.message}`);
         throw err;
      }
   }
}

export default new UrlRepository();