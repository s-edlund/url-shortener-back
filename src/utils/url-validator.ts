export class URLValidator {
   isValidUrl(url: string): boolean {
      try {
         new URL(url);
         return true;
       } catch(err:any) {
         return false;
       }
   }
}