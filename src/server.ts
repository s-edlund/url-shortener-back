import Express  from 'express';
import { UrlShortener } from './utils/url-shortener';
import cors from 'cors';
import config from 'config';

const app = Express()
const port = 3001

const urlShortener = new UrlShortener();


// Should not be left open like this, TODO.
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is up')
})

app.get('/shorten', (req, res) => {
   try {
      const passedURL = req.query.url as string;
      // should sanitise here

      const shortenedUrl = urlShortener.shorten(passedURL)
      res.json({shortenedUrl: shortenedUrl});
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
      console.log(`slug ${slug}`);
      const storedUrl = urlShortener.lengthen(slug);
      if(storedUrl) {
         // redirect
         console.log(`redirect ${storedUrl}`); 
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
  console.log(`URL shortening app available on port ${port}`)
})