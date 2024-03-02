"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url_shortener_1 = require("./utils/url-shortener");
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("config"));
const logger_1 = require("./utils/logger");
//import dbAccess from './database/db-access';
const url_repository_1 = __importDefault(require("./repository/url-repository"));
const app = (0, express_1.default)();
const port = 3001;
const urlShortener = new url_shortener_1.UrlShortener();
const logger = (0, logger_1.getLogger)('server');
url_repository_1.default.setupRepo().catch(err => {
    logger.error(`Error during database setup. Shutting down: ${err.message}`);
    process.exit(1); // force shutdown. 
}).then(() => logger.info(`URL Repo initialized successfully`));
// Should not be left open like this, TODO.
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Server is up');
});
app.get('/shorten', async (req, res) => {
    try {
        const passedURL = req.query.url;
        // should sanitise here
        const slug = await url_repository_1.default.createOrReturnExistingSlugForUrl(passedURL);
        res.json({ "shortenedUrl": slug });
    }
    catch (err) {
        const stat = err.status ? err.status : 500;
        res.status(stat);
        res.json({ err: err.message, status: stat });
    }
});
// Handle everything else with a redirect or 404
app.get('/*', (req, res) => {
    try {
        let slug = req.originalUrl;
        // trim initial /
        while (slug.startsWith('/'))
            slug = slug.replace('/', '');
        logger.info(`slug ${slug}`);
        const storedUrl = urlShortener.lengthen(slug);
        if (storedUrl) {
            // redirect
            logger.info(`redirect ${storedUrl}`);
            res.redirect(storedUrl);
        }
        else {
            res.status(404);
            res.send(`<h2 style="color: red">Unable to locate url slug: ${slug}</h2>`);
        }
    }
    catch (err) {
        const stat = err.status ? err.status : 500;
        res.status(stat);
        res.json({ err: err.message, status: stat });
    }
});
app.listen(port, () => {
    const port = config_1.default.get('port');
    logger.info(`URL shortening app available on port ${port}`);
});
//# sourceMappingURL=server.js.map