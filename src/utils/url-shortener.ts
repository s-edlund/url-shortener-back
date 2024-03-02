import { URLValidator } from "./url-validator";


export class UrlShortener {

   // Allowed letters for slugs. The longer the list, the shorter the URLs.
   // The lengh of the alphabet is the base number of the  slug.
   // The number of unique slugs is basically astronomical, but 
   // would theoretically be limited by the max length of a string in the 
   // database, or computer memory.

   alpha = "abcdefghijklmnopqrstuvwxyz0123456789";

   /**
    * This is basically it. If we have a number that's unique (it is, it's a primary key in a database table),
    * we can generate a string from it in the base number of the alphabet
    * 
    * @param n A number
    * @param currentResult For recursion, should start out empty 
    * @returns 
    */
   numberToUniqueString(n: number, currentResult:string = ''): string {
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

   // Not really used
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