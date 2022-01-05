FROM node:16-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
COPY . /usr/src/app/

RUN npm install --only=prod

EXPOSE 6001

USER node

CMD ["node", "app.js"]

