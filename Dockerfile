FROM node:10.16.4-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.lock ./
RUN npm install --production
COPY build ./build

CMD ["node", "build/server.js"]
