FROM node:21-alpine3.18

ARG DATABASE_PASSWORD

WORKDIR /app
ADD package.json ./
ADD package-lock.json ./
RUN npm i
RUN npm prune --omit=dev

ADD lib/ lib/

ADD tsconfig.json ./
ADD config/* ./config/

ENV DB_PASSWORD=${DATABASE_PASSWORD};

CMD ["npm", "run", "start-prod"]