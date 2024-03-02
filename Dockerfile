FROM node:21-alpine3.18

WORKDIR /app
ADD lib/ lib/
ADD package.json ./
ADD package-lock.json ./
ADD tsconfig.json ./

RUN npm i
RUN npm prune --omit=dev

CMD ["npm", "run", "start-prod"]