"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url_shortener_1 = require("./utils/url-shortener");
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("config"));
const app = (0, express_1.default)();
const port = 3001;
const urlShortener = new url_shortener_1.UrlShortener();
// Should not be left open like this, TODO.
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Server is up');
});
app.get('/shorten', (req, res) => {
    try {
        const passedURL = req.query.url;
        // should sanitise here
        const shortenedUrl = urlShortener.shorten(passedURL);
        res.json({ shortenedUrl: shortenedUrl });
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
        console.log(`slug ${slug}`);
        const storedUrl = urlShortener.lengthen(slug);
        if (storedUrl) {
            // redirect
            console.log(`redirect ${storedUrl}`);
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
    console.log(`URL shortening app available on port ${port}`);
});
//# sourceMappingURL=server.js.map