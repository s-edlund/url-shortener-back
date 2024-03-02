import { Client } from 'pg'
import config from 'config';
import { getLogger } from '../utils/logger';

const logger = getLogger('database-access');

const SCHEMA_NAME = 'app';
const TABLE_NAME = 'urlmapping';

const user = config.get<string>('database.dbUser');
const password = config.get<string>('database.dbPassword');
const host = config.get<string>('database.dbHost');
const port = config.get<string>('database.dbPort');

logger.info(`connect user ${user} host: ${host} port: ${port} `);

class DatabaseAccess {

   private getConnectedClient(): Client {
      try {
         const c = new Client({
            user: config.get<string>('database.dbUser'),
            password: config.get<string>('database.dbPassword'),
            host: config.get<string>('database.dbHost'),
            port: config.get<string>('database.dbPort')
         });
         c.connect();
         return c;
      } catch(err) {
         logger.error(`Error caught creating connection ${err.message}}`)
         throw err;
      }
   }

   async setupDatabase() {
      const client = this.getConnectedClient();
      try {
         const tableExistsQuery = `
            SELECT EXISTS (
               SELECT * FROM information_schema.tables 
               WHERE  table_schema = '${SCHEMA_NAME}'
               AND    table_name   = '${TABLE_NAME}'
               );
         `;

         const res = await client.query(tableExistsQuery);
         logger.info(`res ${JSON.stringify(res, null, 2)}`)
         const first = res.rows[0];
         if(first.exists === true) {
            logger.info(`Database is already set up, will not create new tables`)
            return;
         }

         await client.query(`CREATE SCHEMA ${SCHEMA_NAME}`);

         const table1 = `
            CREATE TABLE ${SCHEMA_NAME}.${TABLE_NAME} (
               ID SERIAL PRIMARY KEY,
               URL TEXT NOT NULL,
               SLUG VARCHAR(256) NOT NULL,
               USERNAME VARCHAR(256),
               UNIQUE(SLUG)  
         )`

         const response = await client.query(table1);

         client.end();
      } catch(err) {
         logger.error(`Error caught in setup database ${err.message}}`)
         throw err;
      } finally {
         client.end();
      }
   }

   async getSlugForURL(url: string): Promise<string|undefined> {
      const client = this.getConnectedClient();
      try {
         const sql = `SELECT SLUG FROM ${SCHEMA_NAME}.${TABLE_NAME} WHERE URL = $1`; // no sql injection
         const res = await client.query(sql, [url]);
         logger.info(`res from select slug ${JSON.stringify(res)}`);
         if(res.rows && res.rows.length >0 ) {
            const slug = res.rows[0].slug;
            return slug;
         }
         return undefined;
      } catch(err) {
         logger.error(`Error getting slug for URL ${url}: ${err.message}}`)
         throw err;
      } finally {
         client.end();
      }
   }

   async getURLForSlug(slug: string): Promise<string|undefined> {
      const client = this.getConnectedClient();
      try {
         const sql = `SELECT URL FROM ${SCHEMA_NAME}.${TABLE_NAME} WHERE SLUG = $1`; // no sql injection
         const res = await client.query(sql, [slug]);
         logger.info(`res from select url ${JSON.stringify(res)}`);
         if(res.rows && res.rows.length >0 ) {
            if(res.rows.length > 1)
               logger.warn(`WARNING FOUND MORE THAN 1 URL FOR SLUG ${slug}. It should not be possible. Check your math!`)
            const url = res.rows[0].url;
            return url;
         }
         return undefined;
      } catch(err) {
         logger.error(`Error getting URL for slug ${slug}: ${err.message}}`)
         throw err;
      } finally {
         client.end();
      }
   }


   async createNewMapping(data: {url:string,slug:string,user:string}): Promise<number> {
      const client = this.getConnectedClient();
      try {
         const sql = `INSERT INTO ${SCHEMA_NAME}.${TABLE_NAME} (URL, SLUG, USERNAME)  VALUES ($1, $2, $3) RETURNING ID`; // no sql injection
         const res = await client.query(sql, [data.url, data.slug, data.user]);
         logger.info(`insert res ${JSON.stringify(res)}`);
         if(res.rows && res.rows.length >0 ) {
            const id = res.rows[0].id;
            return id;
         }
         throw new Error(`unexpected error, no rows returned from insert statement`)
      } catch(err) {
         logger.error(`Error creating new mapping ${err.message}}`)
         throw err;
      } finally {
         client.end();
      }
   }

   async updateMapping(id, data:{slug: string,user: string}) {
      const client = this.getConnectedClient();
      try {
         const sql = `UPDATE ${SCHEMA_NAME}.${TABLE_NAME} SET SLUG=$1, USERNAME=$2 WHERE ID=$3`;
         const res = await client.query(sql, [data.slug, data.user, id]);
         logger.info(`update res ${JSON.stringify(res)}`);
      } catch(err) {
         logger.error(`Error updating mapping: ${err.message}}`)
         throw err;
      } finally {
         client.end();
      }
   }
}


export default new DatabaseAccess();