import { URLValidator } from "./url-validator";


export class UrlShortener {

   urlValidator = new URLValidator();

   map: {[key: string]: string} = {};
   reverseMap: {[key: number]: string} = {};

   inc = 0;

   // Allowed letters for slugs. The longer the list, the shorter the URLs.
   alpha = "abcdefghijklmnopqrstuvwxyz0123456789";

   numberToUniqueString(n: number, currentResult:string): string {
      const base = this.alpha.length;

      if(n < base)   {
         currentResult += this.alpha[n];
         return currentResult.split("").reverse().join("");
      }

      const pos = (n % base);
      const c = this.alpha[pos];
      currentResult += c;
      const nextNum = Math.floor(n/base);
      return this.numberToUniqueString(nextNum, currentResult);
   }

   stringToNumber(s: string): BigInt {
      let pos = 0;
      let result = 0n;
      let scale = 1;
      const base = this.alpha.length;

      while(pos < s.length) {
         result += BigInt(s[pos]) * BigInt(scale);
         scale = scale*base;
         ++pos;
      }
      return result;
   }

   lengthen(url:string): string|undefined {
       return this.reverseMap[url]
   }

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