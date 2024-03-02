import winston, {format}from 'winston';


export const getLogger = (prefix: string) => {
   const logger = winston.createLogger({
      level: 'info',
      format: format.combine(
         format.timestamp(),
         format.label({label: prefix}),
         format.prettyPrint()
     ),
      transports: [new winston.transports.Console()],
   });

   return logger;
 };