FROM node:18 as base

WORKDIR /usr/src/server

ENV NODE_ENV dev

COPY package*.json ./

RUN npm install --include=dev

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]
