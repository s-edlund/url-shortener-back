"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlShortener = void 0;
const url_validator_1 = require("./url-validator");
class UrlShortener {
    constructor() {
        this.urlValidator = new url_validator_1.URLValidator();
        this.map = {};
        this.reverseMap = {};
        this.inc = 0;
        // Allowed letters for slugs. The longer the list, the shorter the URLs.
        this.alpha = "abcdefghijklmnopqrstuvwxyz0123456789";
        /*
        getUniqueSlugForNumber(num: number):string {
           console.log(`shortening ${str}`);
           if(!this.urlValidator.isValidUrl(str)) {
              const err = Error(`Invalid URL ${str}`);
              (err as any).status = 400;
              throw err;
           }
           if(this.map[str] !== undefined)
              return this.map[str];
            this.map[str] = this.numberToString(this.inc, "");
            this.reverseMap[this.map[str]] = str;
            ++this.inc; // auto inc number in a DB really
            return this.map[str];
        }   */
    }
    numberToUniqueString(n, currentResult) {
        const base = this.alpha.length;
        if (n < base) {
            currentResult += this.alpha[n];
            return currentResult.split("").reverse().join("");
        }
        const pos = (n % base);
        const c = this.alpha[pos];
        currentResult += c;
        const nextNum = Math.floor(n / base);
        return this.numberToUniqueString(nextNum, currentResult);
    }
    stringToNumber(s) {
        let pos = 0;
        let result = 0n;
        let scale = 1;
        const base = this.alpha.length;
        while (pos < s.length) {
            result += BigInt(s[pos]) * BigInt(scale);
            scale = scale * base;
            ++pos;
        }
        return result;
    }
    lengthen(url) {
        return this.reverseMap[url];
    }
}
exports.UrlShortener = UrlShortener;
/*
const shortener = new UrlShortener();
const shortened = shortener.shorten("http://www.yahoo.com");
console.log(`shortened = ${shortened}`)
const original = shortener.lengthen(shortened);
console.log(`original = ${original}`)

const shortened2 = shortener.shorten("http://www.google.com");
console.log(`shortened = ${shortened2}`)
const original2 = shortener.lengthen(shortened2);
console.log(`original = ${original2}`)

const shortened3 = shortener.shorten("http://www.yahoo.com");
console.log(`shortened = ${shortened3}`)
const original3 = shortener.lengthen(shortened3);
console.log(`original = ${original3}`)
*/ 
//# sourceMappingURL=url-shortener.js.map